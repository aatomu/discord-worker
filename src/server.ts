import { verifyKey } from 'discord-interactions'
import * as discord from 'discord-api-types/v10'

export interface Env {
  DISCORD_TOKEN: string
  DISCORD_PUBLIC_KEY: string
}

const entryPoint = 'https://discord.com/api/v10'
const embedSuccess = 0x00ffff
const embedError = 0xff0000

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Check valid request
    if (request.method === 'POST') {
      const signature = request.headers.get('x-signature-ed25519')
      const timestamp = request.headers.get('x-signature-timestamp')
      const body = await request.clone().arrayBuffer()
      const isValidRequest = signature && timestamp && verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY)
      if (!isValidRequest) {
        console.error('Invalid Request')
        return new Response('Bad request signature.', { status: 401 })
      }
    }

    const interaction: discord.APIInteraction = await request.json()
    if (!interaction) {
      console.error('Invalid interaction request')
    }
    console.log(interaction)

    switch (interaction.type) {
      case discord.InteractionType.Ping: {
        return JsonResponse({
          type: discord.InteractionResponseType.Pong,
        })
      }
      case discord.InteractionType.ApplicationCommand: {
        switch (interaction.data.name.toLocaleLowerCase()) {
          case 'message':
            const res = await resourceRequest(env, 'GET', `/channels/${interaction.channel.id}/messages`, null)
            const json: any = await res.json()
            if (!res.ok) {
              return JsonResponse({
                type: discord.InteractionResponseType.ChannelMessageWithSource,
                data: {
                  embeds: [
                    {
                      title: '__**Command Error**__',
                      color: embedError,
                      description: `${json.message}`,
                    },
                  ],
                },
              })
            }

            let message_list: string[] = []
            for (let i = 0; i < json.length; i++) {
              const message = json[i]
              if (message.content && !message.author.bot) {
                message_list.push(message.content)
              }
            }
						console.log(message_list)
            return JsonResponse({
              type: discord.InteractionResponseType.ChannelMessageWithSource,
              data: {
								embeds: [
									{
										title: '__**Command SUCCESS**__',
										color: embedSuccess,
										description: `${message_list.join("\n")}`,
									},
								],
              },
            })
        }
      }
    }

    console.error('Unknown Type')
    return JsonResponse(null, { status: 400 })
  },
}

function JsonResponse(body: discord.APIInteractionResponse | null, init?: any): Response {
  const jsonBody = JSON.stringify(body)

  return new Response(
    jsonBody,
    init || {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }
  )
}

async function resourceRequest(env: Env, method: string, point: string, body: Object | null) {
  const init: RequestInit = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },
  }
  if (body != null) {
    init.body = JSON.stringify(body)
  }

  return fetch(`${entryPoint}${point}`, init)
}

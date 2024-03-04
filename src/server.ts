import * as discord from 'discord-interactions'
import * as discordInteraction from 'discord-api-types/v10'

export interface Env {
  DISCORD_PUBLIC_KEY: string
  DISCORD_TOKEN: string
}

const entryPoint = 'https://discord.com/api/v10/'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Check valid request
    if (request.method === 'POST') {
      const signature = request.headers.get('x-signature-ed25519')
      const timestamp = request.headers.get('x-signature-timestamp')
      const body = await request.clone().arrayBuffer()
      const isValidRequest = signature && timestamp && discord.verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY)
      if (!isValidRequest) {
        console.error('Invalid Request')
        return new Response('Bad request signature.', { status: 401 })
      }
    }

    const interaction: discordInteraction.APIInteraction = await request.json()
    if (!interaction) {
      console.error('Invalid interaction request')
    }
    console.log(interaction)

    switch (interaction.type) {
      case discordInteraction.InteractionType.Ping: {
        return JsonResponse({ type: discordInteraction.InteractionResponseType.Pong })
      }
      case discordInteraction.InteractionType.ApplicationCommand: {
        switch (interaction.data.name.toLocaleLowerCase()) {
          case 'test':
            const res = await resourceRequest(env, `/channels/${interaction.channel.id}/messages`, {
              content: 'あいうえお',
            })

            return JsonResponse({
              type: discordInteraction.InteractionResponseType.ChannelMessageWithSource,
              data: {
                content: `Test Response: ${await res.text()}`,
              },
            })
          case 'invite':
            return JsonResponse({
              type: discordInteraction.InteractionResponseType.ChannelMessageWithSource,
              data: {
                content: 'This Command is not supported',
              },
            })
        }
      }
    }

    console.error('Unknown Type')
    return JsonResponse(null, { status: 400 })
  },
}

function JsonResponse(body: discordInteraction.APIInteractionResponse | null, init?: any): Response {
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

async function resourceRequest(env: Env, point: string, body: Object) {
  return fetch(`${entryPoint}${point}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },
    body: JSON.stringify(body),
  })
}

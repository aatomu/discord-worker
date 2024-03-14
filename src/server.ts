import { verifyKey } from 'discord-interactions'
import * as discord from 'discord-api-types/v10'
import { Ai } from '@cloudflare/ai'

export interface Env {
  TOKEN: string
  PUBLIC_KEY: string
  AI: Ai
}

const entryPoint = 'https://discord.com/api/v10'
const embedSuccess = 0x00ffff
const embedError = 0xff0000

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'POST') {
      return JsonResponse({ error: 'Invalid method.' }, { status: 405 })
    }

    // Check valid request
    const signature = request.headers.get('x-signature-ed25519')
    const timestamp = request.headers.get('x-signature-timestamp')
    const body = await request.clone().arrayBuffer()
    const isValidRequest = signature && timestamp && verifyKey(body, signature, timestamp, env.PUBLIC_KEY)
    if (!isValidRequest) {
      console.error('Invalid Request')
      return JsonResponse({ error: 'Bad request signature.' }, { status: 401 })
    }

    const interaction: discord.APIInteraction = await request.json()
    if (!interaction) {
      console.error('Invalid interaction request')
      return JsonResponse({ error: 'Bad request body' }, { status: 401 })
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
          case 'poll': {
            if (!('options' in interaction.data)) {
              return errorResponse('Invalid command')
            }
            if (!interaction.data.options) {
              return errorResponse('Not enough command options')
            }

            const reaction: string[] = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
            let title: string = ''
            let choices: string[] = []
            interaction.data.options.forEach((options, index) => {
              if ('value' in options) {
                if (options.name === 'title') {
                  title = `# ${options.value}`
                  return
                }
                choices.push(reaction[index - 1] + ': ' + options.value.toString())
              }
            })

            async function defer(): Promise<void> {
              const interactionOriginal = await resourceRequest(env, 'GET', `/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, null)
              if (!interactionOriginal.ok) {
                return
              }
              const interactionResponse: discord.APIMessage = (await interactionOriginal.json()) as discord.APIMessage
              if (!interactionResponse) {
                return
              }
              for (let i = 0; i < choices.length; i++) {
                await resourceRequest(env, 'PUT', `/channels/${interactionResponse.channel_id}/messages/${interactionResponse.id}/reactions/${encodeURIComponent(reaction[i])}/@me`, null)
                await sleep(1000)
              }
            }
            ctx.waitUntil(defer())

            return JsonResponse({
              type: discord.InteractionResponseType.ChannelMessageWithSource,
              data: {
                embeds: [
                  {
                    title: '__**Command Success**__',
                    color: embedSuccess,
                    description: `${title}\n\n${choices.join('\n')}`,
                  },
                ],
              },
            })
          }
          case 'text2image': {
            if (!('options' in interaction.data)) {
              return errorResponse('Invalid command')
            }
            if (!interaction.data.options) {
              return errorResponse('Not enough command options')
            }

            const option = interaction.data.options[0]
            let prompt: string = ''
            if ('value' in option) {
              prompt = option.value.toString()
            }

            async function defer() {
              const ai = new Ai(env.AI)
              const body = new FormData()

              for (let i = 0; i < 4; i++) {
                const response: Uint8Array = await ai.run<'@cf/bytedance/stable-diffusion-xl-lightning'>('@cf/bytedance/stable-diffusion-xl-lightning', {
                  prompt: prompt,
                })

                body.append(`files[${i}]`, new Blob([response], { type: 'image/png' }), 'image.png')
              }

							const interactionPatch = await fetch(`${entryPoint}/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bot ${env.TOKEN}`,
                },
                body: body,
              })
              console.log(interactionPatch.statusText, await interactionPatch.text())
            }
            ctx.waitUntil(defer())

            const data: discord.APIInteractionResponseCallbackData = {
              embeds: [
                {
                  title: '__**Command Success**__',
                  color: embedSuccess,
                  description: `Prompt:\n \`\`\`${prompt}\`\`\``,
                },
              ],
            }

            return JsonResponse({
              type: discord.InteractionResponseType.ChannelMessageWithSource,
              data: data,
            })
          }
          case 'book mark': {
            if (interaction.data.type !== discord.ApplicationCommandType.Message) {
              return errorResponse('Unknown command')
            }

            const t = interaction.data.resolved.messages[interaction.data.target_id]
            return JsonResponse({
              type: discord.InteractionResponseType.ChannelMessageWithSource,
              data: {
                content: `Book mark:https://discord.com/channels/${interaction.data.guild_id}/${t.channel_id}/${t.id}`,
              },
            })
          }
        }
      }
    }

    console.error('Unknown Type')
    return JsonResponse({ error: 'Unknown Type' }, { status: 400 })
  },
}

function JsonResponse(body: discord.APIInteractionResponse | Object, init?: any): Response {
  console.log('Response', body)
  let jsonBody = null
  if (body) {
    jsonBody = JSON.stringify(body)
  }
  return new Response(
    jsonBody,
    init || {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }
  )
}

function errorResponse(message: string): Response {
  return JsonResponse({
    type: discord.InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [
        {
          title: '__**Command Error**__',
          color: embedError,
          description: message,
        },
      ],
    },
  })
}

async function resourceRequest(env: Env, method: string, point: string, body: Object | null) {
  const init: RequestInit = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${env.TOKEN}`,
    },
  }
  if (body != null) {
    init.body = JSON.stringify(body)
  }

  return fetch(`${entryPoint}${point}`, init)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

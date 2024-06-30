import { verifyKey } from 'discord-interactions'
import * as discord from 'discord-api-types/v10'
import { Ai } from '@cloudflare/ai'

export interface Env {
  TOKEN: string
  PUBLIC_KEY: string
  AI: Ai
}

const entryPoint = 'https://discord.com/api/v10'
const embedSuccess = 0xf58025
const embedError = 0xff0000

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    switch (request.method) {
      case 'POST': {
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

        // Discord interaction endpoint activate
        if (interaction.type === discord.InteractionType.Ping) {
          return JsonResponse({
            type: discord.InteractionResponseType.Pong,
          })
        }
        // Interaction(slash,user,message) request
        if (interaction.type === discord.InteractionType.ApplicationCommand) {
          // Slash
          if (interaction.data.type === discord.ApplicationCommandType.ChatInput) {
            switch (interaction.data.name.toLocaleLowerCase()) {
              case 'text2image': {
                if (!interaction.data.options) {
                  return errorResponse('Not enough command options')
                }

                const option = interaction.data.options[0]
                let prompt: string = ''
                if (option.type === discord.ApplicationCommandOptionType.String) {
                  prompt = option.value
                }

                async function defer() {
                  const body = new FormData()

                  for (let i = 0; i < 1; i++) {
                    console.log('aaaaa')
                    const response: Uint8Array = await env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', {
                      prompt: prompt,
                    })

                    body.append(`files[${i}]`, new Blob([response], { type: 'image/png' }), 'image.png')
                  }

                  console.log('cccc')
                  const interactionPatch = await resourceRequest(env, 'PATCH', `/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, body)
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
              case 'embed': {
                return JsonResponse({
                  type: discord.InteractionResponseType.Modal,
                  data: {
                    title: 'Embed Configuration',
                    custom_id: 'embed_config',
                    components: [
                      {
                        type: discord.ComponentType.ActionRow,
                        components: [
                          {
                            type: discord.ComponentType.TextInput,
                            custom_id: 'title',
                            label: 'Title',
                            style: discord.TextInputStyle.Short,
                            min_length: 1,
                            max_length: 200,
                            required: true,
                          },
                        ],
                      },
                      {
                        type: discord.ComponentType.ActionRow,
                        components: [
                          {
                            type: discord.ComponentType.TextInput,
                            custom_id: 'description',
                            label: 'Description',
                            style: discord.TextInputStyle.Paragraph,
                            min_length: 1,
                            max_length: 2000,
                            required: false,
                          },
                        ],
                      },
                      {
                        type: discord.ComponentType.ActionRow,
                        components: [
                          {
                            type: discord.ComponentType.TextInput,
                            custom_id: 'thumbnail',
                            label: 'Thumbnail URL',
                            style: discord.TextInputStyle.Short,
                            placeholder: 'https://...',
                            min_length: 8,
                            required: false,
                          },
                        ],
                      },
                      {
                        type: discord.ComponentType.ActionRow,
                        components: [
                          {
                            type: discord.ComponentType.TextInput,
                            custom_id: 'color',
                            label: 'Embed Color',
                            style: discord.TextInputStyle.Short,
                            placeholder: 'ffffff',
                            min_length: 6,
                            max_length: 6,
                            required: false,
                          },
                        ],
                      },
                    ],
                  },
                })
              }
              case 'comp': {
                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: 'aaaa',
                    components: [
                      {
                        type: discord.ComponentType.ActionRow,
                        components: [
                          {
                            type: discord.ComponentType.Button,
                            custom_id: 'a',
                            label: 'aiueo',
                            style: discord.ButtonStyle.Danger,
                          },
                          {
                            type: discord.ComponentType.Button,
                            custom_id: 'b',
                            label: 'aiueo',
                            style: discord.ButtonStyle.Primary,
                          },
                          {
                            type: discord.ComponentType.Button,
                            custom_id: 'c',
                            label: 'aiueo',
                            style: discord.ButtonStyle.Secondary,
                          },
                          {
                            type: discord.ComponentType.Button,
                            custom_id: 'd',
                            label: 'aiueo',
                            style: discord.ButtonStyle.Success,
                          },
                        ],
                      },
                    ],
                  },
                })
              }
            }
          }
          // User
          if (interaction.data.type === discord.ApplicationCommandType.User) {
            switch (interaction.data.name.toLocaleLowerCase()) {
              case 'status': {
                console.log(interaction.data)
                const user = interaction.data.resolved.users[interaction.data.target_id]
                const guildUser = interaction.member
                console.log(user)
                console.log(guildUser)
                const DiscordEpoch = 1420070400000
                const createdAt = new Date(Number(BigInt(user.id) >> 22n) + DiscordEpoch)
                const joinedAt = new Date(guildUser === undefined ? 0 : guildUser.joined_at)
                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    embeds: [
                      {
                        title: `${user.username}'s Status`,
                        description:
                          `Global:\n>  "${user.username === undefined ? '' : user.username}"\n` +
                          `Server:\n>  "${user.global_name === undefined ? '' : user.global_name}"\n` +
                          `Bot:\n>  ${user.bot === true ? true : false}\n` +
                          `Created:\n>  <t:${Math.floor(createdAt.getTime() / 1000)}>\n` +
                          `Joined:\n>  <t:${Math.floor(joinedAt.getTime() / 1000)}>\n`,
                        thumbnail: {
                          url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                        },
                        color: embedSuccess,
                      },
                    ],
                  },
                })
              }
            }
          }
          // Message
          if (interaction.data.type === discord.ApplicationCommandType.Message) {
            switch (interaction.data.name.toLocaleLowerCase()) {
              case 'translate to en': {
                const t = interaction.data.resolved.messages[interaction.data.target_id]
                if (!t.content) {
                  return errorResponse('Unknown message')
                }

                const ai = new Ai(env.AI)
                const translate = await ai.run('@cf/meta/m2m100-1.2b', {
                  text: t.content,
                  target_lang: 'en',
                })

                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: `https://discord.com/channels/${interaction.guild_id}/${interaction.channel.id}/${interaction.id}\n${translate.translated_text}`,
                  },
                })
              }
              case 'translate to jp': {
                const t = interaction.data.resolved.messages[interaction.data.target_id]
                if (!t.content) {
                  return errorResponse('Unknown message')
                }

                const ai = new Ai(env.AI)
                const translate = await ai.run('@cf/meta/m2m100-1.2b', {
                  text: t.content,
                  target_lang: 'ja',
                })

                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: `https://discord.com/channels/${interaction.guild_id}/${interaction.channel.id}/${interaction.id}\n${translate.translated_text}`,
                  },
                })
              }
            }
          }
        }
        // Posted modal
        if (interaction.type === discord.InteractionType.ModalSubmit) {
          switch (interaction.data.custom_id) {
            case 'embed_config': {
              let config: { [k: string]: string } = {}
              interaction.data.components.forEach((row) => {
                const data = row.components[0]
                config[data.custom_id] = data.value
              })

              let user: discord.APIUser
              if (interaction.member) {
                user = interaction.member.user
              } else if (interaction.user) {
                user = interaction.user
              } else {
                user = {
                  id: '00000000',
                  discriminator: '0',
                  username: 'unknown',
                  global_name: 'unknown',
                  avatar: '',
                }
              }
              return JsonResponse({
                type: discord.InteractionResponseType.ChannelMessageWithSource,
                data: {
                  embeds: [
                    {
                      title: config['title'],
                      description: config['description'],
                      thumbnail: {
                        url: config['thumbnail'],
                      },
                      color: hex2num(config['color']),
                      author: {
                        name: user.username,
                        icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                      },
                    },
                  ],
                },
              })
            }
          }
        }

        console.error('Unknown type/command')
        return JsonResponse({ error: 'Unknown type/command' }, { status: 400 })
      }
      default: {
        return JsonResponse({ error: 'Invalid method.' }, { status: 405 })
      }
    }
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
      flags: discord.MessageFlags.Ephemeral,
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

function hex2num(hex: string): number {
  let num = Number(`0x${hex}`)
  if (isNaN(num)) {
    num = 0
  }
  return num
}

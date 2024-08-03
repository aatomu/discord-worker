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
        const isValidRequest = signature && timestamp && (await verifyKey(body, signature, timestamp, env.PUBLIC_KEY))
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
              // case 'text2image': {
              //   if (!interaction.data.options) {
              //     return errorResponse('Not enough command options')
              //   }

              //   const option = interaction.data.options[0]
              //   let prompt: string = ''
              //   if (option.type === discord.ApplicationCommandOptionType.String) {
              //     prompt = option.value
              //   }

              //   async function defer() {
              //     const body = new FormData()

              //     for (let i = 0; i < 1; i++) {
              //       console.log('aaaaa')
              //       const response: Uint8Array = await env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', {
              //         prompt: prompt,
              //       })

              //       body.append(`files[${i}]`, new Blob([response], { type: 'image/png' }), 'image.png')
              //     }

              //     console.log('cccc')
              //     const interactionPatch = await resourceRequest(env, 'PATCH', `/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, body)
              //     console.log(interactionPatch.statusText, await interactionPatch.text())
              //   }
              //   ctx.waitUntil(defer())

              //   const data: discord.APIInteractionResponseCallbackData = {
              //     embeds: [
              //       {
              //         title: '__**Command Success**__',
              //         color: embedSuccess,
              //         description: `Prompt:\n \`\`\`${prompt}\`\`\``,
              //       },
              //     ],
              //   }

              //   return JsonResponse({
              //     type: discord.InteractionResponseType.ChannelMessageWithSource,
              //     data: data,
              //   })
              // }
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
                            label: 'example',
                            style: discord.ButtonStyle.Danger,
                          },
                          {
                            type: discord.ComponentType.Button,
                            custom_id: 'b',
                            label: 'example',
                            style: discord.ButtonStyle.Primary,
                          },
                          {
                            type: discord.ComponentType.Button,
                            custom_id: 'c',
                            label: 'example',
                            style: discord.ButtonStyle.Secondary,
                          },
                          {
                            type: discord.ComponentType.Button,
                            custom_id: 'd',
                            label: 'example',
                            style: discord.ButtonStyle.Success,
                          },
                        ],
                      },
                    ],
                  },
                })
              }
              case 'paste': {
                let userId = interaction.member !== undefined ? interaction.member.user.id : undefined
                if (userId === undefined) {
                  userId = interaction.user !== undefined ? interaction.user.id : ''
                }

                const clipBoard = await caches.default.match(new Request(`https://example.com/cache/${userId}`)).then((res) => {
                  return res?.json() as unknown as clip
                })

                const embeds: discord.APIEmbed[] = [
                  {
                    color: embedSuccess,
                    description: `${clipBoard.message.content !== '' ? clipBoard.message.content : '__**No Message Content**__'}\n\nAttachments:${clipBoard.message.attachments.length}`,
                    timestamp: clipBoard.message.timestamp,
                    footer: {
                      text: `clipped by #${clipBoard.channelName}`,
                    },
                    author: {
                      name: clipBoard.message.author.username,
                      icon_url: `https://cdn.discordapp.com/avatars/${clipBoard.message.author.id}/${clipBoard.message.author.avatar}.png`,
                    },
                  },
                ]
                embeds.push(...clipBoard.message.embeds)

                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    embeds: embeds,
                    components: [
                      {
                        type: discord.ComponentType.ActionRow,
                        components: [
                          {
                            type: discord.ComponentType.Button,
                            style: discord.ButtonStyle.Link,
                            label: 'Jump to message',
                            url: `https://canary.discord.com/channels/${clipBoard.guildID}/${clipBoard.message.channel_id}/${clipBoard.message.id}`,
                          },
                          {
                            type: discord.ComponentType.Button,
                            style: discord.ButtonStyle.Link,
                            label: 'Jump to channel',
                            url: `https://canary.discord.com/channels/${clipBoard.guildID}/${clipBoard.message.channel_id}`,
                          },
                        ],
                      },
                    ],
                  },
                })
              }
              case 'dice': {
                if (!interaction.data.options) {
                  return errorResponse('Not enough command options')
                }

                let face: number = 1
                let quantity: number = 1
                interaction.data.options.forEach((option) => {
                  if (option.name === 'face' && option.type === discord.ApplicationCommandOptionType.Number) {
                    face = option.value
                  }
                  if (option.name === 'quantity' && option.type === discord.ApplicationCommandOptionType.Number) {
                    quantity = option.value
                  }
                })

                let diceList = []
                for (let i = 0; i < quantity; i++) {
                  diceList.push(Math.floor(Math.random() * face + 1))
                }
                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    embeds: [
                      {
                        title: '__**Command Success**__',
                        color: embedSuccess,
                        description: `Run: \`\`\`${quantity}d${face}\`\`\`Dice: \`\`\`[${diceList.join(', ')}]\`\`\`Sum: \`\`\`${diceList.reduce((sum, value) => {
                          return sum + value
                        }, 0)}\`\`\``,
                      },
                    ],
                  },
                })
              }
              case 'base_conv': {
                if (!interaction.data.options) {
                  return errorResponse('Not enough command options')
                }

                let embeds: discord.APIEmbed[] = []

                interaction.data.options.forEach((option) => {
                  if (option.name === 'bin' && option.type === discord.ApplicationCommandOptionType.String) {
                    let input = option.value
                    embeds.push({
                      color: embedSuccess,
                      description: `Bin: \`\`\`${toBin(parseInt(input, 2))}\`\`\`\nDec: \`\`\`${toDec(parseInt(input, 2))}\`\`\`\nHex: \`\`\`${toHex(parseInt(input, 2))}\`\`\``,
                    })
                  }
                  if (option.name === 'dec' && option.type === discord.ApplicationCommandOptionType.String) {
                    let input = option.value
                    embeds.push({
                      color: embedSuccess,
                      description: `Bin: \`\`\`${toBin(parseInt(input, 10))}\`\`\`\nDec: \`\`\`${toDec(parseInt(input, 10))}\`\`\`\nHex: \`\`\`${toHex(parseInt(input, 10))}\`\`\``,
                    })
                  }
                  if (option.name === 'hex' && option.type === discord.ApplicationCommandOptionType.String) {
                    let input = option.value
                    embeds.push({
                      color: embedSuccess,
                      description: `Bin: \`\`\`${toBin(parseInt(input, 16))}\`\`\`\nDec: \`\`\`${toDec(parseInt(input, 16))}\`\`\`\nHex: \`\`\`${toHex(parseInt(input, 16))}\`\`\``,
                    })
                  }
                })

                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    embeds: embeds,
                  },
                })
              }
              case 'ip_calc': {
                if (!interaction.data.options) {
                  return errorResponse('Not enough command options')
                }

                let address: number[] = [0, 0, 0, 0] // 192.168.1.1
                let netmask: number[] = [0, 0, 0, 0] // 255.255.255.0
                let netmask_cidr: number = 0 // 24
                let network: number[] = [0, 0, 0, 0] // 192.168.1.0
                let broadcast: number[] = [0, 0, 0, 0] // 192.168.1.255
                let comment: string[] = [] // ["Class C","Private Address"]

                interaction.data.options.forEach((option) => {
                  if (option.name === 'address' && option.type === discord.ApplicationCommandOptionType.String) {
                    const octet = option.value.split('.')

                    address = [parseInt(octet[0], 10), parseInt(octet[1], 10), parseInt(octet[2], 10), parseInt(octet[3], 10)]
                  }
                  if (option.name === 'netmask' && option.type === discord.ApplicationCommandOptionType.Number) {
                    netmask_cidr = option.value
                    const bits = '1'.repeat(netmask_cidr) + '0'.repeat(32 - netmask_cidr)

                    netmask = [parseInt(bits.slice(0, 8), 2), parseInt(bits.slice(8, 16), 2), parseInt(bits.slice(16, 24), 2), parseInt(bits.slice(24, 32), 2)]
                  }
                })

                network = [address[0] & netmask[0], address[1] & netmask[1], address[2] & netmask[2], address[3] & netmask[3]]
                broadcast = [network[0] | (~netmask[0] & 255), network[1] | (~netmask[1] & 255), network[2] | (~netmask[2] & 255), network[3] | (~netmask[3] & 255)]

                if (network[0] >= 0 && network[0] <= 127) {
                  comment.push('Class A(/8-/32)')
                }
                if (network[0] >= 128 && network[0] <= 191) {
                  comment.push('Class B(/16-/32)')
                }
                if (network[0] >= 192 && network[0] <= 223) {
                  comment.push('Class C(/24-/32)')
                }
                if (network[0] >= 224 && network[0] <= 239) {
                  comment.push('Class D')
                }

                if (network[0] == 127) {
                  comment.push('Loop Back')
                }
                if (network[0] == 10 || network[0] == 172 || network[0] == 192) {
                  comment.push('Private Net')
                }

                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    embeds: [
                      {
                        color: embedSuccess,
                        description: `
\`\`\`
Address   : ${toIP(address)}
Netmask   : ${toIP(netmask)}/${netmask_cidr}
${'='.repeat(20)}
Network   : ${toIP(network)}
Broadcast : ${toIP(broadcast)}
Comment   : ${comment.join(', ')}
\`\`\``,
                      },
                    ],
                  },
                })
              }
              case 'image': {
                if (!interaction.data.options) {
                  return errorResponse('Not enough command options')
                }

                let rgb: number[] = [0xff, 0xff, 0xff]
                const canvasSizeX = 1280
                const canvasSizeY = 720

                interaction.data.options.forEach((option) => {
                  if (option.name === 'color' && option.type === discord.ApplicationCommandOptionType.String) {
                    rgb = [parseInt(option.value.substring(0, 2), 16), parseInt(option.value.substring(2, 4), 16), parseInt(option.value.substring(4, 6), 16)]
                  }
                })

                const pngBinary = new Png()
                // IHDR / png info
                pngBinary.appendChunk(
                  [0x49, 0x48, 0x44, 0x52],
                  [
                    (canvasSizeX >>> 24) & 0xff,
                    (canvasSizeX >>> 16) & 0xff,
                    (canvasSizeX >>> 8) & 0xff,
                    canvasSizeX & 0xff, // image width : canvasSizeX
                    (canvasSizeY >>> 24) & 0xff,
                    (canvasSizeY >>> 16) & 0xff,
                    (canvasSizeY >>> 8) & 0xff,
                    canvasSizeY & 0xff, // image height : canvasSizeY
                    0x08, // color depth : 8bit
                    0x02, // color type  : RGB color
                    0x00, // compression : deflate
                    0x00, // image filter: none
                    0x00, // inter race  : progressive
                  ]
                )

                let canvas = []
                for (let y = 0; y < canvasSizeY; y++) {
                  canvas.push(0x00) // line filter: none
                  for (let x = 0; x < canvasSizeX; x++) {
                    canvas.push(...rgb) // line filter: none
                  }
                }

                const zlibHeader = [0x08, 0x1d]
                const zlibBlocks: number[] = []
                const zlibBlockDataMaxSize = 0xffff
                for (let i = 0; i < canvas.length; i += zlibBlockDataMaxSize) {
                  let isFinal = 0x00
                  if (i + zlibBlockDataMaxSize > canvas.length) {
                    isFinal = 0x01
                  }
                  const data = canvas.slice(i, Math.min(i + zlibBlockDataMaxSize, canvas.length))
                  zlibBlocks.push(...[0x00 | isFinal, (data.length >>> 0) & 0xff, (data.length >>> 8) & 0xff, (~data.length >>> 0) & 0xff, (~data.length >>> 8) & 0xff])
                  zlibBlocks.push(...data)
                }
                const zlibBlockFooter = pngBinary.Adler32(canvas)
                const data = [...zlibHeader, ...zlibBlocks, ...zlibBlockFooter]

                const IDATSize = 0xffffff
                for (let i = 0; i < data.length; i += IDATSize) {
                  pngBinary.appendChunk([0x49, 0x44, 0x41, 0x54], data.slice(i, Math.min(i + IDATSize, data.length)))
                }

                async function defer() {
                  const body = new FormData()
                  body.append(`files[0]`, new Blob([pngBinary.output()], { type: 'image/png' }), 'color.png')
                  const res = await resourceRequest(env, 'PATCH', `/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {}, body)
                  console.log(res.statusText, await res.text())
                }
                ctx.waitUntil(defer())

                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    embeds: [
                      {
                        color: embedSuccess,
                        title: 'Color Preview',
                        fields: [
                          {
                            name: 'Hex Color',
                            value: `\`\`\`#${rgb[0].toString(16)}${rgb[1].toString(16)}${rgb[2].toString(16)}\`\`\``,
                          },
                          {
                            name: 'Decimal Color',
                            value: `\`\`\`${(rgb[0] << 16) | (rgb[1] << 8) | rgb[2]}\`\`\``,
                          },
                          {
                            name: 'RGB Color',
                            value: `\`\`\`${rgb[0]}, ${rgb[1]}, ${rgb[2]}\`\`\``,
                          },
                        ],
                        image: {
                          url: 'attachment://color.png',
                          width: 1280,
                          height: 720,
                        },
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
                const members = interaction.data.resolved.members
                let joinedAtTimestamp: string = '1970-01-01T00:00:00.000000+00:00'
                if (members !== undefined) {
                  joinedAtTimestamp = members[interaction.data.target_id].joined_at
                }

                const DiscordEpoch = 1420070400000
                const createdAt = new Date(Number(BigInt(user.id) >> 22n) + DiscordEpoch)
                const joinedAt = new Date(joinedAtTimestamp)

                const userFlagList: { [key: string]: number } = {
                  '`Discord Employee`': 1 << 0,
                  '`Partnered Server Owner`': 1 << 1,
                  '`HypeSquad Events Member`': 1 << 2,
                  '`Bug Hunter Level 1`': 1 << 3,
                  '`House Bravery Member`': 1 << 6,
                  '`House Brilliance Member`': 1 << 7,
                  '`House Balance Member`': 1 << 8,
                  '`Early Nitro Supporter`': 1 << 9,
                  '`Team Pseudo User`': 1 << 10,
                  '`Bug Hunter Level 2`': 1 << 14,
                  '`Verified Bot`': 1 << 16,
                  '`Early Verified Bot Developer`': 1 << 17,
                  '`Moderator Programs Alumni`': 1 << 18,
                  '`HTTP Interaction Bot`': 1 << 19,
                  '`Active Developer`': 1 << 22,
                }
                let userFlags: string[] = []
                if (user.public_flags) {
                  Object.keys(userFlagList).forEach((key) => {
                    if (Number(user.public_flags) & userFlagList[key]) {
                      userFlags.push(key)
                    }
                  })
                }

                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    embeds: [
                      {
                        title: `${user.username}'s Status`,
                        description:
                          `Discord ID:\n` +
                          `>  \`${user.username === undefined ? '' : user.username}\`\n` +
                          `Display Name:\n` +
                          `>  \`${user.global_name === undefined ? '' : user.global_name}\`\n` +
                          `Nickname:\n` +
                          `>  \`${members === undefined ? '' : members[interaction.data.target_id].nick}\`\n` +
                          `Bot:\n` +
                          `>  ${user.bot === true ? true : false}\n` +
                          `Created:\n` +
                          `>  <t:${Math.floor(createdAt.getTime() / 1000)}>\n` +
                          `>  (${createdAt.toLocaleDateString('ja-Jp', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2, timeZoneName: 'longOffset' })})\n` +
                          `Joined:\n` +
                          `>  <t:${Math.floor(joinedAt.getTime() / 1000)}>\n` +
                          `>  (${joinedAt.toLocaleDateString('ja-Jp', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2, timeZoneName: 'longOffset' })})\n` +
                          `Flag:\n` +
                          `>  \"${userFlags.join(',')}\"\n`,
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
              case 'copy': {
                const message = interaction.data.resolved.messages[interaction.data.target_id]

                let userId = interaction.member !== undefined ? interaction.member.user.id : undefined
                if (userId === undefined) {
                  userId = interaction.user !== undefined ? interaction.user.id : ''
                }

                const clipBoard: clip = {
                  guildID: interaction.guild_id ? interaction.guild_id : '',
                  channelName: interaction.channel.name ? interaction.channel.name : 'DM',
                  message: message,
                }
                await caches.default.put(new Request(`https://example.com/cache/${userId}`), new Response(JSON.stringify(clipBoard)))

                return JsonResponse({
                  type: discord.InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    flags: discord.MessageFlags.Ephemeral,
                    embeds: [
                      {
                        title: 'message copied',
                        color: embedSuccess,
                      },
                    ],
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

async function resourceRequest(env: Env, method: string, point: string, header: HeadersInit, body: any | null) {
  const init: RequestInit = {
    method: method,
    headers:
      {
        Authorization: `Bot ${env.TOKEN}`,
      } || header,
  }
  if (body != null) {
    init.body = body
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

interface clip {
  channelName: string
  message: discord.APIMessage
  guildID: string
}

function toBin(n: number): string {
  let hex: string = n.toString(2)
  let result: string = ''

  while (hex.length > 0) {
    result = hex.slice(-8) + ' ' + result
    hex = hex.slice(0, -8)
  }
  return result
}

function toDec(n: number): string {
  let hex: string = n.toString(10)
  let result: string = ''

  while (hex.length > 0) {
    result = hex.slice(-3) + ' ' + result
    hex = hex.slice(0, -3)
  }
  return result
}

function toHex(n: number): string {
  let hex: string = n.toString(16)
  let result: string = ''

  while (hex.length > 0) {
    result = hex.slice(-2) + ' ' + result
    hex = hex.slice(0, -2)
  }
  return result
}

function toIP(ip: number[]): string {
  let ip_string: string[] = []

  ip.forEach((octet) => {
    ip_string.push(octet.toString(10).padStart(3, ' '))
  })
  return ip_string.join('.')
}

class Png {
  body: number[]
  constructor() {
    this.body = this.fileHeader()
  }

  // Png chunk hash
  CRC32(buf: any[], crc = 0): Uint8Array {
    const crct = [...Array(256)].map((_, n) => [...Array(8)].reduce((c, _, k) => (c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1), n))
    const crcNum = buf.reduce((c, x) => crct[(c ^ x) & 0xff] ^ (c >>> 8), crc ^ -1) ^ -1
    const crcArray = new Uint8Array(4).map((_, i) => {
      return crcNum >>> (i * 8)
    })
    return crcArray.reverse()
  }

  // Zlib data hash
  Adler32(data: number[]): number[] {
    let a = 1
    let b = 0

    for (let i = 0; i < data.length; i++) {
      a = (a + data[i]) % 65521
      b = (b + a) % 65521
    }

    const adler = (b << 16) | a
    return [(adler >>> 24) & 0xff, (adler >>> 16) & 0xff, (adler >>> 8) & 0xff, (adler >>> 0) & 0xff]
  }

  fileHeader(): number[] {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  }

  appendChunk(name: number[], data: number[]) {
    try {
      // length
      this.body.push(...[(data.length >>> 24) & 0xff, (data.length >>> 16) & 0xff, (data.length >>> 8) & 0xff, data.length & 0xff])
      // chunk type
      this.body.push(...name)
      // data ("Maximum call stack size exceeded" avoidance)
      const pushSize = 0xffff
      for (let i = 0; i < data.length; i += pushSize) {
        this.body.push(...data.slice(i, Math.min(i + pushSize, data.length)))
      }
      // CRC32
      console.log(name.toString(), '4')
      this.body.push(...this.CRC32([...name, ...data]))
    } catch (e) {
      console.log(`error ${e}`)
    }
  }

  output(): Uint8Array {
    this.appendChunk([0x49, 0x45, 0x4e, 0x44], [])
    return new Uint8Array(this.body)
  }
}

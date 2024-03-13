import fetch from 'node-fetch'
import * as discord from 'discord-api-types/v10'

export const commands: discord.RESTPutAPIApplicationCommandsJSONBody = [
  {
		type:discord.ApplicationCommandType.ChatInput,
    name: 'poll',
    description: 'simple poll button',
    options: [
      { type: discord.ApplicationCommandOptionType.String, name: 'title', description: 'Poll title', required: true },
      { type: discord.ApplicationCommandOptionType.String, name: 'choice_1', description: 'Choice 1', required: true },
      { type: discord.ApplicationCommandOptionType.String, name: 'choice_2', description: 'Choice 2', required: true },
      { type: discord.ApplicationCommandOptionType.String, name: 'choice_3', description: 'Choice 3', required: false },
      { type: discord.ApplicationCommandOptionType.String, name: 'choice_4', description: 'Choice 3', required: false },
      { type: discord.ApplicationCommandOptionType.String, name: 'choice_5', description: 'Choice 3', required: false },
    ],
  },
  {
		type:discord.ApplicationCommandType.ChatInput,
    name: 'text2image',
    description: 'create image by stable diffusion!!',
    options: [{ type: discord.ApplicationCommandOptionType.String, name: 'prompt', description: 'image create prompt', required: true, min_length: 5 }],
  },
  {
		type:discord.ApplicationCommandType.Message,
    name: 'book mark'
  },
]

const token = process.env.TOKEN
if (!token) {
  throw new Error('invalid value: TOKEN')
}
const applicationId = process.env.APPLICATION_ID
if (!applicationId) {
  throw new Error('invalid value: APPLICATION_ID')
}
const testGuildId = process.env.TEST_GUILD_ID
let registerURL: string
if (testGuildId) {
  registerURL = `https://discord.com/api/v10/applications/${applicationId}/guilds/${testGuildId}/commands`
  console.log(`Register Target: ${testGuildId}`)
} else {
  registerURL = `https://discord.com/api/v10/applications/${applicationId}/commands`
  console.log(`Register Target: Global`)
}

async function registerCommands() {
  const response = await fetch(registerURL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify(commands),
  })

  if (response.ok) {
    console.log('Registered all commands')
  } else {
    console.error('Error registering commands')
    const text = await response.text()
    console.error(text)
  }

  return response
}

registerCommands()

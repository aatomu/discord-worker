import fetch from 'node-fetch'
import * as discord from 'discord-api-types/v10'

// Command Limit:
//  * ChatInput: 100
//  * User     : 5
//  * Message  : 5
export const commands: discord.RESTPutAPIApplicationCommandsJSONBody = [
  {
    type: discord.ApplicationCommandType.ChatInput,
    name: 'text2image',
    description: 'create image by stable diffusion!!',
    options: [{ type: discord.ApplicationCommandOptionType.String, name: 'prompt', description: 'image create prompt', required: true, min_length: 5 }],
		integration_types: [discord.ApplicationIntegrationType.GuildInstall,discord.ApplicationIntegrationType.UserInstall],
		contexts:[discord.InteractionContextType.Guild,discord.InteractionContextType.BotDM,discord.InteractionContextType.PrivateChannel]
  },
  {
    type: discord.ApplicationCommandType.Message,
    name: 'translate to en',
		integration_types: [discord.ApplicationIntegrationType.GuildInstall,discord.ApplicationIntegrationType.UserInstall],
		contexts:[discord.InteractionContextType.Guild,discord.InteractionContextType.BotDM,discord.InteractionContextType.PrivateChannel]
  },
  {
    type: discord.ApplicationCommandType.Message,
    name: 'translate to jp',
		integration_types: [discord.ApplicationIntegrationType.GuildInstall,discord.ApplicationIntegrationType.UserInstall],
		contexts:[discord.InteractionContextType.Guild,discord.InteractionContextType.BotDM,discord.InteractionContextType.PrivateChannel]
  },
	{
		type:discord.ApplicationCommandType.User,
		name:'embed',
		integration_types: [discord.ApplicationIntegrationType.GuildInstall,discord.ApplicationIntegrationType.UserInstall],
		contexts:[discord.InteractionContextType.Guild,discord.InteractionContextType.BotDM,discord.InteractionContextType.PrivateChannel]
	},
  {
    type: discord.ApplicationCommandType.ChatInput,
    name: 'embed',
    description: 'create new Embed!',
		integration_types: [discord.ApplicationIntegrationType.GuildInstall,discord.ApplicationIntegrationType.UserInstall],
		contexts:[discord.InteractionContextType.Guild,discord.InteractionContextType.BotDM,discord.InteractionContextType.PrivateChannel]
  },
  {
    type: discord.ApplicationCommandType.ChatInput,
    name: 'comp',
    description: 'components test',
		integration_types: [discord.ApplicationIntegrationType.GuildInstall,discord.ApplicationIntegrationType.UserInstall],
		contexts:[discord.InteractionContextType.Guild,discord.InteractionContextType.BotDM,discord.InteractionContextType.PrivateChannel]
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

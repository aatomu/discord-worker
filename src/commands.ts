import fetch from 'node-fetch'
import * as discord from 'discord-api-types/v10'

// Command Limit:
//  * ChatInput: 100
//  * User     : 5
//  * Message  : 5
export const commands: discord.RESTPutAPIApplicationCommandsJSONBody = [
  // {
  //   type: discord.ApplicationCommandType.ChatInput,
  //   name: 'text2image',
  //   description: 'create image by stable diffusion!!',
  //   options: [{ type: discord.ApplicationCommandOptionType.String, name: 'prompt', description: 'image create prompt', required: true, min_length: 5 }],
  // 	integration_types: [discord.ApplicationIntegrationType.GuildInstall,discord.ApplicationIntegrationType.UserInstall],
  // 	contexts:[discord.InteractionContextType.Guild,discord.InteractionContextType.BotDM,discord.InteractionContextType.PrivateChannel]
  // },
  {
    type: discord.ApplicationCommandType.Message,
    name: 'translate to en',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
  },
  {
    type: discord.ApplicationCommandType.Message,
    name: 'translate to jp',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
  },
  {
    type: discord.ApplicationCommandType.User,
    name: 'status',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
  },
  {
    type: discord.ApplicationCommandType.ChatInput,
    name: 'embed',
    description: 'create new Embed!',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
  },
  {
    type: discord.ApplicationCommandType.ChatInput,
    name: 'comp',
    description: 'components test',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
  },
  {
    type: discord.ApplicationCommandType.Message,
    name: 'copy',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
  },
  {
    type: discord.ApplicationCommandType.ChatInput,
    name: 'paste',
    description: 'paste message',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
  },
  {
    type: discord.ApplicationCommandType.ChatInput,
    name: 'dice',
    description: 'roll the dice',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
		options:[
			{
				type:discord.ApplicationCommandOptionType.Number,
				name:"quantity",
				description:"Number of dice",
				required:true,
				min_value:1,
				max_value:100,
			},
			{
				type:discord.ApplicationCommandOptionType.Number,
				name:"face",
				description:"Number of eyes on the dice",
				required:true,
				min_value:2,
				max_value:100,
			},
		]
  },
  {
    type: discord.ApplicationCommandType.ChatInput,
    name: 'base_conv',
    description: 'Base conversion (Bin Dec Hex)',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
		options:[
			{
				type:discord.ApplicationCommandOptionType.String,
				name:"bin",
				description:"from binary"
			},
			{
				type:discord.ApplicationCommandOptionType.String,
				name:"dec",
				description:"from decimal"
			},
			{
				type:discord.ApplicationCommandOptionType.String,
				name:"hex",
				description:"from Hexadecimal"
			},
		]
  },
	{
		type: discord.ApplicationCommandType.ChatInput,
    name: 'ip_calc',
    description: 'calc value',
    integration_types: [discord.ApplicationIntegrationType.GuildInstall, discord.ApplicationIntegrationType.UserInstall],
    contexts: [discord.InteractionContextType.Guild, discord.InteractionContextType.BotDM, discord.InteractionContextType.PrivateChannel],
		options:[
			{
				type:discord.ApplicationCommandOptionType.String,
				name:"address",
				description:"ex: 192.168.1.0",
				min_length:7,
				max_length:15,
				required:true
			},
			{
				type:discord.ApplicationCommandOptionType.Number,
				name:"netmask",
				description:"ex: 24",
				min_value:1,
				max_value:32,
				required:true
			},
		]
	}
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

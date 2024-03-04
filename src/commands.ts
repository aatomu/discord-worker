import fetch from 'node-fetch'

export const commands = [
  {
    name: 'test',
    description: 'test Function',
  },
  {
    name: 'invite',
    description: 'Get an invite link to add the bot to your server',
  },
]

const token = process.env.DISCORD_TOKEN
if (!token) {
  throw new Error('invalid value: DISCORD_TOKEN')
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

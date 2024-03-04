# discord-worker

Discord Interaction Bot with Cloudflare workers

## How to Setup

1. `git clone https://github.com/aatomu/discord-worker.git`: clone repository
2. `npm install`: install using library
3. `wrangler secret set DISCORD_PUBLIC_KEY`: Input your `Bot PublicKey`
4. `wrangler secret set DISCORD_TOKEN`: Input your `Bot Token`
5. `export DISCORD_TOKEN=**** APPLICATION_ID=***`: Input your `Bot Token`,`Application ID`
5. `npm run register`: registration discord commands
6. `npm run deploy`: registration cloudflare workers

## Using Library

- discord-api
- discord-interactions
- node-fetch
- tsx

Discord Resource endpoints: https://discord.com/developers/docs/resources/application

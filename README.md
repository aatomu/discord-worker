# discord-worker

Discord Interaction Bot with Cloudflare workers

## How to Setup

1. `git clone https://github.com/aatomu/discord-worker.git`: clone repository
2. `npm install`: install using library
3. `wrangler secret put PUBLIC_KEY`: Input your `Bot PublicKey`
4. `wrangler secret put TOKEN`: Input your `Bot Token`
5. `export TOKEN=**** APPLICATION_ID=***`: Input your `Bot Token`,`Application ID`
6. `npm run register`: registration discord commands
7. `npm run deploy`: registration cloudflare workers

## Using Library

- discord-api
- discord-interactions
- node-fetch
- tsx

* Discord Resource endpoints:
  https://discord.com/developers/docs/resources/application
* Discord Activity(Embedded App SDK):
  https://discord.com/developers/docs/activities/building-an-activity
  https://github.com/discord/embedded-app-sdk/tree/main/examples/discord-activity-starter

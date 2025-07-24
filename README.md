# bot
Discord bot made for Undertale/Deltarune Wiki's [Discord server](https://undertale.wiki/w/Project:Discord). It is meant to run through Cloudflare Workers.

## Configuration

The bot can be configured for local development using either a `.dev.vars` file (for development) or a `.env` file (for production). The production file is only used when running maintenance scripts. The available configuration variables are:

- `APP_ID`: Discord application's ID
- `BOT_TOKEN`: Discord bot token
- `BOT_PUBLIC_KEY`: Discord application's public key (for command verification)
- `VERIFY_GUILD`: ID of the server used for wiki account verification
- `VERIFY_ROLE`: ID of the role given to users who verify their wiki account
- `VERIFY_WEBHOOK`: Webhook URL of the webhook which posts whenever a user successfully verifies their wiki account
- `VERIFY_CHANNEL`: ID of the channel where the bot should post a message with the verification button
- `VERIFY_MESSAGE`: ID of the message which the bot should edit instead of posting anew
- `OAUTH_CLIENT_ID`: Client ID of the OAuth application on the wiki used for account verification
- `OAUTH_CLIENT_SECRET`: Client secret of the OAuth application on the wiki used for account verification
- `SECRET_KEY`: Randomly generated string used for generating verification state
- `WIKI_REST_API`: URL to the rest.php endpoint of the target wiki for verification
- `ZEPTOMAIL_AUTH`: Secret received from Zeptomail to verify their webhook requests
- `NOTIFICATION_CHANNEL`: Channel ID of the channel where Zeptomail bounces should be sent

## Maintenance scripts

These scripts can be run through `npm run`:

- `npm start`: Starts a development server at `localhost:8787`
    - You might want to install ngrok and run `ngrok http 8787` to obtain a public IP, then set your public URL as the interaction endpoint in your Discord application
- `npm run deploy`: Deploys the current code to Cloudflare Workers (production)
- `npm run cf-typegen`: Regenerates types in `worker-configuration.d.ts`
- `npm run register[-prod]`: Registers Discord bot commands so they can be used
- `npm run post[-prod]`: Posts a message with a verification button

Scripts with a `-prod` suffix use the `.env` file for their configuration, whereas the others use the `.dev.vars` file.

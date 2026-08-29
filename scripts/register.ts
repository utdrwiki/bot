'use strict';
import {REST} from '@discordjs/rest';
import commands from '../src/commands';
import {config} from 'dotenv';

/**
 * Registers the bot commands with Discord.
 */
async function main() {
    const isProduction = process.argv.includes('--prod');
    const vars = config({path: [isProduction ? '.env' : '.dev.vars']});
    if (!vars.parsed) {
        throw new Error('Failed to load environment variables from .dev.vars.');
    }
    await new REST({version: '10'})
        .setToken(vars.parsed.BOT_TOKEN)
        .put(`/applications/${vars.parsed.APP_ID}/commands`, {
            body: commands.flatMap(command => command.names.map(name => ({
                description: command.description,
                name,
                options: command.options,
                type: 1
            })))
        });
}

main();

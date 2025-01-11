'use strict';
import commands from '../src/commands';
import {config} from 'dotenv';

/**
 * Registers the bot commands with Discord.
 */
async function main() {
    const vars = config({path: ['.dev.vars']});
    if (!vars.parsed) {
        throw new Error('Failed to load environment variables from .dev.vars.');
    }
    const body = commands.flatMap(command => command.names.map(name => ({
        description: command.description,
        name,
        options: command.options,
        type: 1
    })));
    const response = await fetch(`https://discord.com/api/applications/${vars.parsed.APP_ID}/commands`, {
        body: JSON.stringify(body),
        headers: {
            'Authorization': `Bot ${vars.parsed.BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        method: 'PUT'
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to register commands: ${text}`);
    }
}

main();

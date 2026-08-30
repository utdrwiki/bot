'use strict';
import {
    ButtonStyle,
    ComponentType,
    RESTJSONErrorCodes,
    RESTPostAPIChannelMessageJSONBody,
    Routes
} from 'discord-api-types/v10';
import {DiscordAPIError, REST} from '@discordjs/rest';
import {config} from 'dotenv';

/**
 * Posts the message with the button in the verification channel.
 */
async function main() {
    const isProduction = process.argv.includes('--prod');
    const vars = config({path: [isProduction ? '.env' : '.dev.vars']});
    if (!vars.parsed) {
        throw new Error('Failed to load environment variables from .dev.vars.');
    }
    const body: RESTPostAPIChannelMessageJSONBody = {
        components: [{
            components: [{
                // eslint-disable-next-line camelcase
                custom_id: 'talktostaffbutton',
                emoji: {
                    name: '💬'
                },
                label: 'Talk to staff',
                style: ButtonStyle.Primary,
                type: ComponentType.Button
            }],
            type: ComponentType.ActionRow
        }],
        // eslint-disable-next-line max-len
        content: '# Talk to staff\nIf you have an issue that you would like to discuss with the staff privately, click the button below.\n**Please note:** if your issue does not require privacy, we will direct you to the public channels. Please only use this option for issues that require privacy, such as reporting a user in the server.'
    };
    const channelId = vars.parsed.TALKTOSTAFF_CHANNEL;
    const messageId = vars.parsed.TALKTOSTAFF_MESSAGE ?? '0';
    const token = vars.parsed.BOT_TOKEN;
    const rest = new REST({version: '10'}).setToken(token);
    try {
        await rest.patch(Routes.channelMessage(channelId, messageId), {body});
    } catch (e) {
        if (
            e instanceof DiscordAPIError &&
            e.code === RESTJSONErrorCodes.UnknownMessage
        ) {
            await rest.post(Routes.channelMessages(channelId), {body});
        } else {
            throw e;
        }
    }
}

main();

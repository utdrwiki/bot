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
                custom_id: 'verify',
                label: 'Verify',
                style: ButtonStyle.Success,
                type: ComponentType.Button
            }],
            type: ComponentType.ActionRow
        }],
        // eslint-disable-next-line max-len
        content: '# Wiki account verification\nYou can get the Verified role by verifying your Undertale/Deltarune Wiki account! Click the button below to start verification, it should only take a minute or two.'
    };
    const channelId = vars.parsed.VERIFY_CHANNEL;
    const messageId = vars.parsed.VERIFY_MESSAGE ?? '0';
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

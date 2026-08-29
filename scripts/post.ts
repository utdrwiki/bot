'use strict';
import {ButtonStyle, ComponentType, Routes} from 'discord-api-types/v10';
import {REST} from '@discordjs/rest';
import {config} from 'dotenv';

/**
 * Checks if a message exists in a channel.
 * @param channelId ID of the channel
 * @param messageId ID of the message
 * @param rest REST client
 * @returns Whether the message exists
 */
async function messageExists(
    channelId: string,
    messageId: string,
    rest: REST
) {
    try {
        await rest.get(Routes.channelMessage(channelId, messageId));
        return true;
    } catch {
        return false;
    }
}

/**
 * Posts the message with the button in the verification channel.
 */
async function main() {
    const isProduction = process.argv.includes('--prod');
    const vars = config({path: [isProduction ? '.env' : '.dev.vars']});
    if (!vars.parsed) {
        throw new Error('Failed to load environment variables from .dev.vars.');
    }
    const messageContent = {
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
    const messageId = vars.parsed.VERIFY_MESSAGE;
    const token = vars.parsed.BOT_TOKEN;
    const rest = new REST({version: '10'}).setToken(token);
    if (await messageExists(channelId, messageId, rest)) {
        await rest.patch(Routes.channelMessage(channelId, messageId), {
            body: messageContent
        });
    } else {
        await rest.post(Routes.channelMessages(channelId), {
            body: messageContent
        });
    }
}

main();

'use strict';
import {ButtonStyleTypes, MessageComponentTypes} from 'discord-interactions';
import {config} from 'dotenv';

/**
 * Checks if a message exists in a channel.
 * @param channelId ID of the channel
 * @param messageId ID of the message
 * @param token Bot token
 * @returns Whether the message exists
 */
async function messageExists(
    channelId: string,
    messageId: string,
    token: string
) {
    const response = await fetch(`https://discord.com/api/channels/${channelId}/messages/${messageId}`, {
        headers: {
            Authorization: `Bot ${token}`
        }
    });
    return response.ok;
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
                style: ButtonStyleTypes.SUCCESS,
                type: MessageComponentTypes.BUTTON
            }],
            type: MessageComponentTypes.ACTION_ROW
        }],
        // eslint-disable-next-line max-len
        content: '# Wiki account verification\nYou can get the Verified role by verifying your Undertale/Deltarune Wiki account! Click the button below to start verification, it should only take a minute or two.'
    };
    const channelId = vars.parsed.VERIFY_CHANNEL;
    const messageId = vars.parsed.VERIFY_MESSAGE;
    const token = vars.parsed.BOT_TOKEN;
    const headers = {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
    };
    const response = await messageExists(channelId, messageId, token) ?
        await fetch(`https://discord.com/api/channels/${channelId}/messages/${messageId}`, {
            body: JSON.stringify(messageContent),
            headers,
            method: 'PATCH'
        }) :
        await fetch(`https://discord.com/api/channels/${channelId}/messages`, {
            body: JSON.stringify(messageContent),
            headers,
            method: 'POST'
        });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to post/edit message: ${text}`);
    }
}

main();

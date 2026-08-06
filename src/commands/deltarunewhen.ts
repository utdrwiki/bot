'use strict';
import {
    InteractionResponseFlags,
    InteractionResponseType
} from 'discord-interactions';
import {CommandInteraction} from '.';
import {InteractionResponse} from '../types';
import {parse} from 'node-html-parser';

/**
 * Fetches the contents of https://deltarune.com/7b/ and posts them in the chat.
 * @param _data Command data
 * @param _env Environment data
 * @returns Response data
 */
async function handle(
    _data: CommandInteraction, _env: Env
): Promise<InteractionResponse> {
    const response = await fetch('https://deltarune.com/7b/');
    if (!response.ok) {
        return {
            data: {
                content: 'Error fetching data from deltarune.com :(',
                flags: InteractionResponseFlags.EPHEMERAL
            },
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
        };
    }
    const html = await response.text();
    const root = parse(html);
    const container = root.querySelector('body > div');
    if (!container) {
        return {
            data: {
                content: 'Error parsing data from deltarune.com :(',
                flags: InteractionResponseFlags.EPHEMERAL
            },
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
        };
    }
    return {
        data: {
            content: container.textContent.trim()
        },
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    };
}

export default {
    description: 'When is Deltarune coming out?',
    handle,
    names: ['deltarunewhen', 'when', 'deltarune', 'rumiadidntaskforthis']
};

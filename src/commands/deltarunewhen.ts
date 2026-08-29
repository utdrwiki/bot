'use strict';
import {
    APIApplicationCommandInteraction,
    APIInteractionResponse,
    InteractionResponseType,
    MessageFlags
} from 'discord-api-types/v10';
import {parse} from 'node-html-parser';

/**
 * Fetches the contents of https://deltarune.com/7b/ and posts them in the chat.
 * @param _data Command data
 * @param _env Environment data
 * @returns Response data
 */
async function handle(
    _data: APIApplicationCommandInteraction, _env: Env
): Promise<APIInteractionResponse> {
    const response = await fetch('https://deltarune.com/7b/');
    if (!response.ok) {
        return {
            data: {
                content: 'Error fetching data from deltarune.com :(',
                flags: MessageFlags.Ephemeral
            },
            type: InteractionResponseType.ChannelMessageWithSource
        };
    }
    const html = await response.text();
    const root = parse(html);
    const container = root.querySelector('body > div');
    if (!container) {
        return {
            data: {
                content: 'Error parsing data from deltarune.com :(',
                flags: MessageFlags.Ephemeral
            },
            type: InteractionResponseType.ChannelMessageWithSource
        };
    }
    return {
        data: {
            content: `${String.fromCharCode(8302)}\n${container.textContent
                .split('\n')
                .map(line => {
                    const trimmed = line.trim();
                    const done = Array.from(trimmed.matchAll(/▓/gu)).length;
                    const notDone = Array.from(trimmed.matchAll(/░/gu)).length;
                    const total = done + notDone;
                    if (total === 0) {
                        return trimmed;
                    }
                    const percentage = Math.round(done / total * 100);
                    return `${trimmed} (${percentage}%)`;
                })
                .filter(Boolean)
                .join('\n')}`
        },
        type: InteractionResponseType.ChannelMessageWithSource
    };
}

export default {
    description: 'When is Deltarune coming out?',
    handle,
    names: ['deltarunewhen', 'when', 'deltarune', 'rumiadidntaskforthis']
};

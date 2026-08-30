'use strict';
import {
    APIApplicationCommandInteraction,
    APIInteractionResponse,
    ApplicationCommandOptionType
} from 'discord-api-types/v10';
import {
    createPrivateThread,
    editMessage,
    ephemeralMessage,
    getUser,
    sendMessage
} from '../discord';
import {getStringOption} from '.';

/**
 * Starts a private thread between a user and a staff group.
 * @param user The user to create the thread for
 * @param group The staff group to create the thread with
 * @param env Environment data
 * @returns Response data
 */
export async function talkToStaff(
    user: string,
    group: string,
    env: Env
): Promise<APIInteractionResponse> {
    const counter = Number(await env.KV.get('talktostaffcount') ?? 1);
    await env.KV.put('talktostaffcount', String(counter + 1));
    const groups = JSON.parse(env.TALKTOSTAFF_GROUPS) as Record<string, string>;
    const groupId = groups[group];
    const thread = await createPrivateThread(
        env.TALKTOSTAFF_CHANNEL,
        `${counter.toString().padStart(4, '0')}`,
        env.BOT_TOKEN
    );
    const message = await sendMessage(thread.id, {
        content: `Hello <@${user}>! This is a private thread between you and staff. Please write about your issue, and the staff will arrive shortly!`
    }, env.BOT_TOKEN);
    await editMessage(message, {
        content: `Hello <@${user}>! This is a private thread between you and <@&${groupId}>. Please write about your issue, and the staff will arrive shortly!`
    }, env.BOT_TOKEN);
    return ephemeralMessage(`Your private thread has been created: <#${thread.id}>. Please write about your issue there and a staff member will soon respond!`);
}

/**
 * Lets users talk to staff members through private threads.
 * @param data Command data
 * @param env Environment data
 * @returns Response data
 * @throws {Error} If not invoked as a slash command
 */
function handle(
    data: APIApplicationCommandInteraction,
    env: Env
): Promise<APIInteractionResponse> {
    const user = getUser(data);
    if (!('options' in data.data)) {
        throw new Error('No options provided.');
    }
    const group = getStringOption('group', data.data.options);
    return talkToStaff(user.id, group, env);
}

export default {
    description: 'Talk to staff members privately',
    handle,
    names: ['talktostaff'],
    options: [
        {
            // TODO: Make this configurable somehow.
            choices: [
                {
                    name: 'Server staff',
                    value: 'server'
                },
                {
                    name: 'Undertale Wiki staff',
                    value: 'utwiki'
                },
                {
                    name: 'Deltarune Wiki staff',
                    value: 'drwiki'
                }
            ],
            description: 'Which staff group do you want to talk to?',
            name: 'group',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ]
};

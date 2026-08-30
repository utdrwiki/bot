'use strict';
import {
    APIApplicationCommandInteraction,
    APIInteractionResponse,
    ApplicationCommandOptionType,
    PermissionFlagsBits
} from 'discord-api-types/v10';
import {
    addRole,
    createPrivateThread,
    ephemeralMessage,
    sendMessage
} from '../discord';
import {getBoolOption, getStringOption, getUserOption} from '.';

/**
 * Starts a private thread between a user and a staff group.
 * @param user The user to create the thread for
 * @param group The staff group to create the thread with
 * @param mute Whether to mute the user in the thread
 * @param env Environment data
 * @returns Response data
 */
export async function talkToUser(
    user: string,
    group: string,
    mute: boolean,
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
    if (mute) {
        await addRole(
            user,
            // TODO: Rename this variable
            env.VERIFY_GUILD,
            env.TALKTOSTAFF_MUTE_ROLE,
            env.BOT_TOKEN
        );
    }
    await sendMessage(thread.id, {
        content: `Hello <@${user}>, a <@&${groupId}> member wanted to speak to you privately. They will be in this thread shortly.`
    }, env.BOT_TOKEN);
    return ephemeralMessage(`Private thread has been created: <#${thread.id}>.`);
}

/**
 * Lets staff talk to users through private threads, optionally muting them in
 * the process.
 * @param data Command data
 * @param env Environment data
 * @returns Response data
 * @throws {Error} If not invoked as a slash command
 */
function handle(
    data: APIApplicationCommandInteraction,
    env: Env
): Promise<APIInteractionResponse> {
    if (!('options' in data.data)) {
        throw new Error('No options provided.');
    }
    const user = getUserOption('user', data.data.options);
    const group = getStringOption('group', data.data.options);
    const mute = getBoolOption('mute', data.data.options);
    return talkToUser(user, group, mute, env);
}

export default {
    description: 'Talk to a user privately',
    handle,
    names: ['talktouser'],
    options: [
        {
            description: 'The user to talk to',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.User
        },
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
            description: 'Which staff group do you want to involve?',
            name: 'group',
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            description: 'Should the user be confined to the thread?',
            name: 'mute',
            required: false,
            type: ApplicationCommandOptionType.Boolean
        }
    ],
    permissions: PermissionFlagsBits.ManageMessages
};

'use strict';
import {
    APIApplicationCommandInteraction,
    APIInteraction,
    APIInteractionResponse,
    APIMessageComponentInteraction,
    APIModalSubmitInteraction,
    APIPrivateThreadChannel,
    APIUser,
    ChannelType,
    InteractionResponseType,
    InteractionType,
    MessageFlags,
    RESTPostAPIChannelMessageJSONBody,
    Routes
} from 'discord-api-types/v10';
import {REST} from '@discordjs/rest';
import commands from './commands';
import components from './components';
import modals from './modals';
import {verifyKey} from 'discord-interactions';

let rest: REST | null = null;

/**
 * Gets a REST client for Discord API requests.
 * @param token Bot token
 * @returns REST client
 */
function getRest(token: string) {
    if (!rest) {
        rest = new REST({version: '10'}).setToken(token);
    }
    return rest;
}

/**
 * Handles a command interaction from Discord.
 * @param data Data associated with the command interaction
 * @param env Environment data
 * @returns Response data
 */
async function handleCommand(
    data: APIApplicationCommandInteraction,
    env: Env
): Promise<Response> {
    const command = commands.find(cmd => cmd.names.includes(data.data.name));
    if (!command) {
        return new Response('Nonexistent command.', {status: 400});
    }
    const response = await command.handle(data, env);
    return new Response(JSON.stringify(response), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    });
}

/**
 * Handles a message component interaction from Discord.
 * @param data Data associated with the message component interaction
 * @param env Environment data
 * @returns Response data
 */
async function handleComponent(
    data: APIMessageComponentInteraction,
    env: Env
): Promise<Response> {
    const component = components[data.data.custom_id];
    if (!component) {
        return new Response('Nonexistent component.', {status: 400});
    }
    const response = await component(data, env);
    return new Response(JSON.stringify(response), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    });
}

/**
 * Handles a modal submit interaction from Discord.
 * @param data Data associated with the modal submit interaction
 * @param env Environment data
 * @returns Response data
 */
async function handleModal(
    data: APIModalSubmitInteraction,
    env: Env
): Promise<Response> {
    const modal = modals[data.data.custom_id];
    if (!modal) {
        return new Response('Nonexistent modal.', {status: 400});
    }
    const response = await modal(data, env);
    return new Response(JSON.stringify(response), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    });
}

/**
 * Handles an interaction request from Discord.
 * @param request Request data
 * @param env Environment data
 * @returns Response data
 */
export async function handleInteraction(
    request: Request,
    env: Env
): Promise<Response> {
    const body: APIInteraction = await request.json();
    if (!await verifyKey(
        JSON.stringify(body),
        request.headers.get('X-Signature-Ed25519') || '',
        request.headers.get('X-Signature-Timestamp') || '',
        env.BOT_PUBLIC_KEY
    )) {
        return new Response('Invalid request signature', {status: 401});
    }
    switch (body.type) {
        case InteractionType.Ping:
            return new Response(JSON.stringify({type: 1}), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        case InteractionType.ApplicationCommand:
            return handleCommand(body, env);
        case InteractionType.MessageComponent:
            return handleComponent(body, env);
        case InteractionType.ModalSubmit:
            return handleModal(body, env);
        default:
            return new Response(null, {status: 400});
    }
}

/**
 * Retrieves a user from interaction data.
 * @param mou Interaction data with a member or user property
 * @param mou.member The member object, if it exists
 * @param mou.member.user The user object within the member
 * @param mou.user The user object, if it exists
 * @returns The user
 * @throws {Error} If neither member nor user is present
 */
export function getUser(
    mou: { member?: { user: APIUser }; user?: APIUser }
): APIUser {
    if (mou.member) {
        return mou.member.user;
    }
    if (mou.user) {
        return mou.user;
    }
    throw new Error('Missing user in interaction payload.');
}

/**
 * Adds a role to a Discord user.
 * @param userId ID of the user to add the role to
 * @param guildId ID of the guild the user is in
 * @param roleId ID of the role to add
 * @param token Bot token
 */
export async function addRole(
    userId: string,
    guildId: string,
    roleId: string,
    token: string
) {
    await getRest(token).put(Routes.guildMemberRole(guildId, userId, roleId));
}

/**
 * Sends a message to a Discord channel.
 * @param channelId ID of the channel to send the message to
 * @param body Message content
 * @param token Bot token
 */
export async function sendMessage(
    channelId: string,
    body: RESTPostAPIChannelMessageJSONBody,
    token: string
): Promise<void> {
    await getRest(token).post(Routes.channelMessages(channelId), {body});
}

/**
 * Creates a private thread in a Discord channel.
 * @param channelId ID of the channel to create the thread in
 * @param name Name of the thread
 * @param token Bot token
 * @returns Promise that resolves when the thread is created
 * @throws {Error} If the thread creation fails
 */
export function createPrivateThread(
    channelId: string,
    name: string,
    token: string
): Promise<APIPrivateThreadChannel> {
    return getRest(token)
        .post(Routes.threads(channelId), {
            body: {
                // eslint-disable-next-line camelcase
                auto_archive_duration: 10080,
                invitable: false,
                name,
                type: ChannelType.PrivateThread
            }
        }) as Promise<APIPrivateThreadChannel>;
}

/**
 * Creates an interaction response with an ephemeral message.
 * @param content Message content
 * @returns Interaction response
 */
export function ephemeralMessage(
    content: string
): APIInteractionResponse {
    return {
        data: {
            content,
            flags: MessageFlags.Ephemeral
        },
        type: InteractionResponseType.ChannelMessageWithSource
    };
}

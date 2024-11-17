'use strict';
import {InteractionResponseType, InteractionType, verifyKey} from 'discord-interactions';
import commands, {CommandInteraction} from './commands';
import components, {ComponentInteraction} from './components';
import {InteractionResponse, PingInteraction} from './types';

export type Interaction =
    PingInteraction |
    CommandInteraction |
    ComponentInteraction;

/**
 * Handles a command interaction from Discord.
 * @param data Data associated with the command interaction
 * @param env Environment data
 * @returns Response data
 */
async function handleCommand(
    data: CommandInteraction,
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
    data: ComponentInteraction,
    env: Env
): Promise<Response> {
    const component = components[data.data.custom_id];
    if (!component) {
        return new Response('Nonexistent component.', {status: 400});
    }
    const response = await component(data, env);
    console.log(response);
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
    const body: Interaction = await request.json();
    if (!await verifyKey(
        JSON.stringify(body),
        request.headers.get('X-Signature-Ed25519') || '',
        request.headers.get('X-Signature-Timestamp') || '',
        env.BOT_PUBLIC_KEY
    )) {
        return new Response('Invalid request signature', {status: 401});
    }
    switch (body.type) {
        case InteractionType.PING:
            return new Response(JSON.stringify({type: 1}), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        case InteractionType.APPLICATION_COMMAND:
            return handleCommand(body, env);
        case InteractionType.MESSAGE_COMPONENT:
            return handleComponent(body, env);
        default:
            return new Response(null, {status: 400});
    }
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
    await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
        headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json'
        },
        method: 'PUT'
    });
}

/**
 * Creates an interaction response with an ephemeral message.
 * @param content Message content
 * @returns Interaction response
 */
export function ephemeralMessage(content: string): InteractionResponse {
    return {
        data: {
            content,
            flags: 64
        },
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    };
}

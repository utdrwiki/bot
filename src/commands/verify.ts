'use strict';
import {CommandInteraction, getStringOption} from '.';
import {addRole, ephemeralMessage} from '../discord';
import {InteractionResponse, STRING_OPTION, getUser} from '../types';

/**
 * Retrieves a Fandom user's user ID.
 * @param username Fandom username
 * @returns User ID
 */
async function getUserId(username: string): Promise<number | undefined> {
    const response = await fetch(`https://community.fandom.com/api.php?${new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'users',
        ususers: username
    })}`);
    const json: any = await response.json();
    if (json.query.users[0]) {
        return json.query.users[0].userid;
    }
}

/**
 * Retrieves a Fandom user's Discord handle.
 * @param userId Fandom user ID
 * @returns Discord username
 */
async function getMastheadDiscord(userId: number): Promise<string | undefined> {
    const response = await fetch(`https://services.fandom.com/user-attribute/user/${userId}/attr/discordHandle?cb=${Date.now()}`);
    if (!response.ok) {
        if (response.status === 404) {
            return;
        }
        throw new Error(`Failed to retrieve Discord handle: ${response.status}`);
    }
    const json: any = await response.json();
    return json.value;
}

/**
 * Posts in the verification log that a user successfully verified.
 * @param webhookUrl Webhook URL of the verification log
 * @param discordUserId Discord user ID
 * @param wikiUsername Wiki username
 */
async function postUsernameToWebhook(
    webhookUrl: string,
    discordUserId: string,
    wikiUsername: string
): Promise<void> {
    await fetch(webhookUrl, {
        body: JSON.stringify({
            content: `<@${discordUserId}> - [${wikiUsername}](<https://undertale.wiki/User:${encodeURIComponent(wikiUsername)}>)`
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
    });
}

/**
 * Handles a verification command.
 * @param data Command data
 * @param env Environment data
 * @returns Response data
 */
async function handle(
    data: CommandInteraction,
    env: Env
): Promise<InteractionResponse> {
    const wikiUsername = getStringOption('username', data);
    const wikiUserId = await getUserId(wikiUsername);
    // eslint-disable-next-line max-len
    const instructions = 'Did you visit the verification link, click the button, and copy the verification command from there?';
    if (!wikiUserId) {
        return ephemeralMessage(`User ${wikiUsername} does not exist on the wiki. ${instructions}`);
    }
    const discordUser = getUser(data);
    const kvKey = `discord:${discordUser.id}`;
    const storedWikiUserId = await env.UTW_BOT.get(kvKey);
    if (String(wikiUserId) === storedWikiUserId) {
        return ephemeralMessage('You have already verified as this user!');
    }
    const discordUsername = await getMastheadDiscord(wikiUserId);
    if (!discordUsername) {
        return ephemeralMessage(`User ${wikiUsername} does not have a Discord username set. ${instructions}`);
    }
    if (discordUsername !== discordUser.username) {
        return ephemeralMessage(`User ${wikiUsername} has "${discordUsername}" as a Discord tag in their masthead, but your username is ${discordUser.username}. ${instructions}`);
    }
    await env.UTW_BOT.put(`discord:${discordUser.id}`, String(wikiUserId));
    await postUsernameToWebhook(
        env.VERIFY_WEBHOOK,
        discordUser.id,
        wikiUsername
    );
    try {
        await addRole(
            discordUser.id,
            env.VERIFY_GUILD,
            env.VERIFY_ROLE,
            env.BOT_TOKEN
        );
    } catch (error) {
        console.error({
            error,
            message: 'Failed to add role.',
            user: discordUser.id,
            username: discordUser.username
        });
    }
    return ephemeralMessage('Verification successful!');
}

export default {
    description: 'Verifies your wiki username.',
    handle,
    names: ['verify', 'v'],
    options: [
        {
            description: 'Your wiki username',
            name: 'username',
            required: true,
            type: STRING_OPTION
        }
    ]
};

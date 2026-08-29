'use strict';

import {addRole, sendMessage} from './discord';
import {verifyToken} from './crypto';

interface OAuthUserInfo {
    sub: number;
    username: string;
    editcount: number;
    email_verified: boolean;
    confirmed_email: boolean;
    blocked: boolean;
    registered: null | string;
    groups: string[];
    rights: string[];
    grants: string[];
}

/**
 * Handles the OAuth2 callback from the wiki.
 * @param code Received OAuth2 code
 * @param env Environment variables
 * @returns Access token from the MediaWiki API
 * @throws {Error} If the request fails
 */
async function getAccessToken(code: string, env: Env): Promise<string> {
    const response = await fetch(`${env.WIKI_REST_API}/oauth2/access_token`, {
        body: new URLSearchParams({
            // eslint-disable-next-line camelcase
            client_id: env.OAUTH_CLIENT_ID,
            // eslint-disable-next-line camelcase
            client_secret: env.OAUTH_CLIENT_SECRET,
            code,
            // eslint-disable-next-line camelcase
            grant_type: 'authorization_code'
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST'
    });
    if (!response.ok) {
        const message = await response.text();
        console.error({
            message,
            status: response.status
        });
        throw new Error('Failed to get access token.');
    }
    return (await response.json() as any).access_token;
}

/**
 * Retrieves user information for the verified wiki user.
 * @param accessToken Access token from the MediaWiki API
 * @param env Environment variables
 * @returns User information
 * @throws {Error} If the request fails
 */
async function getUserInfo(
    accessToken: string,
    env: Env
): Promise<OAuthUserInfo> {
    const response = await fetch(`${env.WIKI_REST_API}/oauth2/resource/profile`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        const message = await response.text();
        console.error({
            message,
            status: response.status
        });
        throw new Error('Failed to get user info.');
    }
    return response.json() as Promise<OAuthUserInfo>;
}

/**
 * Handles the OAuth2 callback after a user allows verification.
 * @param request Request data
 * @param env Environment variables
 * @returns Callback response
 */
export async function handleOAuth(
    request: Request,
    env: Env
): Promise<Response> {
    try {
        const url = new URL(request.url);
        const token = url.searchParams.get('state');
        const code = url.searchParams.get('code');
        if (!code || !token) {
            // eslint-disable-next-line max-len
            throw new Error('Request does not contain an OAuth2 code or state. If this is because you rejected authorization, you can leave the page.');
        }
        const discordUserId = await verifyToken(token, env.SECRET_KEY);
        const kvKey = `discord:${discordUserId}`;
        if (await env.KV.get(kvKey)) {
            return new Response('You have already verified!');
        }
        const accessToken = await getAccessToken(code, env);
        const wikiUserInfo = await getUserInfo(accessToken, env);
        if (!wikiUserInfo.groups.includes('user')) {
            // eslint-disable-next-line max-len
            throw new Error('You are most likely using a temporary account. Please use the user option on the wiki navigation bar to instead register a full account before verifying!');
        }
        if (wikiUserInfo.blocked) {
            throw new Error('Your account is blocked on the wiki.');
        }
        await env.KV.put(kvKey, String(wikiUserInfo.sub));
        await sendMessage(env.VERIFY_USERNAME_CHANNEL, {
            // eslint-disable-next-line camelcase
            allowed_mentions: {parse: []},
            content: `<@${discordUserId}> - [${wikiUserInfo.username}](<https://undertale.wiki/User:${encodeURIComponent(wikiUserInfo.username)}>)`
        }, env.BOT_TOKEN);
        await addRole(
            discordUserId,
            env.VERIFY_GUILD,
            env.VERIFY_ROLE,
            env.BOT_TOKEN
        );
    } catch (error: any) {
        console.error(error);
        return new Response(error.message, {status: 400});
    }
    return new Response('Verification successful! You can now close the page.');
}

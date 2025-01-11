'use strict';
import {
    ButtonStyleTypes,
    InteractionResponseType,
    MessageComponentTypes
} from 'discord-interactions';
import {InteractionResponse, getUser} from '../types';
import {addRole, ephemeralMessage} from '../discord';
import {ComponentInteraction} from '.';
import {generateToken} from '../crypto';

/**
 * Responds to the user who clicked on the verify button.
 * @param data Interaction data
 * @param env Environment data
 * @returns Response data
 */
async function handle(
    data: ComponentInteraction,
    env: Env
): Promise<InteractionResponse> {
    const user = getUser(data);
    const storedWikiId = await env.UTW_BOT.get(`discord:${user.id}`);
    if (storedWikiId) {
        try {
            await addRole(
                user.id,
                env.VERIFY_GUILD,
                env.VERIFY_ROLE,
                env.BOT_TOKEN
            );
        } catch (error) {
            console.error({
                error,
                message: 'Failed to add role.',
                user: user.id,
                username: user.username
            });
        }
        return ephemeralMessage('Verification successful!');
    }
    const token = await generateToken(user.id, env.SECRET_KEY);
    const verificationUrl = `${env.WIKI_REST_API}/oauth2/authorize?response_type=code&client_id=${env.OAUTH_CLIENT_ID}&state=${token}`;
    return {
        data: {
            components: [{
                components: [
                    {
                        // eslint-disable-next-line camelcase
                        label: 'Verify wiki account',
                        style: ButtonStyleTypes.LINK,
                        type: MessageComponentTypes.BUTTON,
                        url: verificationUrl
                    }
                ],
                type: MessageComponentTypes.ACTION_ROW
            }],
            // eslint-disable-next-line max-len
            content: '**To continue verification, please visit the button link below!** You will have to log into your wiki account, then confirm you are trying to verify your Discord account.',
            flags: 64
        },
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    };
}

export default handle;

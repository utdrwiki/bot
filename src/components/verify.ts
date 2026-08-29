'use strict';
import {
    APIInteractionResponse,
    APIMessageComponentInteraction,
    ButtonStyle,
    ComponentType,
    InteractionResponseType,
    MessageFlags
} from 'discord-api-types/v10';
import {addRole, ephemeralMessage, getUser} from '../discord';
import {generateToken} from '../crypto';

/**
 * Responds to the user who clicked on the verify button.
 * @param data Interaction data
 * @param env Environment data
 * @returns Response data
 */
async function handle(
    data: APIMessageComponentInteraction,
    env: Env
): Promise<APIInteractionResponse> {
    const user = getUser(data);
    const storedWikiId = await env.KV.get(`discord:${user.id}`);
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
                        style: ButtonStyle.Link,
                        type: ComponentType.Button,
                        url: verificationUrl
                    }
                ],
                type: ComponentType.ActionRow
            }],
            // eslint-disable-next-line max-len
            content: '**To continue verification, please visit the button link below!** You will have to log into your wiki account, then confirm you are trying to verify your Discord account.',
            flags: MessageFlags.Ephemeral
        },
        type: InteractionResponseType.ChannelMessageWithSource
    };
}

export default handle;

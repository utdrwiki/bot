'use strict';
import {
    ButtonStyleTypes,
    InteractionResponseType,
    MessageComponentTypes
} from 'discord-interactions';
import {InteractionResponse, getUser} from '../types';
import {addRole, ephemeralMessage} from '../discord';
import {ComponentInteraction} from '.';

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
    const verificationUrl = `https://undertale.fandom.com/wiki/Special:VerifyUser?user=${encodeURIComponent(user.username)}&c=wb&useskin=fandomdesktop`;
    return {
        data: {
            components: [{
                components: [
                    {
                        // eslint-disable-next-line camelcase
                        label: 'Visit the verification page',
                        style: ButtonStyleTypes.LINK,
                        type: MessageComponentTypes.BUTTON,
                        url: verificationUrl
                    }
                ],
                type: MessageComponentTypes.ACTION_ROW
            }],
            content: `**To continue verification, please visit this link:** <${verificationUrl}>.
It will tell you to click a button, then provide you with a command to run. After you have the command, come back here and run it.
You do not have to do anything else on the linked page other than click the button and copy the command.`,
            flags: 64
        },
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    };
}

export default handle;

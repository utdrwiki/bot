'use strict';
import {
    APIInteractionResponse,
    APIModalSubmitInteraction,
    ComponentType
} from 'discord-api-types/v10';
import {getUser} from '../discord';
import {talkToStaff} from '../commands/talktostaff';

/**
 * Handles the talk to staff modal submission.
 * @param data Interaction data
 * @param env Environment data
 * @returns Response data
 * @throws {Error} If the modal is not the expected one
 */
function handle(
    data: APIModalSubmitInteraction,
    env: Env
): Promise<APIInteractionResponse> {
    if (!data.member) {
        throw new Error('Not invoked by a guild member.');
    }
    const user = getUser(data);
    const {components} = data.data;
    if (
        components[0].type !== ComponentType.Label ||
        components[0].component.type !== ComponentType.RadioGroup ||
        !components[0].component.value
    ) {
        throw new Error('Wrong modal.');
    }
    const group = components[0].component.value;
    return talkToStaff(user.id, group, env);
}

export default handle;

'use strict';
import {
    APIInteractionResponse,
    APIModalSubmitInteraction,
    ComponentType
} from 'discord-api-types/v10';
import {talkToUser} from '../commands/talktouser';

/**
 * Handles the talk to user modal submission.
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
    const staffGroups = JSON.parse(env.TALKTOSTAFF_GROUPS);
    const staffRoles = new Set(Object.values(staffGroups));
    const isStaff = data.member.roles.some(role => staffRoles.has(role));
    const {components: [compUser, compGroup, compMute]} = data.data;
    if (
        !isStaff ||
        compUser.type !== ComponentType.Label ||
        compUser.component.type !== ComponentType.UserSelect ||
        !compUser.component.values[0] ||
        compGroup.type !== ComponentType.Label ||
        compGroup.component.type !== ComponentType.RadioGroup ||
        !compGroup.component.value ||
        compMute.type !== ComponentType.Label ||
        compMute.component.type !== ComponentType.Checkbox
    ) {
        throw new Error('Wrong modal.');
    }
    const [user] = compUser.component.values;
    const group = compGroup.component.value;
    const mute = compMute.component.value;
    return talkToUser(user, group, mute, env);
}

export default handle;

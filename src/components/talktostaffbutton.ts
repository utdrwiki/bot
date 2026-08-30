'use strict';
import {
    APIInteractionResponse,
    APILabelComponent,
    APIMessageComponentInteraction,
    ComponentType,
    InteractionResponseType
} from 'discord-api-types/v10';
import {ephemeralMessage} from '../discord';

/**
 * Responds to the user who clicked on the talk to staff button.
 * @param data The interaction data
 * @param env Environment data
 * @returns Response data
 * @throws {Error} If the interaction was not invoked by a guild member
 */
function handle(
    data: APIMessageComponentInteraction,
    env: Env
): APIInteractionResponse {
    if (!data.member) {
        throw new Error('Not invoked by a guild member.');
    }
    if (data.member.roles.some(role => role === env.TALKTOSTAFF_MUTE_ROLE)) {
        return ephemeralMessage('You cannot use this feature while muted.');
    }
    const staffGroups = JSON.parse(env.TALKTOSTAFF_GROUPS);
    const staffRoles = new Set(Object.values(staffGroups));
    const isStaff = data.member.roles.some(role => staffRoles.has(role));
    const selectGroup: APILabelComponent = {
        component: {
            // eslint-disable-next-line camelcase
            custom_id: 'group',
            options: [
                {
                    label: 'Discord server staff',
                    value: 'server'
                },
                {
                    label: 'Undertale Wiki staff',
                    value: 'utwiki'
                },
                {
                    label: 'Deltarune Wiki staff',
                    value: 'drwiki'
                }
            ],
            required: true,
            type: ComponentType.RadioGroup
        },
        label: 'Select the staff group you want to talk to:',
        type: ComponentType.Label
    };
    const selectUser: APILabelComponent = {
        component: {
            // eslint-disable-next-line camelcase
            custom_id: 'user',
            placeholder: 'Select a user to talk to',
            type: ComponentType.UserSelect
        },
        label: 'Select the user you want to talk to:',
        type: ComponentType.Label
    };
    const muteCheckbox: APILabelComponent = {
        component: {
            // eslint-disable-next-line camelcase
            custom_id: 'mute',
            type: ComponentType.Checkbox
        },
        label: 'Mute user?',
        type: ComponentType.Label
    };
    const confirmCheckbox: APILabelComponent = {
        component: {
            // eslint-disable-next-line camelcase
            custom_id: 'confirmation',
            options: [
                {
                    label: 'I confirm that my issue REQUIRES privacy.',
                    value: 'confirm'
                }
            ],
            type: ComponentType.CheckboxGroup
        },
        label: 'Terms:',
        type: ComponentType.Label
    };
    return {
        data: {
            components: isStaff ?
                [selectUser, selectGroup, muteCheckbox] :
                [selectGroup, confirmCheckbox],
            // eslint-disable-next-line camelcase
            custom_id: isStaff ? 'talktousermodal' : 'talktostaffmodal',
            title: isStaff ? 'Talk to user' : 'Talk to staff'
        },
        type: InteractionResponseType.Modal

    };
}

export default handle;

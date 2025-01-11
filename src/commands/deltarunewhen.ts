'use strict';
import {CommandInteraction} from '.';
import {InteractionResponse} from '../types';
import {InteractionResponseType} from 'discord-interactions';

/**
 * Tells you the % of time that elapsed between the release of Deltarune
 * Chapter 1 and the date 7 years after, estimated by Toby Fox to be the
 * maximum amount of time he is willing to spend on a project.
 *
 * Rumia asked for this.
 * @param _data Command data
 * @param _env Environment data
 * @returns Response data
 */
function handle(_data: CommandInteraction, _env: Env): InteractionResponse {
    const startDate = new Date('2018-10-31');
    const endDate = new Date('2025-10-31');
    const now = new Date();
    const sinceStart = now.getTime() - startDate.getTime();
    const total = endDate.getTime() - startDate.getTime();
    const fraction = sinceStart / total;
    const percentage = Math.round(fraction * 10000) / 100;
    return {
        data: {
            content: `${percentage}%`
        },
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    };
}

export default {
    description: 'When is Deltarune coming out?',
    handle,
    names: ['deltarunewhen', 'when', 'deltarune', 'rumiaaskedforthis']
};

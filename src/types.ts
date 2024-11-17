'use strict';
import {InteractionResponseType, InteractionType} from 'discord-interactions';

export const STRING_OPTION = 3;
export const INT_OPTION = 4;

interface User {
    id: string;
    username: string;
}

export type MemberOrUser =
    { member: { user: User } } |
    { user: User };

export interface PingInteraction {
    type: InteractionType.PING;
}

interface InteractionResponseData {
    content?: string;
    components?: object[];
    flags?: number;
}

export interface InteractionResponse {
    data?: InteractionResponseData;
    type: InteractionResponseType;
}

/**
 * Retrieves a user from interaction data.
 * @param mou Interaction data with a member or user property
 * @returns The user
 */
export function getUser(mou: MemberOrUser): User {
    if ('member' in mou) {
        return mou.member.user;
    }
    return mou.user;
}

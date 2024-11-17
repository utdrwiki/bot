'use strict';
import {InteractionType} from 'discord-interactions';
import type {InteractionResponse, MemberOrUser} from '../types';
import verify from './verify';

interface ComponentData {
    custom_id: string;
}

export type ComponentInteraction = {
    type: InteractionType.MESSAGE_COMPONENT;
    data: ComponentData;
    token: string;
} & MemberOrUser;

type ComponentHandler = (data: ComponentInteraction, env: Env) =>
    Promise<InteractionResponse> |
    InteractionResponse;

const handlers: Record<string, ComponentHandler | undefined> = {
    verify
};

export default handlers;

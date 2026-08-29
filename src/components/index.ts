'use strict';
import {
    APIInteractionResponse,
    APIMessageComponentInteraction
} from 'discord-api-types/v10';
import verify from './verify';

type ComponentHandler = (
    data: APIMessageComponentInteraction,
    env: Env
) => Promise<APIInteractionResponse> | APIInteractionResponse;

const handlers: Record<string, ComponentHandler | undefined> = {
    verify
};

export default handlers;

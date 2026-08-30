'use strict';
import {
    APIInteractionResponse,
    APIModalSubmitInteraction
} from 'discord-api-types/v10';
import talktostaffmodal from './talktostaffmodal';
import talktousermodal from './talktousermodal';

type ComponentHandler = (
    data: APIModalSubmitInteraction,
    env: Env
) => Promise<APIInteractionResponse> | APIInteractionResponse;

const handlers: Record<string, ComponentHandler | undefined> = {
    talktostaffmodal,
    talktousermodal
};

export default handlers;

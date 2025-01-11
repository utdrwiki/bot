'use strict';
import {
    INT_OPTION,
    InteractionResponse,
    MemberOrUser,
    STRING_OPTION
} from '../types';
import {InteractionType} from 'discord-interactions';
import deltarunewhen from './deltarunewhen';

interface IntOption {
    type: typeof INT_OPTION;
    value: number;
}

interface StringOption {
    type: typeof STRING_OPTION;
    value: string;
}

type CommandOptionValue = IntOption | StringOption;

type CommandOption = {
    name: string;
} & CommandOptionValue;

interface CommandData {
    name: string;
    options: CommandOption[];
}

export type CommandInteraction = {
    type: InteractionType.APPLICATION_COMMAND;
    data: CommandData;
    token: string;
} & MemberOrUser;

interface CommandRegisterOption {
    name: string;
    description: string;
    required?: boolean;
    type: typeof INT_OPTION | typeof STRING_OPTION;
}

interface Command {
    names: string[];
    description: string;
    handle: (
        data: CommandInteraction,
        env: Env
    ) => Promise<InteractionResponse> | InteractionResponse;
    options?: CommandRegisterOption[];
}

/**
 * Retrieves a string option from a command interaction.
 * @param name Option name
 * @param data Command interaction data
 * @returns Option value
 * @throws {Error} If the option is missing or not a string
 */
export function getStringOption(
    name: string,
    data: CommandInteraction
): string {
    const value = data.data.options.find(opt => opt.name === name);
    if (!value) {
        throw new Error(`Missing string option "${name}".`);
    }
    if (value.type !== STRING_OPTION) {
        throw new Error(`Expected string option "${name}".`);
    }
    return value.value;
}

const commands: Command[] = [
    deltarunewhen
];

export default commands;

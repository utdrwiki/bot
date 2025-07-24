'use strict';
import {
    CommandOptionType,
    InteractionResponse,
    MemberOrUser
} from '../types';
import {InteractionType} from 'discord-interactions';
import deltarunewhen from './deltarunewhen';
import notes from './notes';

interface BaseOption {
    name: string;
}

interface IntOption extends BaseOption {
    type: CommandOptionType.INT_OPTION;
    value: number;
}

interface StringOption extends BaseOption {
    type: CommandOptionType.STRING_OPTION;
    value: string;
}

interface UserOption extends BaseOption {
    type: CommandOptionType.USER_OPTION;
    value: string;
}

interface Subcommand extends BaseOption {
    type: CommandOptionType.SUBCOMMAND;
    // eslint-disable-next-line no-use-before-define
    options: CommandOption[];
}

type CommandOption = IntOption | StringOption | UserOption | Subcommand;

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
    options?: CommandRegisterOption[];
    type: CommandOptionType;
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
 * Retrieves a string option from a command's options.
 * @param name Option name
 * @param options Command options
 * @returns Option value
 * @throws {Error} If the option is missing or not a string
 */
export function getStringOption(
    name: string,
    options: CommandOption[]
): string {
    const value = options.find(opt => opt.name === name);
    if (!value) {
        throw new Error(`Missing string option "${name}".`);
    }
    if (value.type !== CommandOptionType.STRING_OPTION) {
        throw new Error(`Expected string option "${name}".`);
    }
    return value.value;
}

/**
 * Retrieves a user option from a command's options.
 * @param name Option name
 * @param options Command options
 * @returns Option value
 * @throws {Error} If the option is missing or not a string
 */
export function getUserOption(
    name: string,
    options: CommandOption[]
): string {
    const value = options.find(opt => opt.name === name);
    if (!value) {
        throw new Error(`Missing user option "${name}".`);
    }
    if (value.type !== CommandOptionType.USER_OPTION) {
        throw new Error(`Expected user option "${name}".`);
    }
    return value.value;
}

/**
 * Retrieves the current command's subcommand.
 * @param options Command options
 * @returns Subcommand and its data
 * @throws {Error} If the subcommand is missing
 */
export function getSubcommand(options: CommandOption[]): Subcommand {
    const subcommand = options
        .find(({type}) => type === CommandOptionType.SUBCOMMAND);
    if (!subcommand) {
        throw new Error('Missing subcommand.');
    }
    return subcommand as Subcommand;
}

const commands: Command[] = [
    deltarunewhen,
    notes
];

export default commands;

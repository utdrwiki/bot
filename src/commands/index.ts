'use strict';
import {
    APIApplicationCommandInteraction,
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandOption,
    APIInteractionResponse,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    InteractionType
} from 'discord-api-types/v10';
import deltarunewhen from './deltarunewhen';
import notes from './notes';
import rumiaaskedforthis from './rumiaaskedforthis';

type CommandOption =
    APIApplicationCommandInteractionDataOption<
        InteractionType.ApplicationCommand
    >;

type Subcommand = Extract<
    CommandOption,
    {type: ApplicationCommandOptionType.Subcommand}
>;

interface Command {
    names: string[];
    description: string;
    handle: (
        data: APIApplicationCommandInteraction,
        env: Env
    ) => Promise<APIInteractionResponse> | APIInteractionResponse;
    options?: APIApplicationCommandOption[];
    type?: ApplicationCommandType;
    permissions?: bigint;
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
    options?: CommandOption[]
): string {
    if (!options) {
        throw new Error(`Missing string option list for "${name}".`);
    }
    const value = options.find(opt => opt.name === name);
    if (!value) {
        throw new Error(`Missing string option "${name}".`);
    }
    if (value.type !== ApplicationCommandOptionType.String) {
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
export function getUserOption(name: string, options?: CommandOption[]): string {
    if (!options) {
        throw new Error(`Missing user option list for "${name}".`);
    }
    const value = options.find(opt => opt.name === name);
    if (!value) {
        throw new Error(`Missing user option "${name}".`);
    }
    if (value.type !== ApplicationCommandOptionType.User) {
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
export function getSubcommand(options?: CommandOption[]): Subcommand {
    if (!options) {
        throw new Error('Missing subcommand list.');
    }
    const subcommand = options.find(
        ({type}) => type === ApplicationCommandOptionType.Subcommand
    );
    if (!subcommand) {
        throw new Error('Missing subcommand.');
    }
    return subcommand as Subcommand;
}

const commands: Command[] = [
    deltarunewhen,
    notes,
    rumiaaskedforthis
];

export default commands;

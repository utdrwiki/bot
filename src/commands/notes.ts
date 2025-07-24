'use strict';
import {
    CommandInteraction,
    getStringOption,
    getSubcommand,
    getUserOption
} from '.';
import {
    CommandOptionType,
    InteractionResponse,
    User,
    getUser
} from '../types';
import {ephemeralMessage} from '../discord';

interface Note {
    date: string;
    note: string;
    author: string;
}

/**
 * Add a new note to a user.
 * @param user User ID
 * @param author User who is adding the note
 * @param notes List of notes
 * @param note Note to add
 * @param db Database to store notes
 * @returns Response data
 */
async function handleAdd(
    user: string,
    author: User,
    notes: Note[],
    note: string,
    db: KVNamespace<string>
): Promise<InteractionResponse> {
    notes.push({
        author: author.id,
        date: new Date().toISOString(),
        note
    });
    await db.put(`notes:${user}`, JSON.stringify(notes));
    return ephemeralMessage('Note added.');
}

/**
 * Retrieve all notes from a user.
 * @param notes List of notes
 * @returns Response data
 */
function handleGet(notes: Note[]): InteractionResponse {
    if (notes.length === 0) {
        return ephemeralMessage('User has no notes.');
    }
    notes.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return ephemeralMessage(
        `User has ${notes.length} notes. Here are the last 5:${notes
            .slice(0, 5)
            .map(
                ({note, date, author}, index) => `\n${index + 1}. "${note}" by <@${author}> on <t:${Math.floor(new Date(date).getTime() / 1000)}:f>`
            )
            .join('')
    }`
);
}

/**
 * Manage notes between moderators on Discord users.
 * @param data Command data
 * @param env Environment data
 * @returns Response data
 */
async function handle(
    data: CommandInteraction,
    env: Env
): Promise<InteractionResponse> {
    const subcommand = getSubcommand(data.data.options);
    const user = getUserOption('user', subcommand.options);
    const author = getUser(data);
    const notesDB = await env.UTW_BOT.get(`notes:${user}`);
    const notes: Note[] = notesDB ? JSON.parse(notesDB) : [];
    switch (subcommand.name) {
        case 'add':
            return handleAdd(
                user,
                author,
                notes,
                getStringOption('note', subcommand.options),
                env.UTW_BOT
            );
        case 'get':
            return handleGet(notes);
        default:
            throw new Error(`Unknown subcommand "${subcommand.name}".`);
    }
}

export default {
    description: 'Add note to a user',
    handle,
    names: ['note'],
    options: [
        {
            description: 'Add a note to this user.',
            name: 'add',
            options: [
                {
                    description: 'User to add a note to.',
                    name: 'user',
                    required: true,
                    type: CommandOptionType.USER_OPTION
                },
                {
                    description: 'Note to add.',
                    name: 'note',
                    required: true,
                    type: CommandOptionType.STRING_OPTION
                }
            ],
            type: CommandOptionType.SUBCOMMAND
        },
        {
            description: 'Check notes of this user.',
            name: 'get',
            options: [
                {
                    description: 'User to check notes of.',
                    name: 'user',
                    required: true,
                    type: CommandOptionType.USER_OPTION
                }
            ],
            type: CommandOptionType.SUBCOMMAND
        }
    ]
};

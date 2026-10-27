/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, Message } from "@vencord/discord-types";
import { findByCode } from "@webpack";
import { ChannelStore, lodash, showToast, UserStore } from "@webpack/common";

import { Discord, HolyNotes } from "./types";
import { deleteCacheFromDataStore, DeleteEntireStore, saveCacheToDataStore } from "./utils";

export const noteHandlerCache = new Map();

export default new (class NoteHandler {
    private _formatNote(channel: Channel, message: Message): HolyNotes.Note {
        return {
            id: message.id,
            channel_id: message.channel_id,
            guild_id: channel.guild_id,
            content: message.content,
            author: {
                id: message.author.id,
                avatar: message.author.avatar,
                discriminator: message.author.discriminator,
                username: message.author.username,
            },
            flags: message.flags,
            // Moment has a toString() function, this doesn't convert to '[object Object]'.
            timestamp: message.timestamp.toString(),
            attachments: message.attachments as Discord.Attachment[],
            embeds: message.embeds,
            reactions: message.reactions as Discord.Reaction[],
            stickerItems: message.stickerItems,
        };
    }


    public getNotes(notebook?: string): Record<string, HolyNotes.Note> {
        return noteHandlerCache.get(notebook);
    }

    public getAllNotes(): HolyNotes.Note[] {
        const data = noteHandlerCache.entries();
        const notes = {};
        for (const [key, value] of data) {
            notes[key] = value;
        }
        return notes as HolyNotes.Note[];
    }

    public addNote = async (message: Message, notebook: string) => {
        const notes = this.getNotes(notebook);
        const channel = ChannelStore.getChannel(message.channel_id);
        const newNotes = Object.assign({ [message.id]: this._formatNote(channel, message) }, notes);

        noteHandlerCache.set(notebook, newNotes);
        saveCacheToDataStore(notebook, newNotes as unknown as HolyNotes.Note[]);

        showToast({
            text: `Successfully added note to  ${notebook}.`,
            variant: "success",
        });
    };

    public deleteNote = async (noteId: string, notebook: string) => {
        const notes = this.getNotes(notebook);

        noteHandlerCache.set(notebook, lodash.omit(notes, noteId));
        saveCacheToDataStore(notebook, lodash.omit(notes, noteId) as unknown as HolyNotes.Note[]);

        showToast({
            text: `Successfully deleted note from ${notebook}.`,
            variant: "success",
        });
    };

    public moveNote = async (note: HolyNotes.Note, from: string, to: string) => {
        const origNotebook = this.getNotes(from);
        const newNoteBook = lodash.cloneDeep(this.getNotes(to));

        newNoteBook[note.id] = note;

        noteHandlerCache.set(from, lodash.omit(origNotebook, note.id));
        noteHandlerCache.set(to, newNoteBook);

        saveCacheToDataStore(from, lodash.omit(origNotebook, note.id) as unknown as HolyNotes.Note[]);
        saveCacheToDataStore(to, newNoteBook as unknown as HolyNotes.Note[]);


        showToast({
            text: `Successfully moved note from ${from} to ${to}.`,
            variant: "success",
        });
    };

    public newNoteBook = async (notebookName: string, silent?: Boolean) => {
        let notebookExists = false;

        for (const key of noteHandlerCache.keys()) {
            if (key === notebookName) {
                notebookExists = true;
                break;
            }
        }

        if (notebookExists) {
            showToast({
                text: `Notebook ${notebookName} already exists.`,
                variant: "critical",
            });
            return;
        }

        noteHandlerCache.set(notebookName, {});
        saveCacheToDataStore(notebookName, {} as HolyNotes.Note[]);

        if (!silent) return showToast({
            text: `Successfully created ${notebookName}.`,
            variant: "success",
        });
    };

    public deleteNotebook = async (notebookName: string) => {
        noteHandlerCache.delete(notebookName);
        deleteCacheFromDataStore(notebookName);

        showToast({
            text: `Successfully deleted ${notebookName}.`,
            variant: "success",
        });
    };

    public refreshAvatars = async () => {
        const notebooks = this.getAllNotes();

        const User = findByCode("tag", "isClyde");

        for (const notebook in notebooks)
            for (const noteId in notebooks[notebook]) {
                const note = notebooks[notebook][noteId];
                const user = UserStore.getUser(note.author.id) ?? new User({ ...note.author });

                Object.assign(notebooks[notebook][noteId].author, {
                    avatar: user.avatar,
                    discriminator: user.discriminator,
                    username: user.username,
                });
            }

        for (const notebook in notebooks) {
            noteHandlerCache.set(notebook, notebooks[notebook]);
            saveCacheToDataStore(notebook, notebooks[notebook] as unknown as HolyNotes.Note[]);
        }

        showToast({
            text: "Successfully refreshed avatars.",
            variant: "success",
        });

    };

    public deleteEverything = async () => {
        noteHandlerCache.clear();
        await DeleteEntireStore();

        showToast({
            text: "Successfully deleted all notes.",
            variant: "success",
        });
    };

    public exportNotes = async () => {
        return this.getAllNotes();
    };

    public importNotes = async (notes: HolyNotes.Note[]) => {
        try {
            var parseNotes = JSON.parse(notes as unknown as string);
        } catch (e) {
            console.log(e);
            return showToast({
                text: "Invalid JSON.",
                variant: "critical",
            });
        }

        for (const notebook in parseNotes) {
            noteHandlerCache.set(notebook, parseNotes[notebook]);
            saveCacheToDataStore(notebook, parseNotes[notebook] as unknown as HolyNotes.Note[]);
        }

        showToast({
            text: "Successfully imported notes.",
            variant: "success",
        });

    };
});

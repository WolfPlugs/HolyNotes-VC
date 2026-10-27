/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { RenderModalProps } from "@vencord/discord-types";
import { Modal, React } from "@webpack/common";

import noteHandler from "../../NoteHandler";
import Error from "./Error";
import { RenderMessage } from "./RenderMessage";

export default ({ notebook, onChangeTab, ...props }: RenderModalProps & { notebook: string; onChangeTab: React.Dispatch<React.SetStateAction<string>>; }) => {
    const notes = noteHandler.getNotes(notebook);

    const handleDelete = () => {
        props.onClose();
        onChangeTab("Main");
        noteHandler.deleteNotebook(notebook);
    };

    return (
        <Modal
            {...props}
            title="Confirm Deletion"
            size="xl"
            actions={[
                {
                    text: "DELETE",
                    variant: "critical-primary",
                    onClick: handleDelete,
                },
            ]}
        >
            <ErrorBoundary>
                {notes && Object.keys(notes).length > 0 ? (
                    Object.values(notes).map(note => (
                        <RenderMessage
                            key={note.id}
                            note={note}
                            notebook={notebook}
                            fromDeleteModal={true} />
                    ))
                ) : (
                    <Error />
                )}
            </ErrorBoundary>
        </Modal>
    );
};

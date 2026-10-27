/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { RenderModalProps } from "@vencord/discord-types";
import { Modal, React, TextInput } from "@webpack/common";

import noteHandler from "../../NoteHandler";

export default (props: RenderModalProps) => {
    const [notebookName, setNotebookName] = React.useState("");

    const handleCreateNotebook = React.useCallback(() => {
        if (notebookName !== "") noteHandler.newNoteBook(notebookName);
        props.onClose();
    }, [notebookName]);

    return (
        <div>
            <Modal
                {...props}
                title="Create Notebook"
                actions={[
                    {
                        text: "Create Notebook",
                        variant: "primary",
                        onClick: handleCreateNotebook,
                    },
                ]}
            >
                <TextInput
                    value={notebookName}
                    placeholder="Notebook Name"
                    onChange={value => setNotebookName(value)}
                    style={{ marginBottom: "10px" }} />
            </Modal>
        </div>
    );
};

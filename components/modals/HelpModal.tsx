/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText } from "@components/BaseText";
import { Paragraph } from "@components/Paragraph";
import { RenderModalProps } from "@vencord/discord-types";
import { findCssClasses } from "@webpack";
import { Modal } from "@webpack/common";

import noteHandler from "../../NoteHandler";
import { downloadNotes, uploadNotes } from "../../utils";

export default (props: RenderModalProps) => {
    const { statusTagGreen } = findCssClasses("statusTagGreen");

    return (
        <Modal
            {...props}
            title="Help Modal"
            size="lg"
            actions={[
                {
                    text: "Refresh Avatars",
                    variant: "primary",
                    onClick: noteHandler.refreshAvatars,
                },
                {
                    text: "Import Notes",
                    variant: "primary",
                    onClick: uploadNotes,
                },
                {
                    text: "Export Notes",
                    variant: "primary",
                    onClick: downloadNotes,
                },
                {
                    text: "Delete All Notes",
                    variant: "critical-primary",
                    onClick: noteHandler.deleteEverything,
                },
            ]}
        >
            <div className="vc-help-markdown">
                <BaseText>Adding Notes</BaseText>
                <Paragraph>
                    To add a note right click on a message then hover over the "Note Message" item and click
                    <br />
                    the button with the notebook name you would like to note the message to.
                    <br />
                    <span style={{ fontWeight: "bold" }} className={statusTagGreen}>
                        Protip:
                    </span>{" "}
                    Clicking the "Note Message" button by itself will note to Main by default!
                </Paragraph>
                <hr />
                <BaseText>Deleting Notes</BaseText>
                <Paragraph>
                    Note you can either right click the note and hit "Delete Note" or you can hold the
                    'DELETE' key on your keyboard and click on a note; it's like magic!
                </Paragraph>
                <hr />
                <BaseText>Moving Notes</BaseText>
                <Paragraph>
                    To move a note right click on a note and hover over the "Move Note" item and click on
                    the button corresponding to the notebook you would like to move the note to.
                </Paragraph>
                <hr />
                <BaseText>Jump To Message</BaseText>
                <Paragraph>
                    To jump to the location that the note was originally located at just right click on the
                    note and hit "Jump to Message".
                </Paragraph>
            </div>
        </Modal>
    );
};

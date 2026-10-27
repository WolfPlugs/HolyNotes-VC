/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText } from "@components/BaseText";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { classes } from "@utils/misc";
import { RenderModalProps } from "@vencord/discord-types";
import { Modal, openModal, React, Select, TextInput } from "@webpack/common";

import noteHandler from "../../NoteHandler";
import { HolyNotes } from "../../types";
import HelpIcon from "../icons/HelpIcon";
import Errors from "./Error";
import HelpModal from "./HelpModal";
import NotebookCreateModal from "./NotebookCreateModal";
import NotebookDeleteModal from "./NotebookDeleteModal";
import { CreateTabBar } from "./NoteBookTab";
import { RenderMessage } from "./RenderMessage";

const renderNotebook = ({
    notes, notebook, updateParent, sortDirection, sortType, searchInput, closeModal
}: {
    notes: Record<string, HolyNotes.Note>;
    notebook: string;
    updateParent: () => void;
    sortDirection: boolean;
    sortType: boolean;
    searchInput: string;
    closeModal: () => void;
}) => {
    const messageArray = Object.values(notes).map(note => (
        <RenderMessage
            key={note.id}
            note={note}
            notebook={notebook}
            updateParent={updateParent}
            fromDeleteModal={false}
            closeModal={closeModal}
        />
    ));

    if (sortType)
        messageArray.sort(
            (a, b) =>
                new Date(b.props.note?.timestamp)?.getTime() - new Date(a.props.note?.timestamp)?.getTime(),
        );

    if (sortDirection) messageArray.reverse();

    const filteredMessages = messageArray.filter(message =>
        message.props.note?.content?.toLowerCase().includes(searchInput.toLowerCase()),
    );

    return filteredMessages.length > 0 ? filteredMessages : <Errors />;
};


enum SortingEnum {
    AscendingDateAdded = "ada",
    AscendingMessageDate = "amd",
    DescendingDateAdded = "dda",
    DescendingMessageDate = "dmd",
}


export const NoteModal = (props: RenderModalProps) => {
    const [sortingSelection, setSortingSelection] = React.useState(SortingEnum.AscendingDateAdded);
    const [sortDirection, setSortDirection] = React.useState(true);
    const [sortType, setSortType] = React.useState(true);
    const [searchInput, setSearch] = React.useState("");
    const [currentNotebook, setCurrentNotebook] = React.useState("Main");

    const changeSorting = (value: SortingEnum) => {
        setSortDirection(value === SortingEnum.AscendingDateAdded || value === SortingEnum.AscendingMessageDate);
        setSortType(value === SortingEnum.AscendingDateAdded || value === SortingEnum.DescendingDateAdded);
        setSortingSelection(value);
    };

    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

    const notes = noteHandler.getNotes(currentNotebook);
    if (!notes) return <></>;

    const { TabBar, selectedTab } = CreateTabBar({ tabs: noteHandler.getAllNotes(), firstSelectedTab: currentNotebook, onChangeTab: setCurrentNotebook });
    const isNotMain = currentNotebook !== "Main";

    return (
        <ErrorBoundary>
            <Modal
                {...props}
                size="xl"
                title={
                    <div>
                        <Flex flexDirection="row" alignItems="center">
                            <BaseText
                                size="lg"
                                weight="semibold"
                                style={{ flexGrow: 1 }}
                                className={classes("vc-notebook-heading")}>
                                NOTEBOOK
                            </BaseText>
                            <div className={classes("vc-notebook-flex", "vc-help-icon")} onClick={() => openModal(HelpModal)}>
                                <HelpIcon />
                            </div>
                            <div className={classes("vc-notebook-search")}>
                                <TextInput
                                    autoFocus={false}
                                    placeholder="Search for a message..."
                                    onChange={e => setSearch(e)}
                                />
                            </div>
                        </Flex>
                        <div className={classes("vc-notebook-tabbar-container")}>
                            {TabBar}
                        </div>
                    </div>
                }
                actions={[
                    {
                        text: isNotMain ? "Delete Notebook" : "Create Notebook",
                        variant: isNotMain ? "critical-primary" : "primary",
                        onClick: isNotMain
                            ? () => openModal(props => <NotebookDeleteModal {...props} notebook={currentNotebook} onChangeTab={setCurrentNotebook} />)
                            : () => openModal(props => <NotebookCreateModal {...props} />),
                    },
                ]}
                actionBarInput={
                    <div className={classes("sort-button-container", "vc-notebook-display-left")}>
                        <BaseText>Change Sorting:</BaseText>
                        <Select
                            options={[
                                { label: "Ascending / Date Added", value: SortingEnum.AscendingDateAdded },
                                { label: "Ascending / Message Date", value: SortingEnum.AscendingMessageDate },
                                { label: "Descending / Date Added", value: SortingEnum.DescendingDateAdded },
                                { label: "Descending / Message Date", value: SortingEnum.DescendingMessageDate },
                            ]}
                            isSelected={v => v === sortingSelection}
                            closeOnSelect={true}
                            select={changeSorting}
                            serialize={v => v}
                        />
                    </div>
                }
            >
                <ErrorBoundary>
                    {renderNotebook({
                        notes,
                        notebook: currentNotebook,
                        updateParent: () => forceUpdate(),
                        sortDirection: sortDirection,
                        sortType: sortType,
                        searchInput: searchInput,
                        closeModal: props.onClose,
                    })}
                </ErrorBoundary>
            </Modal>
        </ErrorBoundary>
    );
};

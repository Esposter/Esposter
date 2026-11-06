import type { AnyPageBuilderDocument } from "@/models/pageBuilder/AnyPageBuilderDocument";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { UiCommand } from "@/models/ui/UiCommand";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { checkIsElementTarget } from "@/util/dom/checkIsElementTarget";
import { getBlockNode } from "headless-block-editor";

// A focused button or link takes Enter as its own activation rather than a text edit
const checkIsControlTarget = (target: EventTarget | null) =>
  checkIsElementTarget(target) && target.closest("button, a[href]") !== null;
// The editor's keys over the selected node. Its moves, its clipboard and its delete are commands, bound for as long as the editor is
// Mounted and unbound while a node's delete asks. Enter is listed but never bound, since a focused button or link must keep it, and
// The canvas's frame is a document of its own, so the keys it passes on are pressed again on the window where the commands are bound
export const usePageBuilderKeyCommands = (
  kind: AnyPageBuilderKind,
  getPageDocument: () => AnyPageBuilderDocument | undefined,
  resourceId: MaybeRefOrGetter<string>,
  announce: (message: string) => void,
  isDeleteOpen: Ref<boolean>,
) => {
  const {
    deleteNode,
    deleteSelected,
    getMoveDownRefusal,
    getMoveLeftRefusal,
    getMoveRightRefusal,
    getMoveUpRefusal,
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
  } = usePageBuilderMoves(kind, getPageDocument, resourceId, announce);
  const { copySelected, cutSelected, pasteSelected } = usePageBuilderClipboard(
    kind,
    getPageDocument,
    resourceId,
    announce,
    deleteNode,
  );
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId, setEditingNodeId } = pageBuilderCanvasStore;
  // Enter edits the selected node in place when it is a text node, and does nothing for any other node
  const startTextEdit = () => {
    const currentDocument = getPageDocument();
    const nodeId = getSelectedNodeId(toValue(resourceId));
    const nodePointer = currentDocument && getNodePointer(kind, currentDocument, nodeId);
    if (!currentDocument || nodePointer === undefined) return;
    if (getBlockNode(currentDocument, nodePointer, kind.children)?.type !== kind.textType) return;

    setEditingNodeId(toValue(resourceId), nodeId);
  };
  // Keys typed in a text field are no edit key, so the editor's own Enter is taken only from outside one
  const handleEnterKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || checkIsEditableTarget(event.target) || checkIsControlTarget(event.target)) return;

    startTextEdit();
  };
  // The canvas takes its arrows and Escape and hands every other key here. Enter starts a text edit, and each key is pressed again
  // On the window, where its command is bound, so a command that takes the key prevents its default in the frame too
  const handleCanvasKeydown = (event: KeyboardEvent) => {
    handleEnterKeydown(event);
    const forwardedEvent = new KeyboardEvent("keydown", {
      altKey: event.altKey,
      bubbles: true,
      cancelable: true,
      ctrlKey: event.ctrlKey,
      key: event.key,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
    });
    if (!window.dispatchEvent(forwardedEvent)) event.preventDefault();
  };
  // Paste needs no selection, since it lands where nothing is selected too, so it is bound whenever the editor is and no delete asks
  const pasteCommand: UiCommand = {
    group: PAGE_BUILDER_COMMAND_GROUP,
    id: "page-builder-paste",
    meaning: UiIconMeaning.Paste,
    run: pasteSelected,
    shortcut: "cmd+v",
    title: "Paste a block",
  };
  // A move the selection cannot take stays listed, unavailable with the reason it cannot, so the reader sees why it is not taken
  const getMoveProps = (refusal: string | undefined) => ({ description: refusal, isDisabled: refusal !== undefined });
  // The commands over the selected node, which are bound and listed only while a node is selected
  const getSelectionCommands = (): UiCommand[] => [
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-delete",
      meaning: UiIconMeaning.Delete,
      run: deleteSelected,
      shortcut: "delete",
      title: "Delete the selected block",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-delete-backspace",
      meaning: UiIconMeaning.Delete,
      run: deleteSelected,
      shortcut: "backspace",
      title: "Delete the selected block",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-copy",
      meaning: UiIconMeaning.Copy,
      run: copySelected,
      shortcut: "cmd+c",
      title: "Copy the selected block",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-cut",
      meaning: UiIconMeaning.Delete,
      run: cutSelected,
      shortcut: "cmd+x",
      title: "Cut the selected block",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-move-down",
      meaning: UiIconMeaning.ArrowDown,
      ...getMoveProps(getMoveDownRefusal()),
      run: moveDown,
      shortcut: "alt+arrowdown",
      title: "Move the selected block down",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-move-left",
      meaning: UiIconMeaning.ArrowLeft,
      ...getMoveProps(getMoveLeftRefusal()),
      run: moveLeft,
      shortcut: "alt+arrowleft",
      title: "Move the selected block out of its parent",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-move-right",
      meaning: UiIconMeaning.ArrowRight,
      ...getMoveProps(getMoveRightRefusal()),
      run: moveRight,
      shortcut: "alt+arrowright",
      title: "Move the selected block into the block before it",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-move-up",
      meaning: UiIconMeaning.ArrowUp,
      ...getMoveProps(getMoveUpRefusal()),
      run: moveUp,
      shortcut: "alt+arrowup",
      title: "Move the selected block up",
    },
    {
      group: PAGE_BUILDER_COMMAND_GROUP,
      id: "page-builder-edit-text",
      meaning: UiIconMeaning.Edit,
      shortcut: "enter",
      title: "Edit the selected text",
    },
  ];

  useCommands((): UiCommand[] => {
    if (isDeleteOpen.value) return [];
    if (!getSelectedNodeId(toValue(resourceId))) return [pasteCommand];

    return [pasteCommand, ...getSelectionCommands()];
  });

  return { handleCanvasKeydown, handleEnterKeydown };
};

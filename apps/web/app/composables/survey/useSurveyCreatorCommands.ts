import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";
import type { History, JsonPatchOperation } from "@esposter/shared";
import type { BlockNodeProps } from "headless-block-editor";
import type { SurveyDocument, SurveyNode, SurveyNodeType, SurveyRootProps } from "headless-survey-engine";

import { ROOT_POINTER } from "@/services/pageBuilder/constants";
import { getRecordedHistory } from "@/services/pageBuilder/getRecordedHistory";
import { createSurveyNode } from "@/services/resource/survey/createSurveyNode";
import { getSurveyNodeLocation } from "@/services/resource/survey/getSurveyNodeLocation";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { JsonPatchOperationType, parseJsonPointer, readJsonValue, redoHistory, undoHistory } from "@esposter/shared";
import {
  applyBlockEdit,
  duplicateBlockNode,
  getAcceptedTypes,
  getBlockLayerRows,
  getBlockNode,
  getBlockPropPointer,
  getFocusAfterRemoval,
  getSiblingMoveOperations,
  insertBlockNode,
  moveBlockNode,
  moveIntoPreviousSibling,
  moveOutAfterParent,
  removeBlockNode,
  updateBlockNodeProps,
} from "headless-block-editor";
import { surveyDocumentSchema, surveyNodeChildren, surveyNodeSchema, surveyRegistry } from "headless-survey-engine";

// How many elements a slot holds, so a new element placed at the slot's end lands after the last of them
const getSlotLength = (document: SurveyDocument, slotPointer: string) => {
  const elements = readJsonValue(document, parseJsonPointer(slotPointer));
  return Array.isArray(elements) ? elements.length : 0;
};
// A question's name, which the survey keeps unique across its questions. A page or a panel holds none
const getElementName = (node: SurveyNode | undefined) => (node && "name" in node.props ? node.props.name : undefined);
// The names the document's elements hold, which a new name has to avoid
const getElementNames = (document: SurveyDocument) =>
  new Set(
    getBlockLayerRows(document, surveyNodeChildren).flatMap(({ nodePointer }) => {
      const name = getElementName(getBlockNode(document, nodePointer, surveyNodeChildren));
      return name === undefined ? [] : [name];
    }),
  );
// The first name from a base that no element holds. The name joins the set, so the next name from the same base skips it
const addUniqueName = (base: string, names: Set<string>) => {
  let index = 1;
  while (names.has(`${base}${index}`)) index += 1;

  const name = `${base}${index}`;
  names.add(name);
  return name;
};
// Where a new element goes: straight after the selected element in its own slot. With nothing selected it goes to the end of
// The first page's children when they take its type, and otherwise to the end of the survey's pages, which is where a page goes
const getInsertTarget = (document: SurveyDocument, selectedPointer: string, type: SurveyNodeType) => {
  if (selectedPointer !== "") {
    const location = getSurveyNodeLocation(selectedPointer);
    return location && { index: location.index + 1, slotPointer: location.slotPointer };
  }

  const slotPointer = [getBlockPropPointer("/content/0", "children"), "/content"].find((candidate) =>
    getAcceptedTypes(document, surveyRegistry, surveyNodeChildren, candidate).includes(type),
  );
  return slotPointer === undefined ? undefined : { index: getSlotLength(document, slotPointer), slotPointer };
};
// The commands the creator's panes and shortcuts run over its document. Each gesture is one of the core's commands, applied
// Through the survey's document schema as one history entry. A command the core or the schema refuses changes nothing and returns false
export const useSurveyCreatorCommands = () => {
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document, history, selectedPointer } = storeToRefs(surveyCreatorStore);
  const { commit } = surveyCreatorStore;
  const applyEdit = (operations: JsonPatchOperation[], label: string, interactionId?: string) => {
    if (operations.length === 0) return false;

    return applyBlockEdit(surveyDocumentSchema, document.value, operations).match(
      ({ document: editedDocument, inverses }) => {
        commit(editedDocument, getRecordedHistory(history.value, { interactionId, inverses, label, operations }));
        return true;
      },
      (error) => {
        console.error(error);
        return false;
      },
    );
  };
  // An undo or a redo applies the operations that undo or redo its entry, and the history moves only when they land
  const moveHistory = (operations: JsonPatchOperation[], movedHistory: History<PageBuilderHistoryEntry>) => {
    applyBlockEdit(surveyDocumentSchema, document.value, operations).match((moved) => {
      commit(moved.document, movedHistory);
    }, console.error);
  };
  const undo = () => {
    const { entry, history: undoneHistory } = undoHistory(history.value);
    if (entry !== undefined) moveHistory(entry.inverses, undoneHistory);
  };
  const redo = () => {
    const { entry, history: redoneHistory } = redoHistory(history.value);
    if (entry !== undefined) moveHistory(entry.operations, redoneHistory);
  };
  const select = (nodePointer: string) => {
    selectedPointer.value = nodePointer;
  };
  // A kind inserted at an index of a slot, as one history entry, and selected. The core refuses a slot that takes no node of its kind
  const insertNodeAt = (type: SurveyNodeType, slotPointer: string, index: number) => {
    const node = createSurveyNode(
      type,
      crypto.randomUUID(),
      addUniqueName("question", getElementNames(document.value)),
    );
    if (node === undefined) return false;

    const isInserted = applyEdit(
      insertBlockNode(document.value, surveyRegistry, surveyNodeChildren, slotPointer, index, node),
      "Insert element",
    );
    if (isInserted) selectedPointer.value = `${slotPointer}/${index}`;
    return isInserted;
  };
  const insertNode = (type: SurveyNodeType) => {
    const target = getInsertTarget(document.value, selectedPointer.value, type);
    return target !== undefined && insertNodeAt(type, target.slotPointer, target.index);
  };
  const moveElement = (operations: JsonPatchOperation[]) => applyEdit(operations, "Move element");
  const moveNodeDown = (nodePointer: string) =>
    moveElement(getSiblingMoveOperations(document.value, surveyRegistry, surveyNodeChildren, nodePointer, 1));
  const moveNodeUp = (nodePointer: string) =>
    moveElement(getSiblingMoveOperations(document.value, surveyRegistry, surveyNodeChildren, nodePointer, -1));
  const moveNodeIntoPrevious = (nodePointer: string) =>
    moveElement(moveIntoPreviousSibling(document.value, surveyRegistry, surveyNodeChildren, nodePointer));
  const moveNodeOut = (nodePointer: string) =>
    moveElement(moveOutAfterParent(document.value, surveyRegistry, surveyNodeChildren, nodePointer));
  const moveNodeTo = (nodePointer: string, slotPointer: string, index: number) =>
    moveElement(moveBlockNode(document.value, surveyRegistry, surveyNodeChildren, nodePointer, slotPointer, index));
  // The renames a copy needs: each question in the copied subtree takes a name no element holds, since a copy would
  // Otherwise repeat the name of the question it copies. The name is numbered from its base without a trailing number,
  // So a copy of question1 is question2 as an inserted question is, rather than question11
  const getCopyNameOperations = (nodePointer: string, copyPointer: string): JsonPatchOperation[] => {
    const names = getElementNames(document.value);
    return getBlockLayerRows(document.value, surveyNodeChildren).flatMap(({ nodePointer: rowPointer }) => {
      const isInCopy = rowPointer === nodePointer || rowPointer.startsWith(`${nodePointer}/`);
      const name = isInCopy ? getElementName(getBlockNode(document.value, rowPointer, surveyNodeChildren)) : undefined;
      if (name === undefined) return [];

      return [
        {
          op: JsonPatchOperationType.Replace,
          path: getBlockPropPointer(`${copyPointer}${rowPointer.slice(nodePointer.length)}`, "name"),
          value: addUniqueName(name.replace(/\d+$/u, "") || name, names),
        },
      ];
    });
  };
  const duplicateNode = (nodePointer: string) => {
    const location = getSurveyNodeLocation(nodePointer);
    if (location === undefined) return false;

    const copyPointer = `${location.slotPointer}/${location.index + 1}`;
    const operations = duplicateBlockNode(
      document.value,
      surveyRegistry,
      surveyNodeChildren,
      surveyNodeSchema,
      nodePointer,
    );
    const isDuplicated = applyEdit(
      [...operations, ...getCopyNameOperations(nodePointer, copyPointer)],
      "Duplicate element",
    );
    if (isDuplicated) selectedPointer.value = copyPointer;
    return isDuplicated;
  };
  // The selection moves to the element focus lands on when the removed element held it, and stays where it is otherwise
  const removeNode = (nodePointer: string) => {
    if (getBlockNode(document.value, nodePointer, surveyNodeChildren) === undefined) return false;

    const isSelectionRemoved =
      selectedPointer.value === nodePointer || selectedPointer.value.startsWith(`${nodePointer}/`);
    const focusPointer = getFocusAfterRemoval(document.value, surveyNodeChildren, nodePointer);
    const isRemoved = applyEdit(removeBlockNode(nodePointer), "Delete element");
    if (isRemoved && isSelectionRemoved) selectedPointer.value = focusPointer;
    return isRemoved;
  };
  // A run of edits to the same props of one node, a field typed into key by key, is one interaction and so one undo step
  const updateNodeProps = (nodePointer: string, props: Record<string, unknown>) =>
    applyEdit(
      updateBlockNodeProps<BlockNodeProps>(nodePointer, props),
      "Edit element",
      `props:${nodePointer}:${Object.keys(props).toSorted().join(",")}`,
    );
  // The core's node-props command takes a node's id as one of its props, which the root does not hold, so the root's props are
  // Written at the root's own pointer
  const updateRootProps = (props: Partial<SurveyRootProps>) =>
    applyEdit(
      Object.entries<unknown>(props).map(([key, value]) => ({
        op: JsonPatchOperationType.Add,
        path: getBlockPropPointer(ROOT_POINTER, key),
        value,
      })),
      "Edit survey",
      `root:${Object.keys(props).toSorted().join(",")}`,
    );

  return {
    applyEdit,
    duplicateNode,
    insertNode,
    insertNodeAt,
    moveNodeDown,
    moveNodeIntoPrevious,
    moveNodeOut,
    moveNodeTo,
    moveNodeUp,
    redo,
    removeNode,
    select,
    undo,
    updateNodeProps,
    updateRootProps,
  };
};

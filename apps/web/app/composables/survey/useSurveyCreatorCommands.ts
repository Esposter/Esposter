import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";
import type { History, JsonPatchOperation } from "@esposter/shared";
import type { BlockNodeProps } from "headless-block-editor";
import type { SurveyDocument, SurveyNode, SurveyNodeType, SurveyRootProps } from "survey-engine";

import { ROOT_POINTER } from "@/services/pageBuilder/constants";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import {
  JsonPatchOperationType,
  parseArrayIndex,
  parseJsonPointer,
  pushHistory,
  readJsonValue,
  redoHistory,
  toJsonPointer,
  undoHistory,
} from "@esposter/shared";
import {
  applyBlockEdit,
  duplicateBlockNode,
  getAcceptedTypes,
  getBlockLayerRows,
  getBlockNode,
  getBlockPropPointer,
  getFocusAfterRemoval,
  insertBlockNode,
  moveBlockNode,
  moveIntoPreviousSibling,
  moveOutAfterParent,
  removeBlockNode,
  updateBlockNodeProps,
} from "headless-block-editor";
import {
  surveyDocumentSchema,
  surveyNodeChildren,
  surveyNodeSchema,
  surveyNodeTypeDefinitionMap,
  surveyRegistry,
} from "survey-engine";

// The survey's root holds its pages in the content slot, and the first page is where an empty selection places a new element
const CONTENT_POINTER = "/content";
const FIRST_PAGE_POINTER = `${CONTENT_POINTER}/0`;

// The slot a node sits in and its index there, or none for a pointer that names no element of a slot
const getNodeLocation = (nodePointer: string) => {
  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  return index === undefined ? undefined : { index, slotPointer: toJsonPointer(segments.slice(0, -1)) };
};
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
// The node a new element of a type is, under its own id and name, with each of its slots an empty list. The node schema
// Parses it, so a node that schema refuses is no node at all rather than one a type assertion has let through
const createSurveyNode = (type: SurveyNodeType, id: string, name: string): SurveyNode | undefined => {
  const { createDefaultProps, slots } = surveyNodeTypeDefinitionMap[type];
  const props = {
    ...createDefaultProps(),
    ...Object.fromEntries(Object.keys(slots).map((slot): [string, never[]] => [slot, []])),
    id,
  };
  const result = surveyNodeSchema.safeParse({ props: "name" in props ? { ...props, name } : props, type });
  return result.success ? result.data : undefined;
};
// Where a new element goes: straight after the selected element in its own slot. With nothing selected it goes to the end of
// The first page's children when they take its type, and otherwise to the end of the survey's pages, which is where a page goes
const getInsertTarget = (document: SurveyDocument, selectedPointer: string, type: SurveyNodeType) => {
  if (selectedPointer !== "") {
    const location = getNodeLocation(selectedPointer);
    return location && { index: location.index + 1, slotPointer: location.slotPointer };
  }

  const slotPointer = [getBlockPropPointer(FIRST_PAGE_POINTER, "children"), CONTENT_POINTER].find((candidate) =>
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
  const applyEdit = (operations: JsonPatchOperation[], label: string) => {
    if (operations.length === 0) return false;

    return applyBlockEdit(surveyDocumentSchema, document.value, operations).match(
      ({ document: editedDocument, inverses }) => {
        commit(editedDocument, pushHistory(history.value, { inverses, label, operations }));
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
  const insertNode = (type: SurveyNodeType) => {
    const target = getInsertTarget(document.value, selectedPointer.value, type);
    const node =
      target && createSurveyNode(type, crypto.randomUUID(), addUniqueName("question", getElementNames(document.value)));
    if (target === undefined || node === undefined) return false;

    const isInserted = applyEdit(
      insertBlockNode(document.value, surveyRegistry, surveyNodeChildren, target.slotPointer, target.index, node),
      "Insert element",
    );
    if (isInserted) selectedPointer.value = `${target.slotPointer}/${target.index}`;
    return isInserted;
  };
  // The operations that move a node to the index one away from it in its own slot, or none when no sibling sits there
  const getSiblingMoveOperations = (nodePointer: string, offset: number) => {
    const location = getNodeLocation(nodePointer);
    if (location === undefined) return [];

    const siblingIndex = location.index + offset;
    if (
      siblingIndex < 0 ||
      !getBlockNode(document.value, `${location.slotPointer}/${siblingIndex}`, surveyNodeChildren)
    )
      return [];

    return moveBlockNode(
      document.value,
      surveyRegistry,
      surveyNodeChildren,
      nodePointer,
      location.slotPointer,
      siblingIndex,
    );
  };
  const moveElement = (operations: JsonPatchOperation[]) => applyEdit(operations, "Move element");
  const moveNodeDown = (nodePointer: string) => moveElement(getSiblingMoveOperations(nodePointer, 1));
  const moveNodeUp = (nodePointer: string) => moveElement(getSiblingMoveOperations(nodePointer, -1));
  const moveNodeIntoPrevious = (nodePointer: string) =>
    moveElement(moveIntoPreviousSibling(document.value, surveyRegistry, surveyNodeChildren, nodePointer));
  const moveNodeOut = (nodePointer: string) =>
    moveElement(moveOutAfterParent(document.value, surveyRegistry, surveyNodeChildren, nodePointer));
  const moveNodeTo = (nodePointer: string, slotPointer: string, index: number) =>
    moveElement(moveBlockNode(document.value, surveyRegistry, surveyNodeChildren, nodePointer, slotPointer, index));
  // The renames a copy needs: each question in the copied subtree takes a name no element holds, since a copy would
  // Otherwise repeat the name of the question it copies
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
          value: addUniqueName(name, names),
        },
      ];
    });
  };
  const duplicateNode = (nodePointer: string) => {
    const location = getNodeLocation(nodePointer);
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
  const updateNodeProps = (nodePointer: string, props: Record<string, unknown>) =>
    applyEdit(updateBlockNodeProps<BlockNodeProps>(nodePointer, props), "Edit element");
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
    );

  return {
    applyEdit,
    duplicateNode,
    insertNode,
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

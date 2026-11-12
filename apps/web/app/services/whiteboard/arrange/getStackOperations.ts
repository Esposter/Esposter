import type { JsonPatchOperation } from "@esposter/shared";
import type { PositionedDocument } from "vue-block-editor-headless";

import { StackMove } from "@/models/whiteboard/StackMove";
import { getSelectedElements } from "@/services/whiteboard/getSelectedElements";
import { exhaustiveGuard, takeOne } from "@esposter/shared";
import { changePositionedElementZOrder } from "vue-block-editor-headless";

// The runs of neighbouring indexes in a list of ascending indexes, each as its first and its last index
const getRuns = (indexes: number[]): { end: number; start: number }[] =>
  indexes.reduce<{ end: number; start: number }[]>((runs, index) => {
    const lastRun = runs.at(-1);
    if (lastRun !== undefined && lastRun.end + 1 === index) lastRun.end = index;
    else runs.push({ end: index, start: index });
    return runs;
  }, []);

// The z-order operations that stack a selection one way, keeping the order of the selected elements among themselves. A selection holding the top
// Element cannot bring forward or to the front, and one holding the bottom element cannot send backward or to the back, so each is no operation
export const getStackOperations = (
  document: PositionedDocument,
  selectedIds: string[],
  move: StackMove,
): JsonPatchOperation[] => {
  const indexes = getSelectedElements(document, selectedIds).map(({ index }) => index);
  if (indexes.length === 0) return [];

  const lowestIndex = takeOne(indexes, 0);
  const highestIndex = takeOne(indexes, indexes.length - 1);
  const topIndex = document.elements.length - 1;
  switch (move) {
    // The element above each run of neighbouring selected elements moves beneath the run, which lifts the run one step and leaves the order of the
    // Elements that are not selected as it was. A move only shifts indexes inside its own run, so every run is read from its original indexes
    case StackMove.BringForward:
      return highestIndex === topIndex
        ? []
        : getRuns(indexes).flatMap(({ end, start }) => changePositionedElementZOrder(document, end + 1, start));
    // Each selected element moves to the top in turn, lowest first. Moving an element above it shifts the next selected one down, so each is read
    // From its index less the moves before it
    case StackMove.BringToFront:
      return highestIndex === topIndex
        ? []
        : indexes.flatMap((index, position) => changePositionedElementZOrder(document, index - position, topIndex));
    // The element below each run of neighbouring selected elements moves above the run, which sinks the run one step and leaves the order of the
    // Elements that are not selected as it was
    case StackMove.SendBackward:
      return lowestIndex === 0
        ? []
        : getRuns(indexes).flatMap(({ end, start }) => changePositionedElementZOrder(document, start - 1, end));
    // Each selected element moves to the bottom in turn, highest first. Moving an element below it shifts the next selected one up, so each is read
    // From its index plus the moves before it
    case StackMove.SendToBack:
      return lowestIndex === 0
        ? []
        : indexes
            .toReversed()
            .flatMap((index, position) => changePositionedElementZOrder(document, index + position, 0));
    default:
      return exhaustiveGuard(move);
  }
};

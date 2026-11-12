import type { PositionedDocument, ShapeElement } from "vue-block-editor-headless";

import { StackMove } from "@/models/whiteboard/StackMove";
import { getStackOperations } from "@/services/whiteboard/arrange/getStackOperations";
import { WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// The element list's ids in order, the first drawn beneath the rest, so a stacking reads as the order of these ids
const createDocument = (ids: string[]): PositionedDocument => ({
  elements: ids.map((id): ShapeElement => ({ ...WHITEBOARD_PROCESS, id })),
});
const getOrder = (document: PositionedDocument, operations: ReturnType<typeof getStackOperations>) =>
  applyPatches(document, operations).document.elements.map(({ id }) => id);

describe(getStackOperations, () => {
  const FIRST_ID = crypto.randomUUID();
  const SECOND_ID = crypto.randomUUID();
  const THIRD_ID = crypto.randomUUID();
  const FOURTH_ID = crypto.randomUUID();

  test("bring to front lifts a selection above the rest in its order", () => {
    expect.hasAssertions();

    const document = createDocument([FIRST_ID, SECOND_ID, THIRD_ID, FOURTH_ID]);
    const operations = getStackOperations(document, [FIRST_ID, THIRD_ID], StackMove.BringToFront);

    expect(getOrder(document, operations)).toStrictEqual([SECOND_ID, FOURTH_ID, FIRST_ID, THIRD_ID]);
  });

  test("bring forward moves a selection one step past the element above it", () => {
    expect.hasAssertions();

    const document = createDocument([FIRST_ID, SECOND_ID, THIRD_ID]);
    const operations = getStackOperations(document, [FIRST_ID, SECOND_ID], StackMove.BringForward);

    expect(getOrder(document, operations)).toStrictEqual([THIRD_ID, FIRST_ID, SECOND_ID]);
  });

  test("bring forward lifts each run of a split selection one step and leaves the others in their order", () => {
    expect.hasAssertions();

    const FIFTH_ID = crypto.randomUUID();
    const document = createDocument([FIRST_ID, SECOND_ID, THIRD_ID, FOURTH_ID, FIFTH_ID]);
    const operations = getStackOperations(document, [FIRST_ID, FOURTH_ID], StackMove.BringForward);

    expect(getOrder(document, operations)).toStrictEqual([SECOND_ID, FIRST_ID, THIRD_ID, FIFTH_ID, FOURTH_ID]);
  });

  test("send backward sinks each run of a split selection one step and leaves the others in their order", () => {
    expect.hasAssertions();

    const FIFTH_ID = crypto.randomUUID();
    const document = createDocument([FIRST_ID, SECOND_ID, THIRD_ID, FOURTH_ID, FIFTH_ID]);
    const operations = getStackOperations(document, [SECOND_ID, FIFTH_ID], StackMove.SendBackward);

    expect(getOrder(document, operations)).toStrictEqual([SECOND_ID, FIRST_ID, THIRD_ID, FIFTH_ID, FOURTH_ID]);
  });

  test("a selection holding the top element cannot bring forward", () => {
    expect.hasAssertions();

    const document = createDocument([FIRST_ID, SECOND_ID, THIRD_ID]);

    expect(getStackOperations(document, [FIRST_ID, THIRD_ID], StackMove.BringForward)).toStrictEqual([]);
    expect(getStackOperations(document, [FIRST_ID, THIRD_ID], StackMove.BringToFront)).toStrictEqual([]);
  });

  test("send to back sinks a selection below the rest in its order", () => {
    expect.hasAssertions();

    const document = createDocument([FIRST_ID, SECOND_ID, THIRD_ID, FOURTH_ID]);
    const operations = getStackOperations(document, [SECOND_ID, FOURTH_ID], StackMove.SendToBack);

    expect(getOrder(document, operations)).toStrictEqual([SECOND_ID, FOURTH_ID, FIRST_ID, THIRD_ID]);
  });

  test("send backward moves a selection one step below the element under it", () => {
    expect.hasAssertions();

    const document = createDocument([FIRST_ID, SECOND_ID, THIRD_ID]);
    const operations = getStackOperations(document, [SECOND_ID, THIRD_ID], StackMove.SendBackward);

    expect(getOrder(document, operations)).toStrictEqual([SECOND_ID, THIRD_ID, FIRST_ID]);
  });
});

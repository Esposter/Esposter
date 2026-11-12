import type { PositionedDocument, ShapeElement } from "vue-block-editor-headless";

import { DistributeAxis } from "@/models/whiteboard/DistributeAxis";
import { getDistributeOperations } from "@/services/whiteboard/arrange/getDistributeOperations";
import { WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { applyPatches } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getDistributeOperations, () => {
  const FIRST_ID = crypto.randomUUID();
  const SECOND_ID = crypto.randomUUID();
  const THIRD_ID = crypto.randomUUID();
  const createShape = (id: string, x: number, y: number, width: number, height: number): ShapeElement => ({
    ...WHITEBOARD_PROCESS,
    height,
    id,
    width,
    x,
    y,
  });

  test("Distributing horizontally makes every gap equal", () => {
    expect.hasAssertions();

    // The three shapes span from 0 to 580 and their widths total 230, so the two gaps share the 350 left over, 175 each. The first and last hold still
    const document: PositionedDocument = {
      elements: [
        createShape(THIRD_ID, 500, 0, 80, 100),
        createShape(FIRST_ID, 0, 0, 100, 100),
        createShape(SECOND_ID, 150, 0, 50, 100),
      ],
    };
    const operations = getDistributeOperations(document, [FIRST_ID, SECOND_ID, THIRD_ID], DistributeAxis.Horizontal);

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(THIRD_ID, 500, 0, 80, 100),
      createShape(FIRST_ID, 0, 0, 100, 100),
      createShape(SECOND_ID, 275, 0, 50, 100),
    ]);
  });

  test("Distributing vertically makes every gap equal", () => {
    expect.hasAssertions();

    const document: PositionedDocument = {
      elements: [
        createShape(FIRST_ID, 0, 0, 100, 100),
        createShape(SECOND_ID, 0, 150, 100, 50),
        createShape(THIRD_ID, 0, 500, 100, 80),
      ],
    };
    const operations = getDistributeOperations(document, [FIRST_ID, SECOND_ID, THIRD_ID], DistributeAxis.Vertical);

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(FIRST_ID, 0, 0, 100, 100),
      createShape(SECOND_ID, 0, 275, 100, 50),
      createShape(THIRD_ID, 0, 500, 100, 80),
    ]);
  });

  test("Distribute is disabled below three boxes", () => {
    expect.hasAssertions();

    const document: PositionedDocument = {
      elements: [createShape(FIRST_ID, 0, 0, 100, 100), createShape(SECOND_ID, 300, 0, 100, 100)],
    };

    expect(getDistributeOperations(document, [FIRST_ID, SECOND_ID], DistributeAxis.Horizontal)).toStrictEqual([]);
  });

  test("Distribute of boxes that do not span the others is unchanged", () => {
    expect.hasAssertions();

    // The first box starts first but ends at 120, before the last box ends at 500, and the last box ends last but starts at 400, after the first. The
    // Gaps total 420 of the 500 left, so each is 40 and the middle box moves from 150 to 160
    const document: PositionedDocument = {
      elements: [
        createShape(FIRST_ID, 0, 0, 120, 100),
        createShape(SECOND_ID, 150, 0, 200, 100),
        createShape(THIRD_ID, 400, 0, 100, 100),
      ],
    };
    const operations = getDistributeOperations(document, [FIRST_ID, SECOND_ID, THIRD_ID], DistributeAxis.Horizontal);

    expect(applyPatches(document, operations).document.elements).toStrictEqual([
      createShape(FIRST_ID, 0, 0, 120, 100),
      createShape(SECOND_ID, 160, 0, 200, 100),
      createShape(THIRD_ID, 400, 0, 100, 100),
    ]);
  });

  test("A box lying inside another's span never moves the box that ends furthest", () => {
    expect.hasAssertions();

    // The second shape ends furthest, at 250, though the third starts after it, so the third is spaced and the second holds still
    const document: PositionedDocument = {
      elements: [
        createShape(FIRST_ID, 0, 0, 100, 100),
        createShape(SECOND_ID, 50, 0, 200, 100),
        createShape(THIRD_ID, 120, 0, 20, 100),
      ],
    };
    const operations = getDistributeOperations(document, [FIRST_ID, SECOND_ID, THIRD_ID], DistributeAxis.Horizontal);

    expect(applyPatches(document, operations).document.elements.find(({ id }) => id === SECOND_ID)).toHaveProperty(
      "x",
      50,
    );
  });
});

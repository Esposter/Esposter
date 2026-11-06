import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";
import type { SurveyDropSlot } from "@/models/resource/survey/SurveyDropSlot";

import { resolveSurveyDropTarget } from "@/services/resource/survey/resolveSurveyDropTarget";
import { SurveyNodeType } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

const createBox = (top: number, height: number, left = 0, width = 400): OverlayBox => ({ height, left, top, width });

describe(resolveSurveyDropTarget, () => {
  // A page takes questions and panels, and a panel takes questions alone, as the core's slots do
  const PAGE_ACCEPTED_TYPES = [SurveyNodeType.Text, SurveyNodeType.Panel];
  const PANEL_ACCEPTED_TYPES = [SurveyNodeType.Text];
  const PAGE_SLOT_POINTER = "/content/0/props/children";
  const PANEL_SLOT_POINTER = "/content/0/props/children/2/props/children";
  // A page of two questions over a panel, with the panel holding one question
  const createSlots = (): SurveyDropSlot[] => [
    {
      acceptedTypes: PAGE_ACCEPTED_TYPES,
      box: createBox(0, 300),
      childBoxes: [createBox(40, 40), createBox(100, 40), createBox(160, 80)],
      slotPointer: PAGE_SLOT_POINTER,
    },
    {
      acceptedTypes: PANEL_ACCEPTED_TYPES,
      box: createBox(160, 80),
      childBoxes: [createBox(180, 40, 20, 360)],
      slotPointer: PANEL_SLOT_POINTER,
    },
  ];

  test("a question dragged from the palette lands in the page at the index after the last child the pointer has passed", () => {
    expect.hasAssertions();

    expect(
      resolveSurveyDropTarget({ draggedType: SurveyNodeType.Text, point: { x: 200, y: 150 }, slots: createSlots() }),
    ).toStrictEqual({ index: 2, slotPointer: PAGE_SLOT_POINTER });
  });

  test("a question dragged over a panel lands in the panel, the nearest slot that takes it", () => {
    expect.hasAssertions();

    expect(
      resolveSurveyDropTarget({ draggedType: SurveyNodeType.Text, point: { x: 200, y: 190 }, slots: createSlots() }),
    ).toStrictEqual({ index: 0, slotPointer: PANEL_SLOT_POINTER });
  });

  test("a page dragged over a panel finds no slot that takes a page, and resolves to none", () => {
    expect.hasAssertions();

    expect(
      resolveSurveyDropTarget({ draggedType: SurveyNodeType.Page, point: { x: 200, y: 190 }, slots: createSlots() }),
    ).toBeUndefined();
  });
});

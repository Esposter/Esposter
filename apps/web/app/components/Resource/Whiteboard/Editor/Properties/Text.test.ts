// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { TextElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesText from "#src/components/Resource/Whiteboard/Editor/Properties/Text.vue";
import {
  createWhiteboardEditState,
  WHITEBOARD_ARROW,
  WHITEBOARD_PROCESS,
} from "#src/services/whiteboard/constants.test";
import { useWhiteboardStore } from "#src/store/resource/whiteboard/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { assert, describe, expect, test } from "vitest";
import {
  getTextWidth,
  HorizontalAlignment,
  PositionedElementType,
  TextSize,
  VerticalAlignment,
} from "vue-block-editor-headless";

// The button that names a choice, found by its text, as the other panel tests find theirs
const clickButton = async (wrapper: VueWrapper, label: string) => {
  const button = wrapper.findAll("button").find((candidate) => candidate.text() === label);
  assert.exists(button);
  await button.trigger("click");
};

describe("resourceWhiteboardEditorPropertiesText", () => {
  const TEXT_BOX: TextElement = {
    color: "",
    id: v7(),
    isWrapped: true,
    text: "Review the order",
    textSize: TextSize.Small,
    type: PositionedElementType.Text,
    width: 200,
    x: 0,
    y: 0,
  };

  test("choosing a larger size sets the element's text size", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    editState.value = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesText, {
      props: { element: WHITEBOARD_PROCESS, index: 0 },
    });

    await clickButton(wrapper, "XL");

    expect(editState.value.document).toStrictEqual({
      elements: [{ ...WHITEBOARD_PROCESS, textSize: TextSize.ExtraLarge }],
    });
  });

  test("auto width sizes the box to its widest line", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    editState.value = createWhiteboardEditState({ elements: [TEXT_BOX] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesText, {
      props: { element: TEXT_BOX, index: 0 },
    });

    await wrapper.get('[role="checkbox"][aria-label="Auto width"]').trigger("click");

    expect(editState.value.document).toStrictEqual({
      elements: [{ ...TEXT_BOX, isWrapped: false, width: getTextWidth("Review the order", TextSize.Small) }],
    });
  });

  test("returning to a wrapped width keeps the box width", async () => {
    expect.hasAssertions();

    const autoWidthBox: TextElement = { ...TEXT_BOX, isWrapped: false, width: 120 };
    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    editState.value = createWhiteboardEditState({ elements: [autoWidthBox] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesText, {
      props: { element: autoWidthBox, index: 0 },
    });

    await wrapper.get('[role="checkbox"][aria-label="Auto width"]').trigger("click");

    expect(editState.value.document).toStrictEqual({ elements: [{ ...autoWidthBox, isWrapped: true }] });
  });

  test("shape text aligns to the left and the top", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    editState.value = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesText, {
      props: { element: WHITEBOARD_PROCESS, index: 0 },
    });

    await clickButton(wrapper, "Left");
    await clickButton(wrapper, "Top");

    expect(editState.value.document).toStrictEqual({
      elements: [
        {
          ...WHITEBOARD_PROCESS,
          horizontalAlignment: HorizontalAlignment.Left,
          verticalAlignment: VerticalAlignment.Top,
        },
      ],
    });
  });

  test("text box text aligns to the right", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    editState.value = createWhiteboardEditState({ elements: [TEXT_BOX] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesText, {
      props: { element: TEXT_BOX, index: 0 },
    });

    await clickButton(wrapper, "Right");

    expect(editState.value.document).toStrictEqual({
      elements: [{ ...TEXT_BOX, horizontalAlignment: HorizontalAlignment.Right }],
    });
  });

  test("an arrow label has no alignment control", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesText, {
      props: { element: WHITEBOARD_ARROW, index: 0 },
    });
    const labels = wrapper.findAll("button").map((button) => button.text());

    expect(labels).toStrictEqual(["S", "M", "L", "XL"]);
  });
});

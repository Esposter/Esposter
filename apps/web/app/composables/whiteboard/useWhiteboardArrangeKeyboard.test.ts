// @vitest-environment nuxt
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { ShapeElement } from "vue-block-editor-headless";

import { useWhiteboardArrangeKeyboard } from "@/composables/whiteboard/useWhiteboardArrangeKeyboard";
import { createWhiteboardEditState, pressKey, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// The stacking keys mounted as a surface, so their commands are bound for as long as the mount lasts
const mountArrangeKeyboard = (
  editState: Ref<WhiteboardEditState>,
  selectedIds: Ref<string[]>,
  isDeleteOpen: Ref<boolean> = ref(false),
) =>
  mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => {
        useWhiteboardArrangeKeyboard(editState, selectedIds, isDeleteOpen);
      },
    }),
  );

const createShape = (id: string): ShapeElement => ({ ...WHITEBOARD_PROCESS, id });

describe(useWhiteboardArrangeKeyboard, () => {
  const FIRST_ID = v7();
  const SECOND_ID = v7();
  const THIRD_ID = v7();

  test("the bracket keys stack the selection", async () => {
    expect.hasAssertions();

    const editState = ref(
      createWhiteboardEditState({ elements: [createShape(FIRST_ID), createShape(SECOND_ID), createShape(THIRD_ID)] }),
    );
    const selectedIds = ref([FIRST_ID, SECOND_ID]);
    await mountArrangeKeyboard(editState, selectedIds);

    pressKey({ bubbles: true, ctrlKey: true, key: "]" });

    expect(editState.value.document.elements.map(({ id }) => id)).toStrictEqual([THIRD_ID, FIRST_ID, SECOND_ID]);

    pressKey({ bubbles: true, ctrlKey: true, key: "[" });

    expect(editState.value.document.elements.map(({ id }) => id)).toStrictEqual([FIRST_ID, SECOND_ID, THIRD_ID]);
  });

  test("shift with the bracket keys sends the selection to the ends", async () => {
    expect.hasAssertions();

    // The shapes are drawn above the first element, so each shift key takes them to the one end the shift names
    const editState = ref(
      createWhiteboardEditState({ elements: [createShape(THIRD_ID), createShape(FIRST_ID), createShape(SECOND_ID)] }),
    );
    const selectedIds = ref([FIRST_ID, SECOND_ID]);
    await mountArrangeKeyboard(editState, selectedIds);

    pressKey({ bubbles: true, ctrlKey: true, key: "{", shiftKey: true });

    expect(editState.value.document.elements.map(({ id }) => id)).toStrictEqual([FIRST_ID, SECOND_ID, THIRD_ID]);

    pressKey({ bubbles: true, ctrlKey: true, key: "}", shiftKey: true });

    expect(editState.value.document.elements.map(({ id }) => id)).toStrictEqual([THIRD_ID, FIRST_ID, SECOND_ID]);
  });

  test("the stacking keys do nothing with no selection", async () => {
    expect.hasAssertions();

    const document = { elements: [createShape(FIRST_ID), createShape(SECOND_ID)] };
    const editState = ref(createWhiteboardEditState(document));
    const selectedIds = ref<string[]>([]);
    await mountArrangeKeyboard(editState, selectedIds);

    pressKey({ bubbles: true, ctrlKey: true, key: "]" });
    pressKey({ bubbles: true, ctrlKey: true, key: "}", shiftKey: true });

    expect(editState.value.document).toStrictEqual(document);
  });
});

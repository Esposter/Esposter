// @vitest-environment nuxt
import type { ShapeElement } from "vue-block-editor-headless";

import ResourceWhiteboardEditorPropertiesSketch from "@/components/Resource/Whiteboard/EditorPropertiesSketch.vue";
import { createWhiteboardEditState, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";
import { ShapeKind, SketchLevel } from "vue-block-editor-headless";

describe("resourceWhiteboardEditorPropertiesSketch", () => {
  test("architect draws a shape with straight edges", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    whiteboardStore.editState = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });
    const wrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesSketch, {
      props: { element: WHITEBOARD_PROCESS, index: 0 },
    });

    const architectButton = wrapper.findAll("button").find((button) => button.text() === "Architect");
    assert.exists(architectButton);
    await architectButton.trigger("click");

    expect(whiteboardStore.editState.document).toStrictEqual({
      elements: [{ ...WHITEBOARD_PROCESS, sketchLevel: SketchLevel.Architect }],
    });
  });

  test("an ellipse offers no corner setting", async () => {
    expect.hasAssertions();

    const ellipse: ShapeElement = { ...WHITEBOARD_PROCESS, kind: ShapeKind.Ellipse };
    const processWrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesSketch, {
      props: { element: WHITEBOARD_PROCESS, index: 0 },
    });
    const ellipseWrapper = await mountSuspended(ResourceWhiteboardEditorPropertiesSketch, {
      props: { element: ellipse, index: 0 },
    });

    expect(processWrapper.findAll("button").map((button) => button.text())).toContain("Round");
    expect(ellipseWrapper.findAll("button").map((button) => button.text())).not.toContain("Round");
  });
});

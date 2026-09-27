// @vitest-environment nuxt
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";

import { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import FlowchartEditorNodeRectangle from "@/components/FlowchartEditor/Node/Rectangle.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { VueFlow } from "@vue-flow/core";
import { describe, expect, test } from "vitest";

describe("flowchartEditorNodeRectangle", () => {
  // A published page draws the graph with no editor store loaded, so the canvas alone is what it mounts
  test("draws the colour its node carries on a canvas with no editor store", async () => {
    expect.hasAssertions();

    const backgroundColor = "red";
    const node: GraphNode = {
      data: {},
      id: crypto.randomUUID(),
      position: { x: 0, y: 0 },
      style: { backgroundColor },
      type: GeneralNodeType.Rectangle,
    };
    const component = await mountSuspended(
      defineComponent(
        () => () =>
          h(VueFlow, {
            nodes: [node],
            nodeTypes: { [GeneralNodeType.Rectangle]: markRaw(FlowchartEditorNodeRectangle) },
          }),
      ),
    );
    await nextTick();
    const element = component.element.querySelector<HTMLElement>(".node");

    expect(element?.style.backgroundColor).toBe(backgroundColor);
  });
});

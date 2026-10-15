import type { ComponentOptions, SetupContext, VNode } from "vue";

import tresCanvasClient from "#src/runtime/TresCanvas.client";
import { TresCanvas as CoreTresCanvas } from "@tresjs/core";
import { describe, expect, test, vi } from "vitest";

// The renderer loads three and WebGL, which the forwarding under test never touches
vi.mock("@tresjs/core", () => ({ TresCanvas: { name: "CoreTresCanvas" } }));

describe("tresCanvasClient", () => {
  // Upstream #33: attributes and slots must reach the renderer unchanged, so anything the page passes in still arrives
  test("forwards attributes and slots to the renderer's canvas unchanged", () => {
    const attrs = { class: "scene" };
    const slots = { default: () => [] };
    const { setup } = tresCanvasClient as ComponentOptions;
    const render = (setup as (props: object, context: SetupContext) => () => VNode)({}, {
      attrs,
      slots,
    } as unknown as SetupContext);
    const vnode = render();
    expect(vnode.type).toBe(CoreTresCanvas);
    expect(vnode.props).toStrictEqual(attrs);
    expect(vnode.children).toBe(slots);
  });
});

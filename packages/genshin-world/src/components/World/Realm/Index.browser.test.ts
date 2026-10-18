import WorldRealm from "#src/components/World/Realm/Index.vue";
import { TresCanvas } from "@tresjs/core";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { defineComponent, h } from "vue";

describe("worldRealm", () => {
  // The realm's island is drawn into the canvas its scene mounts in, so a player has a scene to stand in once they go in
  test("the realm's island draws into a canvas", () => {
    expect.hasAssertions();

    render(defineComponent({ render: () => h(TresCanvas, null, { default: () => h(WorldRealm) }) }));

    expect(document.querySelector("canvas")).not.toBeNull();
  });
});

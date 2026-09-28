// @vitest-environment nuxt
import type { WorldBox } from "@/models/agentConsole/world/WorldBox";

import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe(useWorldBox, () => {
  test("collides as its box while the component draws it, and not once it draws nothing or unmounts", async () => {
    expect.hasAssertions();

    const box: WorldBox = { max: [1, 1, 1], min: [0, 0, 0] };
    const isDrawn = ref(true);
    const component = await mountSuspended(
      defineComponent({
        render: () => null,
        setup: () => {
          useWorldBox(() => (isDrawn.value ? box : undefined));
        },
      }),
    );
    const agentConsoleWorldStore = useAgentConsoleWorldStore();
    const { doorBox, worldBoxes } = storeToRefs(agentConsoleWorldStore);

    expect(worldBoxes.value).toStrictEqual([doorBox.value, box]);

    isDrawn.value = false;
    await nextTick();

    expect(worldBoxes.value).toStrictEqual([doorBox.value]);

    isDrawn.value = true;
    await nextTick();
    component.unmount();

    expect(worldBoxes.value).toStrictEqual([doorBox.value]);
  });
});

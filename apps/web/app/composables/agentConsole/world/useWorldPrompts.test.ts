// @vitest-environment nuxt
import { DOOR_MAX_Z, DOOR_WORLD_PROMPT_ID } from "@/services/agentConsole/world/constants";
import { findReachableObject } from "@/services/agentConsole/world/findReachableObject";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";
import { createPinia, setActivePinia } from "pinia";
import { Vector3 } from "three";
import { beforeEach, describe, expect, test } from "vitest";

describe(useWorldPrompts, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Just inside the opening facing out, and just outside it facing in
  test.each([
    { heading: -Math.PI / 2, position: new Vector3(1.4, 1, DOOR_MAX_Z), side: "inside" },
    { heading: Math.PI / 2, position: new Vector3(-0.4, 1, DOOR_MAX_Z), side: "outside" },
  ])("offers the door to a player $side facing it, and opens it", async ({ heading, position }) => {
    expect.hasAssertions();

    const agentConsoleWorldStore = useAgentConsoleWorldStore();
    const { isDoorOpen } = storeToRefs(agentConsoleWorldStore);
    const worldPrompts = useWorldPrompts();
    const reachableWorldPrompt = findReachableObject(position, heading, worldPrompts.value);
    await reachableWorldPrompt?.run();

    expect(reachableWorldPrompt?.id).toBe(DOOR_WORLD_PROMPT_ID);
    expect(isDoorOpen.value).toBe(true);
  });

  test("offers the open door to a player behind its panel", () => {
    expect.hasAssertions();

    const agentConsoleWorldStore = useAgentConsoleWorldStore();
    const { isDoorOpen } = storeToRefs(agentConsoleWorldStore);
    isDoorOpen.value = true;
    const worldPrompts = useWorldPrompts();
    // Outside, past the panel standing out from the wall, facing back at it
    const reachableWorldPrompt = findReachableObject(new Vector3(-1, 1, DOOR_MAX_Z + 2), Math.PI, worldPrompts.value);

    expect(reachableWorldPrompt?.id).toBe(DOOR_WORLD_PROMPT_ID);
  });
});

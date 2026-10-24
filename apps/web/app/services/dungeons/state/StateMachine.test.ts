import type { StateMachineStateMap } from "@/models/dungeons/state/StateMachineStateMap";
import type { SceneWithPlugins } from "vue-phaserjs";

import { StateMachine } from "@/services/dungeons/state/StateMachine";
import { describe, expect, test, vi } from "vitest";

describe(StateMachine, () => {
  // The scene is only passed through to the states, which these tests never read
  const scene = {} as SceneWithPlugins;

  const createMachine = (stateMap: StateMachineStateMap<"idle" | "walk">) => {
    const stateMachine = new StateMachine<"idle" | "walk">();
    stateMachine.scene = scene;
    stateMachine.stateMap = stateMap;
    return stateMachine;
  };

  test("moving into the state it is already in runs nothing", async () => {
    expect.hasAssertions();

    const onEnter = vi.fn<() => void>();
    const onExit = vi.fn<() => void>();
    const stateMachine = createMachine({ idle: { name: "idle", onEnter, onExit }, walk: { name: "walk" } });
    await stateMachine.setState("idle");
    await stateMachine.setState("idle");

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onExit).not.toHaveBeenCalled();
  });

  test("exits the current state, waiting for an async exit, before entering the next one", async () => {
    expect.hasAssertions();

    const calls: string[] = [];
    const stateMachine = createMachine({
      idle: {
        name: "idle",
        onEnter: () => void calls.push("enter idle"),
        onExit: async () => {
          await Promise.resolve();
          calls.push("exit idle");
        },
      },
      walk: { name: "walk", onEnter: () => void calls.push("enter walk") },
    });
    await stateMachine.setState("idle");
    await stateMachine.setState("walk");

    expect(calls).toStrictEqual(["enter idle", "exit idle", "enter walk"]);
    expect(stateMachine.currentState.name).toBe("walk");
  });

  test("clearing the machine exits the current state and leaves no state current", async () => {
    expect.hasAssertions();

    const onExit = vi.fn<() => void>();
    const stateMachine = createMachine({ idle: { name: "idle", onExit }, walk: { name: "walk" } });
    await stateMachine.setState("idle");
    await stateMachine.setState();

    expect(onExit).toHaveBeenCalledWith(scene);
    expect(stateMachine.currentState.name).toBeUndefined();
  });
});

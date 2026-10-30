import type { DevCommand } from "#src/models/dev/DevCommand";
import type { DevResult } from "#src/models/dev/DevResult";
import type { DevVariable } from "#src/models/dev/DevVariable";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { DevVariableKind } from "#src/models/dev/DevVariableKind";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { createTeleportCommand } from "#src/services/dev/commands/createTeleportCommand";
import { DEV_LANDMARK } from "#src/services/dev/constants.test";
import { createDevRegistry } from "#src/services/dev/createDevRegistry";
import { exposeDevRegistry } from "#src/services/dev/exposeDevRegistry";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

describe(createDevRegistry, () => {
  const TIME_ARGUMENTS = z.object({ hour: z.coerce.number() });
  const GIVE_ARGUMENTS = z.object({ item: z.string(), count: z.coerce.number().int().min(1) });
  const SCENARIO_NAME = "boss-fight";

  const createTimeCommand = (calls: string[]): DevCommand<typeof TIME_ARGUMENTS> => ({
    args: TIME_ARGUMENTS,
    name: "time",
    run: ({ hour }) => {
      calls.push("time");
      return { ok: true, value: hour };
    },
  });

  const createGiveCommand = (calls: string[]): DevCommand<typeof GIVE_ARGUMENTS> => ({
    args: GIVE_ARGUMENTS,
    name: "give",
    run: ({ count, item }) => {
      calls.push("give");
      return { ok: true, value: `${item} ${count}` };
    },
  });

  const createCloudVariable = (state: { cloudCoverage: number }): DevVariable => ({
    get: () => state.cloudCoverage,
    group: "Sky",
    kind: DevVariableKind.Number,
    name: "cloud coverage",
    range: { max: 1, min: 0, step: 0.1 },
    set: (value) => {
      state.cloudCoverage = Number(value);
    },
  });

  test("Valid line runs and reports", () => {
    expect.hasAssertions();

    const calls: string[] = [];
    const registry = createDevRegistry();
    registry.register({ commands: [createTimeCommand(calls)], variables: [] });

    expect(registry.run("time 21")).toStrictEqual({ ok: true, value: 21 });
    expect(calls).toStrictEqual(["time"]);
  });

  test("Bad argument runs nothing", () => {
    expect.hasAssertions();

    const calls: string[] = [];
    const registry = createDevRegistry();
    registry.register({ commands: [createGiveCommand(calls)], variables: [] });

    expect(registry.run("give Mora lots").ok).toBe(false);
    expect(calls).toStrictEqual([]);
  });

  test("Unknown name is refused", () => {
    expect.hasAssertions();

    const registry = createDevRegistry();
    registry.register({ commands: [createTimeCommand([])], variables: [] });

    expect(registry.run("ti")).toStrictEqual({ error: "unknown command ti; did you mean time?", ok: false, usage: "" });
  });

  test("Command whose state is not mounted says so", () => {
    expect.hasAssertions();

    const registry = createDevRegistry();
    const dispose = registry.register({ commands: [createTimeCommand([])], variables: [] });
    dispose();

    expect(registry.run("time 21")).toStrictEqual({ error: "not available here", ok: false, usage: "time <hour>" });
  });

  test("Failure returns its usage", () => {
    expect.hasAssertions();

    const registry = createDevRegistry();
    registry.register({ commands: [createGiveCommand([])], variables: [] });

    expect(registry.run("give Mora 0")).toStrictEqual({
      error: "Too small: expected number to be >=1",
      ok: false,
      usage: "give <item> <count>",
    });
  });

  test("Control and console agree", () => {
    expect.hasAssertions();

    const state = { cloudCoverage: 0 };
    const variable = createCloudVariable(state);
    const registry = createDevRegistry();
    registry.register({ commands: [], variables: [variable] });

    expect(registry.run("set cloud coverage 0.1")).toStrictEqual({ ok: true, value: 0.1 });
    expect(variable.get()).toBe(0.1);
  });

  test("Out of range is refused", () => {
    expect.hasAssertions();

    const state = { cloudCoverage: 0 };
    const registry = createDevRegistry();
    registry.register({ commands: [], variables: [createCloudVariable(state)] });

    expect(registry.run("set cloud coverage 2")).toStrictEqual({
      error: "cloud coverage must be from 0 to 1",
      ok: false,
      usage: "set <name> <value>",
    });
    expect(state.cloudCoverage).toBe(0);
  });

  test("Scenario applies its commands in order", () => {
    expect.hasAssertions();

    const calls: string[] = [];
    const registry = createDevRegistry();
    registry.register({ commands: [createTimeCommand(calls), createGiveCommand(calls)], variables: [] });

    expect(registry.runScenario({ lines: ["time 21", "give Mora 100"], name: SCENARIO_NAME })).toStrictEqual({
      ok: true,
      value: 2,
    });
    expect(calls).toStrictEqual(["time", "give"]);
  });

  test("Failure stops the scenario", () => {
    expect.hasAssertions();

    const calls: string[] = [];
    const registry = createDevRegistry();
    registry.register({ commands: [createTimeCommand(calls), createGiveCommand(calls)], variables: [] });

    expect(registry.runScenario({ lines: ["time 21", "give Mora lots", "time 0"], name: SCENARIO_NAME })).toStrictEqual(
      {
        error: `${SCENARIO_NAME} stopped at "give Mora lots": Invalid input: expected number, received NaN`,
        ok: false,
        usage: "give <item> <count>",
      },
    );
    expect(calls).toStrictEqual(["time"]);
  });

  test("Automation receives data", () => {
    expect.hasAssertions();

    const registry = createDevRegistry();
    registry.register({ commands: [createTimeCommand([])], variables: [] });
    const target: { __dev?: { run: (line: string) => DevResult } } = {};
    exposeDevRegistry(registry, target);

    expect(target.__dev?.run("time 21")).toStrictEqual({ ok: true, value: 21 });
  });

  test("Change signal reports a line that ran", () => {
    expect.hasAssertions();

    const listener = vi.fn<() => void>();
    const registry = createDevRegistry();
    registry.register({ commands: [createTimeCommand([])], variables: [] });
    const unsubscribe = registry.subscribe(listener);
    registry.run("time 21");
    unsubscribe();
    registry.run("time 22");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("Listing shows what is mounted", () => {
    expect.hasAssertions();

    const variable = createCloudVariable({ cloudCoverage: 0 });
    const scenario = { lines: ["time 21"], name: SCENARIO_NAME };
    const registry = createDevRegistry();
    const dispose = registry.register({ commands: [], scenarios: [scenario], variables: [variable] });

    expect(registry.getVariables()).toStrictEqual([variable]);
    expect(registry.getScenarios()).toStrictEqual([scenario]);

    dispose();

    expect(registry.getVariables()).toStrictEqual([]);
    expect(registry.getScenarios()).toStrictEqual([]);
  });

  test("a renderer is read while the handle that holds it is registered", () => {
    expect.hasAssertions();

    const renderer = { info: { render: { calls: 0, triangles: 0 } } };
    const registry = createDevRegistry();
    const dispose = registry.register({ commands: [], renderer: () => renderer, variables: [] });
    const registered = registry.getRenderer();

    dispose();

    expect({ after: registry.getRenderer(), registered }).toStrictEqual({ after: undefined, registered: renderer });
  });

  test("disposing the newest renderer falls back to the one registered before it", () => {
    expect.hasAssertions();

    const earlier = { info: { render: { calls: 1, triangles: 1 } } };
    const later = { info: { render: { calls: 2, triangles: 2 } } };
    const registry = createDevRegistry();
    registry.register({ commands: [], renderer: () => earlier, variables: [] });
    const disposeLater = registry.register({ commands: [], renderer: () => later, variables: [] });

    disposeLater();

    expect(registry.getRenderer()).toBe(earlier);
  });

  test("A place of several words is one place when it is quoted, and a single word still is", () => {
    expect.hasAssertions();

    const catalogue: Catalogue = {
      regions: [
        {
          areas: [
            {
              id: "liyue-harbor",
              layer: WorldLayer.Surface,
              name: "Liyue Harbor",
              outline: [
                { x: -100, z: -100 },
                { x: 100, z: -100 },
                { x: 100, z: 100 },
                { x: -100, z: 100 },
              ],
              subareas: [],
              subregion: "",
              weathers: [],
            },
          ],
          id: "liyue",
          name: "Liyue",
        },
      ],
    };
    const landmark = { ...DEV_LANDMARK, areaId: "liyue-harbor" };
    const jumpTo = vi.fn<(pose: WorldJumpPose) => void>();
    const registry = createDevRegistry();
    registry.register({
      commands: [createTeleportCommand({ catalogue, getLandmarks: () => [landmark], jumpTo })],
      variables: [],
    });

    expect({ quoted: registry.run('teleport "Liyue Harbor"'), single: registry.run("teleport Liyue") }).toStrictEqual({
      quoted: { ok: true, value: "Liyue Harbor" },
      single: { ok: true, value: "Liyue" },
    });
    expect(jumpTo).toHaveBeenNthCalledWith(1, computeJumpPose(landmark));
    expect(jumpTo).toHaveBeenNthCalledWith(2, computeJumpPose(landmark));
  });
});

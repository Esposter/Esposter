import { ComputeKind } from "#src/models/fleet/ComputeKind";
import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";
import { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";
import type { GenshinExitReadings } from "#src/models/genshinProgress/GenshinExitReadings";
import { buildGenshinProgress } from "#src/services/genshinProgress/buildGenshinProgress";
import { formatGenshinProgress } from "#src/services/genshinProgress/formatGenshinProgress";
import { GENSHIN_NO_COMMAND_NOTE, GENSHIN_PHASE_GATES } from "#src/services/genshinProgress/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(buildGenshinProgress, () => {
  const noExit: GenshinExitReadings = {
    approvals: new Map(),
    lockKeys: { indexes: [], objects: [] },
    means: new Map(),
    passReports: new Map(),
    requiredKeys: { indexes: [], objects: [] },
  };

  test("A phase's progress counts its units by kind", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [
          { blockers: [], folder: "gcg", kind: ComputeKind.Screen, needs: [], parityIds: [], phase: 2 },
          { blockers: [], folder: "wish", kind: ComputeKind.Screen, needs: [[]], parityIds: [], phase: 2 },
          { blockers: [], folder: "mondstadt", kind: ComputeKind.Region, needs: [[]], parityIds: [], phase: 2 },
        ],
        changes: [],
        exit: noExit,
        roadmap: { items: [], names: new Map([[2, "The interface"]]) },
        scriptedQuests: [],
      },
      [],
    );

    expect(takeOne(phases, 2).rows).toStrictEqual([
      {
        blocked: 0,
        done: 1,
        firstBlocker: "",
        kind: ComputeKind.Screen,
        notMeasurable: 0,
        runnable: 1,
        scripted: 0,
        units: 2,
        waiting: 0,
      },
      {
        blocked: 0,
        done: 0,
        firstBlocker: "",
        kind: ComputeKind.Region,
        notMeasurable: 0,
        runnable: 1,
        scripted: 0,
        units: 1,
        waiting: 0,
      },
    ]);
  });

  test("A compute area with only waiting items counts as waiting and names its first blocker", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [
          {
            blockers: ["a plate", "a clip"],
            folder: "login",
            kind: ComputeKind.Scene,
            needs: [],
            parityIds: [],
            phase: 1,
          },
        ],
        changes: [],
        exit: noExit,
        roadmap: { items: [], names: new Map() },
        scriptedQuests: [],
      },
      [],
    );

    expect(takeOne(phases, 1).rows).toStrictEqual([
      {
        blocked: 0,
        done: 0,
        firstBlocker: "a plate",
        kind: ComputeKind.Scene,
        notMeasurable: 0,
        runnable: 0,
        scripted: 0,
        units: 1,
        waiting: 1,
      },
    ]);
  });

  test("A compute area whose every queue item needs a capability this machine lacks is blocked on the other machine", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [
          {
            blockers: [],
            folder: "interface",
            kind: ComputeKind.Pieces,
            needs: [["game-install"]],
            parityIds: [],
            phase: 3,
          },
        ],
        changes: [],
        exit: noExit,
        roadmap: { items: [], names: new Map() },
        scriptedQuests: [],
      },
      ["linux"],
    );

    expect(takeOne(phases, 3).rows).toStrictEqual([
      {
        blocked: 1,
        done: 0,
        firstBlocker: "",
        kind: ComputeKind.Pieces,
        notMeasurable: 0,
        runnable: 0,
        scripted: 0,
        units: 1,
        waiting: 0,
      },
    ]);
  });

  test("A change counts each open task in its own task's phase, and never a done one", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [],
        changes: [
          {
            needs: [],
            phase: 2,
            tasks: [
              { isDone: false, number: "1.1", phase: 2 },
              { isDone: false, number: "1.2", phase: 4 },
              { isDone: true, number: "1.3", phase: 2 },
            ],
            waiting: "",
          },
        ],
        exit: noExit,
        roadmap: { items: [], names: new Map() },
        scriptedQuests: [],
      },
      [],
    );

    expect(takeOne(phases, 2).rows).toStrictEqual([
      {
        blocked: 0,
        done: 0,
        firstBlocker: "",
        kind: GenshinProgressKind.Change,
        notMeasurable: 0,
        runnable: 1,
        scripted: 0,
        units: 1,
        waiting: 0,
      },
    ]);
    expect(takeOne(phases, 4).rows).toStrictEqual([
      {
        blocked: 0,
        done: 0,
        firstBlocker: "",
        kind: GenshinProgressKind.Change,
        notMeasurable: 0,
        runnable: 1,
        scripted: 0,
        units: 1,
        waiting: 0,
      },
    ]);
  });

  test("A change with no open task counts as done in its own phase", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [],
        changes: [{ needs: [], phase: 6, tasks: [{ isDone: true, number: "1.1", phase: 6 }], waiting: "" }],
        exit: noExit,
        roadmap: { items: [], names: new Map() },
        scriptedQuests: [],
      },
      [],
    );

    expect(takeOne(phases, 6).rows).toStrictEqual([
      {
        blocked: 0,
        done: 1,
        firstBlocker: "",
        kind: GenshinProgressKind.Change,
        notMeasurable: 0,
        runnable: 0,
        scripted: 0,
        units: 1,
        waiting: 0,
      },
    ]);
  });

  test("A roadmap item counts under its phase, done or open by its checkbox", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [],
        changes: [],
        exit: noExit,
        roadmap: {
          items: [
            { isDone: true, phase: 0 },
            { isDone: false, phase: 0 },
          ],
          names: new Map(),
        },
        scriptedQuests: [],
      },
      [],
    );

    expect(takeOne(phases, 0).rows).toStrictEqual([
      {
        blocked: 0,
        done: 1,
        firstBlocker: "",
        kind: GenshinProgressKind.Item,
        notMeasurable: 0,
        runnable: 1,
        scripted: 0,
        units: 2,
        waiting: 0,
      },
    ]);
  });

  test("A quest with a script is reported as scripted, not done", () => {
    expect.hasAssertions();

    const progress = buildGenshinProgress(
      {
        areas: [],
        changes: [],
        exit: noExit,
        roadmap: {
          items: [
            { isDone: false, phase: 4, quest: "351" },
            { isDone: false, phase: 4, quest: "352" },
          ],
          names: new Map(),
        },
        scriptedQuests: ["351"],
      },
      [],
    );

    expect(takeOne(progress.phases, 4).rows).toStrictEqual([
      {
        blocked: 0,
        done: 0,
        firstBlocker: "",
        kind: GenshinProgressKind.Quest,
        notMeasurable: 1,
        runnable: 0,
        scripted: 1,
        units: 2,
        waiting: 0,
      },
    ]);
    const lines = formatGenshinProgress(progress);
    expect(lines).toContain("  scripted: quest 351");
    expect(lines).toContain("  not measurable: quest 352");
  });

  test("A check with no command is not measurable", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      { areas: [], changes: [], exit: noExit, roadmap: { items: [], names: new Map() }, scriptedQuests: [] },
      [],
    );

    const scriptedSession = takeOne(
      GENSHIN_PHASE_GATES.filter(({ phase }) => phase === 3),
      0,
    );
    expect(takeOne(phases, 3).checks).toStrictEqual([
      { name: scriptedSession.gate, notes: [GENSHIN_NO_COMMAND_NOTE], state: GenshinExitCheckState.NotMeasurable },
    ]);
  });
});

import type { GenshinExitReadings } from "#src/models/genshinProgress/GenshinExitReadings";

import { ComputeKind } from "#src/models/fleet/ComputeKind";
import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";
import { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";
import { buildGenshinProgress } from "#src/services/genshinProgress/buildGenshinProgress";
import {
  GENSHIN_MISSING_ID_BLOCKER,
  GENSHIN_NO_COMMAND_NOTE,
  GENSHIN_PHASE_GATES,
} from "#src/services/genshinProgress/constants";
import { formatGenshinProgress } from "#src/services/genshinProgress/formatGenshinProgress";
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

  test("a phase's progress counts its units by kind", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [
          { blockers: [], folder: "", kind: ComputeKind.Screen, needs: [], parityIds: [], phase: 2, skipped: 0 },
          { blockers: [], folder: "", kind: ComputeKind.Screen, needs: [[]], parityIds: [], phase: 2, skipped: 0 },
          { blockers: [], folder: "", kind: ComputeKind.Region, needs: [[]], parityIds: [], phase: 2, skipped: 0 },
        ],
        changes: [],
        exit: noExit,
        roadmap: { items: [], names: new Map() },
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

  test("a compute area with only waiting items counts as waiting and names its first blocker", () => {
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
            skipped: 0,
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

  test("a compute area whose every queue item needs a capability this machine lacks is blocked on the other machine", () => {
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
            skipped: 0,
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

  test("a compute area whose only open line has no id is waiting on that line, never done or runnable", () => {
    expect.hasAssertions();

    const progress = buildGenshinProgress(
      {
        areas: [
          { blockers: [], folder: "login", kind: ComputeKind.Scene, needs: [], parityIds: [], phase: 1, skipped: 1 },
        ],
        changes: [],
        exit: noExit,
        roadmap: { items: [], names: new Map() },
        scriptedQuests: [],
      },
      [],
    );

    expect(takeOne(progress.phases, 1).rows).toStrictEqual([
      {
        blocked: 0,
        done: 0,
        firstBlocker: GENSHIN_MISSING_ID_BLOCKER,
        kind: ComputeKind.Scene,
        notMeasurable: 0,
        runnable: 0,
        scripted: 0,
        units: 1,
        waiting: 1,
      },
    ]);
    expect(formatGenshinProgress(progress)).toContainEqual(expect.stringContaining(GENSHIN_MISSING_ID_BLOCKER));
  });

  test("a change counts each open task in its own task's phase, and never a done one", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [],
        changes: [
          {
            needs: [],
            phase: 2,
            tasks: [
              { isDone: false, number: "", phase: 2 },
              { isDone: false, number: "", phase: 4 },
              { isDone: true, number: "", phase: 2 },
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

  test("a change with no open task counts as done in its own phase", () => {
    expect.hasAssertions();

    const { phases } = buildGenshinProgress(
      {
        areas: [],
        changes: [{ needs: [], phase: 6, tasks: [{ isDone: true, number: "", phase: 6 }], waiting: "" }],
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

  test("a roadmap item counts under its phase, done or open by its checkbox", () => {
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

  test("a quest with a script is reported as scripted, not done", () => {
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
    expect(formatGenshinProgress(progress)).toMatchInlineSnapshot(`
      [
        "",
        "phase 0: ",
        "no units",
        "checks",
        "  not measurable: A fresh PC and Mac pair reproduces every published dataset and fit from the install",
        "    no command reads it yet",
        "  not measurable: every asset family has a spec and a recipe",
        "    no command reads it yet",
        "  not measurable: every kind of unit has a check",
        "    no command reads it yet",
        "",
        "phase 1: ",
        "no units",
        "checks",
        "  not measurable: Every pass of the login and of Windrise holds and is frozen at every hour and weather, each reference scores under its bar, and the frame cost holds",
        "    no command reads it yet",
        "",
        "phase 2: ",
        "no units",
        "checks",
        "  not measurable: Every screen's parity ids are under their bars in every state it shows, with the game's words by key and every art gap on the roadmap",
        "    no command reads it yet",
        "",
        "phase 3: ",
        "no units",
        "checks",
        "  not measurable: A scripted session plays from the opening: walk, climb, glide, swim, fight, collect, open the menu, save and load, and a quest runs from its table",
        "    no command reads it yet",
        "",
        "phase 4: ",
        "kind   units  done  runnable here  waiting  blocked on the other machine  scripted  not measurable  first blocker",
        "-----  -----  ----  -------------  -------  ----------------------------  --------  --------------  -------------",
        "Quest  2      0     0              0        0                             1         1",
        "checks",
        "  not measurable: The region's passes hold and are frozen, its spawned places, residents, shops, domains and puzzles are placed, and its first quest chain plays through in a scripted session",
        "    no command reads it yet",
        "  scripted: quest 351",
        "  not measurable: quest 352",
        "",
        "phase 5: ",
        "no units",
        "checks",
        "  not measurable: Each region meets Mondstadt's gate, region by region",
        "    no command reads it yet",
        "",
        "phase 6: ",
        "no units",
        "checks",
        "  not measurable: Each system's scenarios pass, it is reachable through a finished screen, and its data is read from the hosted game data",
        "    no command reads it yet",
        "",
        "phase 7: ",
        "no units",
        "checks",
        "  not measurable: Each reference of the game in a state a person can reach scores under its bar, the frame and load budgets hold, and no art gap is left unrecorded",
        "    no command reads it yet",
      ]
    `);
  });

  test("a check with no command is not measurable", () => {
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

import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { describe, expect, test } from "vitest";

describe(runFits, () => {
  const fits: Record<string, () => Promise<GameDataBuild>> = {
    clouds: () => Promise.resolve({ notes: ["clouds"], objects: { "login/clouds": 0 } }),
    sky: () => Promise.resolve({ notes: ["sky"], objects: { "login/sky": 1 } }),
  };

  test("merges every fit's notes and records", async () => {
    expect.hasAssertions();
    await expect(runFits(fits, [], { isDryRun: false })).resolves.toStrictEqual({
      notes: ["clouds", "sky"],
      objects: { "login/clouds": 0, "login/sky": 1 },
    });
  });

  // The command publishes each record as its own key scope, so a fit run alone must return only its own records
  test("returns only the records of the fits named", async () => {
    expect.hasAssertions();
    await expect(runFits(fits, ["sky"], { isDryRun: false })).resolves.toStrictEqual({
      notes: ["sky"],
      objects: { "login/sky": 1 },
    });
  });

  // A group's name runs every fit under it, so `ground` runs each area's ground fit and `ground/a` runs one of them
  test("runs every fit under a group's name", async () => {
    expect.hasAssertions();
    await expect(
      runFits(
        {
          "ground/a": () => Promise.resolve({ notes: ["a"], objects: { "ground/a": 0 } }),
          "ground/b": () => Promise.resolve({ notes: ["b"], objects: { "ground/b": 1 } }),
          sky: () => Promise.resolve({ notes: ["sky"], objects: { "login/sky": 2 } }),
        },
        ["ground"],
        { isDryRun: false },
      ),
    ).resolves.toStrictEqual({ notes: ["a", "b"], objects: { "ground/a": 0, "ground/b": 1 } });
  });

  // A fit's compute holds the thread, so a record another fit fetched meanwhile would outwait its timeout
  test("runs one fit at a time", async () => {
    expect.hasAssertions();

    const events: string[] = [];
    const createFit = (name: string) => async (): Promise<GameDataBuild> => {
      events.push(`${name} start`);
      await Promise.resolve();
      events.push(`${name} end`);
      return { notes: [], objects: {} };
    };
    await runFits({ clouds: createFit("clouds"), sky: createFit("sky") }, [], { isDryRun: false });

    expect(events).toStrictEqual(["clouds start", "clouds end", "sky start", "sky end"]);
  });

  test("refuses a name no fit has", async () => {
    expect.hasAssertions();
    await expect(runFits(fits, [""], { isDryRun: false })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: , not a fit: one of clouds, sky]`,
    );
  });

  // Names are matched against the fits' own keys, so a prototype's name is no fit and is refused like any unknown name
  test("refuses a prototype's name, which no fit has", async () => {
    expect.hasAssertions();
    await expect(runFits(fits, ["toString"], { isDryRun: false })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: toString, not a fit: one of clouds, sky]`,
    );
  });

  // A dry run reaches every fit, so a fit that writes a world data file under it writes none
  test("hands the dry run to every fit it runs", async () => {
    expect.hasAssertions();

    const dryRuns: boolean[] = [];
    const createFit = ({ isDryRun }: DryRunOptions): Promise<GameDataBuild> => {
      dryRuns.push(isDryRun);
      return Promise.resolve({ notes: [], objects: {} });
    };
    await runFits({ clouds: createFit, sky: createFit }, [], { isDryRun: true });

    expect(dryRuns).toStrictEqual([true, true]);
  });
});

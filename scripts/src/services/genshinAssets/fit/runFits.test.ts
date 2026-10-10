import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { describe, expect, test } from "vitest";

describe(runFits, () => {
  const fits: Record<string, () => Promise<GameDataBuild>> = {
    clouds: () => Promise.resolve({ notes: ["clouds"], objects: { "login/clouds": 0 } }),
    sky: () => Promise.resolve({ notes: ["sky"], objects: { "login/sky": 1 } }),
  };

  test("merges every fit's notes and records", async () => {
    expect.hasAssertions();
    await expect(runFits(fits, [])).resolves.toStrictEqual({
      notes: ["clouds", "sky"],
      objects: { "login/clouds": 0, "login/sky": 1 },
    });
  });

  // The command publishes each record as its own key scope, so a fit run alone must return only its own records
  test("returns only the records of the fits named", async () => {
    expect.hasAssertions();
    await expect(runFits(fits, ["sky"])).resolves.toStrictEqual({ notes: ["sky"], objects: { "login/sky": 1 } });
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
    await runFits({ clouds: createFit("clouds"), sky: createFit("sky") }, []);

    expect(events).toStrictEqual(["clouds start", "clouds end", "sky start", "sky end"]);
  });

  test("refuses a name no fit has", async () => {
    expect.hasAssertions();
    await expect(runFits(fits, [""])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: , not a fit: one of clouds, sky]`,
    );
  });
});

import type { Stats } from "#shared/models/dungeons/monster/Stats";

import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { Save } from "#shared/models/dungeons/data/Save";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
import { BASE_DEFENSE } from "#shared/services/dungeons/monster/constants";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(Dungeons, () => {
  test("keeps a single save", () => {
    expect.hasAssertions();

    const save = new Save();
    const dungeons = new Dungeons({ save });

    expect(dungeons.save).toStrictEqual(save);
  });

  test("migrates the legacy saves array to a single save", () => {
    expect.hasAssertions();

    const save = new Save();
    const dungeons = new Dungeons({ saves: [save] });

    expect(dungeons.save).toStrictEqual(save);
  });

  test("keeps save undefined for a legacy empty saves array", () => {
    expect.hasAssertions();

    const dungeons = new Dungeons({ saves: [] });

    expect(dungeons.save).toBeUndefined();
  });

  test("defaults missing monster defense from the species data", () => {
    expect.hasAssertions();

    const save = new Save();
    const { key, stats } = takeOne(save.player.monsters);
    // Simulate a legacy save written before the defense stat existed
    delete (stats as Partial<Stats>).defense;
    const dungeons = new Dungeons({ saves: [save] });

    assert.exists(dungeons.save);
    expect(takeOne(dungeons.save.player.monsters).stats.defense).toBe(getMonsterData(key).stats.defense);
  });
});

describe("dungeonsSchema", () => {
  // structuredClone both sides: zod passes nested class instances through while the clone is plain objects
  test("parses the single-save shape", () => {
    expect.hasAssertions();

    const dungeons = new Dungeons({ save: new Save() });

    expect(structuredClone(dungeonsSchema.parse(dungeons))).toStrictEqual(structuredClone(dungeons));
  });

  test("migrates the legacy saves shape", () => {
    expect.hasAssertions();

    const dungeons = new Dungeons();
    const save = new Save();

    expect(structuredClone(dungeonsSchema.parse({ ...dungeons, saves: [save] }))).toStrictEqual(
      structuredClone({ ...dungeons, save }),
    );
  });

  test("defaults missing monster defense in the legacy shape", () => {
    expect.hasAssertions();

    const dungeons = new Dungeons();
    const save = new Save();
    const { stats } = takeOne(save.player.monsters);
    // Simulate a legacy save written before the defense stat existed
    delete (stats as Partial<Stats>).defense;
    const parsedDungeons = dungeonsSchema.parse({ ...dungeons, saves: [save] });

    assert.exists(parsedDungeons.save);
    expect(takeOne(parsedDungeons.save.player.monsters).stats.defense).toBe(BASE_DEFENSE);
  });
});

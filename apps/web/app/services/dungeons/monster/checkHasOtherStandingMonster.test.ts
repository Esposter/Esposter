import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { checkHasOtherStandingMonster } from "#src/services/dungeons/monster/checkHasOtherStandingMonster";
import { describe, expect, test } from "vitest";

describe(checkHasOtherStandingMonster, () => {
  test("the active monster and a fainted party member do not stand in for it", () => {
    expect.hasAssertions();

    const activeMonster = new Monster(MonsterKey.Iguanignite);
    const faintedMonster = new Monster(MonsterKey.Aquavalor);
    faintedMonster.status.health = 0;

    expect(checkHasOtherStandingMonster([activeMonster], activeMonster)).toBe(false);
    expect(checkHasOtherStandingMonster([activeMonster, faintedMonster], activeMonster)).toBe(false);
  });

  test("a party member that has not fainted stands in for the active monster", () => {
    expect.hasAssertions();

    const activeMonster = new Monster(MonsterKey.Iguanignite);
    const standingMonster = new Monster(MonsterKey.Aquavalor);

    expect(checkHasOtherStandingMonster([activeMonster, standingMonster], activeMonster)).toBe(true);
  });
});

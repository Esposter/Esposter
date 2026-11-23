import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import { Monster, monsterSchema } from "#shared/models/dungeons/monster/Monster";
import { describe, expect, test } from "vitest";

describe("monsterSchema", () => {
  test.each([
    ["with", { asset: { key: MonsterKey.Iguanignite } }],
    ["without", {}],
  ])("a saved monster %s the retired asset field parses", (_shape, retired) => {
    expect.hasAssertions();

    // A save is a copy of the monster, with the retired field beside it
    const savedMonster = Object.assign(structuredClone(new Monster(MonsterKey.Iguanignite)), retired);

    expect(monsterSchema.parse(savedMonster).key).toBe(MonsterKey.Iguanignite);
  });
});

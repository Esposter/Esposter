import { FileKey } from "#shared/generated/phaser/FileKey";
import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import { Monster, monsterSchema } from "#shared/models/dungeons/monster/Monster";
import { getMonsterFileKey } from "#src/services/dungeons/monster/getMonsterFileKey";
import { NotFoundError } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getMonsterFileKey, () => {
  test("a monster saved before the change renders its portrait", () => {
    expect.hasAssertions();

    // A save is a copy of the monster, with the retired asset beside it
    const savedMonster = Object.assign(structuredClone(new Monster(MonsterKey.Iguanignite)), {
      asset: { key: MonsterKey.Iguanignite },
    });

    expect(getMonsterFileKey(monsterSchema.parse(savedMonster).key)).toBe(FileKey.UIMonstersIguanignite);
  });

  test("an unknown species fails its lookup", () => {
    expect.hasAssertions();

    // @ts-expect-error A species the map does not hold is the one value the parameter's type refuses
    const unknownSpecies: MonsterKey = "Unknown";

    expect(() => getMonsterFileKey(unknownSpecies)).toThrowErrorMatchingInlineSnapshot(
      `[NotFoundError: ${new NotFoundError(getMonsterFileKey.name, "Unknown").message}]`,
    );
  });
});

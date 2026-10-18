import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { ALYOSHA_CHARACTER_ID, createAlyoshaKitBehaviour } from "#src/services/kit/characters/alyoshaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readCharacterKitRecord } from "#src/services/kit/readCharacterKitRecord.test";
import { describe, expect, test } from "vitest";

const kit = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ALYOSHA_CHARACTER_ID);
const { record, toParameter } = await readCharacterKitRecord(ALYOSHA_CHARACTER_ID);
const toFrames = (seconds: number) => Math.round(seconds * 60);

describe(createAlyoshaKitBehaviour, () => {
  test("the normal attacks, in sequence", () => {
    expect.hasAssertions();

    expect(
      kit.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual(
      record.normalAttacks.map((action) => ({
        frames: action.animationFrames,
        hitmarks: action.hits.map(({ hitmarkFrames }) => hitmarkFrames),
      })),
    );
  });

  test("charged attack lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.chargedAttack.seconds)).toBe(record.chargedAttack.animationFrames);
    expect(kit.chargedAttack.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      record.chargedAttack.hits.map(({ hitmarkFrames }) => hitmarkFrames),
    );
  });

  test("plunge lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.lowPlunge.seconds)).toBe(record.plunges[KitPlunge.Low].animationFrames);
    expect(kit.lowPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      record.plunges[KitPlunge.Low].hits.map(({ hitmarkFrames }) => hitmarkFrames),
    );
    expect(toFrames(kit.highPlunge.seconds)).toBe(record.plunges[KitPlunge.High].animationFrames);
    expect(kit.highPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      record.plunges[KitPlunge.High].hits.map(({ hitmarkFrames }) => hitmarkFrames),
    );
    expect(toFrames(kit.plungeCollision.hitmarkSeconds)).toBe(record.plungeCollision.hitmarkFrames);
  });

  test("thunderbolt strike's tap deals one hit", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalSkill.seconds)).toBe(record.skill.animationFrames);
    expect(kit.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      record.skill.hits.map(({ hitmarkFrames }) => hitmarkFrames),
    );
    expect(kit.skillCooldownSeconds).toBe(toParameter(record.skillCooldownSeconds));
  });

  test("hunter's advance deals no hit yet", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalBurst.seconds)).toBe(record.burst.animationFrames);
    expect(kit.elementalBurst.hits).toHaveLength(0);
    expect(kit.burstCooldownSeconds).toBe(toParameter(record.burstCooldownSeconds));
  });
});

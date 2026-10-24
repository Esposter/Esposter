import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { CaptureResult } from "@/models/dungeons/item/CaptureResult";
import { createCaptureResult } from "@/services/dungeons/item/createCaptureResult";
import { createRandomNumber } from "@/util/math/random/createRandomNumber";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/util/math/random/createRandomNumber"), () => ({ createRandomNumber: vi.fn<() => number>(() => 0) }));

const getMonster = (health?: number) => {
  const monster = new Monster(MonsterKey.Iguanignite);
  if (health !== undefined) monster.status.health = health;
  return monster;
};

describe(createCaptureResult, () => {
  test("catches a full-health monster on a roll at its success rate", () => {
    expect.hasAssertions();

    // A full-health monster has a success rate of 0.5, and a roll of exactly that rate still catches it
    vi.mocked(createRandomNumber).mockReturnValueOnce(0.5);

    expect(createCaptureResult(getMonster())).toBe(CaptureResult.Success);
  });

  test("a roll just past the success rate is a near miss", () => {
    expect.hasAssertions();

    vi.mocked(createRandomNumber).mockReturnValueOnce(0.55);

    expect(createCaptureResult(getMonster())).toBe(CaptureResult.NearMiss);
  });

  test("a roll well past the success rate fails the catch", () => {
    expect.hasAssertions();

    vi.mocked(createRandomNumber).mockReturnValueOnce(0.625);

    expect(createCaptureResult(getMonster())).toBe(CaptureResult.Failure);
  });

  test("a weakened monster is easier to catch on the same roll", () => {
    expect.hasAssertions();

    // On this roll full health only near-misses, while a monster at no health has a success rate of 0.7
    vi.mocked(createRandomNumber).mockReturnValueOnce(0.55);
    expect(createCaptureResult(getMonster())).toBe(CaptureResult.NearMiss);

    vi.mocked(createRandomNumber).mockReturnValueOnce(0.55);
    expect(createCaptureResult(getMonster(0))).toBe(CaptureResult.Success);
  });
});

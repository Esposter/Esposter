import { useMonsterPositions } from "@/composables/dungeons/scene/battle/monster/useMonsterPositions";
import { describe, expect, test } from "vitest";

describe(useMonsterPositions, () => {
  test("a reset returns both sides to their initial positions and clears any tween the battle left running", () => {
    expect.hasAssertions();

    const {
      monsterInfoContainerPosition,
      monsterInfoContainerTween,
      monsterPosition,
      monsterTween,
      resetMonsterPositions,
    } = useMonsterPositions({ x: 0, y: 0 }, { x: 1, y: 0 });
    monsterPosition.value = { x: -1, y: -1 };
    monsterInfoContainerPosition.value = { x: -1, y: -1 };
    monsterTween.value = { duration: 0 };
    monsterInfoContainerTween.value = { duration: 0 };

    resetMonsterPositions();

    expect(monsterPosition.value).toStrictEqual({ x: 0, y: 0 });
    expect(monsterInfoContainerPosition.value).toStrictEqual({ x: 1, y: 0 });
    expect(monsterTween.value).toBeUndefined();
    expect(monsterInfoContainerTween.value).toBeUndefined();
  });
});

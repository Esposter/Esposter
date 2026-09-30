import { LOGIN_TOWER_FIELD } from "#src/services/login/tower/constants";
import { getLoginTowers } from "#src/services/login/tower/getLoginTowers";
import { LOGIN_WALKWAY_WIDTH } from "#src/services/login/walkway/constants";
import { describe, expect, test } from "vitest";

describe(getLoginTowers, () => {
  test("stands the same towers every time, all of them clear of the walkway", () => {
    expect.hasAssertions();

    const towers = getLoginTowers();

    expect(getLoginTowers()).toStrictEqual(towers);
    expect(towers.every(({ diameter, position: [x] }) => Math.abs(x) - diameter / 2 > LOGIN_WALKWAY_WIDTH / 2)).toBe(
      true,
    );
  });

  test("keeps the field's towers apart", () => {
    expect.hasAssertions();

    const towers = getLoginTowers().slice(-LOGIN_TOWER_FIELD.count);

    expect(
      towers.every(({ position: [x, z] }, index) =>
        towers
          .slice(index + 1)
          .every(({ position: [otherX, otherZ] }) => Math.hypot(otherX - x, otherZ - z) > LOGIN_TOWER_FIELD.spacing),
      ),
    ).toBe(true);
  });
});

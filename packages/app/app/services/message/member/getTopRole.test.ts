import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { getTopRole } from "@/services/message/member/getTopRole";
import { describe, expect, test } from "vitest";

describe(getTopRole, () => {
  test("returns the highest-positioned role", () => {
    expect.hasAssertions();

    const lowRole = createRoomRole({ position: 0 });
    const highRole = createRoomRole({ position: 1 });

    expect(getTopRole([lowRole, highRole])).toStrictEqual(highRole);
    expect(getTopRole([highRole, lowRole])).toStrictEqual(highRole);
  });

  test("ignores the @everyone role", () => {
    expect.hasAssertions();

    const everyoneRole = createRoomRole({ isEveryone: true, position: 1 });
    const role = createRoomRole({ position: 0 });

    expect(getTopRole([everyoneRole, role])).toStrictEqual(role);
    expect(getTopRole([everyoneRole])).toBeUndefined();
  });

  test("returns undefined for no roles", () => {
    expect.hasAssertions();

    expect(getTopRole([])).toBeUndefined();
  });
});

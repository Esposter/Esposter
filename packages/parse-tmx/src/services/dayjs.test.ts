import baseDayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { describe, expect, test } from "vitest";

baseDayjs.extend(duration);

export const dayjs: typeof baseDayjs = baseDayjs;

describe(dayjs, () => {
  test("stub", () => {
    expect.hasAssertions();

    expect(undefined).toBeUndefined();
  });
});

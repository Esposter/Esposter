import { describe, expect, test } from "vitest";

import { SinStatusKind } from "../../models/SinStatusKind";
import { parseSinsResult } from "./parseSinsResult";

describe(parseSinsResult, () => {
  test("reads a result the script did not write in its shape as a failed run", () => {
    expect.hasAssertions();

    expect(parseSinsResult('{"result":"answered"}')).toStrictEqual({ result: SinStatusKind.Failed });
  });
});

import { describe, expect, expectTypeOf, test } from "vitest";

import type { CommissionTask, SinStatus } from "../../types";
import type { SinStatusKind } from "./SinStatusKind";
import type { TaskStatus } from "./TaskStatus";

// The contract file imports nothing, because the engine validates the module's state keys against that one file, so it
// Repeats the mod's value sets; these tests are what keeps each repeat equal to the enum it copies
describe("state contract", () => {
  test("sinStatus holds exactly the values of SinStatusKind", () => {
    expect.hasAssertions();

    expectTypeOf<SinStatus>().toEqualTypeOf<`${SinStatusKind}`>();
  });

  test("a commission task's status holds exactly the values of TaskStatus", () => {
    expect.hasAssertions();

    expectTypeOf<CommissionTask["status"]>().toEqualTypeOf<`${TaskStatus}`>();
  });
});

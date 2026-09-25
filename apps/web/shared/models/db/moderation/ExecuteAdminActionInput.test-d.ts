import type { ExecuteAdminActionInput } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import type { AdminActionType } from "@esposter/db-schema";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("executeAdminActionInput type", () => {
  // Every other place an action type touches is a map keyed by the enum, so a new member fails to compile there.
  // The input union is the one that would stay silent: a variant nobody wrote leaves the action unreachable
  test("accepts every admin action type", () => {
    expect.hasAssertions();

    expectTypeOf<ExecuteAdminActionInput["type"]>().toEqualTypeOf<AdminActionType>();
  });
});

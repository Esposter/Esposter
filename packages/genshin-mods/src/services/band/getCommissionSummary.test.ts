import { describe, expect, test } from "vitest";

import { TaskStatus } from "../../models/TaskStatus";
import { getCommissionSummary } from "./getCommissionSummary";

describe(getCommissionSummary, () => {
  test("reads the goal, the tasks done, the share and the whole minutes since it opened", () => {
    expect.hasAssertions();

    const minuteMs = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
    const commission = {
      goal: "a",
      openedAt: 0,
      tasks: [
        { id: "0", status: TaskStatus.Completed, subject: "" },
        { id: "1", status: TaskStatus.Pending, subject: "" },
      ],
    } as const;

    expect(getCommissionSummary({ ...commission, tasks: [...commission.tasks] }, minuteMs)).toBe(
      "a · 1 of 2 · 50% · 1m",
    );
  });
});

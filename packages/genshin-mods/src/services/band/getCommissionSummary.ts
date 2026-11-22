import type { Commission } from "../../../types";

import { TaskStatus } from "../../models/TaskStatus";
import { MINUTE_FORMATTER, PERCENT_FORMATTER } from "../constants";

// The goal, the tasks done of the total, their share as a percentage and the whole minutes since the commission opened
export const getCommissionSummary = ({ goal, openedAt, tasks }: Commission, now: number): string => {
  const done = tasks.filter(({ status }) => status === TaskStatus.Completed).length;
  const elapsedMinutes = Math.floor(
    Temporal.Duration.from({ milliseconds: Math.max(0, now - openedAt) }).total("minutes"),
  );
  return [
    goal,
    `${done} of ${tasks.length}`,
    PERCENT_FORMATTER.format(done / tasks.length),
    MINUTE_FORMATTER.format(elapsedMinutes),
  ]
    .filter(Boolean)
    .join(" · ");
};

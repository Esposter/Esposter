import type { Commission } from "../../../types";

import { minuteFormat } from "../minuteFormat";

const percentFormat = new Intl.NumberFormat("en", { style: "percent" });

// `goal · 3 of 4 · 75% · 12m`, the clock counting whole minutes from the commission's opening
export const getCommissionSummary = ({ goal, openedAt, tasks }: Commission, now: number): string => {
  const done = tasks.filter(({ status }) => status === "completed").length;
  const elapsedMinutes = Math.floor(
    Temporal.Duration.from({ milliseconds: Math.max(0, now - openedAt) }).total("minutes"),
  );
  return [
    goal,
    `${done} of ${tasks.length}`,
    percentFormat.format(done / tasks.length),
    minuteFormat.format(elapsedMinutes),
  ]
    .filter(Boolean)
    .join(" · ");
};

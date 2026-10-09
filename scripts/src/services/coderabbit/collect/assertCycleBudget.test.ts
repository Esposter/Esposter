import { assertCycleBudget } from "#src/services/coderabbit/collect/assertCycleBudget";
import {
  CYCLE_BUDGET_MS,
  JOB_STARTED_AT_ENVIRONMENT_VARIABLE,
  REPAIR_ATTEMPT_TIMEOUT_MS,
  SESSION_TIMEOUT_MS,
} from "#src/services/coderabbit/collect/constants";
import { readWorkflowLines } from "#src/services/coderabbit/collect/readWorkflowLines.test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(assertCycleBudget, () => {
  const workflowName = "run-review-collector.yaml";
  const timeoutPrefix = "    timeout-minutes: ";

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("refuses a session that could end past the run's budget", () => {
    expect.hasAssertions();

    vi.stubEnv(JOB_STARTED_AT_ENVIRONMENT_VARIABLE, "0");
    vi.setSystemTime(CYCLE_BUDGET_MS - SESSION_TIMEOUT_MS + 1);

    expect(() => {
      assertCycleBudget(SESSION_TIMEOUT_MS);
    }).toThrowErrorMatchingInlineSnapshot(
      `[CycleBudgetSpentError: Invalid operation: Create, name: coderabbit, the run has spent 56 of its 100 minutes, too few for a session of up to 45]`,
    );
  });

  // Outside the job no timeout ends the run — a run by hand, or the queue push's carry — so nothing is refused however
  // Long it has run
  test("budgets nothing outside the job", () => {
    expect.hasAssertions();

    vi.stubEnv(JOB_STARTED_AT_ENVIRONMENT_VARIABLE, undefined);
    vi.setSystemTime(CYCLE_BUDGET_MS);

    expect(() => {
      assertCycleBudget(SESSION_TIMEOUT_MS);
    }).not.toThrow();
  });

  // A workflow file cannot import the constant, and a variable it spells otherwise is unset in the cycle, which then
  // Budgets nothing and is killed mid-session again with no error to say so
  test("reads its start under the variable its job records it in", () => {
    expect.hasAssertions();

    expect(readWorkflowLines(workflowName)).toContain(
      `          echo "${JOB_STARTED_AT_ENVIRONMENT_VARIABLE}=$(date +%s%3N)" >> "$GITHUB_ENV"`,
    );
  });

  // The budget is asked only before a step that launches a session starts, so the job's timeout must outlast it by the
  // Longest such step — a raised constant would otherwise reopen the kill that leaves no retrigger
  test("runs in a job whose timeout outlasts the budget and its longest step", () => {
    expect.hasAssertions();

    const lines = readWorkflowLines(workflowName);
    const timeoutLine = lines.slice(lines.indexOf("  collect:")).find((line) => line.startsWith(timeoutPrefix)) ?? "";
    const timeoutMs = Temporal.Duration.from({ minutes: Number(timeoutLine.slice(timeoutPrefix.length)) }).total(
      "milliseconds",
    );

    expect(timeoutMs).toBeGreaterThan(CYCLE_BUDGET_MS + Math.max(SESSION_TIMEOUT_MS, REPAIR_ATTEMPT_TIMEOUT_MS));
  });
});

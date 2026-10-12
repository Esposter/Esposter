import { runGh } from "#src/services/shared/runGh";
import { getResult, jsonDateParse } from "@esposter/shared";
import { z } from "zod";

const runStatusSchema: z.ZodType<{ status: string }> = z.object({ status: z.string() });

// A workflow run's status as GitHub reports it. A run that cannot be read is reported as not completed, so an issue it may
// Own is held for this run's next look rather than settled against a fixer still on it.
export const getRunStatus = (runId: string): string =>
  getResult(() => runStatusSchema.parse(jsonDateParse(runGh(["run", "view", runId, "--json", "status"])))).match(
    ({ status }) => status,
    () => "",
  );

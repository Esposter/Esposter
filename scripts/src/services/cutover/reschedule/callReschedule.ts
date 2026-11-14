import type { RescheduleResponse } from "#src/models/cutover/RescheduleResponse";

import { rescheduleResponseSchema } from "#src/models/cutover/RescheduleResponse";
import { CUTOVER_SECRET_HEADER, RESCHEDULE_PATH } from "#src/services/cutover/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// Asks the functions Worker to schedule every pending job. The secret travels in a header and never in the URL or a message
export const callReschedule = async (functionsUrl: string, secret: string): Promise<RescheduleResponse> => {
  const response = await getResultAsync(() =>
    fetch(new URL(RESCHEDULE_PATH, functionsUrl), { headers: { [CUTOVER_SECRET_HEADER]: secret }, method: "POST" }),
  ).match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
  if (!response.ok)
    throw new InvalidOperationError(
      Operation.Update,
      "reschedule",
      `the functions Worker answered HTTP ${response.status}`,
    );
  return rescheduleResponseSchema.parse(await response.json());
};

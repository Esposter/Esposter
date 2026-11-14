import type { RescheduleRequest } from "#src/models/cutover/RescheduleRequest";
import type { RescheduleResponse } from "#src/models/cutover/RescheduleResponse";

import { rescheduleResponseSchema } from "#src/models/cutover/RescheduleResponse";
import { callFunctionsRoute } from "#src/services/cutover/callFunctionsRoute";
import { RESCHEDULE_PATH } from "#src/services/cutover/constants";

// Asks the functions Worker to arm the old estate's pending message reminders and the TodoList reminders from the copied
// Rows, on their owners' objects
export const callReschedule = async (
  functionsUrl: string,
  secret: string,
  request: RescheduleRequest,
): Promise<RescheduleResponse> =>
  rescheduleResponseSchema.parse(await callFunctionsRoute(functionsUrl, secret, RESCHEDULE_PATH, request));

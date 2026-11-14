import type { RescheduleResponse } from "#src/models/cutover/RescheduleResponse";

import { rescheduleResponseSchema } from "#src/models/cutover/RescheduleResponse";
import { callFunctionsRoute } from "#src/services/cutover/callFunctionsRoute";
import { RESCHEDULE_PATH } from "#src/services/cutover/constants";

// Asks the functions Worker to arm the TodoList reminders from the copied rows, on their owners' objects
export const callReschedule = async (functionsUrl: string, secret: string): Promise<RescheduleResponse> =>
  rescheduleResponseSchema.parse(await callFunctionsRoute(functionsUrl, secret, RESCHEDULE_PATH));

import { AZURE_FUNCTION_FAILED_LOG_MESSAGE_SUFFIX, AzureFunction } from "@esposter/db-schema";
// Built from the same constants `logAndRethrow` composes its `context.error` message from, so renaming the message
// Cannot leave this alert matching a prefix nothing logs.
const DeadLetterReplayFailedQuery: `traces | where message startswith "${string}"` = `traces | where message startswith "${AzureFunction.ReplayDeadLetterEvent}${AZURE_FUNCTION_FAILED_LOG_MESSAGE_SUFFIX}"`;

export default DeadLetterReplayFailedQuery;

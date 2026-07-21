import { AzureFunction, DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX } from "@esposter/db-schema";
// Built from the same constants the replay handler composes its `context.error` message from, so renaming the message
// Cannot leave this alert matching a prefix nothing logs.
const DeadLetterQuarantinedQuery: `traces | where message startswith "${string}"` = `traces | where message startswith "${AzureFunction.ReplayDeadLetterEvent}${DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX}"`;

export default DeadLetterQuarantinedQuery;

// Log-message segments an Azure Function appends after its own `AzureFunction` name, so a failure and a quarantine
// Read the same way whichever handler emitted them. Nothing external matches on these any more — the scheduled query
// Rule alerts that did were removed with App Insights — so they are a logging convention now, not a contract; a
// Rename is safe, and anything that starts matching on them again belongs back in this comment.
export const AZURE_FUNCTION_FAILED_LOG_MESSAGE_SUFFIX = " failed: ";
export const DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX = " quarantined";

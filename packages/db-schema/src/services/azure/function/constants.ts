// Log-message segments an Azure Function appends after its own `AzureFunction` name, so a failure and a quarantine
// Read the same way whichever handler emitted them. Nothing external matches on them, so they are a logging
// Convention rather than a contract and a rename is safe — anything that starts matching on them belongs back
// In this comment.
export const AZURE_FUNCTION_FAILED_LOG_MESSAGE_SUFFIX = " failed: ";
export const DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX = " quarantined";

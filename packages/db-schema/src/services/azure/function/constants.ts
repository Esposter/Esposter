// Log-message segments an Azure Function appends after its own `AzureFunction` name. Scheduled query rule alerts match
// On the composed prefix, so both the emitting handler and the alert query build it from these constants — renaming a
// Message can never leave an alert watching a prefix nothing logs.
export const AZURE_FUNCTION_FAILED_LOG_MESSAGE_SUFFIX = " failed: ";
export const DEAD_LETTER_QUARANTINED_LOG_MESSAGE_SUFFIX = " quarantined";

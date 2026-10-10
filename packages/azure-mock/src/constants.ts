// The service's own wording, which callers match on to tell a missing blob from any other failure
export const BLOB_NOT_FOUND_ERROR_CODE = "BlobNotFound";
export const BLOB_NOT_FOUND_MESSAGE = "The specified blob does not exist.";
// The service's wording for a conditional request its condition refused
export const CONDITION_NOT_MET_ERROR_CODE = "ConditionNotMet";
export const CONDITION_NOT_MET_MESSAGE = "The condition specified using HTTP conditional header(s) is not met.";
export const MOCK_BLOB_BASE_URL = "https://mockaccount.blob.core.windows.net";
export const MOCK_QUEUE_BASE_URL = "https://mockaccount.queue.core.windows.net";
export const MOCK_SEARCH_BASE_URL = "https://mockaccount.search.windows.net";
export const MOCK_TABLE_BASE_URL = "https://mockaccount.table.core.windows.net";

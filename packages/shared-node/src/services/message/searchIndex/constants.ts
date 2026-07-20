export const SEARCH_API_VERSION = "2024-07-01";
export const TABLE_API_VERSION = "2019-02-02";
// Mirrors db-schema's SearchIndex.Messages, which shared-node cannot import.
export const MESSAGES_INDEX = "messages-index";
export const MESSAGES_TABLE = "Messages";
// Mirrors Azure's 1000-doc index-batch limit and db-schema's AZURE_MAX_PAGE_SIZE, un-importable here.
export const SEARCH_INDEX_MAX_BATCH_SIZE = 1000;

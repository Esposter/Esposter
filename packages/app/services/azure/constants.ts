export const AZURE_DEFAULT_PARTITION_KEY = "Default";
// Crazy big timestamps for calculating reverse-ticked timestamps.
// It also indicates how long before azure table storage
// completely ***ks up trying to insert a negative partition / row key
export const AZURE_SELF_DESTRUCT_TIMER = "9".repeat(30);
export const AZURE_SELF_DESTRUCT_TIMER_SMALL = "9".repeat(15);
export const AZURE_MAX_BATCH_SIZE = 100;
export const AZURE_MAX_PAGE_SIZE = 1000;

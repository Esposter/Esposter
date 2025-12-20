// Crazy big timestamps for calculating reverse-ticked timestamps.
// It also indicates how long before azure table storage
// Completely ***ks up trying to insert a negative partition / row key
export const AZURE_SELF_DESTRUCT_TIMER = "9".repeat(30);

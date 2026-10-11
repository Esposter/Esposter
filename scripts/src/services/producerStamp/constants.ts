// The file an output's stamp is written as beside the output, which every reader of the output reads back
export const PRODUCER_STAMP_NAME = "producer.json";
// The window, in days, that a stamp whose commit git does not know lists producer commits over
export const PRODUCER_STALE_WINDOW_DAYS = 14;
// How many commit lines a staleness report prints before it counts the rest
export const MAX_LISTED_PRODUCER_COMMITS = 5;
export const SHORT_SHA_LENGTH = 7;

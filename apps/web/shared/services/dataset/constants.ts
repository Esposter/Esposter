import { MAX_READ_LIMIT } from "@esposter/shared";

// Why a dataset read stops short — every truncation surface explains the cap with this one sentence
export const DATASET_ROW_CAP_DESCRIPTION = `Dataset reads are capped at ${MAX_READ_LIMIT} rows, so the rest are not loaded.`;
// Counting a truncated read walks the partition page by page, so the walk itself needs a bound; a count
// That hit this bound is a floor, and every surface renders it as "N+" via formatTruncationCount
export const DATASET_MAX_COUNTED_ROWS = 10 * MAX_READ_LIMIT;

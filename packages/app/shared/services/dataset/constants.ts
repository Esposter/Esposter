import { AZURE_MAX_PAGE_SIZE } from "@esposter/db-schema";

// Why a dataset read stops short — every truncation surface explains the cap with this one sentence
export const DATASET_ROW_CAP_DESCRIPTION = `Dataset reads are capped at ${AZURE_MAX_PAGE_SIZE} rows, so the rest are not loaded.`;

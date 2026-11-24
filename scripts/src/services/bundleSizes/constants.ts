import { KIBIBYTE } from "@esposter/configuration/constants";

export const BUNDLE_SIZES_FILENAME = "bundle-sizes.md";
// The subject every record commit opens with, which the review names its own by (`checkIsRecordCommit`)
export const BUNDLE_SIZE_COMMIT_PREFIX = "chore(bundle-sizes):";
// The growth a record's commit body marks for a reader to check first. A row that grew by a KiB or more moved for a
// Reason the change that moved it should name, and every row a record gains or loses is marked as well
export const BUNDLE_SIZE_READ_BYTES = KIBIBYTE;

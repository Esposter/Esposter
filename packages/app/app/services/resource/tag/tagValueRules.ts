import { MAX_TAG_VALUE_LENGTH } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
// An empty value is a meaningful Azure tag ("environment:"), so only the length is constrained
export const tagValueRules = [
  (value: string) => normalizeString(value).length <= MAX_TAG_VALUE_LENGTH || `Max ${MAX_TAG_VALUE_LENGTH} characters`,
];

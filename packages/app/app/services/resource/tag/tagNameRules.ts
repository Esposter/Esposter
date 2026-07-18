import { MAX_TAG_NAME_LENGTH } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
// A blank name is how the dialog marks a row the user has not filled in yet, so it is allowed here
// And dropped at save; only a name that exists must fit.
export const tagNameRules = [
  (value: string) => normalizeString(value).length <= MAX_TAG_NAME_LENGTH || `Max ${MAX_TAG_NAME_LENGTH} characters`,
];

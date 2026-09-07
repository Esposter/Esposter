import type { TagRow } from "@/models/resource/TagRow";
import type { ResourceTags } from "@esposter/db-schema";

import { normalizeString } from "@esposter/shared";
// Rows with a blank name are the user's in-progress ones, never tags — dropping them here is what
// Lets the dialog keep an empty row on screen without ever writing it.
export const getResourceTags = (rows: TagRow[]): ResourceTags =>
  Object.fromEntries(
    rows
      .filter(({ name }) => normalizeString(name).length > 0)
      .map(({ name, value }) => [normalizeString(name), normalizeString(value)]),
  );

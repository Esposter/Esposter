import type { BlueprintEntryContent } from "#shared/models/resource/blueprint/BlueprintEntryContent";

import { isOuterGrammarEntry } from "#shared/services/resource/blueprint/isOuterGrammarEntry";
import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";

// The scanning form of the same decision, for a caller that only reads the strings and has no use for a rewrite
export const visitBlueprintEntryContentStrings = (entry: BlueprintEntryContent, visit: (value: string) => void) => {
  if (isOuterGrammarEntry(entry)) deepVisitStrings(entry.content, visit);
};

import type { BlueprintEntryContent } from "#shared/models/resource/blueprint/BlueprintEntryContent";

import { checkIsOuterGrammarEntry } from "#shared/services/resource/blueprint/checkIsOuterGrammarEntry";
import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";

// The scanning form of the same decision, for a caller that only reads the strings and has no use for a rewrite
export const visitBlueprintEntryContentStrings = (entry: BlueprintEntryContent, visit: (value: string) => void) => {
  if (checkIsOuterGrammarEntry(entry)) deepVisitStrings(entry.content, visit);
};

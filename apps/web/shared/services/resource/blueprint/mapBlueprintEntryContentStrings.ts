import type { BlueprintEntryContent } from "#shared/models/resource/blueprint/BlueprintEntryContent";

import { checkIsOuterGrammarEntry } from "#shared/services/resource/blueprint/checkIsOuterGrammarEntry";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";

export const mapBlueprintEntryContentStrings = (
  entry: BlueprintEntryContent,
  replace: (value: string) => string,
): unknown => (checkIsOuterGrammarEntry(entry) ? deepReplaceStrings(entry.content, replace) : entry.content);

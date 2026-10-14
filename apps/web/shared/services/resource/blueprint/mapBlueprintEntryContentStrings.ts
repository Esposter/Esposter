import type { BlueprintEntryContent } from "#shared/models/resource/blueprint/BlueprintEntryContent";

import { isOuterGrammarEntry } from "#shared/services/resource/blueprint/isOuterGrammarEntry";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";

export const mapBlueprintEntryContentStrings = (
  entry: BlueprintEntryContent,
  replace: (value: string) => string,
): unknown => (isOuterGrammarEntry(entry) ? deepReplaceStrings(entry.content, replace) : entry.content);

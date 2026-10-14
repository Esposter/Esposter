import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";
import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";
import { ResourceType } from "@esposter/db-schema";

type BlueprintEntryContent = Pick<BlueprintEntry, "content" | "type">;

// Every read or rewrite of an entry's content goes through here, so exactly one place decides whose grammar
// The content belongs to. A `type: Blueprint` entry's content is a manifest in its own right: its
// `{{entry:*}}` and `{{parameter:*}}` tokens name that child's entries and parameters, not this deploy's, so
// The outer grammar never descends into it and the nested manifest is created byte-for-byte as authored.
// Callers take the whole entry rather than its content precisely so the decision cannot be bypassed
const isOuterGrammarEntry = (entry: BlueprintEntryContent) => entry.type !== ResourceType.Blueprint;

export const mapBlueprintEntryContentStrings = (
  entry: BlueprintEntryContent,
  replace: (value: string) => string,
): unknown => (isOuterGrammarEntry(entry) ? deepReplaceStrings(entry.content, replace) : entry.content);

// The scanning form of the same decision, for a caller that only reads the strings and has no use for a rewrite
export const visitBlueprintEntryContentStrings = (entry: BlueprintEntryContent, visit: (value: string) => void) => {
  if (isOuterGrammarEntry(entry)) deepVisitStrings(entry.content, visit);
};

import type { BlueprintEntryContent } from "#shared/models/resource/blueprint/BlueprintEntryContent";

import { ResourceType } from "@esposter/db-schema";

// Every read or rewrite of an entry's content goes through here, so exactly one place decides whose grammar
// The content belongs to. A `type: Blueprint` entry's content is a manifest in its own right: its
// `{{entry:*}}` and `{{parameter:*}}` tokens name that child's entries and parameters, not this deploy's, so
// The outer grammar never descends into it and the nested manifest is created byte-for-byte as authored.
// Callers take the whole entry rather than its content precisely so the decision cannot be bypassed
export const isOuterGrammarEntry = (entry: BlueprintEntryContent) => entry.type !== ResourceType.Blueprint;

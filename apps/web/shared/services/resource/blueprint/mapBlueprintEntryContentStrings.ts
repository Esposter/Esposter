import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";
import { ResourceType } from "@esposter/db-schema";

// Every read or rewrite of an entry's content goes through here, so exactly one place decides whose grammar
// The content belongs to. A `type: Blueprint` entry's content is a manifest in its own right: its
// `{{entry:*}}` and `{{parameter:*}}` tokens name that child's entries and parameters, not this deploy's, so
// The outer grammar never descends into it and the nested manifest is created byte-for-byte as authored.
// Callers take the whole entry rather than its content precisely so the decision cannot be bypassed
export const mapBlueprintEntryContentStrings = (
  entry: Pick<BlueprintEntry, "content" | "type">,
  replace: (value: string) => string,
): unknown => (entry.type === ResourceType.Blueprint ? entry.content : deepReplaceStrings(entry.content, replace));

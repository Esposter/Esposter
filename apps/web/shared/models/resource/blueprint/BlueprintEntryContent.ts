import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

export type BlueprintEntryContent = Pick<BlueprintEntry, "content" | "type">;

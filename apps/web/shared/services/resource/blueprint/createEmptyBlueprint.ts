import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

export const createEmptyBlueprint = (): BlueprintResource => ({ entries: [], parameters: [] });

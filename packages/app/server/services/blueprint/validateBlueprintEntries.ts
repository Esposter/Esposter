import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { BLUEPRINT_ENTRY_TOKEN_REGEX } from "#shared/services/resource/blueprint/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";
import { DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Pre-validates every entry against its type's own contentSchema — with a placeholder id standing in for
// Each `{{entry:key}}` so uuid-shaped bindings pass — so a manifest can never deploy content the type's
// Own save path would reject. Runs before anything is created, so a bad entry rejects the whole deploy
export const validateBlueprintEntries = (entries: BlueprintEntry[]): void => {
  const placeholderId = crypto.randomUUID();
  for (const entry of entries) {
    const { contentSchema } = ResourceDefinitionMap[entry.type];
    const content = deepReplaceStrings(entry.content, (string) =>
      string.replace(BLUEPRINT_ENTRY_TOKEN_REGEX, placeholderId),
    );
    if (!contentSchema.safeParse(content).success)
      throw new InvalidOperationError(
        Operation.Create,
        DatabaseEntityType.Resource,
        `invalid content for entry ${entry.key}`,
      );
  }
};

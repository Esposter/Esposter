import { blueprintResourceSchema } from "#shared/models/resource/blueprint/BlueprintResource";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The check manifest text passes before the Editor saves it or an import adopts it. The schema says what a manifest is
// And coerces the dates it holds, so a plain JSON.parse feeds it. A failure throws, and the caller shows its message
export const parseBlueprintManifest = (json: string) => {
  // oxlint-disable-next-line no-restricted-properties -- blueprintResourceSchema validates the manifest and coerces its own dates
  const parsedManifest = blueprintResourceSchema.safeParse(JSON.parse(json));
  if (!parsedManifest.success)
    throw new InvalidOperationError(Operation.Create, "blueprint", takeOne(parsedManifest.error.issues, 0).message);

  return parsedManifest.data;
};

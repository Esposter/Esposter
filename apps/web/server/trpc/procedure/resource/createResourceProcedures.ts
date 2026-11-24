import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceType } from "@esposter/db-schema";

import { createBaseProcedures } from "#server/trpc/procedure/resource/createBaseProcedures";
import { createFileAssetsProcedures } from "#server/trpc/procedure/resource/createFileAssetsProcedures";
import { createPublishProcedures } from "#server/trpc/procedure/resource/createPublishProcedures";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";

// The base group rides on every type, and each capability group rides only on the types that declare its capability
type ResourceProcedures<TType extends ResourceType> = ReturnType<typeof createBaseProcedures<TType>> &
  (TType extends FileAssetsResourceType ? ReturnType<typeof createFileAssetsProcedures> : unknown) &
  (TType extends PublishableResourceType ? ReturnType<typeof createPublishProcedures<TType>> : unknown);

// The publish hooks are keyed by the type: a publishable type takes its options, and every other type takes none. The
// Check is not distributive, so the options stay this type's own rather than the union of every publishable type's
export const createResourceProcedures = <TType extends ResourceType>(
  type: TType,
  options?: [TType] extends [PublishableResourceType]
    ? PublishableResourceProcedureOptions<ResourceContent<TType>>
    : never,
): ResourceProcedures<TType> => {
  // The groups are gated on the same runtime checks the conditional states at the type level, which is why the object
  // Is right for every type, and why the cast is the one the compiler leaves: TS2322 refuses a concrete object as a
  // Value of `ResourceProcedures<TType>`, a conditional over the generic `TType`
  const procedures = {
    ...createBaseProcedures(type),
    ...(checkHasCapability(type, "fileAssets") ? createFileAssetsProcedures(type) : {}),
    ...(checkHasCapability(type, "publishable") ? createPublishProcedures(type, options) : {}),
  };
  /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a conditional over the generic TType, which no
     concrete object is assignable to (TS2322); each group is gated on checkHasCapability above */
  return procedures as ResourceProcedures<TType>;
};

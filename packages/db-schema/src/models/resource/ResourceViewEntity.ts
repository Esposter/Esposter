import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "#src/models/azure/table/AzureEntity";
import { selectResourceSchema } from "#src/schema/resources";
import { z } from "zod";
// `partitionKey` is the resource id and `rowKey` the UTC date bucket — daily buckets keep entities small
// And make a partition range scan ("views this week") possible without a reshape
export class ResourceViewEntity extends AzureEntity {
  count = 0;

  constructor(init?: Partial<ResourceViewEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const resourceViewEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: selectResourceSchema.shape.id,
      rowKey: z.iso.date(),
    }),
  ).shape,
  count: z.int().nonnegative(),
}) satisfies z.ZodType<ToData<ResourceViewEntity>>;

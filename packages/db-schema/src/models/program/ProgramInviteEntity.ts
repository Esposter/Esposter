import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { selectResourceSchema } from "@/schema/resources";
import { z } from "zod";

// PartitionKey = program id, rowKey = the opaque invite token
export class ProgramInviteEntity extends AzureEntity {
  // The audience key column's value for this recipient — never leaves the server or the owner client
  keyValue = "";

  constructor(init?: Partial<ProgramInviteEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const programInviteEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: selectResourceSchema.shape.id,
      rowKey: z.uuid(),
    }),
  ).shape,
  keyValue: z.string().min(1),
}) satisfies z.ZodType<ToData<ProgramInviteEntity>>;

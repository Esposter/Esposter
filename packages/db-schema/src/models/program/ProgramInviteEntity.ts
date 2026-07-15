import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { selectResourceSchema } from "@/schema/resources";
import { z } from "zod";

// PartitionKey = program id, rowKey = the opaque invite token
export class ProgramInviteEntity extends AzureEntity {
  // The audience key column's value for this recipient — never leaves the server or the owner client
  keyValue = "";
  // A non-secret stand-in for the recipient, safe to publish. The rowKey token is the bearer credential
  // Survey writes accept, so it can never be the identity a publishable dataset carries — a published
  // Funnel chart would otherwise hand every viewer the ability to respond as any invitee
  publicId = "";

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
  publicId: z.uuid(),
}) satisfies z.ZodType<ToData<ProgramInviteEntity>>;

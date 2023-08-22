import { AzureEntity, CompositeKeyEntity } from "@/models/azure";
import { roomSchema } from "@/models/esbabbler/room";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

export class InviteCodeEntity extends AzureEntity {
  roomId!: string;

  constructor(init: Partial<InviteCodeEntity> & CompositeKeyEntity) {
    super();
    Object.assign(this, init);
  }
}

export const inviteCodeSchema = itemMetadataSchema.merge(
  z.object({
    partitionKey: z.string(),
    rowKey: z.string(),
    roomId: roomSchema.shape.id,
  }),
) satisfies z.ZodType<InviteCodeEntity>;

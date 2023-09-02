import { selectRoomSchema } from "@/db/schema/rooms";
import { AzureEntity, CompositeKeyEntity } from "@/models/azure";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

export class InviteEntity extends AzureEntity {
  roomId!: string;

  constructor(init: Partial<InviteEntity> & CompositeKeyEntity) {
    super();
    Object.assign(this, init);
  }
}

export const inviteCodeSchema = itemMetadataSchema.merge(
  z.object({
    partitionKey: z.string(),
    rowKey: z.string(),
    roomId: selectRoomSchema.shape.id,
  }),
) satisfies z.ZodType<InviteEntity>;

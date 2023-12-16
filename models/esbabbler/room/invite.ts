import { selectRoomSchema } from "@/db/schema/rooms";
import { AzureEntity, type CompositeKeyEntity } from "@/models/azure";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { getProperties } from "@/services/shared/getProperties";
import { z } from "zod";

export class InviteEntity extends AzureEntity {
  roomId!: string;

  constructor(init: Partial<InviteEntity> & CompositeKeyEntity) {
    super();
    Object.assign(this, init);
  }
}

export const InviteEntityProperties = getProperties<InviteEntity>();

export const inviteCodeSchema = z
  .object({
    partitionKey: z.string(),
    rowKey: z.string(),
    roomId: selectRoomSchema.shape.id,
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<InviteEntity>;

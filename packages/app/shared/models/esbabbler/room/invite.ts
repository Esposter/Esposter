import type { CompositeKeyEntity } from "@/shared/models/azure/CompositeKeyEntity";

import { selectRoomSchema } from "@/shared/db/schema/rooms";
import { AzureEntity } from "@/shared/models/azure/AzureEntity";
import { itemMetadataSchema } from "@/shared/models/entity/ItemMetadata";
import { getPropertyNames } from "@/shared/util/getPropertyNames";
import { z } from "zod";

export class InviteEntity extends AzureEntity {
  roomId!: string;

  constructor(init: CompositeKeyEntity & Partial<InviteEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const InviteEntityPropertyNames = getPropertyNames<InviteEntity>();

export const inviteCodeSchema = z
  .object({
    partitionKey: z.string(),
    roomId: selectRoomSchema.shape.id,
    rowKey: z.string(),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<InviteEntity>;

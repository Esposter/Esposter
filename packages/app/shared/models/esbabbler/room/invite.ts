import type { CompositeKeyEntity } from "@/shared/models/azure/CompositeKeyEntity";

import { selectRoomSchema } from "@/server/db/schema/rooms";
import { AzureEntity } from "@/shared/models/azure/AzureEntity";
import { itemMetadataSchema } from "@/shared/models/itemMetadata";
import { getPropertyNames } from "@/shared/utils/getPropertyNames";
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
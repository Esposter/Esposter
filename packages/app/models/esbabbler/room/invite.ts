import type { CompositeKeyEntity } from "@/models/azure";

import { selectRoomSchema } from "@/db/schema/rooms";
import { AzureEntity } from "@/models/azure";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { getPropertyNames } from "@/services/shared/getPropertyNames";
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

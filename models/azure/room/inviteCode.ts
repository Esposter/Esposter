import { CompositeKeyEntity } from "@/models/azure";
import { roomSchema } from "@/models/azure/room";
import type { toZod } from "tozod";
import { z } from "zod";

export class InviteCodeEntity extends CompositeKeyEntity {
  roomId!: string;

  createdAt!: Date;
}

export const inviteCodeSchema: toZod<InviteCodeEntity> = z.object({
  partitionKey: z.string(),
  rowKey: z.string(),
  roomId: roomSchema.shape.id,
  createdAt: z.date(),
});

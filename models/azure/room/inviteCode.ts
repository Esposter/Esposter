import { CompositeKeyEntity } from "@/models/azure";
import { roomSchema } from "@/models/azure/room";
import { userSchema } from "@/server/trpc/routers/user";
import type { toZod } from "tozod";
import { z } from "zod";

export class InviteCodeEntity extends CompositeKeyEntity {
  creatorId!: string;

  roomId!: string;

  createdAt!: Date;

  expiredAt!: Date;
}

export const inviteCodeSchema: toZod<InviteCodeEntity> = z.object({
  partitionKey: z.string(),
  rowKey: z.string(),
  creatorId: userSchema.shape.id,
  roomId: roomSchema.shape.id,
  createdAt: z.date(),
  expiredAt: z.date(),
});

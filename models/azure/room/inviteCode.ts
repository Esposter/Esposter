import { CompositeKeyEntity } from "@/models/azure";
import { roomSchema } from "@/models/azure/room";
import { z } from "zod";

export class InviteCodeEntity extends CompositeKeyEntity {
  roomId!: string;

  createdAt!: Date;
}

export const inviteCodeSchema = z.object({
  partitionKey: z.string(),
  rowKey: z.string(),
  roomId: roomSchema.shape.id,
  createdAt: z.date(),
}) satisfies z.ZodType<InviteCodeEntity>;

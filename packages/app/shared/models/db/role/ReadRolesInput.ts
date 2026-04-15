import { selectRoomSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readRolesInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type ReadRolesInput = z.infer<typeof readRolesInputSchema>;

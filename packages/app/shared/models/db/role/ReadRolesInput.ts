import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readRolesInputSchema = roomIdSchema;
export type ReadRolesInput = z.infer<typeof readRolesInputSchema>;

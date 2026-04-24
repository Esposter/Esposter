import { roomIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readRolesInputSchema = roomIdsSchema;
export type ReadRolesInput = z.infer<typeof readRolesInputSchema>;

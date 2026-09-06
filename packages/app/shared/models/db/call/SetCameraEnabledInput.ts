import { callSessionIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const setCameraEnabledInputSchema = z.object({ ...callSessionIdSchema.shape, isCameraEnabled: z.boolean() });
export type SetCameraEnabledInput = z.infer<typeof setCameraEnabledInputSchema>;

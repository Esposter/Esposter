import { selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const saveStagedResourceContentInputSchema = z.object({
  contentVersion: selectResourceSchema.shape.contentVersion,
  // The hex SHA-256 of the exact bytes uploaded, so a commit can tell its own upload from another device's
  hash: z.hash("sha256"),
  id: selectResourceSchema.shape.id,
});
export type SaveStagedResourceContentInput = z.infer<typeof saveStagedResourceContentInputSchema>;

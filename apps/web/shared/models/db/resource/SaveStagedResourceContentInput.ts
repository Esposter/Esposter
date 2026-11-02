import { ASSET_HASH_REGEX } from "#shared/services/resource/constants";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const saveStagedResourceContentInputSchema = z.object({
  contentVersion: selectResourceInResourceSchema.shape.contentVersion,
  // The lowercase hex SHA-256 of the exact bytes uploaded, so a commit can tell its own upload from another device's
  hash: z.string().regex(ASSET_HASH_REGEX),
  id: selectResourceInResourceSchema.shape.id,
});
export type SaveStagedResourceContentInput = z.infer<typeof saveStagedResourceContentInputSchema>;

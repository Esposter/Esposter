import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { ToData } from "@esposter/shared";

// Rebuilding a content class from a shape that carries none of its metadata — GrapesJS project data, which
// Holds only its own keys — re-runs the field initializers, minting a fresh id and timestamps on every save.
// Carrying the loaded entity's metadata across keeps both the persisted identity and the dirty check stable
export const getItemMetadata = ({ createdAt, deletedAt, id, updatedAt }: AItemEntity): ToData<AItemEntity> => ({
  createdAt,
  deletedAt,
  id,
  updatedAt,
});

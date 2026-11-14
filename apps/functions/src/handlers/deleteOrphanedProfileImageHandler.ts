import { getContainerClient } from "#src/services/azure/getContainerClient";
import { db } from "#src/services/shared/db";
import { deleteBlobs } from "@esposter/db";
import { StorageBucket, getUserProfileImageBlobName, r2ObjectCreatedQueueMessageSchema } from "@esposter/db-schema";

// A profile image's write SAS outlives the request that minted it, so its blob can land after the account has been
// Swept. Nothing lists it at that point, so the landing deletes itself. A landing for an account still in use is kept.
// The message is R2's object-create notification for the public user assets bucket, so the key is the blob's name
export const deleteOrphanedProfileImageHandler = async (body: unknown): Promise<void> => {
  const { bucket, object } = r2ObjectCreatedQueueMessageSchema.parse(body);
  if (bucket !== StorageBucket.PublicUserAssets) return;

  const blobName = object.key;
  // A room's image is named under its room, so only a profile image's first segment names an owner
  const [userId] = blobName.split("/");
  if (!userId || blobName !== getUserProfileImageBlobName(userId)) return;

  const user = await db.query.usersInAuth.findFirst({
    columns: { deletionRequestedAt: true },
    where: { id: { eq: userId } },
  });
  if (user && !user.deletionRequestedAt) return;

  const containerClient = await getContainerClient(StorageBucket.PublicUserAssets);
  await deleteBlobs(containerClient, [blobName]);
};

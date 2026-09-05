import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";
import type { Database } from "@esposter/db-schema";

// Whether a caller may read one asset path — the single definition of the question, asked by the serving endpoint
// Before it signs a SAS and by the clone before it copies a blob. The clone copies whatever url the caller's
// Content names, so a check living only on the read path would let anyone holding a url they cannot open paste it
// Into their own resource, publish, and have the clone re-serve the owner's private blob from a directory that
// Answers to the whole internet. A url the caller may not read is data rather than an error: the clone carries it
// Verbatim, so a shared blueprint keeps rendering for whoever can already see its assets
export const checkIsResourceAssetReadable = async (
  db: Database,
  { isPublished, resourceId }: Pick<ResourceAssetPath, "isPublished" | "resourceId">,
  userId?: string,
): Promise<boolean> => {
  // Published assets stay anonymous-capable for as long as a publication row exists — unpublish is what revokes
  // Them, so the row is read per request and never cached
  if (isPublished) {
    const publication = await db.query.resourcePublications.findFirst({ where: { resourceId: { eq: resourceId } } });
    if (publication) return true;
  }

  if (!userId) return false;

  const resource = await db.query.resources.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: resourceId }, userId: { eq: userId } },
  });
  return Boolean(resource);
};

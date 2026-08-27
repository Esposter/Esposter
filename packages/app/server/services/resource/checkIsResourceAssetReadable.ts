import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";
import type { Database } from "@esposter/db-schema";

// Whether a caller may read one asset path — the single definition of the question, asked by the serving endpoint
// Before it signs a SAS and by the clone before it copies a blob. Both must ask it: the clone copies whatever url
// The caller's content names, so a check that lived only on the read path would let anyone holding a url they
// Cannot open (a personalized export mails absolute ones out) paste it into their own resource, publish, and have
// The clone re-serve the owner's private blob from a directory that answers to the whole internet.
// A url the caller may not read is data, not an error — the clone carries it verbatim, exactly like a dangling or
// Unparseable one, so a shared blueprint keeps rendering for whoever can already see its assets
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

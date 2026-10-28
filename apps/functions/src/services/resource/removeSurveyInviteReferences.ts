import type { InvocationContext } from "@azure/functions";
import type { ContainerClient } from "@azure/storage-blob";
import type { ResourceInResource } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { broadcastStorageUsage } from "#src/services/storage/broadcastStorageUsage";
import { chargeStorageLedgerEntry, getContentBlobName, readJsonBlob, writeJsonBlob } from "@esposter/db";
import {
  AzureContainer,
  resourceLinksInResource,
  ResourceLinkType,
  resourcesInResource,
  ResourceType,
} from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, noop, Operation, settleAll, takeOne } from "@esposter/shared";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { createHash } from "node:crypto";

// The survey invite's type tag in a webpage and in an email, as apps/web names them (WebpageNodeType.SurveyInvite and
// EmailNodeType.SurveyInvite). The functions app cannot import the web's enums, so the tags are repeated here and only
// Ever matched against stored content
const SURVEY_INVITE_NODE_TYPES = new Set(["survey-invite", "SurveyInvite"]);
// How many resources are rewritten at once, each held only until its own write and charge are done
const RESOURCE_REWRITE_CONCURRENCY = 4;

type StoredNode = Record<string, unknown>;

const checkIsRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isDeletedSurveyInvite = (node: StoredNode, deletedSurveyIds: Set<string>) =>
  typeof node.type === "string" &&
  SURVEY_INVITE_NODE_TYPES.has(node.type) &&
  checkIsRecord(node.props) &&
  typeof node.props.surveyId === "string" &&
  deletedSurveyIds.has(node.props.surveyId);

// The nodes with every survey invite naming a deleted survey removed, at any depth. A container holds its children under
// `props.children`, on a webpage and in an email alike, so one walk serves both trees
const removeSurveyInvites = (nodes: unknown[], deletedSurveyIds: Set<string>): unknown[] =>
  nodes.flatMap((node) => {
    if (!checkIsRecord(node)) return [node];
    if (isDeletedSurveyInvite(node, deletedSurveyIds)) return [];

    const { props } = node;
    if (!checkIsRecord(props) || !Array.isArray(props.children)) return [node];

    return [{ ...node, props: { ...props, children: removeSurveyInvites(props.children, deletedSurveyIds) } }];
  });

// Rewrites one resource's working copy without the invites to the surveys it names as deleted, then drops those survey links.
// The rewrite moves the version the way a save does, so a client editing the old copy is told it is stale.
// A write that fails leaves the link in place, which is what the next run finds the resource by
const removeSurveyInviteReferencesFromResource = async (
  context: InvocationContext,
  containerClient: ContainerClient,
  { contentVersion, id, userId }: Pick<ResourceInResource, "contentVersion" | "id" | "userId">,
  deletedSurveyIds: Set<string>,
): Promise<void> => {
  const contentBlobName = getContentBlobName(id);
  const serializedContent = (await readJsonBlob(containerClient, contentBlobName))?.toString();
  // oxlint-disable-next-line no-restricted-properties -- the stored content as written: the rewrite compares its re-serialised copy with the stored text, so a revived ISO string would look changed
  const document: unknown = serializedContent === undefined ? undefined : JSON.parse(serializedContent);
  if (checkIsRecord(document) && Array.isArray(document.content)) {
    const serializedNextContent = JSON.stringify({
      ...document,
      content: removeSurveyInvites(document.content, deletedSurveyIds),
    });
    if (serializedNextContent !== serializedContent) {
      const storedContentSize = await db.transaction(async (transaction) => {
        const [updatedResource] = await transaction
          .update(resourcesInResource)
          .set({
            contentHash: createHash("sha256").update(serializedNextContent).digest("hex"),
            contentSize: Buffer.byteLength(serializedNextContent),
            contentVersion: contentVersion + 1,
          })
          .where(and(eq(resourcesInResource.id, id), eq(resourcesInResource.contentVersion, contentVersion)))
          .returning({ id: resourcesInResource.id });
        // A save that landed since the read holds content this rewrite would overwrite, so the rewrite is refused and its link kept
        if (!updatedResource)
          throw new InvalidOperationError(Operation.Update, id, "moved on before its invites were removed");

        return (await writeJsonBlob(containerClient, contentBlobName, serializedNextContent)).size;
      });
      // The owner is charged for the copy that is stored now, as a save charges its own write
      await chargeStorageLedgerEntry(db, userId, AzureContainer.ResourceAssets, contentBlobName, storedContentSize);
      await broadcastStorageUsage(context, [userId]);
    }
  }

  await db
    .delete(resourceLinksInResource)
    .where(
      and(
        eq(resourceLinksInResource.sourceId, id),
        eq(resourceLinksInResource.type, ResourceLinkType.Survey),
        inArray(resourceLinksInResource.targetId, [...deletedSurveyIds]),
      ),
    );
};

// Removes every survey invite that names a survey no longer present, from the webpages and emails holding it.
// The survey links the index keeps for them name the survey, so a link to a survey with no row is the invite left behind:
// A purged survey's links stay until its holders are rewritten, which is what makes a rerun find whatever a failed run left
export const removeSurveyInviteReferences = async (
  context: InvocationContext,
  containerClient: ContainerClient,
): Promise<void> => {
  const danglingSurveyLinks = await db
    .select({
      contentVersion: resourcesInResource.contentVersion,
      sourceId: resourceLinksInResource.sourceId,
      targetId: resourceLinksInResource.targetId,
      userId: resourcesInResource.userId,
    })
    .from(resourceLinksInResource)
    .innerJoin(resourcesInResource, eq(resourcesInResource.id, resourceLinksInResource.sourceId))
    .where(
      and(
        eq(resourceLinksInResource.type, ResourceLinkType.Survey),
        inArray(resourcesInResource.type, [ResourceType.Email, ResourceType.Webpage]),
        notInArray(
          resourceLinksInResource.targetId,
          db
            .select({ id: resourcesInResource.id })
            .from(resourcesInResource)
            .where(eq(resourcesInResource.type, ResourceType.Survey)),
        ),
      ),
    );

  const sourceLinkEntries = [...Map.groupBy(danglingSurveyLinks, (danglingSurveyLink) => danglingSurveyLink.sourceId)];
  await settleAll(
    sourceLinkEntries.map(([sourceId, sourceLinks]) => async () => {
      const { contentVersion, userId } = takeOne(sourceLinks);
      await getResultAsync(() =>
        removeSurveyInviteReferencesFromResource(
          context,
          containerClient,
          { contentVersion, id: sourceId, userId },
          new Set(sourceLinks.map(({ targetId }) => targetId)),
        ),
      ).match(noop, (error) => {
        context.error(`Failed to remove survey invites from resource ${sourceId}: `, error);
      });
    }),
    RESOURCE_REWRITE_CONCURRENCY,
  );
};

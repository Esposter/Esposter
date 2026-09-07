ALTER TABLE "posts" ADD COLUMN "ancestorIds" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
-- Existing rows predate the column, so their chains are derived once from the parentId links that already
-- Describe them. Written recursively rather than for the one level the UI could produce, because the data is
-- What it is rather than what the UI allowed
WITH RECURSIVE "chain" AS (
	SELECT "id", ARRAY[]::uuid[] AS "ancestorIds" FROM "posts" WHERE "parentId" IS NULL
	UNION ALL
	SELECT "posts"."id", "chain"."ancestorIds" || "chain"."id"
	FROM "posts" INNER JOIN "chain" ON "posts"."parentId" = "chain"."id"
)
UPDATE "posts" SET "ancestorIds" = "chain"."ancestorIds" FROM "chain" WHERE "posts"."id" = "chain"."id" AND "posts"."parentId" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "posts_parentId_ranking_index" ON "posts" ("parentId","ranking" DESC,"id" DESC);--> statement-breakpoint
CREATE INDEX "posts_ancestorIds_index" ON "posts" USING gin ("ancestorIds");

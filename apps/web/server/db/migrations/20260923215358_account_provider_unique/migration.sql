-- A provider's account linked twice keeps only its most recently updated row, so the unique below can be added
DELETE FROM "accounts" AS "duplicate" USING "accounts" AS "kept"
WHERE "duplicate"."providerId" = "kept"."providerId"
  AND "duplicate"."accountId" = "kept"."accountId"
  AND ("duplicate"."updatedAt", "duplicate"."id") < ("kept"."updatedAt", "kept"."id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_providerId_accountId_unique" UNIQUE("providerId","accountId");

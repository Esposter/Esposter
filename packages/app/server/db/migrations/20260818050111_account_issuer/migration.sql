-- The column is added nullable and filled before it is constrained: an account predating it is not an OIDC
-- Account, and better-auth namespaces those as `local:{providerId}`, which is exactly what its issuer is
ALTER TABLE "accounts" ADD COLUMN "issuer" text;--> statement-breakpoint
UPDATE "accounts" SET "issuer" = 'local:' || "providerId" WHERE "issuer" IS NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_issuer_accountId_unique" UNIQUE("issuer","accountId");

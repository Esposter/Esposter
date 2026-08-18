ALTER TABLE "accounts" ADD COLUMN "issuer" text NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_issuer_accountId_unique" UNIQUE("issuer","accountId");
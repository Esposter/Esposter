ALTER TABLE "message"."invites" ADD COLUMN "expiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "message"."invites" ADD COLUMN "maxUses" integer;--> statement-breakpoint
ALTER TABLE "message"."invites" ADD COLUMN "uses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."invites" ADD CONSTRAINT "invites_max_uses_check" CHECK ("maxUses" IS NULL OR "maxUses" > 0);--> statement-breakpoint
ALTER TABLE "message"."invites" ADD CONSTRAINT "invites_uses_check" CHECK ("uses" >= 0);
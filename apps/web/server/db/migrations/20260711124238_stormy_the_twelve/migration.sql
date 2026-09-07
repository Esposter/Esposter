ALTER TABLE "message"."invites" ALTER COLUMN "maxUses" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "message"."invites" ALTER COLUMN "maxUses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."invites" ADD CONSTRAINT "invites_uses_max_uses_check" CHECK ("maxUses" = 0 OR "uses" <= "maxUses");--> statement-breakpoint
ALTER TABLE "message"."invites" DROP CONSTRAINT "invites_max_uses_check", ADD CONSTRAINT "invites_max_uses_check" CHECK ("maxUses" >= 0);
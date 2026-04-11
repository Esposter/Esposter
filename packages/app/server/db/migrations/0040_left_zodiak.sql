CREATE TABLE "message"."room_categories" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "name" CHECK (LENGTH("message"."room_categories"."name") <= 100),
	CONSTRAINT "position" CHECK ("message"."room_categories"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "message"."user_statuses" DROP CONSTRAINT "message";--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD COLUMN "categoryId" uuid;--> statement-breakpoint
ALTER TABLE "message"."room_categories" ADD CONSTRAINT "room_categories_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD CONSTRAINT "rooms_categoryId_room_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "message"."room_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."user_statuses" ADD CONSTRAINT "message" CHECK (LENGTH("message"."user_statuses"."message") <= 64);
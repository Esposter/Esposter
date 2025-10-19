CREATE TABLE "message"."push_subscriptions" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"auth" text NOT NULL,
	"endpoint" text NOT NULL,
	"expiration_time" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"p256dh" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_user_id_unique" UNIQUE("endpoint","user_id")
);
--> statement-breakpoint
ALTER TABLE "message"."push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
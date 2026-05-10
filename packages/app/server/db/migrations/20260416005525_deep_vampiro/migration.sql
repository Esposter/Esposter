CREATE TABLE "message"."room_roles" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"color" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"isEveryone" boolean DEFAULT false NOT NULL,
	"name" text NOT NULL,
	"permissions" bigint DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"roomId" uuid NOT NULL,
	CONSTRAINT "name" CHECK (LENGTH("message"."room_roles"."name") <= 100),
	CONSTRAINT "position" CHECK ("message"."room_roles"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "message"."users_to_room_roles" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"userId" text NOT NULL,
	"roomId" uuid NOT NULL,
	"roleId" uuid NOT NULL,
	CONSTRAINT "users_to_room_roles_userId_roomId_roleId_pk" PRIMARY KEY("userId","roomId","roleId")
);
--> statement-breakpoint
ALTER TABLE "message"."room_roles" ADD CONSTRAINT "room_roles_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."users_to_room_roles" ADD CONSTRAINT "users_to_room_roles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."users_to_room_roles" ADD CONSTRAINT "users_to_room_roles_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."users_to_room_roles" ADD CONSTRAINT "users_to_room_roles_roleId_room_roles_id_fk" FOREIGN KEY ("roleId") REFERENCES "message"."room_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "room_roles_room_id_position_idx" ON "message"."room_roles" USING btree ("roomId","position");--> statement-breakpoint
CREATE UNIQUE INDEX "room_roles_everyone_unique" ON "message"."room_roles" USING btree ("roomId") WHERE "message"."room_roles"."isEveryone" = TRUE;
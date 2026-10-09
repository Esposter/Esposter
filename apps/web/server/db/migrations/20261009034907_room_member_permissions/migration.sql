ALTER TYPE "storage"."azureContainer" ADD VALUE 'genshin-assets' BEFORE 'message-assets';--> statement-breakpoint
CREATE TABLE "message"."roomMemberPermissions" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"allow" bigint DEFAULT 0 NOT NULL,
	"deny" bigint DEFAULT 0 NOT NULL,
	"roomId" uuid,
	"userId" text,
	CONSTRAINT "roomMemberPermissions_pkey" PRIMARY KEY("userId","roomId"),
	CONSTRAINT "roomMemberPermissions_allow_deny_disjoint_check" CHECK (("allow" & "deny") = 0)
);
--> statement-breakpoint
ALTER TABLE "message"."roomMemberPermissions" ADD CONSTRAINT "roomMemberPermissions_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."roomMemberPermissions" ADD CONSTRAINT "roomMemberPermissions_Hy6rifSoGfrB_fkey" FOREIGN KEY ("userId","roomId") REFERENCES "message"."usersToRooms"("userId","roomId") ON DELETE CASCADE;
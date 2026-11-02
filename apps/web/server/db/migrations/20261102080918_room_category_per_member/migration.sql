ALTER TABLE "message"."rooms" DROP CONSTRAINT "rooms_categoryId_room_categories_id_fk";--> statement-breakpoint
ALTER TABLE "message"."usersToRooms" ADD COLUMN "categoryId" uuid;--> statement-breakpoint
UPDATE "message"."usersToRooms" AS u SET "categoryId" = r."categoryId" FROM "message"."rooms" AS r, "message"."roomCategories" AS c WHERE r."categoryId" IS NOT NULL AND c."id" = r."categoryId" AND u."roomId" = r."id" AND u."userId" = c."userId";--> statement-breakpoint
ALTER TABLE "message"."rooms" DROP COLUMN "categoryId";--> statement-breakpoint
CREATE INDEX "usersToRooms_categoryId_index" ON "message"."usersToRooms" ("categoryId") WHERE "categoryId" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."usersToRooms" ADD CONSTRAINT "usersToRooms_categoryId_roomCategories_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "message"."roomCategories"("id") ON DELETE SET NULL;
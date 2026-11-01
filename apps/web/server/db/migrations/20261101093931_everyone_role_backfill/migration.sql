-- Gives each server room that predates its `@everyone` row the row `createRoom` seeds: ReadMessages | SendMessages |
-- MentionEveryone | ManageInvites (1 + 2 + 8 + 64). SQL cannot import DEFAULT_EVERYONE_PERMISSIONS
-- (packages/db-schema/src/services/room/constants.ts), so the value is restated here: change both together.
-- A direct message has no roles by design, so it is left without one.
INSERT INTO "message"."roomRoles" ("color", "createdAt", "id", "isEveryone", "name", "permissions", "position", "roomId", "updatedAt")
SELECT '', now(), gen_random_uuid(), true, '@everyone', 75, 0, "rooms"."id", now()
FROM "message"."rooms"
WHERE "rooms"."type" = 'Room'
  AND NOT EXISTS (
    SELECT 1 FROM "message"."roomRoles"
    WHERE "roomRoles"."roomId" = "rooms"."id" AND "roomRoles"."isEveryone" = true
  );

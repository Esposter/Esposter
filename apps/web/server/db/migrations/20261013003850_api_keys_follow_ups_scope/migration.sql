-- A key made before scopes was made for the follow-ups, the only tools there were, so it holds that scope and nothing else
UPDATE "auth"."apiKeys" SET "permissions" = '{"mcp":["FollowUps"]}' WHERE "permissions" IS NULL;

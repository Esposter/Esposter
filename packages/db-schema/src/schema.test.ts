import { schema } from "#src/generated/schema";
import { capitalize } from "@esposter/shared";
import { getTableConfig, SQLiteDialect } from "drizzle-orm/sqlite-core";
import { describe, expect, test } from "vitest";

describe("schema", () => {
  // Every table lives in the product area that owns it, never unprefixed, and its export is derived from its DDL name
  // rather than chosen: `auth_users` is exported as `usersInAuth`, so it can never collide with a local, a row type or
  // a library name and always says where the table lives. Nothing normalises a DDL name, so a snake_case one would
  // otherwise go unnoticed
  test("every table lives in a named schema and exports its name with its suffix", () => {
    expect.hasAssertions();

    const mismatched = Object.entries(schema)
      .map(([exportName, table]) => {
        const { name } = getTableConfig(table);
        // The DDL name is `<schema>_<table>`, so the schema is everything before the first underscore
        const separatorIndex = name.indexOf("_");
        const expected =
          separatorIndex === -1
            ? `${name} in no schema`
            : `${name.slice(separatorIndex + 1)}In${capitalize(name.slice(0, separatorIndex))}`;
        return [exportName, expected] as const;
      })
      .filter(([exportName, expected]) => exportName !== expected)
      .map(([exportName, expected]) => `${exportName} should be ${expected}`);

    expect(mismatched).toStrictEqual([]);
  });

  // Drizzle-kit hashes the SQL a CHECK renders to, and a migration is already applied against that exact
  // String — so a constraint rewritten to read better forks the migration chain rather than being a no-op.
  // Rendering every check here is what lets an idiom move into a helper without running `db:gen`: identical
  // Output is identical DDL. A deliberate constraint change updates this snapshot and generates a migration.
  test("check constraint sql", () => {
    expect.hasAssertions();

    const dialect = new SQLiteDialect();
    const renderedChecks = Object.values(schema)
      .flatMap((table) =>
        getTableConfig(table).checks.map((check) => `${check.name}: ${dialect.sqlToQuery(check.value).sql}`),
      )
      .join("\n");

    expect(renderedChecks).toMatchInlineSnapshot(`
      "appUsers_name_length_check: LENGTH(TRIM("message_appUsers"."name")) BETWEEN 1 AND 100
      blocks_blockerId_blockedId_check: "social_blocks"."blockerId" != "social_blocks"."blockedId"
      bookmarks_path_length_check: LENGTH("app_bookmarks"."path") <= 2048
      bookmarks_title_length_check: LENGTH("app_bookmarks"."title") <= 100
      callSessions_id_length_check: LENGTH("message_callSessions"."id") = 12
      friendRequests_senderId_receiverId_check: "social_friendRequests"."senderId" != "social_friendRequests"."receiverId"
      friends_senderId_receiverId_check: "social_friends"."senderId" != "social_friends"."receiverId"
      invites_id_length_check: LENGTH("message_invites"."id") = 8
      invites_maxUses_check: "message_invites"."maxUses" >= 0
      invites_uses_check: "message_invites"."uses" >= 0
      invites_uses_maxUses_check: "message_invites"."maxUses" = 0 OR "message_invites"."uses" <= "message_invites"."maxUses"
      likes_value_check: "post_likes"."value" = 1 OR "post_likes"."value" = -1
      posts_title_length_check: LENGTH("post_posts"."title") <= 300
      posts_description_length_check: LENGTH("post_posts"."description") <= 1000
      posts_commentCount_check: "post_posts"."commentCount" >= 0
      resources_name_length_check: LENGTH(TRIM("resource_resources"."name")) BETWEEN 1 AND 100
      resourceVersionAssets_assetHash_check: LENGTH("resource_resourceVersionAssets"."assetHash") = 64 AND "resource_resourceVersionAssets"."assetHash" NOT GLOB '*[^0-9a-f]*'
      resourceVersions_plaintextBytes_check: "resource_resourceVersions"."plaintextBytes" >= 0
      resourceVersions_storedBytes_check: "resource_resourceVersions"."storedBytes" >= 0
      resourceWorkingAssets_assetHash_check: LENGTH("resource_resourceWorkingAssets"."assetHash") = 64 AND "resource_resourceWorkingAssets"."assetHash" NOT GLOB '*[^0-9a-f]*'
      roomCategories_name_length_check: LENGTH(TRIM("message_roomCategories"."name")) BETWEEN 1 AND 100
      roomCategories_position_check: "message_roomCategories"."position" >= 0
      roomEmojis_name_length_check: LENGTH(TRIM("message_roomEmojis"."name")) BETWEEN 1 AND 32
      roomEmojis_name_charset_check: "message_roomEmojis"."name" <> '' AND "message_roomEmojis"."name" NOT GLOB '*[^a-z0-9_]*'
      roomFilters_words_size_check: json_array_length("message_roomFilters"."words") <= 1000
      roomFilters_action_timeoutDurationMs_check: ("message_roomFilters"."action" = 'Timeout' AND "message_roomFilters"."timeoutDurationMs" IS NOT NULL AND "message_roomFilters"."timeoutDurationMs" > 0) OR ("message_roomFilters"."action" <> 'Timeout' AND "message_roomFilters"."timeoutDurationMs" IS NULL)
      roomRoles_color_length_check: LENGTH("message_roomRoles"."color") <= 9
      roomRoles_name_length_check: LENGTH(TRIM("message_roomRoles"."name")) BETWEEN 1 AND 100
      roomRoles_position_check: "message_roomRoles"."position" >= 0
      rooms_name_check: ("message_rooms"."type" = 'DirectMessage' AND LENGTH(TRIM("message_rooms"."name")) = 0) OR ("message_rooms"."type" = 'Room' AND LENGTH(TRIM("message_rooms"."name")) BETWEEN 1 AND 100)
      rooms_type_participantKey_check: ("message_rooms"."type" = 'DirectMessage' AND "message_rooms"."participantKey" IS NOT NULL) OR ("message_rooms"."type" = 'Room' AND "message_rooms"."participantKey" IS NULL)
      rooms_maxFileSizeBytes_check: "message_rooms"."maxFileSizeBytes" >= 0
      rooms_slowmodeMs_check: "message_rooms"."slowmodeMs" >= 0
      rooms_topic_length_check: LENGTH("message_rooms"."topic") <= 500
      scheduledMessageJobs_payload_type_check: 
                (json_extract("message_scheduledMessageJobs"."payload", '$.type') = 'Reminder' AND json_type("message_scheduledMessageJobs"."payload", '$.text') IS NOT NULL)
                OR (json_extract("message_scheduledMessageJobs"."payload", '$.type') = 'ScheduledMessage' AND json_type("message_scheduledMessageJobs"."payload", '$.message') IS NOT NULL)
              
      searchHistories_query_length_check: LENGTH("message_searchHistories"."query") <= 10000
      storageLedger_declaredBytes_check: "storage_storageLedger"."declaredBytes" >= 0
      storageLedger_countedBytes_check: "storage_storageLedger"."countedBytes" >= 0
      userAchievements_amount_check: "achievement_userAchievements"."amount" >= 1
      userSettings_inputSensitivityDecibels_check: "message_userSettings"."inputSensitivityDecibels" BETWEEN -100 AND 0
      userSettings_microphoneVolumePercentage_check: "message_userSettings"."microphoneVolumePercentage" BETWEEN 0 AND 200
      userSettings_speakerVolumePercentage_check: "message_userSettings"."speakerVolumePercentage" BETWEEN 0 AND 200
      userSettings_autoIdleThresholdMs_check: "message_userSettings"."autoIdleThresholdMs" BETWEEN 60000 AND 86400000
      userSettings_pushToTalkKeybind_length_check: LENGTH("message_userSettings"."pushToTalkKeybind") <= 64
      userSettings_pushToTalkReleaseDelayMs_check: "message_userSettings"."pushToTalkReleaseDelayMs" BETWEEN 0 AND 2000
      users_biography_length_check: LENGTH("auth_users"."biography") <= 160
      users_name_length_check: LENGTH(TRIM("auth_users"."name")) BETWEEN 1 AND 100
      userStatuses_message_length_check: LENGTH("message_userStatuses"."message") <= 64
      usersToRooms_displayName_length_check: LENGTH("message_usersToRooms"."displayName") <= 32
      usersToRooms_mentionCount_check: "message_usersToRooms"."mentionCount" >= 0
      webhooks_name_length_check: LENGTH(TRIM("message_webhooks"."name")) BETWEEN 1 AND 100"
    `);
  });
});

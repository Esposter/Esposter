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
      "appUsers_name_length_check: LENGTH(TRIM("message"."appUsers"."name")) BETWEEN 1 AND 100
      blocks_blockerId_blockedId_check: "social_blocks"."blockerId" != "social_blocks"."blockedId"
      bookmarks_path_length_check: LENGTH("app_bookmarks"."path") <= 2048
      bookmarks_title_length_check: LENGTH("app_bookmarks"."title") <= 100
      callSessions_id_length_check: LENGTH("message"."callSessions"."id") = 12
      friendRequests_senderId_receiverId_check: "social_friendRequests"."senderId" != "social_friendRequests"."receiverId"
      friends_senderId_receiverId_check: "social_friends"."senderId" != "social_friends"."receiverId"
      invites_id_length_check: LENGTH("message"."invites"."id") = 8
      invites_maxUses_check: "message"."invites"."maxUses" >= 0
      invites_uses_check: "message"."invites"."uses" >= 0
      invites_uses_maxUses_check: "message"."invites"."maxUses" = 0 OR "message"."invites"."uses" <= "message"."invites"."maxUses"
      likes_value_check: "post"."likes"."value" = 1 OR "post"."likes"."value" = -1
      posts_title_length_check: LENGTH("post"."posts"."title") <= 300
      posts_description_length_check: LENGTH("post"."posts"."description") <= 1000
      posts_commentCount_check: "post"."posts"."commentCount" >= 0
      resources_name_length_check: LENGTH(TRIM("resource"."resources"."name")) BETWEEN 1 AND 100
      resourceVersionAssets_assetHash_check: "resource"."resourceVersionAssets"."assetHash" ~ '^[0-9a-f]{64}$'
      resourceVersions_plaintextBytes_check: "resource"."resourceVersions"."plaintextBytes" >= 0
      resourceVersions_storedBytes_check: "resource"."resourceVersions"."storedBytes" >= 0
      resourceWorkingAssets_assetHash_check: "resource"."resourceWorkingAssets"."assetHash" ~ '^[0-9a-f]{64}$'
      roomCategories_name_length_check: LENGTH(TRIM("message"."roomCategories"."name")) BETWEEN 1 AND 100
      roomCategories_position_check: "message"."roomCategories"."position" >= 0
      roomEmojis_name_length_check: LENGTH(TRIM("message"."roomEmojis"."name")) BETWEEN 1 AND 32
      roomEmojis_name_charset_check: "message"."roomEmojis"."name" ~ '^[a-z0-9_]+$'
      roomFilters_words_size_check: cardinality("message"."roomFilters"."words") <= 1000
      roomFilters_action_timeoutDurationMs_check: ("message"."roomFilters"."action" = 'Timeout' AND "message"."roomFilters"."timeoutDurationMs" IS NOT NULL AND "message"."roomFilters"."timeoutDurationMs" > 0) OR ("message"."roomFilters"."action" <> 'Timeout' AND "message"."roomFilters"."timeoutDurationMs" IS NULL)
      roomMemberPermissions_allow_deny_disjoint_check: ("message"."roomMemberPermissions"."allow" & "message"."roomMemberPermissions"."deny") = 0
      roomRoles_color_length_check: LENGTH("message"."roomRoles"."color") <= 9
      roomRoles_name_length_check: LENGTH(TRIM("message"."roomRoles"."name")) BETWEEN 1 AND 100
      roomRoles_position_check: "message"."roomRoles"."position" >= 0
      rooms_name_check: ("message"."rooms"."type" = 'DirectMessage' AND LENGTH(TRIM("message"."rooms"."name")) = 0) OR ("message"."rooms"."type" = 'Room' AND LENGTH(TRIM("message"."rooms"."name")) BETWEEN 1 AND 100)
      rooms_type_participantKey_check: ("message"."rooms"."type" = 'DirectMessage' AND "message"."rooms"."participantKey" IS NOT NULL) OR ("message"."rooms"."type" = 'Room' AND "message"."rooms"."participantKey" IS NULL)
      rooms_maxFileSizeBytes_check: "message"."rooms"."maxFileSizeBytes" >= 0
      rooms_slowmodeMs_check: "message"."rooms"."slowmodeMs" >= 0
      rooms_topic_length_check: LENGTH("message"."rooms"."topic") <= 500
      scheduledMessageJobs_payload_type_check: 
                ("message"."scheduledMessageJobs"."payload"->>'type' = 'Reminder' AND "message"."scheduledMessageJobs"."payload" ? 'text')
                OR ("message"."scheduledMessageJobs"."payload"->>'type' = 'ScheduledMessage' AND "message"."scheduledMessageJobs"."payload" ? 'message')
              
      searchHistories_query_length_check: LENGTH("message"."searchHistories"."query") <= 10000
      storageLedger_declaredBytes_check: "storage"."storageLedger"."declaredBytes" >= 0
      storageLedger_countedBytes_check: "storage"."storageLedger"."countedBytes" >= 0
      userAchievements_amount_check: "achievement_userAchievements"."amount" >= 1
      userSettings_inputSensitivityDecibels_check: "message"."userSettings"."inputSensitivityDecibels" BETWEEN -100 AND 0
      userSettings_microphoneVolumePercentage_check: "message"."userSettings"."microphoneVolumePercentage" BETWEEN 0 AND 200
      userSettings_speakerVolumePercentage_check: "message"."userSettings"."speakerVolumePercentage" BETWEEN 0 AND 200
      userSettings_autoIdleThresholdMs_check: "message"."userSettings"."autoIdleThresholdMs" BETWEEN 60000 AND 86400000
      userSettings_pushToTalkKeybind_length_check: LENGTH("message"."userSettings"."pushToTalkKeybind") <= 64
      userSettings_pushToTalkReleaseDelayMs_check: "message"."userSettings"."pushToTalkReleaseDelayMs" BETWEEN 0 AND 2000
      users_biography_length_check: LENGTH("auth_users"."biography") <= 160
      users_name_length_check: LENGTH(TRIM("auth_users"."name")) BETWEEN 1 AND 100
      userStatuses_message_length_check: LENGTH("message"."userStatuses"."message") <= 64
      usersToRooms_displayName_length_check: LENGTH("message"."usersToRooms"."displayName") <= 32
      usersToRooms_mentionCount_check: "message"."usersToRooms"."mentionCount" >= 0
      webhooks_name_length_check: LENGTH(TRIM("message"."webhooks"."name")) BETWEEN 1 AND 100"
    `);
  });
});

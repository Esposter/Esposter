import { schema } from "#src/generated/schema";
import { capitalize } from "@esposter/shared";
import { is } from "drizzle-orm";
import { getTableConfig, isPgEnum, PgDialect, PgTable } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";

describe("schema", () => {
  // Every table and enum lives in the Postgres schema of the product area that owns it, never in `public`, and its
  // Export is derived from its DDL name rather than chosen: a table's is suffixed with its schema — `usersInAuth` for
  // `auth.users` — so it can never collide with a local, a row type or a library name and always says where the table
  // Lives, and an enum's with `Enum`, since it shares its name with the TS enum it is built from. Nothing normalises a
  // DDL name, so a snake_case one would otherwise go unnoticed, and both kinds are checked in one pass so a
  // Declaration cannot be added under a kind this invariant forgot to look at
  test("every table and enum lives in a named schema and exports its name with its suffix", () => {
    expect.hasAssertions();

    const mismatched = Object.entries(schema)
      .flatMap(([exportName, value]) => {
        if (is(value, PgTable)) {
          const { name, schema: tableSchema } = getTableConfig(value);
          return [[exportName, tableSchema ? `${name}In${capitalize(tableSchema)}` : `${name} in public`] as const];
        } else if (isPgEnum(value))
          return [[exportName, value.schema ? `${value.enumName}Enum` : `${value.enumName} in public`] as const];
        else return [];
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

    const dialect = new PgDialect();
    const renderedChecks = Object.values(schema)
      .filter((value) => is(value, PgTable))
      .flatMap((table) =>
        getTableConfig(table).checks.map((check) => `${check.name}: ${dialect.sqlToQuery(check.value).sql}`),
      )
      .join("\n");

    expect(renderedChecks).toMatchInlineSnapshot(`
      "appUsers_name_length_check: LENGTH(TRIM("message"."appUsers"."name")) BETWEEN 1 AND 100
      blocks_blockerId_blockedId_check: "social"."blocks"."blockerId" != "social"."blocks"."blockedId"
      bookmarks_path_length_check: LENGTH("app"."bookmarks"."path") <= 2048
      bookmarks_title_length_check: LENGTH("app"."bookmarks"."title") <= 100
      callSessions_id_length_check: LENGTH("message"."callSessions"."id") = 12
      friendRequests_senderId_receiverId_check: "social"."friendRequests"."senderId" != "social"."friendRequests"."receiverId"
      friends_senderId_receiverId_check: "social"."friends"."senderId" != "social"."friends"."receiverId"
      invites_id_length_check: LENGTH("message"."invites"."id") = 8
      invites_maxUses_check: "message"."invites"."maxUses" >= 0
      invites_uses_check: "message"."invites"."uses" >= 0
      invites_uses_maxUses_check: "message"."invites"."maxUses" = 0 OR "message"."invites"."uses" <= "message"."invites"."maxUses"
      likes_value_check: "post"."likes"."value" = 1 OR "post"."likes"."value" = -1
      posts_title_length_check: LENGTH("post"."posts"."title") <= 300
      posts_description_length_check: LENGTH("post"."posts"."description") <= 1000
      resources_name_length_check: LENGTH(TRIM("resource"."resources"."name")) BETWEEN 1 AND 100
      resourceVersions_plaintextBytes_check: "resource"."resourceVersions"."plaintextBytes" >= 0
      resourceVersions_storedBytes_check: "resource"."resourceVersions"."storedBytes" >= 0
      roomCategories_name_length_check: LENGTH(TRIM("message"."roomCategories"."name")) BETWEEN 1 AND 100
      roomCategories_position_check: "message"."roomCategories"."position" >= 0
      roomEmojis_name_length_check: LENGTH(TRIM("message"."roomEmojis"."name")) BETWEEN 1 AND 32
      roomEmojis_name_charset_check: "message"."roomEmojis"."name" ~ '^[a-z0-9_]+$'
      roomFilters_words_size_check: cardinality("message"."roomFilters"."words") <= 1000
      roomFilters_action_timeoutDurationMs_check: ("message"."roomFilters"."action" = 'Timeout' AND "message"."roomFilters"."timeoutDurationMs" IS NOT NULL AND "message"."roomFilters"."timeoutDurationMs" > 0) OR ("message"."roomFilters"."action" <> 'Timeout' AND "message"."roomFilters"."timeoutDurationMs" IS NULL)
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
      userAchievements_amount_check: "achievement"."userAchievements"."amount" >= 1
      userSettings_inputSensitivityDecibels_check: "message"."userSettings"."inputSensitivityDecibels" BETWEEN -100 AND 0
      userSettings_microphoneVolumePercentage_check: "message"."userSettings"."microphoneVolumePercentage" BETWEEN 0 AND 200
      userSettings_speakerVolumePercentage_check: "message"."userSettings"."speakerVolumePercentage" BETWEEN 0 AND 200
      userSettings_autoIdleThresholdMs_check: "message"."userSettings"."autoIdleThresholdMs" BETWEEN 60000 AND 86400000
      userSettings_pushToTalkKeybind_length_check: LENGTH("message"."userSettings"."pushToTalkKeybind") <= 64
      userSettings_pushToTalkReleaseDelayMs_check: "message"."userSettings"."pushToTalkReleaseDelayMs" BETWEEN 0 AND 2000
      users_biography_length_check: LENGTH("auth"."users"."biography") <= 160
      users_name_length_check: LENGTH(TRIM("auth"."users"."name")) BETWEEN 1 AND 100
      userStatuses_message_length_check: LENGTH("message"."userStatuses"."message") <= 64
      usersToRooms_nickname_length_check: LENGTH("message"."usersToRooms"."nickname") <= 32
      usersToRooms_mentionCount_check: "message"."usersToRooms"."mentionCount" >= 0
      webhooks_name_length_check: LENGTH(TRIM("message"."webhooks"."name")) BETWEEN 1 AND 100"
    `);
  });
});

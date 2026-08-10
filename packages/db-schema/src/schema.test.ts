import { schema } from "@/schema";
import { is } from "drizzle-orm";
import { getTableConfig, PgDialect, PgTable } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";

const dialect = new PgDialect();
const getRenderedChecks = () =>
  Object.values(schema)
    .filter((value) => is(value, PgTable))
    .flatMap((table) =>
      getTableConfig(table).checks.map((check) => `${check.name}: ${dialect.sqlToQuery(check.value).sql}`),
    )
    .join("\n");

describe("schema", () => {
  // The `pgTable` wrapper's camelCase casing applies to columns and passes the table name through verbatim, so
  // Nothing normalises the name and nothing else would catch a snake_case one. That is exactly how five tables and
  // Eleven enums drifted while the stated rule said the opposite — this is the rule, rather than a sentence about it.
  // The `InMessage` suffix disambiguates the export, not the table: the `message` schema already qualifies the name.
  test("every table name is its exported const name without the schema suffix", () => {
    expect.hasAssertions();

    const mismatched = Object.entries(schema)
      .filter(([, value]) => is(value, PgTable))
      .map(([exportName, table]) => [exportName.replace(/InMessage$/u, ""), getTableConfig(table).name] as const)
      .filter(([expected, name]) => name !== expected)
      .map(([expected, name]) => `${name} should be ${expected}`);

    expect(mismatched).toStrictEqual([]);
  });

  // Drizzle-kit hashes the SQL a CHECK renders to, and a migration is already applied against that exact
  // String — so a constraint rewritten to read better forks the migration chain rather than being a no-op.
  // Rendering every check here is what lets an idiom move into a helper without running `db:gen`: identical
  // Output is identical DDL. A deliberate constraint change updates this snapshot and generates a migration.
  test("check constraint sql", () => {
    expect.hasAssertions();
    expect(getRenderedChecks()).toMatchInlineSnapshot(`
      "appUsers_name_length_check: LENGTH(TRIM("message"."appUsers"."name")) BETWEEN 1 AND 100
      blocks_blockerId_blockedId_check: "blocks"."blockerId" != "blocks"."blockedId"
      callSessions_id_length_check: LENGTH("message"."callSessions"."id") = 12
      friendRequests_senderId_receiverId_check: "friendRequests"."senderId" != "friendRequests"."receiverId"
      friends_senderId_receiverId_check: "friends"."senderId" != "friends"."receiverId"
      invites_id_length_check: LENGTH("message"."invites"."id") = 8
      invites_maxUses_check: "message"."invites"."maxUses" >= 0
      invites_uses_check: "message"."invites"."uses" >= 0
      invites_uses_maxUses_check: "message"."invites"."maxUses" = 0 OR "message"."invites"."uses" <= "message"."invites"."maxUses"
      likes_value_check: "likes"."value" = 1 OR "likes"."value" = -1
      posts_title_length_check: LENGTH("posts"."title") <= 300
      posts_description_length_check: LENGTH("posts"."description") <= 1000
      resources_name_length_check: LENGTH(TRIM("resources"."name")) BETWEEN 1 AND 100
      roomCategories_name_length_check: LENGTH(TRIM("message"."roomCategories"."name")) BETWEEN 1 AND 100
      roomCategories_position_check: "message"."roomCategories"."position" >= 0
      roomFilters_words_size_check: cardinality("message"."roomFilters"."words") <= 1000
      roomFilters_action_timeoutDurationMs_check: ("message"."roomFilters"."action" = 'Timeout' AND "message"."roomFilters"."timeoutDurationMs" IS NOT NULL AND "message"."roomFilters"."timeoutDurationMs" > 0) OR ("message"."roomFilters"."action" <> 'Timeout' AND "message"."roomFilters"."timeoutDurationMs" IS NULL)
      roomRoles_color_length_check: LENGTH("message"."roomRoles"."color") <= 9
      roomRoles_name_length_check: LENGTH(TRIM("message"."roomRoles"."name")) BETWEEN 1 AND 100
      roomRoles_position_check: "message"."roomRoles"."position" >= 0
      rooms_name_check: ("message"."rooms"."type" = 'DirectMessage' AND LENGTH(TRIM("message"."rooms"."name")) = 0) OR ("message"."rooms"."type" = 'Room' AND LENGTH(TRIM("message"."rooms"."name")) BETWEEN 1 AND 100)
      rooms_type_participantKey_check: ("message"."rooms"."type" = 'DirectMessage' AND "message"."rooms"."participantKey" IS NOT NULL) OR ("message"."rooms"."type" = 'Room' AND "message"."rooms"."participantKey" IS NULL)
      rooms_maxFileSizeBytes_check: "message"."rooms"."maxFileSizeBytes" IS NULL OR "message"."rooms"."maxFileSizeBytes" >= 1
      rooms_slowmodeMs_check: "message"."rooms"."slowmodeMs" IS NULL OR "message"."rooms"."slowmodeMs" >= 1
      rooms_topic_length_check: LENGTH("message"."rooms"."topic") <= 500
      scheduledMessageJobs_payload_type_check: 
                ("message"."scheduledMessageJobs"."payload"->>'type' = 'Reminder' AND "message"."scheduledMessageJobs"."payload" ? 'text')
                OR ("message"."scheduledMessageJobs"."payload"->>'type' = 'ScheduledMessage' AND "message"."scheduledMessageJobs"."payload" ? 'message')
              
      searchHistories_query_length_check: LENGTH("message"."searchHistories"."query") <= 10000
      storageBlobs_declaredBytes_check: "storageBlobs"."declaredBytes" >= 0
      storageBlobs_countedBytes_check: "storageBlobs"."countedBytes" >= 0
      userAchievements_amount_check: "userAchievements"."amount" >= 1
      users_biography_length_check: LENGTH("users"."biography") <= 160
      users_name_length_check: LENGTH(TRIM("users"."name")) BETWEEN 1 AND 100
      userSettings_inputSensitivityDecibels_check: "message"."userSettings"."inputSensitivityDecibels" BETWEEN -100 AND 0
      userSettings_microphoneVolumePercentage_check: "message"."userSettings"."microphoneVolumePercentage" BETWEEN 0 AND 200
      userSettings_speakerVolumePercentage_check: "message"."userSettings"."speakerVolumePercentage" BETWEEN 0 AND 200
      userSettings_autoIdleThresholdMs_check: "message"."userSettings"."autoIdleThresholdMs" BETWEEN 60000 AND 86400000
      userSettings_pushToTalkReleaseDelayMs_check: "message"."userSettings"."pushToTalkReleaseDelayMs" BETWEEN 0 AND 2000
      userStatuses_message_length_check: LENGTH("message"."userStatuses"."message") <= 64
      usersToRooms_nickname_length_check: LENGTH("message"."usersToRooms"."nickname") <= 32
      usersToRooms_mentionCount_check: "message"."usersToRooms"."mentionCount" >= 0
      webhooks_name_length_check: LENGTH(TRIM("message"."webhooks"."name")) BETWEEN 1 AND 100"
    `);
  });
});

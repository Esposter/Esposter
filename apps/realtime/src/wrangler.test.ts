import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareCoreDatabaseIdMap,
  CloudflareDatabaseRole,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
  QueueJob,
  QueueJobBindingNameMap,
  StorageBucket,
} from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

interface WranglerEnvironment {
  d1_databases: { binding: string; database_id: string; database_name: string }[];
  durable_objects: { bindings: { class_name: string; name: string }[] };
  migrations: { new_sqlite_classes: string[]; tag: string }[];
  name: string;
  queues: { producers: { binding: string; queue: string }[] };
  r2_buckets: { binding: string; bucket_name: string }[];
}

describe.each([{ environment: CloudflareEnvironment.Development }, { environment: CloudflareEnvironment.Production }])(
  "the $environment environment of the realtime Worker",
  ({ environment }) => {
    // The names this file shares with Pulumi and the app.
    // A wrangler config that names a queue, bucket or database Pulumi does not create binds to nothing.
    // Each expected name is built by the same function Pulumi calls, so the two cannot disagree.
    // Read from this package's own file so the suite runs from the repo root too.
    // The config is JSONC: the formatter keeps its trailing commas, which JSON.parse refuses, so they are removed first.
    const configuration = jsonDateParse<{
      account_id: string;
      env: Record<CloudflareEnvironment, WranglerEnvironment>;
    }>(
      readFileSync(resolve(import.meta.dirname, "..", "wrangler.jsonc"), "utf8").replaceAll(
        /,(?<closing>\s*[}\]])/gu,
        "$<closing>",
      ),
    );
    const wrangler = configuration.env[environment];

    test("deploys into the committed account, which each environment inherits", () => {
      expect.hasAssertions();

      expect(configuration.account_id).toBe(CLOUDFLARE_ACCOUNT_ID);
    });

    test("runs as its environment's Worker", () => {
      expect.hasAssertions();

      expect(wrangler.name).toBe(
        getCloudflareResourceName(environment, CloudflareAssetType.Worker, CloudflareWorkerPurpose.Realtime),
      );
    });

    // The notification producer is the one queue this Worker sends to, the notification a due todo reminder is sent as
    test("produces to the notification job's queue alone", () => {
      expect.hasAssertions();

      expect(wrangler.queues.producers).toStrictEqual([
        {
          binding: QueueJobBindingNameMap[QueueJob.ProcessNotification],
          queue: getCloudflareResourceName(environment, CloudflareAssetType.Queue, QueueJob.ProcessNotification),
        },
      ]);
    });

    // The one bucket its code reads, a todo list's content, which a reminder checks before it sends
    test("binds the resource bucket, and the core database by its environment's name and id", () => {
      expect.hasAssertions();

      expect(wrangler.r2_buckets).toStrictEqual([
        {
          binding: "RESOURCE_ASSETS",
          bucket_name: getCloudflareResourceName(
            environment,
            CloudflareAssetType.R2Bucket,
            StorageBucket.ResourceAssets,
          ),
        },
      ]);
      expect(wrangler.d1_databases).toStrictEqual([
        {
          binding: "CORE",
          database_id: CloudflareCoreDatabaseIdMap[environment],
          database_name: getCloudflareResourceName(
            environment,
            CloudflareAssetType.D1Database,
            CloudflareDatabaseRole.Core,
          ),
        },
      ]);
    });

    // A Worker that is only objects has no cron: its objects wake on their own alarms, and no schedule runs here
    test("holds its objects, each migrated as a SQLite class in its first migration", () => {
      expect.hasAssertions();

      expect(wrangler.durable_objects.bindings).toStrictEqual([
        { class_name: "CallObject", name: "CALL" },
        { class_name: "RoomObject", name: "ROOM" },
        { class_name: "TopicObject", name: "TOPIC" },
        { class_name: "UserObject", name: "USER" },
      ]);
      expect(wrangler.migrations).toStrictEqual([
        { new_sqlite_classes: ["CallObject", "RoomObject", "TopicObject", "UserObject"], tag: "v1" },
      ]);
    });
  },
);

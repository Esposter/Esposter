import {
  CloudflareAssetType,
  CloudflareCoreDatabaseIdMap,
  CloudflareDatabaseRole,
  CloudflareEnvironment,
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
  durable_objects: { bindings: { class_name: string; name: string; script_name?: string }[] };
  migrations: { new_sqlite_classes: string[]; tag: string }[];
  name: string;
  queues: { producers: { binding: string; queue: string }[] };
  r2_buckets: { bucket_name: string }[];
  triggers: { crons: string[] };
  vars: { CLOUDFLARE_ENVIRONMENT: string };
}

// The names this file shares with Pulumi and the app: a queue, bucket or database a wrangler config names that Pulumi does
// not create is a binding that resolves to nothing. Each expected name is built by the same function Pulumi calls, so the
// two cannot disagree. Read from this package's own file so the suite runs from the repo root too.
// The config is JSONC: the formatter keeps its trailing commas, which JSON.parse refuses, so they are removed first
const configuration = jsonDateParse<{ env: Record<CloudflareEnvironment, WranglerEnvironment> }>(
  readFileSync(resolve(import.meta.dirname, "..", "wrangler.jsonc"), "utf8").replaceAll(/,(\s*[}\]])/g, "$1"),
);

const environments = [
  { environment: CloudflareEnvironment.Development },
  { environment: CloudflareEnvironment.Production },
];

describe.each(environments)("the $environment environment of the functions Worker", ({ environment }) => {
  const wrangler = configuration.env[environment];

  test("produces to the notification queue under its environment's queue name", () => {
    expect.hasAssertions();

    expect(wrangler.queues.producers).toStrictEqual([
      {
        binding: QueueJobBindingNameMap[QueueJob.ProcessNotification],
        queue: getCloudflareResourceName(environment, CloudflareAssetType.Queue, QueueJob.ProcessNotification),
      },
    ]);
  });

  test("binds every storage bucket, and the core database by its environment's name and id", () => {
    expect.hasAssertions();

    expect(wrangler.r2_buckets.map(({ bucket_name }) => bucket_name).toSorted()).toStrictEqual(
      Object.values(StorageBucket)
        .map((bucket) => getCloudflareResourceName(environment, CloudflareAssetType.R2Bucket, bucket))
        .toSorted(),
    );
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

  test("runs as its environment's Worker, reads its queue names by that environment, and purges on the nightly cron", () => {
    expect.hasAssertions();

    expect(wrangler.name).toBe(getCloudflareResourceName(environment, CloudflareAssetType.Worker, "functions"));
    expect(wrangler.vars.CLOUDFLARE_ENVIRONMENT).toBe(environment);
    expect(wrangler.triggers.crons).toStrictEqual(["0 3 * * *"]);
  });

  test("calls the web Worker's object by its script, and holds its own scheduler and realtime objects, each migrated as a SQLite class", () => {
    expect.hasAssertions();

    expect(wrangler.durable_objects.bindings).toStrictEqual([
      { class_name: "Scheduler", name: "SCHEDULER" },
      {
        class_name: "$DurableObject",
        name: "SERVER",
        script_name: getCloudflareResourceName(environment, CloudflareAssetType.Worker, "web"),
      },
      { class_name: "CallObject", name: "CALL" },
      { class_name: "RoomObject", name: "ROOM" },
      { class_name: "UserObject", name: "USER" },
    ]);
    expect(wrangler.migrations).toStrictEqual([
      { new_sqlite_classes: ["Scheduler"], tag: "v1" },
      { new_sqlite_classes: ["CallObject", "RoomObject", "UserObject"], tag: "v2" },
    ]);
  });
});

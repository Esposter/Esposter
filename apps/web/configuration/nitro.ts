import type { NuxtConfig } from "nuxt/schema";

import { readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { AzureFunction } from "../../../packages/db-schema/src/models/azure/function/AzureFunction.ts";
import { CloudflareAssetType } from "../../../packages/db-schema/src/models/cloudflare/CloudflareAssetType.ts";
import { CloudflareEnvironment } from "../../../packages/db-schema/src/models/cloudflare/CloudflareEnvironment.ts";
import { StorageBucket } from "../../../packages/db-schema/src/models/storage/StorageBucket.ts";
import { getCloudflareResourceName } from "../../../packages/db-schema/src/services/cloudflare/getCloudflareResourceName.ts";
import { toKebabCase } from "../../../packages/shared/src/util/text/toKebabCase.ts";
import {
  PDF_CMAP_BASE_URL,
  PDF_STANDARD_FONT_DATA_BASE_URL,
  PDF_WASM_BASE_URL,
} from "../app/services/pdf/constants.ts";
import { MEGABYTE } from "../shared/services/app/constants.ts";
import {
  GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL,
  GENSHIN_REGION_DATA_BASE_URL,
} from "../shared/services/genshin/constants.ts";
import { TEMPORAL_POLYFILL_BASE_URL } from "./constants.ts";

// The world package's own folder, found through its manifest, which is there before any build
const genshinWorldDirectory = dirname(createRequire(import.meta.url).resolve("genshin-world/package.json"));
// The PDF renderer's own folder of character maps, fonts and decoders, served from its install rather than a copy
const pdfjsDistDirectory = dirname(createRequire(import.meta.url).resolve("pdfjs-dist/package.json"));
// A binding's name is its resource's name in SCREAMING_SNAKE, so each bucket and queue the enums declare is bound here
const toBindingName = (name: string) => name.replaceAll("-", "_").toUpperCase();
// The Pulumi declarations make a queue for each job the functions Worker consumes and a bucket for each store of data.
// The job enum also names a cron, a route and a deleted job, and the bucket enum the dead letters a queue's own
// Dead-letter queue keeps now, so none of those gets a binding
const NON_QUEUE_JOBS: AzureFunction[] = [
  AzureFunction.PurgeDeletedResources,
  AzureFunction.PushWebhook,
  AzureFunction.ReplayDeadLetterEvent,
];
const NON_BUCKETS: StorageBucket[] = [StorageBucket.DeadLetter];
const QUEUE_JOBS = Object.values(AzureFunction).filter((job) => !NON_QUEUE_JOBS.includes(job));
const BUCKETS = Object.values(StorageBucket).filter((bucket) => !NON_BUCKETS.includes(bucket));

// One environment's wrangler block. Wrangler does not inherit a binding, or a var, into an `env` block, so each carries
// Its own, and every resource name is the one function both Pulumi and the Workers call for the environment. A binding's
// Name is the same in both environments, so no code branches on the environment to reach a resource
const getEnvironmentWrangler = (environment: CloudflareEnvironment) => {
  const databaseIds =
    environment === CloudflareEnvironment.Development
      ? {
          core: process.env.CLOUDFLARE_D1_DEV_CORE_DATABASE_ID,
          streams: process.env.CLOUDFLARE_D1_DEV_STREAMS_DATABASE_ID,
        }
      : { core: process.env.CLOUDFLARE_D1_CORE_DATABASE_ID, streams: process.env.CLOUDFLARE_D1_STREAMS_DATABASE_ID };
  const coreDatabaseName = getCloudflareResourceName(environment, CloudflareAssetType.D1Database, "core");
  const streamsDatabaseName = getCloudflareResourceName(environment, CloudflareAssetType.D1Database, "streams");
  const functionsWorkerName = getCloudflareResourceName(environment, CloudflareAssetType.Worker, "functions");
  return {
    name: getCloudflareResourceName(environment, CloudflareAssetType.Worker, "web"),
    d1_databases: [
      { binding: "CORE", database_id: databaseIds.core, database_name: coreDatabaseName },
      { binding: "STREAMS", database_id: databaseIds.streams, database_name: streamsDatabaseName },
    ],
    durable_objects: {
      bindings: [
        { class_name: "$DurableObject", name: "$DurableObject" },
        { class_name: "Scheduler", name: "SCHEDULER", script_name: functionsWorkerName },
      ],
    },
    queues: {
      producers: QUEUE_JOBS.map((job) => {
        const purpose = toKebabCase(job);
        const queueName = getCloudflareResourceName(environment, CloudflareAssetType.Queue, purpose);
        return { binding: `${toBindingName(purpose)}_QUEUE`, queue: queueName };
      }),
    },
    r2_buckets: BUCKETS.map((bucket) => {
      const bucketName = getCloudflareResourceName(environment, CloudflareAssetType.R2Bucket, bucket);
      return { binding: toBindingName(bucket), bucket_name: bucketName };
    }),
    vars: { CLOUDFLARE_ENVIRONMENT: environment },
  };
};

export const nitro: NuxtConfig["nitro"] = {
  // The Worker's own wrangler configuration, written beside the build. The top level is prod, which a local run and an
  // Unset CLOUDFLARE_ENV use; the env blocks are what CI deploys, `dev` or `prod` by its branch. The Durable Object is
  // The app's stateful half, which the Worker forwards tRPC to, and the Scheduler is the functions Worker's
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      compatibility_date: "2026-11-01",
      env: {
        dev: getEnvironmentWrangler(CloudflareEnvironment.Development),
        prod: getEnvironmentWrangler(CloudflareEnvironment.Production),
      },
      migrations: [{ new_sqlite_classes: ["$DurableObject"], tag: "v1" }],
      ...getEnvironmentWrangler(CloudflareEnvironment.Production),
    },
  },
  hooks: {
    // Nitro's Vite builder, the one Nuxt 5 builds through, dropped the size summary its Rollup builder prints, so each
    // Output directory's size is logged once the build is written. Source maps are left out, since they are never uploaded
    compiled: async ({ logger, options: { output } }) => {
      const directorySizes = await Promise.all(
        Object.entries({ public: output.publicDir, server: output.serverDir }).map(async ([name, directory]) => {
          const entries = await readdir(directory, { recursive: true, withFileTypes: true });
          const sizes = await Promise.all(
            entries
              .filter((entry) => entry.isFile() && !/\.map$/u.test(entry.name))
              .map(async (entry) => (await stat(join(entry.parentPath, entry.name))).size),
          );
          return { name, sizes };
        }),
      );
      for (const { name, sizes } of directorySizes) {
        const size = sizes.reduce((total, fileSize) => total + fileSize, 0);
        logger.info(`Σ ${name}: ${(size / MEGABYTE).toFixed(2)} MB (${sizes.length} files)`);
      }
    },
  },
  preset: "cloudflare_module",
  // A package polyfill is served from its own install under `/polyfills/`, so its version is the lockfile's
  publicAssets: [
    // Each Genshin region's data is served from the world package's own copy, so a region is fetched and released
    // By reach rather than bundled
    {
      baseURL: GENSHIN_REGION_DATA_BASE_URL,
      // oxlint-disable-next-line id-denylist -- `dir` is Nitro's own option name
      dir: join(genshinWorldDirectory, "src/data/regions"),
    },
    // The recordings the login's music plays over its synthesizer, fetched once the login shows
    {
      baseURL: GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL,
      // oxlint-disable-next-line id-denylist -- as above
      dir: join(genshinWorldDirectory, "src/data/login/recordings"),
    },
    {
      baseURL: PDF_CMAP_BASE_URL,
      // oxlint-disable-next-line id-denylist -- `dir` is Nitro's own option name
      dir: join(pdfjsDistDirectory, "cmaps"),
    },
    {
      baseURL: PDF_STANDARD_FONT_DATA_BASE_URL,
      // oxlint-disable-next-line id-denylist -- as above
      dir: join(pdfjsDistDirectory, "standard_fonts"),
    },
    {
      baseURL: PDF_WASM_BASE_URL,
      // oxlint-disable-next-line id-denylist -- as above
      dir: join(pdfjsDistDirectory, "wasm"),
    },
    {
      baseURL: TEMPORAL_POLYFILL_BASE_URL,
      // oxlint-disable-next-line id-denylist -- `dir` is Nitro's own option name
      dir: dirname(createRequire(import.meta.url).resolve("temporal-polyfill")),
    },
  ],
};

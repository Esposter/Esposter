import { CloudflareAssetType } from "../../../packages/db-schema/src/models/cloudflare/CloudflareAssetType.ts";
import { CloudflareDatabaseRole } from "../../../packages/db-schema/src/models/cloudflare/CloudflareDatabaseRole.ts";
import { CloudflareEnvironment } from "../../../packages/db-schema/src/models/cloudflare/CloudflareEnvironment.ts";
import { CloudflareWorkerPurpose } from "../../../packages/db-schema/src/models/cloudflare/CloudflareWorkerPurpose.ts";
import { RateLimiterBinding } from "../../../packages/db-schema/src/models/cloudflare/RateLimiterBinding.ts";
import { QueueJob } from "../../../packages/db-schema/src/models/queue/QueueJob.ts";
import { QueueJobBindingNameMap } from "../../../packages/db-schema/src/models/queue/QueueJobBindingName.ts";
import { StorageBucket } from "../../../packages/db-schema/src/models/storage/StorageBucket.ts";
import { CloudflareCoreDatabaseIdMap } from "../../../packages/db-schema/src/services/cloudflare/CloudflareCoreDatabaseIdMap.ts";
import {
  CLOUDFLARE_ACCOUNT_ID,
  RATE_LIMITER_DURATION_SECONDS,
} from "../../../packages/db-schema/src/services/cloudflare/constants.ts";
import { getCloudflareResourceName } from "../../../packages/db-schema/src/services/cloudflare/getCloudflareResourceName.ts";
import { RateLimiterNamespaceIdMap } from "../../../packages/db-schema/src/services/cloudflare/RateLimiterNamespaceIdMap.ts";
import { RateLimiterPointsMap } from "../../../packages/db-schema/src/services/cloudflare/RateLimiterPointsMap.ts";
import { Environment } from "../shared/models/environment/Environment.ts";

// A binding's name is its resource's name in SCREAMING_SNAKE, so each bucket is bound by it
const toBindingName = (name: string) => name.replaceAll("-", "_").toUpperCase();

// The environment a build is for: CI sets CLOUDFLARE_ENV by its branch, and a build without it is prod. Any other value is
// A typo that would deploy one environment's bindings under another's name, so it fails the build
export const getBuildCloudflareEnvironment = (): CloudflareEnvironment => {
  const value = process.env.CLOUDFLARE_ENV ?? CloudflareEnvironment.Production;
  const environment = Object.values(CloudflareEnvironment).find(
    (cloudflareEnvironment) => cloudflareEnvironment === value,
  );
  if (!environment)
    // oxlint-disable-next-line error-handling/no-bare-error -- the Nuxt configuration loads before `@esposter/shared` is built
    throw new Error(`CLOUDFLARE_ENV must be one of ${Object.values(CloudflareEnvironment).join(", ")}, got ${value}`);
  return environment;
};

// One environment's wrangler block. Wrangler does not inherit a binding, or a var, into an `env` block, so each carries
// Its own, and every resource name is the one function both Pulumi and the Workers call for the environment. A binding's
// Name is the same in both environments, so no code branches on the environment to reach a resource. The vars are the
// Variables the environment's name fixes; the rest of the web Worker's variables are secrets a deploy uploads
export const getEnvironmentWrangler = (environment: CloudflareEnvironment) => {
  const isDevelopment = environment === CloudflareEnvironment.Development;
  // The functions Worker exports the realtime objects and runs them: the web Worker calls each across by its name
  const functionsWorkerName = getCloudflareResourceName(
    environment,
    CloudflareAssetType.Worker,
    CloudflareWorkerPurpose.Functions,
  );
  return {
    account_id: CLOUDFLARE_ACCOUNT_ID,
    d1_databases: [
      {
        binding: "CORE",
        database_id: CloudflareCoreDatabaseIdMap[environment],
        database_name: getCloudflareResourceName(
          environment,
          CloudflareAssetType.D1Database,
          CloudflareDatabaseRole.Core,
        ),
      },
    ],
    durable_objects: {
      bindings: [
        { class_name: "CallObject", name: "CALL", script_name: functionsWorkerName },
        { class_name: "RoomObject", name: "ROOM", script_name: functionsWorkerName },
        { class_name: "UserObject", name: "USER", script_name: functionsWorkerName },
      ],
    },
    name: getCloudflareResourceName(environment, CloudflareAssetType.Worker, CloudflareWorkerPurpose.Web),
    queues: {
      producers: Object.values(QueueJob).map((job) => ({
        binding: QueueJobBindingNameMap[job],
        queue: getCloudflareResourceName(environment, CloudflareAssetType.Queue, job),
      })),
    },
    r2_buckets: Object.values(StorageBucket).map((bucket) => ({
      binding: toBindingName(bucket),
      bucket_name: getCloudflareResourceName(environment, CloudflareAssetType.R2Bucket, bucket),
    })),
    // One binding per limiter, each in its own namespace, so a limiter's counts never reach another's
    ratelimits: Object.values(RateLimiterBinding).map((binding) => ({
      name: binding,
      namespace_id: RateLimiterNamespaceIdMap[environment][binding],
      simple: { limit: RateLimiterPointsMap[binding], period: RATE_LIMITER_DURATION_SECONDS } as const,
    })),
    // The addresses come from the build's environment, which CI sets by branch. `nuxt prepare` evaluates this with none
    // Set, and an unset one is left out rather than written as an undefined var
    vars: Object.fromEntries(
      Object.entries({
        APP_ENV: isDevelopment ? Environment.Development : Environment.Production,
        // The auth origin is the app's own origin, so better-auth reads the same address the app is served from
        BASE_URL: process.env.BASE_URL,
        BETTER_AUTH_URL: process.env.BASE_URL,
        CLOUDFLARE_ENVIRONMENT: environment,
        PUBLIC_ASSETS_BASE_URL: process.env.PUBLIC_ASSETS_BASE_URL,
      }).flatMap(([name, value]) => (value === undefined ? [] : [[name, value] as const])),
    ),
  };
};

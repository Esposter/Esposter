import type { R2Bucket } from "@cloudflare/workers-types";

import { Miniflare } from "miniflare";

// In-memory R2 buckets, one per name, the bindings a Worker gets, all served by one Miniflare instance under each bucket's
// Own name. The instance is handed back beside the buckets so the test that made them can dispose it
export const createMockBuckets = async <BucketName extends string>(
  bucketNames: BucketName[],
): Promise<{ buckets: Map<BucketName, R2Bucket>; dispose: () => Promise<void> }> => {
  const miniflare = new Miniflare({
    workers: [
      {
        config: {
          compatibilityDate: "2026-01-01",
          env: Object.fromEntries(
            bucketNames.map((bucketName) => [bucketName, { name: bucketName, type: "r2" as const }]),
          ),
          manifest: {
            mainModule: "index.js",
            modules: { "index.js": { contents: "export default {}", type: "esm" } },
            modulesRoot: "/",
          },
          name: "mock-buckets",
        },
      },
    ],
  });
  const buckets = new Map(
    await Promise.all(
      bucketNames.map(
        async (bucketName) =>
          [
            bucketName,
            // oxlint-disable typescript/no-unsafe-type-assertion -- Miniflare types its bucket over undici's `Headers`, which the Workers `R2Bucket`'s iterators do not satisfy; the binding is the same object
            // eslint-disable-next-line no-restricted-syntax -- Miniflare types its bucket over undici's `Headers`, which the Workers `R2Bucket`'s iterators do not satisfy; the binding is the same object
            (await miniflare.getR2Bucket(bucketName)) as unknown as R2Bucket,
            // oxlint-enable typescript/no-unsafe-type-assertion
          ] as const,
      ),
    ),
  );
  return { buckets, dispose: () => miniflare.dispose() };
};

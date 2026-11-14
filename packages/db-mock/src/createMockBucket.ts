import type { R2Bucket } from "@cloudflare/workers-types";

import { Miniflare } from "miniflare";

// An in-memory R2 bucket, the binding a Worker gets, served by Miniflare under the bucket's own name. The instance is
// handed back beside the bucket so the test that made it can dispose it
export const createMockBucket = async (
  bucketName: string,
): Promise<{ bucket: R2Bucket; dispose: () => Promise<void> }> => {
  const miniflare = new Miniflare({
    workers: [
      {
        config: {
          compatibilityDate: "2026-01-01",
          env: { [bucketName]: { name: bucketName, type: "r2" } },
          manifest: {
            mainModule: "index.js",
            modules: { "index.js": { contents: "export default {}", type: "esm" } },
            modulesRoot: "/",
          },
          name: "mock-bucket",
        },
      },
    ],
  });
  const miniflareBucket = await miniflare.getR2Bucket(bucketName);
  // eslint-disable-next-line no-restricted-syntax -- Miniflare types its bucket over undici's `Headers`, which the Workers `R2Bucket`'s iterators do not satisfy; the binding is the same object
  const bucket = miniflareBucket as unknown as R2Bucket;
  return { bucket, dispose: () => miniflare.dispose() };
};

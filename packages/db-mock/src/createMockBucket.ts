import type { R2Bucket } from "@cloudflare/workers-types";

import { Miniflare } from "miniflare";

// An in-memory R2 bucket, the binding a Worker gets, served by Miniflare under the bucket's own name. The instance is
// handed back beside the bucket so the test that made it can dispose it
export const createMockBucket = async (bucketName: string) => {
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
  const bucket: R2Bucket = await miniflare.getR2Bucket(bucketName);
  return { bucket, dispose: () => miniflare.dispose() };
};

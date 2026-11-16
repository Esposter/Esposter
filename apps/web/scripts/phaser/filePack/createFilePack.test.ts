import { createFilePack } from "#scripts/phaser/filePack/createFilePack";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(createFilePack, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("fails rather than emptying the file pack when the bucket listing is refused", async () => {
    expect.hasAssertions();

    // The bucket's name is read from the environment, and the client is built from its keys, so both are set. The keys
    // Are never sent, since the listing's one request is answered by the stub
    vi.stubEnv("CLOUDFLARE_ENVIRONMENT", CloudflareEnvironment.Development);
    vi.stubEnv("R2_ACCESS_KEY_ID", "");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(null, { status: 403 }))),
    );

    await expect(createFilePack()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: https://33d16cc4281c2845398ddb2fbd29829b.r2.cloudflarestorage.com/dev-r2-esposter-public-dungeons-assets?list-type=2, responds 403]`,
    );
  });
});

import { BUILD_FILE_EMBEDDER_POLICY } from "#shared/services/app/constants";
import { withBuildFileEmbedderPolicy } from "#shared/services/serviceWorker/withBuildFileEmbedderPolicy";
import { describe, expect, test } from "vitest";

describe(withBuildFileEmbedderPolicy, () => {
  test("a stored copy without the policy is answered with it", () => {
    expect.hasAssertions();

    const response = withBuildFileEmbedderPolicy(new Response());

    expect(response.headers.get("Cross-Origin-Embedder-Policy")).toBe(BUILD_FILE_EMBEDDER_POLICY);
  });
});

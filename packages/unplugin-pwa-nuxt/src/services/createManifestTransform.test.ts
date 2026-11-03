import { createManifestTransform } from "#src/services/createManifestTransform";
import { describe, expect, test } from "vitest";

describe(createManifestTransform, () => {
  const transform = createManifestTransform("/app/", "_nuxt/");

  test("the app's own page is keyed as the base URL and another page as its route", async () => {
    expect.hasAssertions();

    const { manifest } = await transform([
      { revision: "a", size: 1, url: "index.html" },
      { revision: "b", size: 1, url: "about/index.html" },
      { revision: "c", size: 1, url: "contact.html" },
    ]);

    expect(manifest.map(({ url }) => url)).toStrictEqual(["/app/", "about", "contact"]);
  });

  test("an app manifest named by its content has no revision and any other file keeps its own", async () => {
    expect.hasAssertions();

    const { manifest } = await transform([
      { revision: "a", size: 1, url: "_nuxt/builds/meta/1.json" },
      { revision: "b", size: 1, url: "_nuxt/entry.js" },
    ]);

    expect(manifest.map(({ revision }) => revision)).toStrictEqual([null, "b"]);
  });
});

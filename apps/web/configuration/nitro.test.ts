// @vitest-environment nuxt
import { useRouter } from "#app";
import { nitro } from "@@/configuration/nitro";
import { readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, test } from "vitest";

// Every path the server answers from a folder mounted at a base URL, its directories included, since a directory is
// What redirects to its trailing-slash form
const getStaticPaths = (directory: string, baseUrl: string) =>
  readdirSync(directory, { encoding: "utf8", recursive: true }).map(
    (path) => `/${join(baseUrl, path).split(sep).join("/")}`,
  );

describe("nitro", () => {
  // A static path wins over a page on a request to the server, so a page sharing one works when navigated to and
  // Breaks on a reload: a directory redirects to its trailing-slash form, which no page matches
  test("serves no static path a page also answers", () => {
    expect.hasAssertions();

    const router = useRouter();
    const publicAssets = (nitro?.publicAssets ?? []).filter((publicAsset) => publicAsset !== undefined);
    const staticPaths = [
      ...getStaticPaths(join(import.meta.dirname, "..", "public"), ""),
      ...publicAssets.map(({ baseURL = "" }) => `/${baseURL}`),
      ...publicAssets.flatMap(({ baseURL = "", dir: directory }) =>
        directory ? getStaticPaths(directory, baseURL) : [],
      ),
    ];
    const pagePaths = staticPaths.filter((path) => router.resolve(path).matched.length > 0);

    expect(pagePaths).toStrictEqual([]);
  });
});

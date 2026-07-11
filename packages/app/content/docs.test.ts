// @vitest-environment happy-dom
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";

import mermaid from "mermaid";
import { describe, expect, test } from "vitest";

const docsDirectory = join(import.meta.dirname, "docs");
const diagrams = (
  await Promise.all(
    (
      await Array.fromAsync(glob("**/*.md", { cwd: docsDirectory }))
    ).map(async (page) => {
      const markdown = await readFile(join(docsDirectory, page), "utf8");
      return [...markdown.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)].map((match, index) => ({
        code: match[1] ?? "",
        ordinal: index + 1,
        page,
      }));
    }),
  )
).flat();

describe(mermaid.parse, () => {
  test.each(diagrams)("$page diagram $ordinal parses", async ({ code }) => {
    expect.hasAssertions();

    await expect(mermaid.parse(code)).resolves.toBeTruthy();
  });
});

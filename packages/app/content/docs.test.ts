// @vitest-environment happy-dom
import mermaid from "mermaid";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const docsDirectory = join(import.meta.dirname, "docs");
const diagrams = (
  await Promise.all(
    (
      await Array.fromAsync(glob("**/*.md", { cwd: docsDirectory }))
    ).map(async (page) => {
      const markdown = await readFile(join(docsDirectory, page), "utf8");
      return [...markdown.matchAll(/```mermaid\r?\n(?<code>[\s\S]*?)```/gu)].map((match, index) => ({
        code: match.groups?.code ?? "",
        ordinal: index + 1,
        page,
      }));
    }),
  )
).flat();

describe(mermaid.parse, () => {
  test.each(diagrams)("$page diagram $ordinal parses", async ({ code }) => {
    expect.hasAssertions();

    await expect(mermaid.parse(code)).resolves.toBeDefined();
  });
});

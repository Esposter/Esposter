import { createRepositoryPathLinkifier } from "@/services/agentConsole/linkifyRepositoryPaths";
import { describe, expect, test } from "vitest";

describe(createRepositoryPathLinkifier, () => {
  const filePath = "src/index.ts";

  test("links exact file paths and escapes the rest of code text", () => {
    expect.hasAssertions();

    const { linkifyCode } = createRepositoryPathLinkifier([filePath]);
    expect(linkifyCode(`<tag> ${filePath}x ${filePath}`)).toBe(
      `&lt;tag&gt; ${filePath}x <a href="#agent-console-file">${filePath}</a>`,
    );
  });

  test("treats regular-expression punctuation in a repository path literally", () => {
    expect.hasAssertions();

    const path = "src/price+tax.ts";
    const { linkifyCode } = createRepositoryPathLinkifier([path]);
    expect(linkifyCode("src/pricetax.ts src/price+tax.ts")).toBe(
      `src/pricetax.ts <a href="#agent-console-file">${path}</a>`,
    );
  });

  test("does not link a path already inside a markdown link", () => {
    expect.hasAssertions();

    const { linkifyHtml } = createRepositoryPathLinkifier([filePath]);
    expect(linkifyHtml(`<a href="/docs">${filePath}</a><p>${filePath}</p>`)).toBe(
      `<a href="/docs">${filePath}</a><p><a href="#agent-console-file">${filePath}</a></p>`,
    );
  });

  test("leaves text unchanged when no session files are listed", () => {
    expect.hasAssertions();

    const { linkifyHtml } = createRepositoryPathLinkifier([]);
    expect(linkifyHtml(`<p>${filePath}</p>`)).toBe(`<p>${filePath}</p>`);
  });
});

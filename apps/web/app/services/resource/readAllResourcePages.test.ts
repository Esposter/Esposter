import type { Page } from "@esposter/db-schema";

import { readAllResourcePages } from "@/services/resource/readAllResourcePages";
import { describe, expect, test, vi } from "vitest";

describe(readAllResourcePages, () => {
  // Each page names the cursor the next one starts from, so the reads follow the chain to the page with no next cursor
  const pages = new Map([
    ["", { items: ["a"], nextCursor: " " }],
    [" ", { items: ["b"], nextCursor: "" }],
  ]);
  const readFromPages = (cursor: string) => Promise.resolve(pages.get(cursor) ?? { items: [], nextCursor: "" });

  test("reads every page in order, from the cursor each one answered", async () => {
    expect.hasAssertions();

    const readPage = vi.fn<(cursor: string) => Promise<Page<string>>>(readFromPages);

    await expect(readAllResourcePages(readPage)).resolves.toStrictEqual(["a", "b"]);
    expect(readPage.mock.calls.map(([cursor]) => cursor)).toStrictEqual(["", " "]);
  });

  // A cap ends the reads once the items reach it, so the page past it is never read
  test("stops reading once the items reach the cap", async () => {
    expect.hasAssertions();

    const readPage = vi.fn<(cursor: string) => Promise<Page<string>>>(readFromPages);

    await expect(readAllResourcePages(readPage, 1)).resolves.toStrictEqual(["a"]);
    expect(readPage.mock.calls.map(([cursor]) => cursor)).toStrictEqual([""]);
  });
});

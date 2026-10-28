import type { WikiImagesResponse } from "#src/models/genshinParity/WikiImagesResponse";

import { readWholeScreenImages } from "#src/services/genshinParity/shared/readWholeScreenImages";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readWholeScreenImages, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads every batch the continuation names, merging a page answered in two", async () => {
    expect.hasAssertions();

    const continuation = { continue: "gimcontinue||", gimcontinue: "2|Menu.png" };
    const responses: WikiImagesResponse[] = [
      { continue: continuation, query: { pages: { 1: { title: "File:Handbook.png" } } } },
      {
        query: {
          pages: {
            1: { imageinfo: [{ height: 1730, url: "https://wiki/handbook", width: 3130 }] },
            2: { imageinfo: [{ height: 1440, url: "https://wiki/menu", width: 2560 }], title: "File:Menu.png" },
          },
        },
      },
    ];
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    for (const response of responses) fetchSpy.mockResolvedValueOnce(Response.json(response));

    await expect(readWholeScreenImages("a")).resolves.toStrictEqual([
      { height: 1730, title: "File:Handbook.png", url: "https://wiki/handbook", width: 3130 },
      { height: 1440, title: "File:Menu.png", url: "https://wiki/menu", width: 2560 },
    ]);
    expect(fetchSpy.mock.calls[1]?.[0]).toContain(`&${new URLSearchParams(continuation)}`);
  });

  test("fails on a batch the API answers with an error, rather than returning the batches before it", async () => {
    expect.hasAssertions();

    const responses: WikiImagesResponse[] = [
      { continue: { gimcontinue: "2|Menu.png" }, query: { pages: { 1: { title: "File:Handbook.png" } } } },
      { error: { code: "badcontinue", info: "Invalid continue param." } },
    ];
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    for (const response of responses) fetchSpy.mockResolvedValueOnce(Response.json(response));

    await expect(readWholeScreenImages("a")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a, badcontinue: Invalid continue param.]`,
    );
  });
});

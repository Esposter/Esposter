import type { WikiImagesResponse } from "#src/models/genshinParity/WikiImagesResponse";

import { readWholeScreenImages } from "#src/services/genshinParity/shared/readWholeScreenImages";
import { WIKI_ORIGIN } from "genshin-persona/src/services/constants.ts";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readWholeScreenImages, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads every batch the continuation names, merging a page answered in two", async () => {
    expect.hasAssertions();

    const continuation = { continue: "gimcontinue||", gimcontinue: "2|b" };
    const responses: WikiImagesResponse[] = [
      { continue: continuation, query: { pages: { 1: { title: "a" } } } },
      {
        query: {
          pages: {
            1: { imageinfo: [{ height: 1730, url: "https://wiki/handbook", width: 3130 }] },
            2: { imageinfo: [{ height: 1440, url: "https://wiki/menu", width: 2560 }], title: "b" },
          },
        },
      },
    ];
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    for (const response of responses) fetchSpy.mockResolvedValueOnce(Response.json(response));

    await expect(readWholeScreenImages("a")).resolves.toStrictEqual([
      { height: 1730, title: "a", url: "https://wiki/handbook", width: 3130 },
      { height: 1440, title: "b", url: "https://wiki/menu", width: 2560 },
    ]);
    expect(fetchSpy.mock.calls[1]?.[0]).toBe(
      `${WIKI_ORIGIN}/api.php?action=query&generator=images&gimlimit=max&titles=a&prop=imageinfo&iiprop=size|url&format=json&continue=gimcontinue%7C%7C&gimcontinue=2%7Cb`,
    );
  });

  test("fails on a batch the API answers with an error, rather than returning the batches before it", async () => {
    expect.hasAssertions();

    const responses: WikiImagesResponse[] = [
      { continue: { gimcontinue: "2|b" }, query: { pages: { 1: { title: "a" } } } },
      { error: { code: "badcontinue", info: "Invalid continue param." } },
    ];
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    for (const response of responses) fetchSpy.mockResolvedValueOnce(Response.json(response));

    await expect(readWholeScreenImages("a")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a, badcontinue: Invalid continue param.]`,
    );
  });
});

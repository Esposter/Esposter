// @vitest-environment nuxt
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import ResourceWebpageView from "#src/components/Resource/Webpage/View.vue";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, describe, expect, test } from "vitest";

// The head entries the page sets, read by the robots meta each one carries rather than by the order unhead keeps them in
const readRobotsMetas = () => {
  const head = injectHead();
  assert.exists(head);
  return Array.from(head.entries.values(), ({ input }) => input)
    .flatMap((input) =>
      input && typeof input === "object" && "meta" in input && Array.isArray(input.meta) ? input.meta : [],
    )
    .filter((meta) => typeof meta === "object" && meta !== null && "name" in meta && meta.name === "robots");
};

describe("resourceWebpageView", () => {
  const { trpcMsw } = setupMswTrpc();
  const id = v7();
  const name = "";
  const mockPublishedWebpage = (content: WebpageEditor) => {
    trpcMsw.webpage.readPublishedResourceContent.query(() => ({ content, name }));
  };

  test("a page hidden from search tells crawlers not to list it", async () => {
    expect.hasAssertions();

    mockPublishedWebpage(new WebpageEditor({ isIndexable: false }));
    await mountSuspended(ResourceWebpageView, { props: { id } });
    await flushPromises();

    expect(readRobotsMetas()).toStrictEqual([{ content: "noindex", name: "robots" }]);
  });

  test("a page that is listed carries no robots directive", async () => {
    expect.hasAssertions();

    mockPublishedWebpage(new WebpageEditor({ isIndexable: true }));
    await mountSuspended(ResourceWebpageView, { props: { id } });
    await flushPromises();

    expect(readRobotsMetas()).toStrictEqual([]);
  });
});

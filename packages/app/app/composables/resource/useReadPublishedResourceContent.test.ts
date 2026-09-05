// @vitest-environment nuxt
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";

describe(useReadPublishedResourceContent, () => {
  const name = "name";

  // Derived once with the read rather than per view: a view that restates it and forgets unfurls the site name
  // Instead of the resource. The head entry is asserted rather than the rendered document because the nuxt
  // Test runtime never leaves the paused-DOM state a hydrating client starts in
  test("titles the page and the og unfurl with the name of the resource it read", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();
    await mountSuspended(
      defineComponent({
        async setup() {
          await useReadPublishedResourceContent(ResourceType.Note, id, () => Promise.resolve({ content: "", name }));
          return () => h("div");
        },
      }),
    );
    const head = injectHead();
    assert.exists(head);
    // An entry's input widens to everything unhead accepts — a ref, a computed, a getter, or `false` — so the
    // Head entry is picked by the key it carries rather than by reading through that union
    const seoMetaInput = [...head.entries.values()]
      .map(({ input }) => input)
      .find((input) => input && typeof input === "object" && "title" in input);
    assert.exists(seoMetaInput);

    expect(seoMetaInput).toStrictEqual({
      meta: [{ content: name, property: "og:title" }],
      title: name,
    });
  });
});

import UiEmptyState from "@/components/Ui/EmptyState.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { render } from "@nuxt/test-utils/browser";
import { describe, expect, test } from "vitest";

describe("UiEmptyState", () => {
  test("an empty state lays out its title in the browser", async () => {
    expect.hasAssertions();

    const screen = await render(UiEmptyState, { props: { meaning: UiIconMeaning.Create, title: "Nothing here" } });

    expect(screen.getByText("Nothing here").element().getBoundingClientRect().width).toBeGreaterThan(0);
  });
});

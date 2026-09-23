// @vitest-environment nuxt
import ErrorPage from "@/error.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

// The two states are the whole component: a route that never existed, and a failure that might not repeat. What
// Separates them is which way back is offered, so that is what these assert rather than the copy around it
const mountErrorPage = (statusCode: number, statusMessage: string) =>
  mountSuspended(ErrorPage, { props: { error: createError({ statusCode, statusMessage }) } });

describe("errorPage", () => {
  test("offers a missing page only the way home", async () => {
    expect.hasAssertions();

    const wrapper = await mountErrorPage(404, "Page Not Found");

    expect(wrapper.text()).toMatchInlineSnapshot(
      `"Page not foundNothing lives at this address. It may have moved, or it was never here. Go home"`,
    );
  });

  test("offers a failure the retry that often works", async () => {
    expect.hasAssertions();

    const wrapper = await mountErrorPage(500, "Server Error");

    expect(wrapper.text()).toMatchInlineSnapshot(`"Something went wrongServer Error Try again  Go home"`);
  });
});

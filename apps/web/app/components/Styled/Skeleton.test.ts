// @vitest-environment nuxt
import StyledSkeleton from "@/components/Styled/Skeleton.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledSkeleton", () => {
  // `v-card` declares `border-style: solid` for its own `b-1`, `v-skeleton-loader` declares nothing — so a
  // Width alone applies against the initial `none` and every bordered skeleton renders borderless
  test("declares a border style alongside the border width", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledSkeleton);

    expect(component.get(".v-skeleton-loader").attributes()).toHaveProperty("b-solid");
  });
});

// @vitest-environment nuxt
import type { Card } from "@/models/visual/Card";

import VisualCardCarousel from "@/components/Visual/Card/Carousel.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const DURATION = 1000;
const cards: Card[] = [{ text: "a" }, { text: "b" }, { text: "c" }];

// The cards are the root's children in the order given, so each card's classes are read where it sits
const mountCarousel = () => mountSuspended(VisualCardCarousel, { props: { cards, duration: DURATION } });

describe("carousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("the first card is the one that moves first", async () => {
    expect.hasAssertions();

    const component = await mountCarousel();
    const [first, second] = Array.from((component.element as HTMLElement).children);

    expect(first?.classList).toContain("active-card");
    expect(second?.classList).not.toContain("active-card");
  });

  // Each step moves the stack on, so the card after the first takes its turn once a duration has passed
  test("the next card takes its turn after a duration", async () => {
    expect.hasAssertions();

    const component = await mountCarousel();
    vi.advanceTimersByTime(DURATION);
    await flushPromises();
    const [first, second] = Array.from((component.element as HTMLElement).children);

    expect(second?.classList).toContain("active-card");
    expect(first?.classList).toContain("inactive-card");
  });
});

// @vitest-environment happy-dom
import { RECENT_PAGES_STORED_LIMIT } from "@/services/app/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useRecentPageStore } from "@/store/recentPage";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useRecentPageStore, () => {
  const path = "";
  const title = "title";

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    useLocalStorage(LocalStorageKey.RecentPages, []).value = [];
  });

  test("ranks a page visited often above one visited once", () => {
    expect.hasAssertions();

    const recentPageStore = useRecentPageStore();
    const { rankedRecentPages } = storeToRefs(recentPageStore);
    const { visitPage } = recentPageStore;
    visitPage(path);
    visitPage(path);
    visitPage(`${path}1`);

    expect(rankedRecentPages.value.map((recentPage) => [recentPage.path, recentPage.visitCount])).toStrictEqual([
      [path, 2],
      [`${path}1`, 1],
    ]);
  });

  test("ranks a page visited long ago below one visited once this week", () => {
    expect.hasAssertions();

    const recentPageStore = useRecentPageStore();
    const { rankedRecentPages } = storeToRefs(recentPageStore);
    const { visitPage } = recentPageStore;
    visitPage(path);
    visitPage(path);
    vi.setSystemTime(Temporal.Duration.from({ days: 91 }).total("milliseconds"));
    visitPage(`${path}1`);

    expect(rankedRecentPages.value.map((recentPage) => recentPage.path)).toStrictEqual([`${path}1`, path]);
  });

  test("keeps the title across visits and writes a new one", () => {
    expect.hasAssertions();

    const recentPageStore = useRecentPageStore();
    const { rankedRecentPages } = storeToRefs(recentPageStore);
    const { setPageTitle, visitPage } = recentPageStore;
    visitPage(path);
    setPageTitle(path, title);
    visitPage(path);

    expect(rankedRecentPages.value.map((recentPage) => recentPage.title)).toStrictEqual([title]);
  });

  test("drops the lowest-ranked page once the list is full", () => {
    expect.hasAssertions();

    const recentPageStore = useRecentPageStore();
    const { rankedRecentPages } = storeToRefs(recentPageStore);
    const { visitPage } = recentPageStore;
    visitPage(path);
    for (const index of Array.from({ length: RECENT_PAGES_STORED_LIMIT }).keys()) {
      visitPage(`${path}${index}`);
      visitPage(`${path}${index}`);
    }

    expect(rankedRecentPages.value).toHaveLength(RECENT_PAGES_STORED_LIMIT);
    expect(rankedRecentPages.value.some((recentPage) => recentPage.path === path)).toBe(false);
  });
});

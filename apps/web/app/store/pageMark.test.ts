import { PageMarkType } from "#shared/models/app/PageMarkType";
import { usePageMarkStore } from "@/store/pageMark";
import { ResourceType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePageMarkStore, () => {
  const path = "";
  const mark = { resourceType: ResourceType.Blueprint, type: PageMarkType.Resource };
  const newMark = { resourceType: ResourceType.Dashboard, type: PageMarkType.Resource };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("reads the mark of the page at the path mounted last, and the one before once it leaves", () => {
    expect.hasAssertions();

    const pageMarkStore = usePageMarkStore();
    const { getPageMark, registerPageMark } = pageMarkStore;
    registerPageMark(() => ({ mark, path }));
    const unregisterPageMark = registerPageMark(() => ({ mark: newMark, path }));
    registerPageMark(() => ({ mark, path: " " }));
    const pageMark = getPageMark(path);
    unregisterPageMark();

    expect(pageMark).toStrictEqual(newMark);
    expect(getPageMark(path)).toStrictEqual(mark);
  });
});

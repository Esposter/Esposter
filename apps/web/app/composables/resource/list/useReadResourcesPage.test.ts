// @vitest-environment nuxt
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceListPage } from "#shared/models/resource/ResourceListPage";
import type { ReadResourcesOptions } from "#src/models/resource/list/ReadResourcesOptions";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useReadResourcesPage } from "#src/composables/resource/list/useReadResourcesPage";
import { createEmptyPage, SortOrder } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

const createOptions = (page: number, sortBy: ReadResourcesOptions["sortBy"] = []): ReadResourcesOptions => ({
  itemsPerPage: 1,
  page,
  sortBy,
});

describe(useReadResourcesPage, () => {
  const SECOND_CURSOR = " ";
  const THIRD_CURSOR = "a";
  const FOURTH_CURSOR = "b";
  const TOTAL = 4;
  const [first, second, third, fourth] = [
    createResourceListItem(),
    createResourceListItem(),
    createResourceListItem(),
    createResourceListItem(),
  ];
  // Four pages, each naming the cursor of the next, and the first answering the total
  const pages = new Map<string, ResourceListPage>([
    ["", { count: TOTAL, items: [first], nextCursor: SECOND_CURSOR }],
    [FOURTH_CURSOR, { items: [fourth], nextCursor: "" }],
    [SECOND_CURSOR, { items: [second], nextCursor: THIRD_CURSOR }],
    [THIRD_CURSOR, { items: [third], nextCursor: FOURTH_CURSOR }],
  ]);
  const readFromPages = (cursor: string) => Promise.resolve(pages.get(cursor) ?? createEmptyPage<ResourceListItem>());

  // The bin pages quickly, or a Refresh lands while a page read is in flight: the slower earlier response arriving
  // Last would leave the table showing page 1 while the pager reads page 2, and a purge issued from that row would
  // Destroy a resource the user never picked
  test("drops a stale response instead of overwriting fresher rows", async () => {
    expect.hasAssertions();

    let resolveSlowFirstPage: ((page: ResourceListPage) => void) | undefined;
    let isSlow = true;
    const { isPending, items, read } = useReadResourcesPage({
      getFilterInput: () => undefined,
      getFilterKey: () => "",
      readPage: (cursor, _filterInput, options) => {
        if (options.page === 1 && isSlow) {
          isSlow = false;
          return new Promise<ResourceListPage>((resolve) => {
            resolveSlowFirstPage = resolve;
          });
        }
        return readFromPages(cursor);
      },
    });
    const slowRead = read(createOptions(1));
    await read(createOptions(2));
    resolveSlowFirstPage?.({ count: TOTAL, items: [first], nextCursor: SECOND_CURSOR });
    await slowRead;

    expect(items.value).toStrictEqual([second]);
    expect(isPending.value).toBe(false);
  });

  // The total arrives with the first page, and a page change within one filter walks to its cursor without counting again
  test("takes the total from the first page and reuses it for a page change", async () => {
    expect.hasAssertions();

    const readPage = vi.fn<typeof readFromPages>(readFromPages);
    const { count, read } = useReadResourcesPage({ getFilterInput: () => undefined, getFilterKey: () => "", readPage });
    await read(createOptions(1));
    await read(createOptions(2));

    expect(count.value).toBe(TOTAL);
    expect(readPage.mock.calls.map(([cursor]) => cursor)).toStrictEqual(["", SECOND_CURSOR]);
  });

  // A page's cursor is known only from the page before it, so a deep link to a later page reads forward to it
  test("walks forward from the first page to a page no cursor is known for", async () => {
    expect.hasAssertions();

    const readPage = vi.fn<typeof readFromPages>(readFromPages);
    const { items, read } = useReadResourcesPage({ getFilterInput: () => undefined, getFilterKey: () => "", readPage });
    await read(createOptions(3));

    expect(items.value).toStrictEqual([third]);
    expect(readPage.mock.calls.map(([cursor]) => cursor)).toStrictEqual(["", SECOND_CURSOR, THIRD_CURSOR]);
  });

  // Overlapping reads walk the same cursor, and pushing it from each would shift every later page back by one
  test("shows the requested page when overlapping reads walk the same cursor", async () => {
    expect.hasAssertions();

    const { items, read } = useReadResourcesPage({
      getFilterInput: () => undefined,
      getFilterKey: () => "",
      readPage: readFromPages,
    });
    await Promise.all([read(createOptions(3)), read(createOptions(4))]);

    expect(items.value).toStrictEqual([fourth]);
  });

  // A sort change starts the cursors over, since a cursor is a position in the order it was read under
  test("starts the cursors over when the sort changes", async () => {
    expect.hasAssertions();

    const readPage = vi.fn<typeof readFromPages>(readFromPages);
    const { read } = useReadResourcesPage({ getFilterInput: () => undefined, getFilterKey: () => "", readPage });
    await read(createOptions(2));
    readPage.mockClear();
    await read(createOptions(2, [{ key: "name", order: SortOrder.Asc }]));

    expect(readPage.mock.calls.map(([cursor]) => cursor)).toStrictEqual(["", SECOND_CURSOR]);
  });

  test("shows no rows past the last page, beside the total", async () => {
    expect.hasAssertions();

    const { count, items, read } = useReadResourcesPage({
      getFilterInput: () => undefined,
      getFilterKey: () => "",
      readPage: vi.fn<typeof readFromPages>(readFromPages),
    });
    await read(createOptions(TOTAL + 1));

    expect(items.value).toStrictEqual([]);
    expect(count.value).toBe(TOTAL);
  });

  // A relative Updated preset anchors its boundary to the current time, so resolving the filter once per read keeps
  // Every page of the read over one window
  test("hands one resolved filter input to every page of a read", async () => {
    expect.hasAssertions();

    let resolveCount = 0;
    const readPage = vi.fn<
      (cursor: string, filterInput: number, options: ReadResourcesOptions) => Promise<ResourceListPage>
    >((cursor) => readFromPages(cursor));
    const { read } = useReadResourcesPage({ getFilterInput: () => resolveCount++, getFilterKey: () => "", readPage });
    await read(createOptions(3));

    expect(readPage.mock.calls.map(([, filterInput]) => filterInput)).toStrictEqual([0, 0, 0]);
  });

  // A delete, restore or purge moves the total behind an unchanged filter
  test("counts again on a refresh", async () => {
    expect.hasAssertions();

    const readPage = vi.fn<typeof readFromPages>(readFromPages);
    const { read, refresh } = useReadResourcesPage({
      getFilterInput: () => undefined,
      getFilterKey: () => "",
      readPage,
    });
    await read(createOptions(1));
    readPage.mockClear();
    await refresh();

    expect(readPage.mock.calls.map(([cursor]) => cursor)).toStrictEqual([""]);
  });

  test("counts again when the filter changes", async () => {
    expect.hasAssertions();

    const filterKey = ref("");
    const readPage = vi.fn<typeof readFromPages>(readFromPages);
    const { read } = useReadResourcesPage({
      getFilterInput: () => undefined,
      getFilterKey: () => filterKey.value,
      readPage,
    });
    await read(createOptions(1));
    readPage.mockClear();
    filterKey.value = " ";
    await read(createOptions(1));

    expect(readPage.mock.calls.map(([cursor]) => cursor)).toStrictEqual([""]);
  });

  test("clears the rows and the total after a failed read, then reads them again", async () => {
    expect.hasAssertions();

    const message = "message";
    let isFailing = true;
    const { count, error, items, read } = useReadResourcesPage({
      getFilterInput: () => undefined,
      getFilterKey: () => "",
      readPage: (cursor) => (isFailing ? Promise.reject(new Error(message)) : readFromPages(cursor)),
    });
    await read(createOptions(1));

    expect(items.value).toStrictEqual([]);
    expect(count.value).toBe(0);
    expect(error.value).toBe(message);

    isFailing = false;
    await read(createOptions(1));

    expect(items.value).toStrictEqual([first]);
    expect(count.value).toBe(TOTAL);
  });
});

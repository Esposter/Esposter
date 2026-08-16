import { ContentCollection } from "#shared/models/content/ContentCollection";
import { DocsCollectionItemPropertyNames } from "@/models/docs/DocsCollectionItemPropertyNames";
import { getFlattenedNavigationPages } from "@/services/docs/getFlattenedNavigationPages";
import { getSectionCategory } from "@/services/docs/getSectionCategory";
import { getSortedNavigationItems } from "@/services/docs/getSortedNavigationItems";
import { getSurroundingPages } from "@/services/docs/getSurroundingPages";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { RoutePath } from "@esposter/shared";

export const useDocsPage = async () => {
  const { currentRoute } = useRouter();
  // Reactive so doc→doc navigation refetches in place instead of hard-remounting the page (which felt like a full reload)
  const path = computed(() =>
    currentRoute.value.path.endsWith("/") ? currentRoute.value.path.slice(0, -1) : currentRoute.value.path,
  );
  const [{ data: page }, { data: navigation }] = await Promise.all([
    useAsyncData(
      computed(() => AsyncDataKey.DocsPage(path.value)),
      () => queryCollection(ContentCollection.Docs).path(path.value).first(),
      {
        watch: [path],
      },
    ),
    useAsyncData(AsyncDataKey.DocsNavigation, () =>
      queryCollectionNavigation(ContentCollection.Docs, [DocsCollectionItemPropertyNames.description]),
    ),
  ]);

  if (!page.value) throw createError({ fatal: true, statusCode: 404, statusMessage: "Page Not Found" });
  // Unwrap the single docs root group; drop the root index page @nuxt/content injects as its own child
  const sections = computed(() =>
    getSortedNavigationItems(
      navigation.value?.find(({ path: itemPath }) => itemPath === RoutePath.Docs)?.children ?? navigation.value ?? [],
    ).filter(({ path: itemPath }) => itemPath !== RoutePath.Docs),
  );
  const section = computed(() =>
    sections.value.find(
      ({ path: sectionPath }) => path.value === sectionPath || path.value.startsWith(`${sectionPath}/`),
    ),
  );
  const category = computed(() => (section.value ? getSectionCategory(section.value.path) : undefined));
  const categorySections = computed(() =>
    category.value
      ? sections.value.filter(({ path: sectionPath }) => getSectionCategory(sectionPath) === category.value)
      : [],
  );
  // The page is reused across doc→doc navigation, so a later refetch that finds nothing has to raise the 404
  // Itself — the setup guard above only ever runs for the first page
  watch(page, (newPage) => {
    if (!newPage) showError({ fatal: true, statusCode: 404, statusMessage: "Page Not Found" });
  });

  return {
    category,
    categorySections,
    page,
    sections,
    // Surround walks the same sorted+grouped order as the sidebar, not the collection's path order
    surround: computed(() => getSurroundingPages(getFlattenedNavigationPages(categorySections.value), path.value)),
    tocLinks: computed(() => page.value?.body.toc?.links ?? []),
  };
};

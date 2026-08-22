import { ContentCollection } from "#shared/models/content/ContentCollection";
import { DocsCollectionItemPropertyNames } from "@/models/docs/DocsCollectionItemPropertyNames";
import { getFlattenedNavigationPages } from "@/services/docs/getFlattenedNavigationPages";
import { getSectionCategory } from "@/services/docs/getSectionCategory";
import { getSortedNavigationItems } from "@/services/docs/getSortedNavigationItems";
import { getSurroundingPages } from "@/services/docs/getSurroundingPages";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { RoutePath } from "@esposter/shared";
// The route file keys this page by its path, so setup runs once per page and the path never moves underneath it.
// That is what lets a missing page be the framework's own 404 — one throw, during setup, the shape every other
// Nuxt page uses — rather than something watching for a null it then has to tell apart from a fetch in flight
export const useDocsPage = async () => {
  const { currentRoute } = useRouter();
  // Read once rather than tracked: the page is keyed by this path, so a different one is a different instance
  const routePath = currentRoute.value.path;
  const path = routePath.endsWith("/") ? routePath.slice(0, -1) : routePath;
  const [{ data: page }, { data: navigation }] = await Promise.all([
    useAsyncData(AsyncDataKey.DocsPage(path), () => queryCollection(ContentCollection.Docs).path(path).first()),
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
    sections.value.find(({ path: sectionPath }) => path === sectionPath || path.startsWith(`${sectionPath}/`)),
  );
  const category = computed(() => (section.value ? getSectionCategory(section.value.path) : undefined));
  const categorySections = computed(() =>
    category.value
      ? sections.value.filter(({ path: sectionPath }) => getSectionCategory(sectionPath) === category.value)
      : [],
  );
  return {
    category,
    categorySections,
    page,
    sections,
    // Surround walks the same sorted+grouped order as the sidebar, not the collection's path order
    surround: computed(() => getSurroundingPages(getFlattenedNavigationPages(categorySections.value), path)),
    tocLinks: computed(() => page.value?.body.toc?.links ?? []),
  };
};

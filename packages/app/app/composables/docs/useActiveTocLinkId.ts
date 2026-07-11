import type { TocLink } from "@nuxt/content";
import type { MaybeRefOrGetter } from "vue";

const getTocLinkIds = (links: TocLink[]): string[] =>
  links.flatMap((link) => [link.id, ...(link.children ? getTocLinkIds(link.children) : [])]);

export const useActiveTocLinkId = (links: MaybeRefOrGetter<TocLink[]>) => {
  const activeId = ref("");
  let observer: IntersectionObserver | undefined;

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) activeId.value = entry.target.id;
      },
      // Track the heading crossing the upper quarter of the viewport
      { rootMargin: "0% 0% -75% 0%" },
    );

    for (const id of getTocLinkIds(toValue(links))) {
      const heading = window.document.getElementById(id);
      if (heading) observer.observe(heading);
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return activeId;
};

import type { Ref } from "vue";

import { useResizeObserver } from "@vueuse/core";

// The scroll thumb's share of its track and how far down the track it stands, from a scroller's scroll as it stands,
// And re-read whenever the content it scrolls over resizes. A scroller laid out in reverse scrolls from its end, so its
// Top reads the negative of the range and its end 0, and the thumb starts at the track's foot
export const useScrollThumb = (
  scroller: Readonly<Ref<HTMLElement | null>>,
  content: Readonly<Ref<HTMLElement | null>>,
  { isReversed = false }: { isReversed?: boolean } = {},
) => {
  const scrollThumb = shallowRef({ offset: isReversed ? 1 : 0, share: 1 });
  const updateScrollThumb = () => {
    if (!scroller.value) return;
    const { clientHeight, scrollHeight, scrollTop } = scroller.value;
    const scrollRange = scrollHeight - clientHeight;
    const progress = scrollRange > 0 ? scrollTop / scrollRange : 0;
    scrollThumb.value = {
      offset: isReversed ? 1 + progress : progress,
      share: Math.min(clientHeight / scrollHeight, 1),
    };
  };

  useResizeObserver(content, updateScrollThumb);
  return { scrollThumb, updateScrollThumb };
};

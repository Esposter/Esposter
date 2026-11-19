import {
  NON_DRAWING_TAGS,
  TEMPLATE_TAG_REGEX,
  TOP_LEVEL_TEMPLATE_REGEX,
} from "#src/services/genshinParity/componentReference/constants";

// A component draws something of its own when its template opens a native element, one that is not Vue's template, slot
// Or dynamic component. A component that only mounts other components draws nothing itself: each one it mounts is held
// On its own, so the composition is never exempted past its children
export const checkIsDrawn = (source: string): boolean => {
  const template = TOP_LEVEL_TEMPLATE_REGEX.exec(source)?.groups?.body ?? "";
  return Array.from(template.matchAll(TEMPLATE_TAG_REGEX), ({ groups }) => groups?.tag ?? "").some(
    (tag) => !NON_DRAWING_TAGS.has(tag),
  );
};

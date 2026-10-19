import type { z } from "zod";

// A component that takes alternative text needs one, or to be decorative, so a node with neither is refused at its alt
export const checkMjmlAlternativeText = (
  props: { alt?: string; decorative?: boolean },
  context: z.RefinementCtx,
): void => {
  if (!(props.alt || props.decorative))
    context.addIssue({ code: "custom", message: "needs an alternative text or to be decorative", path: ["alt"] });
};

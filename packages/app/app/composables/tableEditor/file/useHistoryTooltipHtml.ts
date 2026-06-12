import { sanitizeHtml } from "@esposter/shared";
import { marked } from "marked";

export const useHistoryTooltipHtml = (
  description: MaybeRefOrGetter<string | undefined>,
  verb: string,
  shortcut: string,
) =>
  computed(() => {
    const [title, ...rest] = (toValue(description) ?? "").split("\n\n");
    const parts = [`${verb}: ${title} *(${shortcut})*`, ...rest];
    return sanitizeHtml(marked.parse(parts.join("\n\n"), { async: false }));
  });

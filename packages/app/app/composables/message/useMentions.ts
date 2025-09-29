import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { parse } from "node-html-parser";

export const useMentions = (message: ReadonlyRefOrGetter<string>) =>
  computed(() => {
    const messageHtml = parse(toValue(message));
    return messageHtml.querySelectorAll("span[data-type='mention']");
  });

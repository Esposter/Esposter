import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { getMentions } from "@esposter/shared";

export const useMentions = (message: ReadonlyRefOrGetter<string>) => computed(() => getMentions(toValue(message)));

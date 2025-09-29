import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { getMentions } from "#shared/services/message/getMentions";

export const useMentions = (message: ReadonlyRefOrGetter<string>) => computed(() => getMentions(toValue(message)));

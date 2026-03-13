
import { getMentions } from "@esposter/shared";

export const useMentions = (message: MaybeRefOrGetter<string>) => computed(() => getMentions(toValue(message)));

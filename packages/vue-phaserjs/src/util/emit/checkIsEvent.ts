import { EVENT_PREFIX } from "#src/util/emit/constants";

export const checkIsEvent = (property: string) => property.startsWith(EVENT_PREFIX);

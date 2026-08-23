import { EVENT_PREFIX } from "#src/util/emit/constants";

export const isEvent = (property: string) => property.startsWith(EVENT_PREFIX);

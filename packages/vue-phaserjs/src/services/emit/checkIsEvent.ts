import { EVENT_PREFIX } from "#src/services/emit/constants";

export const checkIsEvent = (property: string) => property.startsWith(EVENT_PREFIX);

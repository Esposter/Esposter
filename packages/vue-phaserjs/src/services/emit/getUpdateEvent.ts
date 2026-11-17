import type { UpdateEvent } from "#src/models/emit/UpdateEvent";

export const getUpdateEvent = <T extends string>(property: T): UpdateEvent<T> => `update:${property}`;

import { type UpdateEvent } from "@/util/types/UpdateEvent";

export const getUpdateEvent = <T extends string>(property: T): UpdateEvent<T> => `update:${property}`;

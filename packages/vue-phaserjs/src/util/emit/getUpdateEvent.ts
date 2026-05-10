import type { UpdateEvent } from "@/util/types/UpdateEvent";
import type { KebabCase } from "type-fest";

import { toKebabCase } from "@esposter/shared";

export const getUpdateEvent = <T extends string>(property: T): UpdateEvent<KebabCase<T>> =>
  `update:${toKebabCase(property)}` as UpdateEvent<KebabCase<T>>;

import { toKebabCase } from "@/util/text/toKebabCase";
import type { CamelToKebab } from "@/util/types/CamelToKebab";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export const getUpdateEvent = <T extends string>(property: T): UpdateEvent<CamelToKebab<T>> =>
  `update:${toKebabCase(property)}`;

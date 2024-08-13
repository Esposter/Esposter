import type { CamelToKebab } from "@/util/types/CamelToKebab";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

import { toKebabCase } from "@/util/text/toKebabCase";

export const getUpdateEvent = <T extends string>(property: T): UpdateEvent<CamelToKebab<T>> =>
  `update:${toKebabCase(property)}`;

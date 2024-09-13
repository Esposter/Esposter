import type { CamelToKebab } from "@/utils/types/CamelToKebab";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

import { toKebabCase } from "@/utils/text/toKebabCase";

export const getUpdateEvent = <T extends string>(property: T): UpdateEvent<CamelToKebab<T>> =>
  `update:${toKebabCase(property)}`;

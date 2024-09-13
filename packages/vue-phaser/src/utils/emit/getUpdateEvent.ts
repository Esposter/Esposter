import type { UpdateEvent } from "@/utils/types/UpdateEvent";
import type { CamelToKebab } from "@esposter/shared";

import { toKebabCase } from "@esposter/shared";

export const getUpdateEvent = <T extends string>(property: T): UpdateEvent<CamelToKebab<T>> =>
  `update:${toKebabCase(property)}`;

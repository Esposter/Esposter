import type { KebabCasedPropertiesDeep } from "type-fest";
import * as components from "vuetify/components";

export const VuetifyComponentType = Object.keys(components).reduce<Record<string, string>>((acc, curr) => {
  const newComponentName = toKebabCase(curr);
  acc[newComponentName] = newComponentName;
  return acc;
  // eslint-disable-next-line no-use-before-define
}, {}) as { [P in keyof KebabCasedPropertiesDeep<typeof components>]: P };
export type VuetifyComponentType = typeof VuetifyComponentType;

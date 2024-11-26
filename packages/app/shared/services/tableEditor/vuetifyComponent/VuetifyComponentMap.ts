import type { KebabCasedPropertiesDeep } from "type-fest";

import { toKebabCase } from "@esposter/shared";
import * as components from "vuetify/components";

export type VuetifyComponentMap = {
  [P in keyof KebabCasedPropertiesDeepVuetifyComponents]: KebabCasedPropertiesDeepVuetifyComponents[P];
};
type KebabCasedPropertiesDeepVuetifyComponents = KebabCasedPropertiesDeep<typeof components>;

export const VuetifyComponentMap = Object.entries(components).reduce<Record<string, Component>>(
  (acc, [name, component]) => {
    acc[toKebabCase(name)] = component;
    return acc;
  },
  {},
) as VuetifyComponentMap;

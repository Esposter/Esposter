import { KebabCasedPropertiesDeep } from "type-fest";
import * as components from "vuetify/components";

type KebabCasedPropertiesDeepVuetifyComponents = KebabCasedPropertiesDeep<typeof components>;
export type VuetifyComponentMap = {
  [P in keyof KebabCasedPropertiesDeepVuetifyComponents]: KebabCasedPropertiesDeepVuetifyComponents[P];
};

export const VuetifyComponentMap = Object.entries(components).reduce<Record<string, Component>>(
  (acc, [name, component]) => {
    acc[toKebabCase(name)] = component;
    return acc;
  },
  {}
) as VuetifyComponentMap;

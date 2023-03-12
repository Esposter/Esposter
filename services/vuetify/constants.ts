import { KebabCasedPropertiesDeep } from "type-fest";
import * as components from "vuetify/components";

export const THEME_COOKIE_NAME = "theme";

type KebabCasedPropertiesDeepVuetifyComponents = KebabCasedPropertiesDeep<typeof components>;
export type VuetifyComponentMap = {
  [P in keyof KebabCasedPropertiesDeepVuetifyComponents]: KebabCasedPropertiesDeepVuetifyComponents[P];
};

let VuetifyComponentMapCache: VuetifyComponentMap | undefined;
export const VuetifyComponentMap = (() => {
  if (VuetifyComponentMapCache) return VuetifyComponentMapCache;

  VuetifyComponentMapCache = Object.entries(components).reduce<Record<string, Component>>((acc, [name, component]) => {
    acc[toKebabCase(name)] = component;
    return acc;
  }, {}) as VuetifyComponentMap;
  return VuetifyComponentMapCache;
})();

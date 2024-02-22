import { toKebabCase } from "@/util/text/toKebabCase";
import type { KebabCasedPropertiesDeep } from "type-fest";
import * as components from "vuetify/components";

type KebabCasedPropertiesDeepVuetifyComponents = KebabCasedPropertiesDeep<typeof components>;
export type VuetifyComponentMap = {
  [Property in keyof KebabCasedPropertiesDeepVuetifyComponents]: KebabCasedPropertiesDeepVuetifyComponents[Property];
};

export const VuetifyComponentMap = Object.entries(components).reduce<Record<string, Component>>(
  (acc, [name, component]) => {
    acc[toKebabCase(name)] = component;
    return acc;
  },
  {},
) as VuetifyComponentMap;

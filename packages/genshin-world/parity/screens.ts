import type { ScreenFixture } from "#parity/models/ScreenFixture";
import type { Component } from "vue";

import * as barrel from "#src/components/index";

// Every component that has a fixture, found at any depth, so a screen is on the parity page and in the visual suite by
// Having one: each component is a folder, its `Index.vue` beside the `Index.fixture.ts` whose `props` it renders with,
// And it is named as the package's own barrel exports it, so a screen's name is the one its consumers import it by.
// `directory` is its folder, where its approved images are kept
const components = import.meta.glob<Component>("/src/components/**/Index.vue", { eager: true, import: "default" });
const fixtures = import.meta.glob<ScreenFixture>("/src/components/**/Index.fixture.ts", { eager: true });
const COMPONENTS_PREFIX = "/src/components/";
const FIXTURE_FILE = "/Index.fixture.ts";
const exportedComponents = Object.entries(barrel);

export const screens: (ScreenFixture & { component: Component; directory: string; name: string })[] = Object.entries(
  fixtures,
).flatMap(([path, { isMotionOnly, motionProps, props, readyEvent, variants, witnessFamilies }]) => {
  const component = components[path.replace(/\.fixture\.ts$/u, ".vue")];
  const name = exportedComponents.find(([, exported]) => exported === component)?.[0];
  if (!component || !name) return [];
  const directory = path.slice(COMPONENTS_PREFIX.length, -FIXTURE_FILE.length);
  return [{ component, directory, isMotionOnly, motionProps, name, props, readyEvent, variants, witnessFamilies }];
});

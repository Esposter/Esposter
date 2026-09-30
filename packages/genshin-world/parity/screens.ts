import type { Component } from "vue";

import * as barrel from "#src/components/index";

interface Fixture {
  // A screen that is only a motion, such as a sequence of screens each with its own fixture, is shot on the page but
  // Kept out of the visual suite, whose screenshot finishes running animations and so races through it
  isMotionOnly?: boolean;
  // Props applied after the first frame, so a transition they start plays and can be shot at a known time
  motionProps?: Record<string, unknown>;
  props: Record<string, unknown>;
  // The event a screen emits once it has drawn, for one that draws later than it mounts (a 3D scene compiling its
  // Pipelines), which the page and the suite wait on before a shot
  readyEvent?: string;
  // Other states the screen is approved in, each its props over `props` by a name its image is kept under
  variants?: Record<string, Record<string, unknown>>;
}

// Every component that has a fixture, found at any depth, so a screen is on the parity page and in the visual suite by
// Having one: each component is a folder, its `Index.vue` beside the `Index.fixture.ts` whose `props` it renders with,
// And it is named as the package's own barrel exports it, so a screen's name is the one its consumers import it by.
// `directory` is its folder, where its approved images are kept
const components = import.meta.glob<Component>("/src/components/**/Index.vue", { eager: true, import: "default" });
const fixtures = import.meta.glob<Fixture>("/src/components/**/Index.fixture.ts", { eager: true });
const COMPONENTS_PREFIX = "/src/components/";
const FIXTURE_FILE = "/Index.fixture.ts";
const exportedComponents = Object.entries(barrel);

export const screens: (Fixture & { component: Component; directory: string; name: string })[] = Object.entries(
  fixtures,
).flatMap(([path, { isMotionOnly, motionProps, props, readyEvent, variants }]) => {
  const component = components[path.replace(/\.fixture\.ts$/u, ".vue")];
  const name = exportedComponents.find(([, exported]) => exported === component)?.[0];
  if (!component || !name) return [];
  const directory = path.slice(COMPONENTS_PREFIX.length, -FIXTURE_FILE.length);
  return [{ component, directory, isMotionOnly, motionProps, name, props, readyEvent, variants }];
});

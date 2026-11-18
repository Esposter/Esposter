import type { ScreenFixture } from "#parity/models/ScreenFixture";
import type { Component } from "vue";

import * as barrel from "#src/components/index";

// Every component that has a fixture, found at any depth, so a screen is on the parity page and in the visual suite by
// Having one: each component is a folder, its `Index.vue` beside the `Index.fixture.ts` whose `props` it renders with,
// And it is named as the package's own barrel exports it, so a screen's name is the one its consumers import it by.
// `directory` is its folder, where its images are kept
const components = import.meta.glob<Component>("/src/components/**/Index.vue", { eager: true, import: "default" });
// A fixture is imported only when its screen is asked for: its top-level awaits read the game data its screen draws
// With, so an eager import would fetch every screen's data on every page, the other screens' included
const fixtureLoaders = import.meta.glob<ScreenFixture>("/src/components/**/Index.fixture.ts");
const COMPONENTS_PREFIX = "/src/components/";
const FIXTURE_FILE = "/Index.fixture.ts";
const exportedComponents = Object.entries(barrel);

const screenEntries = Object.keys(fixtureLoaders).flatMap((path) => {
  const component = components[path.replace(/\.fixture\.ts$/u, ".vue")];
  const name = exportedComponents.find(([, exported]) => exported === component)?.[0];
  if (!component || !name) return [];
  const directory = path.slice(COMPONENTS_PREFIX.length, -FIXTURE_FILE.length);
  const loadFixture = fixtureLoaders[path];
  return loadFixture ? [{ component, directory, loadFixture, name }] : [];
});

const loadEntry = async ({
  component,
  directory,
  loadFixture,
  name,
}: {
  component: Component;
  directory: string;
  loadFixture: () => Promise<ScreenFixture>;
  name: string;
}): Promise<ScreenFixture & { component: Component; directory: string; name: string }> => ({
  ...(await loadFixture()),
  component,
  directory,
  name,
});

// The names of the screens on the parity page, which its index lists them by
export const screenNames: string[] = screenEntries.map(({ name }) => name);

// The screen a name draws, with its fixture imported, or nothing when no screen has that name
export const loadScreen = async (name: string | null) => {
  const entry = screenEntries.find((candidate) => candidate.name === name);
  return entry ? loadEntry(entry) : undefined;
};

// Every screen with its fixture imported, for the visual suite, which shoots them all
export const loadScreens = () => Promise.all(screenEntries.map((entry) => loadEntry(entry)));

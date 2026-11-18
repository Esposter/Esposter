import type { ScreenFixture } from "#parity/models/ScreenFixture";
import type { Component } from "vue";

import { componentNames } from "virtual:parity-screen-names";

// Every component that has a fixture, found at any depth, so a screen is on the parity page and in the visual suite by
// Having one: each component is a folder, its `Index.vue` beside the `Index.fixture.ts` whose `props` it renders with.
// A screen is named the way the components barrel names every component, from its path (`screenNamesPlugin`), and not read
// Off the barrel, which leaves out a lazy or unreferenced directory. The component is imported only when its screen is asked for
const componentLoaders = import.meta.glob<Component>("/src/components/**/Index.vue", { import: "default" });
// A fixture is imported only when its screen is asked for: its top-level awaits read the game data its screen draws
// With, so an eager import would fetch every screen's data on every page, the other screens' included
const fixtureLoaders = import.meta.glob<ScreenFixture>("/src/components/**/Index.fixture.ts");
const COMPONENTS_PREFIX = "/src/components/";
const FIXTURE_FILE = "/Index.fixture.ts";

interface ScreenEntry {
  // The screen's folder, where its images are kept
  directory: string;
  loadComponent: () => Promise<Component>;
  loadFixture: () => Promise<ScreenFixture>;
  name: string;
}

const screenEntries: ScreenEntry[] = Object.keys(fixtureLoaders).flatMap((fixturePath) => {
  const componentPath = fixturePath.replace(/\.fixture\.ts$/u, ".vue");
  const loadComponent = componentLoaders[componentPath];
  const loadFixture = fixtureLoaders[fixturePath];
  const name = componentNames[componentPath];
  if (!loadComponent || !loadFixture || name === undefined) return [];
  return [
    { directory: fixturePath.slice(COMPONENTS_PREFIX.length, -FIXTURE_FILE.length), loadComponent, loadFixture, name },
  ];
});

const loadEntry = async ({ directory, loadComponent, loadFixture, name }: ScreenEntry) => ({
  ...(await loadFixture()),
  component: await loadComponent(),
  directory,
  name,
});

// The names of the screens on the parity page, which its index lists them by
export const screenNames: string[] = screenEntries.map(({ name }) => name);

// The screen a name draws, with its fixture imported, or nothing when no screen has that name
export const loadScreen = async (name: null | string) => {
  const entry = screenEntries.find((candidate) => candidate.name === name);
  return entry ? loadEntry(entry) : undefined;
};

// Every screen with its fixture imported, for the visual suite, which shoots them all
export const loadScreens = () => Promise.all(screenEntries.map((entry) => loadEntry(entry)));

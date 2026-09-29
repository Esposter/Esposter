import type { Component } from "vue";

// Every interface screen that has a fixture, found by file name at any depth, so a screen is on the parity page and in
// The visual suite by having one: `<Name>.fixture.ts` beside `<Name>.vue`, whose `props` it renders with. A section
// Is a folder (`loading`, `menu`, …), and `directory` is the screen's section, where its approved image is kept
const components = import.meta.glob<Component>("/src/components/interface/**/*.vue", { import: "default" });
const fixtures = import.meta.glob<Record<string, unknown>>("/src/components/interface/**/*.fixture.ts", {
  eager: true,
  import: "props",
});
const INTERFACE_PREFIX = "/src/components/interface/";

export const screens: {
  directory: string;
  load: () => Promise<Component>;
  name: string;
  props: Record<string, unknown>;
}[] = Object.entries(fixtures).flatMap(([path, props]) => {
  const load = components[path.replace(/\.fixture\.ts$/u, ".vue")];
  const relativePath = path.slice(INTERFACE_PREFIX.length, -".fixture.ts".length);
  const separatorIndex = relativePath.lastIndexOf("/");
  return load
    ? [{ directory: relativePath.slice(0, separatorIndex), load, name: relativePath.slice(separatorIndex + 1), props }]
    : [];
});

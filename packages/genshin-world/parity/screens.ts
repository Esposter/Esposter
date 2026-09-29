import type { Component } from "vue";

interface Fixture {
  // Props applied after the first frame, so a transition they start plays and can be shot at a known time
  motionProps?: Record<string, unknown>;
  props: Record<string, unknown>;
}

// Every interface screen that has a fixture, found by file name at any depth, so a screen is on the parity page and in
// The visual suite by having one: `<Name>.fixture.ts` beside `<Name>.vue`, whose `props` it renders with. A section
// Is a folder (`loading`, `menu` and so on), and `directory` is the screen's section, where its approved image is kept
const components = import.meta.glob<Component>("/src/components/interface/**/*.vue", { import: "default" });
const fixtures = import.meta.glob<Fixture>("/src/components/interface/**/*.fixture.ts", { eager: true });
const INTERFACE_PREFIX = "/src/components/interface/";

export const screens: (Fixture & { directory: string; load: () => Promise<Component>; name: string })[] =
  Object.entries(fixtures).flatMap(([path, { motionProps, props }]) => {
    const load = components[path.replace(/\.fixture\.ts$/u, ".vue")];
    const relativePath = path.slice(INTERFACE_PREFIX.length, -".fixture.ts".length);
    const separatorIndex = relativePath.lastIndexOf("/");
    const directory = relativePath.slice(0, separatorIndex);
    const name = relativePath.slice(separatorIndex + 1);
    return load ? [{ directory, load, motionProps, name, props }] : [];
  });

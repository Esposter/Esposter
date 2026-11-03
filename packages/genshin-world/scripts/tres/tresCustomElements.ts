import { templateCompilerOptions } from "@tresjs/core";
import * as THREE from "three";

// Vize names the elements a template holds for a renderer as tag patterns, where Vue asks a predicate. TresJS's predicate
// Takes every `Tres` tag but its own components, which a pattern cannot leave out, so the tags are listed: each class
// Three exports under the name TresJS gives it, kept when TresJS's own predicate takes it, then its kebab-case form and
// Its primitive. A tag of a class three does not export, such as one `extend` adds, has to be named here before it is used
export const tresCustomElements: string[] = [
  ...Object.entries(THREE)
    .filter(([, value]) => typeof value === "function")
    .map(([name]) => `Tres${name}`)
    .filter((tag) => templateCompilerOptions.template.compilerOptions.isCustomElement(tag)),
  "tres-*",
  "primitive",
];

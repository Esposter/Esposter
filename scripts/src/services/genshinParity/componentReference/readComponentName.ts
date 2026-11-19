import { COMPONENTS_SEGMENT } from "#src/services/genshinParity/componentReference/constants";
import { getComponentName } from "@esposter/configuration";

// A component's name as the parity page names it: its path under its package's components folder, named the way the
// Components barrel names it
export const readComponentName = (path: string): string =>
  getComponentName(path.slice(path.indexOf(COMPONENTS_SEGMENT) + COMPONENTS_SEGMENT.length));

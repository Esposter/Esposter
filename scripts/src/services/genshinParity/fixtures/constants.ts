import { GENSHIN_WORLD_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// The world package's components: each a folder holding its `Index.vue`, and its `Index.fixture.ts` where it has one
export const COMPONENTS_DIRECTORY: string = join(GENSHIN_WORLD_DIRECTORY, "src", "components");
export const BARREL_FILE_NAME = "index.ts";
export const COMPONENT_FILE_NAME = "Index.vue";
export const FIXTURE_FILE_NAME = "Index.fixture.ts";
// The committed reference a fixture variant is judged against sits beside the image it is named after, as `Index.reference.webp`
export const REFERENCE_IMAGE_SUFFIX = ".reference";

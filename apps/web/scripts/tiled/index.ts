import { createPropertyTypes } from "@@/scripts/tiled/propertyTypes/createPropertyTypes";
import { remove } from "@@/scripts/tiled/services/remove";

// Order here matters: the property types carry the metadata enums (`TilemapKey`) the tmx properties are generated
// From, so their module is imported only once those enum files exist on disk again
await remove();
await createPropertyTypes();
const { createTmxProperties } = await import("@@/scripts/tiled/tmxProperties/createTmxProperties");
await createTmxProperties();

import { createPropertyTypes } from "@@/scripts/tiled/propertyTypes/createPropertyTypes";
import { remove } from "@@/scripts/tiled/services/remove";

await remove();
await createPropertyTypes();
// eslint-disable-next-line no-restricted-syntax -- order matters: the tmx properties are generated from the metadata enums (TilemapKey) createPropertyTypes writes, so this module loads only once those enum files exist on disk
const { createTmxProperties } = await import("@@/scripts/tiled/tmxProperties/createTmxProperties");
await createTmxProperties();

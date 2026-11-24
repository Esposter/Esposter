import { createPropertyTypes } from "#scripts/tiled/propertyTypes/createPropertyTypes";
import { remove } from "#scripts/tiled/services/remove";

await remove();
await createPropertyTypes();
// Order matters: the tmx properties are generated from the metadata enums (TilemapKey) createPropertyTypes writes, so
// This import waits until those enum files exist on disk
// oxlint-disable-next-line selector-ban/no-restricted-syntax -- the dynamic import loads only after they are written
const { createTmxProperties } = await import("#scripts/tiled/tmxProperties/createTmxProperties");
await createTmxProperties();

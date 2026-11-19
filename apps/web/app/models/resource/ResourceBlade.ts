import type { ResourceBladeSlug } from "#src/models/resource/ResourceBladeSlug";
import type { ResourceBladeType } from "#src/models/resource/ResourceBladeType";

// Every value the `[[blade]]` route segment can name: a built-in blade, or a segment a type declares
export type ResourceBlade = ResourceBladeSlug | ResourceBladeType;

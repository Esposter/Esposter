import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";

export type SerializedFieldReader = (offset: number) => undefined | { end: number; field: SerializedField };

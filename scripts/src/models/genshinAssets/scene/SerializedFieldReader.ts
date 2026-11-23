import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";

export type SerializedFieldReader = (offset: number) => { end: number; field: SerializedField } | undefined;

import type { DumpedTransform } from "#src/models/genshinAssets/shared/DumpedTransform";

export type RectTransformDump = Pick<DumpedTransform, "m_Children" | "m_Father" | "m_GameObject" | "m_LocalScale">;

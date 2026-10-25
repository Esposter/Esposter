import type { ColumnFormContext } from "@/models/resource/sheet/column/ColumnFormContext";

import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";

// Which of the form's context lists feeds a source-column picker is a rendering decision, so its key naming lives here.
// It only exists on this side of the boundary: `shared/` states what a transformation is, never how it looks.
export const createSourceColumnIdFormShape = (itemsKey: keyof ColumnFormContext) => ({
  [sourceColumnIdSchema.keyof().enum.sourceColumnId]: sourceColumnIdSchema.shape.sourceColumnId.meta({
    layout: { itemsKey },
    title: "Source Column",
  }),
});

import type { z } from "zod";

import { dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { blueprintResourceSchema } from "#shared/models/resource/blueprint/BlueprintResource";
import { sheetResourceSchema } from "#shared/models/resource/sheet/SheetResource";
import { todoListResourceSchema } from "#shared/models/resource/todoList/TodoListResource";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { pluralize } from "#shared/util/text/pluralize";
import { ResourceType } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";

// Each entry names its own content schema, so its summary is typed by that schema and the map is read by a plain
// Call on the type. Content the schema cannot read has no summary
const summarizeContent =
  <TSchema extends z.ZodType>(contentSchema: TSchema, summarize: (content: z.infer<TSchema>) => string) =>
  (serializedContent: string): string => {
    const parsedContent = getResult(() =>
      // The content schema owns
      // oxlint-disable-next-line no-restricted-properties -- date coercion, exactly as readResourceContent relies on
      contentSchema.safeParse(JSON.parse(serializedContent)),
    ).unwrapOr(undefined);
    if (parsedContent?.success) return summarize(parsedContent.data);
    else return "";
  };

// What one line of a type's content says about itself, so a history row is choosable rather than being a
// Version number and a time — neither of which is something a person recognises their own work by. Computed
// When the snapshot is taken and carried on its version row, because the listing is one query for the
// Whole history and a summary derived on read would cost one object reconstruction per row.
//
// A type with no meaningful count declares nothing rather than a line that restates its own name: an
// Unsummarized row still carries its reason and its time. See openspec/specs/resource/resource-snapshots/design.md
export const SnapshotSummaryMap: Partial<Record<ResourceType, (serializedContent: string) => string>> = {
  [ResourceType.Blueprint]: summarizeContent(
    blueprintResourceSchema,
    ({ entries }) => `${entries.length} ${pluralize("resource", entries.length)}`,
  ),
  // A group is a visual too, so the count reads the whole tree
  [ResourceType.Dashboard]: summarizeContent(dashboardSchema, ({ visuals }) => {
    const count = listVisuals(visuals).length;
    return `${count} ${pluralize("visual", count)}`;
  }),
  [ResourceType.Sheet]: summarizeContent(
    sheetResourceSchema,
    ({ data: { columns, rows } }) =>
      `${columns.length} ${pluralize("column", columns.length)} · ${rows.length} ${pluralize("row", rows.length)}`,
  ),
  [ResourceType.TodoList]: summarizeContent(
    todoListResourceSchema,
    ({ items }) => `${items.length} ${pluralize("item", items.length)}`,
  ),
};

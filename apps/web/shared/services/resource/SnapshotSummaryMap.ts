import type { ResourceContent } from "#shared/models/resource/ResourceContent";

import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { pluralize } from "#shared/util/text/pluralize";
import { ResourceType } from "@esposter/db-schema";

// What one line of a type's content says about itself, so a history row is choosable rather than being a
// Version number and a time — neither of which is something a person recognises their own work by. Computed
// When the snapshot is taken and carried on its version row, because the listing is one query for the
// Whole history and a summary derived on read would cost one object reconstruction per row.
//
// A type with no meaningful count declares nothing rather than a line that restates its own name: an
// Unsummarized row still carries its reason and its time. See openspec/specs/resource/resource-snapshots/design.md
export const SnapshotSummaryMap: {
  [TType in ResourceType]?: (content: ResourceContent<TType>) => string;
} = {
  [ResourceType.Blueprint]: ({ entries }) => `${entries.length} ${pluralize("resource", entries.length)}`,
  // A group is a visual too, so the count reads the whole tree
  [ResourceType.Dashboard]: ({ visuals }) => {
    const count = listVisuals(visuals).length;
    return `${count} ${pluralize("visual", count)}`;
  },
  [ResourceType.Sheet]: ({ data: { columns, rows } }) =>
    `${columns.length} ${pluralize("column", columns.length)} · ${rows.length} ${pluralize("row", rows.length)}`,
  [ResourceType.TodoList]: ({ items }) => `${items.length} ${pluralize("item", items.length)}`,
};

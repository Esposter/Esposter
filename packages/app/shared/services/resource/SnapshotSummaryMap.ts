import type { ResourceContent } from "#shared/models/resource/ResourceContent";

import { pluralize } from "#shared/util/text/pluralize";
import { ResourceType } from "@esposter/db-schema";

// What one line of a type's content says about itself, so a history row is choosable rather than being a
// Version number and a time — neither of which is something a person recognises their own work by. Computed
// When the snapshot is taken and carried in its blob metadata, because the listing is one round trip for the
// Whole history and a summary derived on read would cost one download per row.
//
// A type with no meaningful count declares nothing rather than a line that restates its own name: an
// Unsummarized row still carries its reason, its label and its time. See /docs/platform/resource-snapshots
export const SnapshotSummaryMap: {
  [TType in ResourceType]?: (content: ResourceContent<TType>) => string;
} = {
  [ResourceType.Blueprint]: ({ entries }) => `${entries.length} ${pluralize("resource", entries.length)}`,
  [ResourceType.Dashboard]: ({ visuals }) => `${visuals.length} ${pluralize("visual", visuals.length)}`,
  [ResourceType.Sheet]: ({ data: { columns, rows } }) =>
    `${columns.length} ${pluralize("column", columns.length)} · ${rows.length} ${pluralize("row", rows.length)}`,
  [ResourceType.TodoList]: ({ items }) => `${items.length} ${pluralize("item", items.length)}`,
};

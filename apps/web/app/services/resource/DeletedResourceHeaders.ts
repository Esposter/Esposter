import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { UiDataTableColumn } from "#src/models/ui/UiDataTableColumn";

import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { ItemMetadataPropertyNames } from "#shared/models/shared/ItemMetadataPropertyNames";

// The bin answers two questions the main list never asks: when did this go, and how long have I got
export const DeletedResourceHeaders: UiDataTableColumn<ResourceListItem, keyof ResourceListItem>[] = [
  { key: ResourceListItemPropertyNames.type, title: "Type" },
  { key: ResourceListItemPropertyNames.name, title: "Name" },
  { key: ItemMetadataPropertyNames.deletedAt, title: "Deleted At" },
  { isSortable: false, key: "retention", title: "Retention" },
  { isSortable: false, key: "actions", title: "Actions" },
];

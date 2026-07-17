import { ResourceActivityType } from "@esposter/db-schema";

export const ResourceActivityTitleMap: Record<ResourceActivityType, string> = {
  [ResourceActivityType.ContentSaved]: "Content saved",
  [ResourceActivityType.Created]: "Created",
  [ResourceActivityType.Duplicated]: "Duplicated",
  [ResourceActivityType.Imported]: "Imported",
  [ResourceActivityType.Published]: "Published",
  [ResourceActivityType.Renamed]: "Renamed",
  [ResourceActivityType.Restored]: "Restored",
  [ResourceActivityType.Unpublished]: "Unpublished",
};

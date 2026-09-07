import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { pluralize } from "#shared/util/text/pluralize";

// One wording per operation, read by both ends of it: the tab composes the toast it shows immediately, and the
// Mutation composes the notification it publishes to the owner's other devices. Written twice, the two would
// Drift the first time either was reworded, and the drift would only ever be visible to someone holding two
// Devices at once.
export const ResourceOperationTitleMap = {
  [ResourceOperationType.Deleted]: (resourceName: string, count: number) =>
    count === 1 ? `Deleted "${resourceName}"` : `Deleted ${count} ${pluralize("resource", count)}`,
  [ResourceOperationType.Duplicated]: (resourceName: string) => `Created "${resourceName}"`,
  [ResourceOperationType.Published]: (resourceName: string, publishVersion: number) =>
    `Published "${resourceName}" (v${publishVersion})`,
  [ResourceOperationType.Purged]: (resourceName: string) => `Permanently deleted "${resourceName}"`,
  // A restore returns a Draft — saying so up front beats a surprise when the public link 404s
  [ResourceOperationType.Restored]: (resourceName: string) => `Restored "${resourceName}" as a draft`,
  [ResourceOperationType.Unpublished]: (resourceName: string) => `Unpublished "${resourceName}"`,
  // Exhaustive over the enum, with each member keeping its own arguments: the map is a namespace of wordings,
  // Never something iterated, so the constraint only has to prove nothing is missing
} as const satisfies Record<ResourceOperationType, (...resourceOperationArguments: never[]) => string>;

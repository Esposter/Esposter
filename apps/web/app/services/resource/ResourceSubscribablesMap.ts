import { ResourceType } from "@esposter/db-schema";

// A type's live subscriptions, run by the blade shell for as long as the resource is open. Its content is read
// Once per opened resource and every blade renders it from the store, so a subscription run by a blade would
// Leave the others — and the Overview — rendering what it last heard. A type with no entry subscribes to nothing
export const ResourceSubscribablesMap: Partial<Record<ResourceType, () => void>> = {
  [ResourceType.TodoList]: useTodoListSubscribables,
};

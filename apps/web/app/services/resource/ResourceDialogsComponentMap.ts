import ResourceSheetDialogs from "@/components/Resource/Sheet/Dialogs.vue";
import ResourceTodoListEditDialog from "@/components/Resource/TodoList/EditDialog.vue";
import { ResourceType } from "@esposter/db-schema";

// Dialogs more than one of a type's blades — or its commands, which are the same on every blade — open, mounted
// By the blade shell rather than by a blade: a dialog mounted in one blade is missing from the others, and one
// Mounted in each is torn down and rebuilt on every switch. A type with no entry mounts nothing
export const ResourceDialogsComponentMap: Partial<Record<ResourceType, Component>> = {
  [ResourceType.Sheet]: ResourceSheetDialogs,
  [ResourceType.TodoList]: ResourceTodoListEditDialog,
};

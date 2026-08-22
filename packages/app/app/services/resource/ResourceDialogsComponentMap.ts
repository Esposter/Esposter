import ResourceSheetDialogs from "@/components/Resource/Sheet/Dialogs.vue";
import { ResourceType } from "@esposter/db-schema";
// Dialogs a type's blade *commands* open, mounted by the blade shell rather than by a blade. The command bar is
// The same on every blade, so a dialog mounted in one of them would be missing from the others — and a type with
// No entry mounts nothing
export const ResourceDialogsComponentMap: Partial<Record<ResourceType, Component>> = {
  [ResourceType.Sheet]: ResourceSheetDialogs,
};

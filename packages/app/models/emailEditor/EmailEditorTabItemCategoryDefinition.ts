import type { EmailEditorTabType } from "@/models/emailEditor/EmailEditorTabType";
import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import type { TabItemCategoryDefinition } from "@/models/vuetify/TabItemCategoryDefinition";
import type { Except } from "type-fest";

export interface EmailEditorTabItemCategoryDefinition
  extends ItemEntityType<EmailEditorTabType>,
    // Text will be uncapitalized type
    Except<TabItemCategoryDefinition, "text"> {}

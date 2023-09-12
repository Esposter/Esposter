import { AItemEntity } from "@/models/shared/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { VuetifyComponentItemType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { VuetifyComponentType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";
import { RegisterSuperJSON } from "@/services/superjson/RegisterSuperJSON";

export class VuetifyComponentItem extends AItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  type = VuetifyComponentItemType.VuetifyComponent;
  component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
  props: Record<string, unknown> = {};
}

// Change this to use class decorators when it is supported
// https://github.com/nuxt/nuxt/issues/14126
RegisterSuperJSON(VuetifyComponentItem);

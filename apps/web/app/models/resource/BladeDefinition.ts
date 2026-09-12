import type { ResourceBladeSlug } from "@/models/resource/ResourceBladeSlug";
import type { ResourceBladeType } from "@/models/resource/ResourceBladeType";

export interface BladeDefinition {
  component: Component;
  icon: string;
  // The route segment for /resources/[id]/[[blade]]: a built-in blade's, or one the type declares
  slug: ResourceBladeSlug | ResourceBladeType;
  title: string;
}

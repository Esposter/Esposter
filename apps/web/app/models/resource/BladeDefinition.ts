import type { ResourceBladeSlug } from "@/models/resource/ResourceBladeSlug";
import type { ResourceBladeType } from "@/models/resource/ResourceBladeType";

export interface BladeDefinition {
  component: Component;
  icon: string;
  // A blade that draws a table owns its own padding and scroll, so the outlet draws it bare
  isBodyBare?: true;
  // The route segment for /resources/[id]/[[blade]]: a built-in blade's, or one the type declares
  slug: ResourceBladeSlug | ResourceBladeType;
  title: string;
}

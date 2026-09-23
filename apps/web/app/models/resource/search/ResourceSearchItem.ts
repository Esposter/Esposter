import type { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import type { RouteLocationRaw } from "vue-router";

export interface ResourceSearchItem {
  // A Services row can be created from as well as opened, which the palette offers as a row of its own
  createTo?: string;
  group: ResourceSearchGroup;
  icon: string;
  id: string;
  subtitle?: string;
  title: string;
  to: RouteLocationRaw;
}

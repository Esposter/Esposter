import type { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import type { RouteLocationRaw } from "vue-router";

export interface ResourceSearchItem {
  // Optional secondary "Create" sub-action rendered as an appended button (Services rows)
  createTo?: string;
  group: ResourceSearchGroup;
  icon: string;
  id: string;
  subtitle?: string;
  title: string;
  to: RouteLocationRaw;
}

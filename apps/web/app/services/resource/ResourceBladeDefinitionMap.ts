import type { BladeDefinition } from "@/models/resource/BladeDefinition";

import { ResourceType } from "@esposter/db-schema";
// The type's own blades after the built-in Overview/Editor; slugs are route segments on /resources/[id]/[[blade]]
//
// Loaded on demand, like the editors: the nav reads this map for every resource it renders and takes only
// `icon`/`slug`/`title` from it, so static entries put every blade of every type — the calendar's date engine
// Included — in the chunk that draws a sidebar. The Outlet renders whichever blade is active inside the same
// Suspense the editors use, so the skeleton already covers the wait
export const ResourceBladeDefinitionMap: Record<ResourceType, BladeDefinition[]> = {
  [ResourceType.Blueprint]: [],
  [ResourceType.Dashboard]: [],
  [ResourceType.Email]: [],
  [ResourceType.Flowchart]: [],
  // Note renders its Tiptap editor inline in the built-in Editor blade, so it declares no extra blades
  [ResourceType.Note]: [],
  // A program has no canvas, so it declares no Editor — Setup and Status are the whole surface
  [ResourceType.Program]: [
    {
      component: defineAsyncComponent(() => import("@/components/Resource/Program/Setup.vue")),
      icon: "mdi-cog",
      slug: "setup",
      title: "Setup",
    },
    {
      component: defineAsyncComponent(() => import("@/components/Resource/Program/Status.vue")),
      icon: "mdi-chart-timeline-variant",
      slug: "status",
      title: "Status",
    },
  ],
  [ResourceType.Sheet]: [
    {
      component: defineAsyncComponent(() => import("@/components/Resource/Sheet/Data.vue")),
      icon: "mdi-table",
      slug: "data",
      title: "Data",
    },
    {
      component: defineAsyncComponent(() => import("@/components/Resource/Sheet/Settings.vue")),
      icon: "mdi-cog",
      slug: "settings",
      title: "Settings",
    },
  ],
  [ResourceType.Survey]: [
    {
      component: defineAsyncComponent(() => import("@/components/Resource/Survey/Responses.vue")),
      icon: "mdi-poll",
      slug: "responses",
      title: "Responses",
    },
  ],
  [ResourceType.TodoList]: [
    {
      component: defineAsyncComponent(() => import("@/components/Resource/TodoList/Items.vue")),
      icon: "mdi-format-list-checks",
      slug: "items",
      title: "Items",
    },
    {
      component: defineAsyncComponent(() => import("@/components/Resource/TodoList/Calendar.vue")),
      icon: "mdi-calendar",
      slug: "calendar",
      title: "Calendar",
    },
  ],
  [ResourceType.Webpage]: [],
};

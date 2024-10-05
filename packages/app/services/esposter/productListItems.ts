import type { ListItem } from "@/models/shared/ListItem";

import { RoutePath } from "@/models/router/RoutePath";

export const productListItems: ListItem[] = [
  {
    href: RoutePath.MessagesIndex,
    icon: "mdi-message-fast",
    title: "Esbabbler",
  },
  {
    href: RoutePath.TableEditor,
    icon: "mdi-table-edit",
    title: "Table Editor",
  },
  {
    href: RoutePath.EmailEditor,
    icon: "mdi-email-edit",
    title: "Email Editor",
  },
  {
    href: RoutePath.WebpageEditor,
    icon: "mdi-language-html5",
    title: "Webpage Editor",
  },
  {
    href: RoutePath.FlowchartEditor,
    icon: "mdi-sitemap",
    title: "Flowchart Editor",
  },
  {
    href: RoutePath.DashboardEditor,
    icon: "mdi-view-dashboard-edit",
    title: "Dashboard Editor",
  },
  {
    href: RoutePath.Surveyer,
    icon: "mdi-text-box-edit",
    title: "Surveyer",
  },
  {
    href: RoutePath.Clicker,
    icon: "mdi-cursor-pointer",
    title: "Clicker",
  },
  {
    href: RoutePath.Dungeons,
    icon: "custom:dungeon-gate",
    title: "Dungeons",
  },
];

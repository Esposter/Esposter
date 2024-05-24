import { RoutePath } from "@/models/router/RoutePath";
import type { ListItem } from "@/models/shared/ListItem";

export const productListItems: ListItem[] = [
  {
    title: "Esbabbler",
    href: RoutePath.MessagesIndex,
    icon: "mdi-message-fast",
  },
  {
    title: "Table Editor",
    href: RoutePath.TableEditor,
    icon: "mdi-table-edit",
  },
  {
    title: "Dashboard",
    href: RoutePath.TableEditor,
    icon: "mdi-view-dashboard-edit",
  },
  {
    title: "Surveyer",
    href: RoutePath.Surveyer,
    icon: "mdi-text-box-edit",
  },
  {
    title: "Clicker",
    href: RoutePath.Clicker,
    icon: "mdi-cursor-pointer",
  },
  {
    title: "Dungeons",
    href: RoutePath.Dungeons,
    icon: "custom:dungeon-gate",
  },
];

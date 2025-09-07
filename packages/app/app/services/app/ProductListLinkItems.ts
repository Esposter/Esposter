import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { RoutePath } from "#shared/models/router/RoutePath";
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { SURVEY_DISPLAY_NAME } from "#shared/services/survey/constants";

export const ProductListLinkItems = [
  {
    href: RoutePath.MessagesIndex,
    icon: "mdi-message-fast",
    title: MESSAGE_DISPLAY_NAME,
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
    href: RoutePath[SURVEY_DISPLAY_NAME],
    icon: "mdi-text-box-edit",
    title: SURVEY_DISPLAY_NAME,
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
] as const satisfies ListLinkItem[];

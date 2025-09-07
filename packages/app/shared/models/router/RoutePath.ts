import { uncapitalize } from "@esposter/shared";

import { SITE_NAME } from "../../services/app/constants";
import { SURVEY_DISPLAY_NAME } from "../../services/survey/constants";

export const RoutePath = {
  About: "/about",
  Anime: "/anime",
  Calendar: "/calendar",
  Clicker: "/clicker",
  Dashboard: "/dashboard",
  DashboardEditor: "/dashboard/editor",
  Docs: "/docs",
  Dungeons: "/dungeons",
  EmailEditor: "/email-editor",
  FlowchartEditor: "/flowchart-editor",
  Github: `https://github.com/${SITE_NAME}/${SITE_NAME}`,
  Index: "/",
  Login: "/login",
  Messages: (id: string) => `/messages/${id}`,
  MessagesIndex: "/messages",
  MessagesInvite: (code: string) => `/messages/invite/${code}`,
  MessagesMessage: (id: string, rowKey: string) => `/messages/${id}/${rowKey}`,
  Post: (id: string) => `/post/${id}`,
  PostCreate: "/post/create",
  PostUpdate: (id: string) => `/post/update/${id}`,
  PrivacyPolicy: "/privacy-policy",
  Survey: (id: string) => `/${uncapitalize(SURVEY_DISPLAY_NAME)}/${id}`,
  [SURVEY_DISPLAY_NAME]: `/${uncapitalize(SURVEY_DISPLAY_NAME)}`,
  TableEditor: "/table-editor",
  UserSettings: "/user/settings",
  WebpageEditor: "/webpage-editor",
} as const;
export type RoutePath = typeof RoutePath;

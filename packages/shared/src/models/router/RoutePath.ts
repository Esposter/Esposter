import { SITE_NAME } from "@/services/app/constants";
import { SURVEY_DISPLAY_NAME } from "@/services/survey/constants";
import { uncapitalize } from "@/util/text/uncapitalize";

export const RoutePath: {
  readonly About: "/about";
  readonly Achievements: "/achievements";
  readonly Anime: "/anime";
  readonly Calendar: "/calendar";
  readonly Clicker: "/clicker";
  readonly Dashboard: "/dashboard";
  readonly DashboardEditor: "/dashboard/editor";
  readonly Docs: "/docs";
  readonly Dungeons: "/dungeons";
  readonly EmailEditor: "/email-editor";
  readonly FlowchartEditor: "/flowchart-editor";
  readonly FluidSimulator: "/fluid-simulator";
  readonly Github: "https://github.com/Esposter/Esposter";
  readonly Index: "/";
  readonly Login: "/login";
  readonly Messages: (id: string) => string;
  readonly MessagesIndex: "/messages";
  readonly MessagesInvite: (code: string) => string;
  readonly MessagesMessage: (id: string, rowKey: string) => string;
  readonly Post: (id: string) => string;
  readonly PostCreate: "/post/create";
  readonly PostUpdate: (id: string) => string;
  readonly PrivacyPolicy: "/privacy-policy";
  readonly Survey: (id: string) => string;
  readonly Surveyer: "/surveyer";
  readonly TableEditor: "/table-editor";
  readonly UserSettings: "/user/settings";
  readonly WebpageEditor: "/webpage-editor";
} = {
  About: "/about",
  Achievements: "/achievements",
  Anime: "/anime",
  Calendar: "/calendar",
  Clicker: "/clicker",
  Dashboard: "/dashboard",
  DashboardEditor: "/dashboard/editor",
  Docs: "/docs",
  Dungeons: "/dungeons",
  EmailEditor: "/email-editor",
  FlowchartEditor: "/flowchart-editor",
  FluidSimulator: "/fluid-simulator",
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

import { SITE_NAME } from "@/services/app/constants";

export const RoutePath: {
  readonly About: "/about";
  readonly Achievements: "/achievements";
  readonly Anime: "/anime";
  readonly Calls: (id: string) => string;
  readonly CallsIndex: "/calls";
  readonly Clicker: "/clicker";
  readonly Docs: "/docs";
  readonly Dungeons: "/dungeons";
  readonly FluidSimulator: "/fluid-simulator";
  readonly Github: "https://github.com/Esposter/Esposter";
  readonly Index: "/";
  readonly Login: "/login";
  readonly Messages: (id: string) => string;
  readonly MessagesDraftsAndSent: "/messages/draftsandsent";
  readonly MessagesFriends: "/messages/friends";
  readonly MessagesIndex: "/messages";
  readonly MessagesInvite: (code: string) => string;
  readonly MessagesMessage: (id: string, rowKey: string) => string;
  readonly MessagesThread: (id: string, rowKey: string) => string;
  readonly Post: (id: string) => string;
  readonly PostCreate: "/post/create";
  readonly PostUpdate: (id: string) => string;
  readonly PrivacyPolicy: "/privacy-policy";
  readonly Resource: (id: string) => string;
  readonly ResourceExplorer: "/resource-explorer";
  readonly ResourceExplorerAll: "/resource-explorer/all";
  readonly ResourceExplorerCreate: "/resource-explorer/create";
  readonly ResourceExplorerCreateType: (type: string) => string;
  readonly ResourceExplorerFavorites: "/resource-explorer/favorites";
  readonly ResourceExplorerRecents: "/resource-explorer/recents";
  readonly ResourceExplorerRecycleBin: "/resource-explorer/recycle-bin";
  readonly ResourceExplorerTags: "/resource-explorer/tags";
  readonly ResourceItems: (id: string) => string;
  readonly User: (id: string) => string;
  readonly UserSettings: "/user/settings";
  readonly View: (type: string, id: string) => string;
} = {
  About: "/about",
  Achievements: "/achievements",
  Anime: "/anime",
  Calls: (id: string) => `/calls/${id}`,
  CallsIndex: "/calls",
  Clicker: "/clicker",
  Docs: "/docs",
  Dungeons: "/dungeons",
  FluidSimulator: "/fluid-simulator",
  Github: `https://github.com/${SITE_NAME}/${SITE_NAME}`,
  Index: "/",
  Login: "/login",
  Messages: (id: string) => `/messages/${id}`,
  MessagesDraftsAndSent: "/messages/draftsandsent",
  MessagesFriends: "/messages/friends",
  MessagesIndex: "/messages",
  MessagesInvite: (code: string) => `/messages/invite/${code}`,
  MessagesMessage: (id: string, rowKey: string) => `/messages/${id}/${rowKey}`,
  MessagesThread: (id: string, rowKey: string) => `/messages/${id}/thread/${rowKey}`,
  Post: (id: string) => `/post/${id}`,
  PostCreate: "/post/create",
  PostUpdate: (id: string) => `/post/update/${id}`,
  PrivacyPolicy: "/privacy-policy",
  Resource: (id: string) => `/resource-explorer/${id}`,
  ResourceExplorer: "/resource-explorer",
  ResourceExplorerAll: "/resource-explorer/all",
  ResourceExplorerCreate: "/resource-explorer/create",
  ResourceExplorerCreateType: (type: string) => `/resource-explorer/create/${type}`,
  ResourceExplorerFavorites: "/resource-explorer/favorites",
  ResourceExplorerRecents: "/resource-explorer/recents",
  ResourceExplorerRecycleBin: "/resource-explorer/recycle-bin",
  ResourceExplorerTags: "/resource-explorer/tags",
  ResourceItems: (id: string) => `/resource-explorer/${id}/items`,
  User: (id: string) => `/user/${id}`,
  UserSettings: "/user/settings",
  View: (type: string, id: string) => `/view/${type}/${id}`,
} as const;
export type RoutePath = typeof RoutePath;

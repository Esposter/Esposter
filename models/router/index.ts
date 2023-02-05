export const RoutePath = {
  Index: "/",
  Login: "/login",
  About: "/about",
  PostCreate: "/post/create",
  PostUpdate: (id: string) => `/post/update/${id}`,
  UserSettings: "/user/settings",
  MessagesIndex: "/messages",
  Messages: (id: string) => `/messages/${id}`,
  Clicker: "/clicker",
  PrivacyPolicy: "https://www.termsfeed.com/live/367522f3-27be-4faa-a7bd-dda7b419a8fc",
  TermsAndConditions: "https://www.termsfeed.com/live/7202726c-ae87-41cd-af54-9bde6ca4477a",
} as const;
export type RoutePath = typeof RoutePath;

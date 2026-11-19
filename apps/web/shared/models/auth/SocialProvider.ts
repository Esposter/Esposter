// The sign-in providers the server configures and the login screen offers, the one list both read. Listed in the order
// The login screen shows its buttons
// eslint-disable-next-line perfectionist/sort-objects -- the buttons render in this declaration order, not alphabetically
export const SocialProvider = { Google: "google", Github: "github", Facebook: "facebook" } as const;
export type SocialProvider = (typeof SocialProvider)[keyof typeof SocialProvider];

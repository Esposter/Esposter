import type { ParityReference } from "#src/models/genshinParity/ParityReference";

// Every screen the console recreates from the game, by the reference it is judged against
export const ParityReferenceMap: Record<string, ParityReference> = {
  "exit-prompt": { screen: "exit-prompt", wikiTitle: "File:Paimon Menu Exit Prompt.png" },
  "loading-region": { screen: "loading-region", wikiTitle: "File:Loading Screen Mondstadt.png" },
  "loading-startup": { screen: "StartupLoading", wikiTitle: "File:Loading Screen Startup.png" },
  "login-dawn": { screen: "LoginScreen", wikiTitle: "File:Login Menu Dawn.png" },
  "login-day": { screen: "LoginScreen", wikiTitle: "File:Login Menu Day.png" },
  "login-door": { screen: "LoginScreen", wikiTitle: "File:Login Menu Door and Platform.png" },
  "login-dusk": { screen: "LoginScreen", wikiTitle: "File:Login Menu Dusk.png" },
  "login-night": { screen: "LoginScreen", wikiTitle: "File:Login Menu Night.png" },
  "paimon-menu": { screen: "pause-menu", wikiTitle: "File:Paimon Menu Version 1.3.png" },
  "paimon-menu-grid": { screen: "pause-menu", wikiTitle: "File:Paimon Menu Version 3.2.png" },
  "publisher-splash": { capture: "session-2.mp4", screen: "PublisherSplash", seconds: 1 },
  settings: { screen: "settings", wikiTitle: "File:Login Menu Settings.png" },
};

import type { ParityReference } from "#src/models/genshinParity/ParityReference";

// Every screen the console recreates from the game, by the reference it is judged against
export const ParityReferenceMap: Record<string, ParityReference> = {
  "exit-prompt": { screen: "exit-prompt", wikiTitle: "File:Paimon Menu Exit Prompt.png" },
  "loading-region": { screen: "loading-region", wikiTitle: "File:Loading Screen Mondstadt.png" },
  "loading-startup": { screen: "StartupLoading", wikiTitle: "File:Loading Screen Startup.png" },
  "paimon-menu": { screen: "pause-menu", wikiTitle: "File:Paimon Menu Version 1.3.png" },
  "paimon-menu-grid": { screen: "pause-menu", wikiTitle: "File:Paimon Menu Version 3.2.png" },
  settings: { screen: "settings", wikiTitle: "File:Login Menu Settings.png" },
};

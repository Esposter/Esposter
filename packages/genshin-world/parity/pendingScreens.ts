// The screen folders with no fixture yet, each named with the reason it has no reference, so the coverage test reads the list
// without loading the Vue components the screen list imports
export const pendingScreens: { directory: string; reason: string }[] = [
  { directory: "Achievement/Screen", reason: "no recording on disk opens the screen" },
  {
    directory: "Archive/Screen",
    reason:
      "its reference is sampled (archive-screen.png, from archive-screen.mkv at 19.5s, the Equipment and Weapons grid); the fixture is not written yet",
  },
  { directory: "Domain/Screen", reason: "no recording on disk opens the screen" },
  { directory: "Mail/Screen", reason: "no recording on disk opens the screen" },
  {
    directory: "Menu/Screen",
    reason:
      "a candidate is sampled (menu-screen.png, from session-2.mp4 at 114.5s, the Paimon menu at 21:9); it is Menu/Paimon's screen unless this folder is another, so the folder is read before a fixture",
  },
  {
    directory: "PaimonsBargains/Screen",
    reason:
      "a candidate is sampled (paimons-bargains-screen.png, from yt-aJq1MnTPtZ4-paimons-bargains-reset.mp4 at 2s, the Shop hub); a webcam sits bottom right and a card is focused, so a cleaner frame is wanted",
  },
  {
    directory: "Party/Screen",
    reason:
      "its reference is sampled (party-screen.png, from yt-greLeGJE-Jg-party-setup.mp4 at 38s); a subtitle band crosses the bottom, so its region stays above y 940; the fixture is not written yet",
  },
  { directory: "Shop/Screen", reason: "no recording on disk opens a vendor shop" },
  { directory: "Statue/Screen", reason: "no recording on disk opens the Blessing screen" },
];

// The screen folders with no fixture yet, each named with the reason it has no fixture.
// The coverage test reads the list without loading the Vue components the screen list imports
export const pendingScreens: { directory: string; reason: string }[] = [
  {
    directory: "Domain/Screen",
    reason:
      "a frame is sourced (KitMcSelby, VViV93IhcUs at 9s, the Golden House entrance, 1080p30 with a webcam bottom right), but its Golden Shadow levels are in no published dataset, so no fixture can read them until the domain schedules are published",
  },
  {
    directory: "Menu/Screen",
    reason:
      "the host that mounts the Paimon menu and the screens it opens, with no look of its own: its picture is Menu/Paimon's, scored by paimon-menu (menu-screen.png, the same menu at 21:9 from session-2.mp4 at 114.5s, is a candidate for a wider-window variant of that entry)",
  },
  {
    directory: "PaimonsBargains/Screen",
    reason:
      "a candidate is sampled (paimons-bargains-screen.png, from yt-aJq1MnTPtZ4-paimons-bargains-reset.mp4 at 2s, the Shop hub); a webcam sits bottom right and a card is focused, so a cleaner frame is wanted",
  },
  { directory: "Statue/Screen", reason: "no recording on disk opens the Blessing screen" },
];

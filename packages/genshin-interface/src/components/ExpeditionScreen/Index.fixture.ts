// Mondstadt's expedition map with Wolvendom picked, as the public clip shows it at 26 seconds: the title and the expedition
// Limit across the head, Mondstadt picked over Liyue's alert, six places as pins with the picked one outlined, and the
// Picked place's rewards, its four durations with 4 hours picked, and the button that sends a character
import { ExpeditionActionKind } from "#src/models/ExpeditionActionKind";

export const props = {
  characters: [
    { bonusLabel: "No Character Bonus", id: 1, label: "Amber", statusLabel: "" },
    { bonusLabel: "No Character Bonus", id: 2, label: "Lisa", statusLabel: "" },
    { bonusLabel: "No Character Bonus", id: 3, label: "Kaeya", statusLabel: "Exploring" },
    { bonusLabel: "No Character Bonus", id: 4, label: "Xingqiu", statusLabel: "" },
    { bonusLabel: "No Character Bonus", id: 5, label: "Noelle", statusLabel: "" },
    { bonusLabel: "No Character Bonus", id: 6, label: "Sucrose", statusLabel: "" },
    { bonusLabel: "No Character Bonus", id: 7, label: "Barbara", statusLabel: "" },
  ],
  characterTitle: "Character Selection",
  closeLabel: "Close",
  detail: {
    actionKind: ExpeditionActionKind.Send,
    actionLabel: "Select Character",
    description:
      "Deep and dark woods where hunters don't easily venture themselves, afraid of its disturbing silence. A dangerous pack of wolves established themselves in the",
    durations: [4, 8, 12, 20],
    id: 105,
    name: "Wolvendom",
    rewards: [
      { countLabel: "1~1", label: "White Radish 1~1", rarity: 1 },
      { countLabel: "1~1", label: "Carrot 1~1", rarity: 1 },
    ],
    statusLabel: "",
  },
  hours: 4,
  limitLabel: "Expedition Limit: 1/2",
  nation: "Mondstadt",
  nations: [
    { hasAlert: false, name: "Mondstadt" },
    { hasAlert: true, name: "Liyue" },
  ],
  picking: false,
  pins: [
    { awayLabel: "", id: 101, label: "Expedition place", x: 815, y: 195 },
    { awayLabel: "", id: 102, label: "Expedition place", x: 565, y: 410 },
    { awayLabel: "", id: 103, label: "Expedition place", x: 1053, y: 338 },
    { awayLabel: "", id: 104, label: "Expedition place", x: 1118, y: 455 },
    { awayLabel: "", id: 105, label: "Wolvendom", x: 745, y: 530 },
    { awayLabel: "", id: 106, label: "Expedition place", x: 1175, y: 660 },
  ],
  place: 105,
  rewardsLabel: "Rewards",
  title: "Dispatch Character on Expedition",
};

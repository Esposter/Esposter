// The Blessing screen of the completionist clip at 173 seconds: four members in combat and three preparing, each at full
// Health and levelled as the clip shows, the pool full at 10000 of 10000 with auto-recover on at half
export const props = {
  autoRecoverTitle: "Auto-recover when nearby",
  closeLabel: "Back",
  isAutoRecoverOn: true,
  members: [
    { healthShare: 1, id: 1, levelText: "Lv. 5", name: "Diluc" },
    { healthShare: 1, id: 2, levelText: "Lv. 5", name: "Venti" },
    { healthShare: 1, id: 3, levelText: "Lv. 2", name: "Xiangling" },
    { healthShare: 1, id: 4, levelText: "Lv. 2", name: "Noelle" },
  ],
  poolAmount: 10_000,
  poolMaximum: 10_000,
  thresholdPercent: 50,
  title: "Statue's Blessing",
  waitingMembers: [
    { healthShare: 1, id: 5, levelText: "Lv. 1", name: "Sucrose" },
    { healthShare: 1, id: 6, levelText: "Lv. 1", name: "Kaeya" },
    { healthShare: 1, id: 7, levelText: "Lv. 1", name: "Shenhe" },
  ],
  worshipTitle: "Worship Statue",
};

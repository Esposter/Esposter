// The Stardust Exchange tab of Paimon's Bargains, with a good picked and its count at two, the words the public clip shows
// Its layout is measured from that clip's frames; the detail's panel colour is an estimate, since the clip dims it
export const props = {
  balances: [
    { id: "primogem", isTopUp: true, name: "Primogems", quantity: 865 },
    { id: "mora", isTopUp: false, name: "Mora", quantity: 69 },
    { id: "starglitter", isTopUp: true, name: "Starglitter", quantity: 2375 },
  ],
  buyLabel: "Purchase",
  closeLabel: "Back",
  countLabel: "Quantity",
  countMaximum: 5,
  goods: [
    {
      costs: [{ count: 75, name: "Starglitter" }],
      id: 1,
      limitLabel: "Left This Month: 5",
      name: "Intertwined Fate",
      refreshLabel: "",
    },
    {
      costs: [{ count: 75, name: "Starglitter" }],
      id: 2,
      limitLabel: "Left This Month: 5",
      name: "Acquaint Fate",
      refreshLabel: "",
    },
    {
      costs: [{ count: 8, name: "Stardust" }],
      id: 3,
      limitLabel: "Left This Month: 100",
      name: "Adventurer's Experience ×3",
      refreshLabel: "",
    },
    {
      costs: [{ count: 5, name: "Stardust" }],
      id: 4,
      limitLabel: "Left This Month: 60",
      name: "Mystic Enhancement Ore",
      refreshLabel: "",
    },
    {
      costs: [{ count: 10, name: "Stardust" }],
      id: 5,
      limitLabel: "Left This Month: 30",
      name: "Mora ×10000",
      refreshLabel: "",
    },
    {
      costs: [{ count: 15, name: "Stardust" }],
      id: 6,
      limitLabel: "Left This Month: 12",
      name: "Black Bronze Horn",
      refreshLabel: "",
    },
  ],
  tabId: 3,
  tabs: [
    { id: 1, name: "Purchase with Primogems" },
    { id: 2, name: "Starglitter Exchange" },
    { id: 3, name: "Stardust Exchange" },
  ],
  title: "Shop",
};

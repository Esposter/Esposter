// The Stardust Exchange tab of Paimon's Bargains, with a good picked and its count at two, the words the public clip shows
// Its layout is measured from that clip's frames; the detail's panel colour is an estimate, since the clip dims it
export const props = {
  balances: [
    { id: "primogem", isTopUp: true, name: "Primogems", quantity: 865 },
    { id: "mora", name: "Mora", quantity: 69 },
    { id: "starglitter", isTopUp: true, name: "Starglitter", quantity: 2375 },
  ],
  buyLabel: "Purchase",
  closeLabel: "Back",
  countLabel: "Quantity",
  countMaximum: 5,
  goods: [
    { id: 1, limitLabel: "Left This Month: 5", name: "Intertwined Fate", price: 75, priceName: "Starglitter" },
    { id: 2, limitLabel: "Left This Month: 5", name: "Acquaint Fate", price: 75, priceName: "Starglitter" },
    { id: 3, limitLabel: "Left This Month: 100", name: "Adventurer's Experience ×3", price: 8, priceName: "Stardust" },
    { id: 4, limitLabel: "Left This Month: 60", name: "Mystic Enhancement Ore", price: 5, priceName: "Stardust" },
    { id: 5, limitLabel: "Left This Month: 30", name: "Mora ×10000", price: 10, priceName: "Stardust" },
    { id: 6, limitLabel: "Left This Month: 12", name: "Black Bronze Horn", price: 15, priceName: "Stardust" },
  ],
  tabId: 3,
  tabs: [
    { id: 1, name: "Purchase with Primogems" },
    { id: 2, name: "Starglitter Exchange" },
    { id: 3, name: "Stardust Exchange" },
  ],
  title: "Shop",
};

// The indicator of the cooking clip's Sticky Honey Roast, whose pointer rests left of the Delicious zone
export const props = {
  autoCookLabel: "Auto Cook",
  closeLabel: "Back",
  dishes: [{ id: 1001, name: "Sticky Honey Roast" }],
  isAutoCookable: true,
  pointer: 0.24,
  selectedId: 1001,
  stopLabel: "Stop",
  title: "Cook",
  zones: { delicious: [0.38, 0.62] satisfies [number, number], regular: [0.3, 0.7] satisfies [number, number] },
};

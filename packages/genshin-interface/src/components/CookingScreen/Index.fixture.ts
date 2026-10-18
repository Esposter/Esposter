// The indicator of the cooking clip's Sticky Honey Roast, whose pointer rests left of the Delicious zone
export const props = {
  autoCookLabel: "Auto Cook",
  canAutoCook: true,
  dishes: [{ id: 1001, name: "Sticky Honey Roast" }],
  pointer: 0.24,
  selectedId: 1001,
  stopLabel: "Stop",
  title: "Cook",
  zones: { delicious: [0.38, 0.62] as [number, number], regular: [0.3, 0.7] as [number, number] },
};

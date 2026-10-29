export interface Drag {
  // Where the held row sat when the drag started, so a scroll under it since is added back to the pointer's travel
  layoutTop: number;
  // The offset that sits the held row in each slot, from where the rows sat when the drag started
  offsets: number[];
  // The container's scale on screen, so an offset measured on screen is written in the container's own pixels
  scale: number;
  // Each ancestor that may scroll, innermost first and the page last
  scrollers: Element[];
  // How far a row the held one passes moves aside: the held row's height and the gap after it
  shift: number;
  targetIndex: number;
  // How far the held row is from its own slot, on screen
  translate: number;
}

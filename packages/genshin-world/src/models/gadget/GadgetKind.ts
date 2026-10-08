// The kinds of gadget the game's widget config names that a gadget's use is built from: a collector stores or spends an
// Element, a detector points to the nearest thing of its kind, a gather point finder points to a gather point, and a
// Device is placed in the world. The config's other kinds (the cameras, the avatar attachments, the toys) are not yet built
export enum GadgetKind {
  Collector = "Collector",
  Detector = "Detector",
  Device = "Device",
  GatherPointFinder = "GatherPointFinder",
}

// A recreation pass, one kind of unknown each, listed in the order they run, each after every pass it depends on
// (apps/web/content/docs/proposals/genshin/recreation-passes.md)
export enum ParityPass {
  Inventory = "Inventory",
  Layout = "Layout",
  Camera = "Camera",
  Shape = "Shape",
  Motion = "Motion",
  Surface = "Surface",
  Display = "Display",
  Light = "Light",
  Atmosphere = "Atmosphere",
  Audio = "Audio",
}

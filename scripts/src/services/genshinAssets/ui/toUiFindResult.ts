import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

// An entry as a search prints it: where it is, its name, its layout and its components, its canvas scaler left out
export const toUiFindResult = ({
  block,
  components,
  container,
  name,
  path,
  pathId,
  rect,
}: UiIndexEntry): Pick<UiIndexEntry, "block" | "components" | "container" | "name" | "path" | "pathId" | "rect"> => ({
  block,
  components,
  container,
  name,
  path,
  pathId,
  rect,
});

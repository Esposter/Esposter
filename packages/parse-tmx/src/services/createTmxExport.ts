import type { TMXExportParsed } from "#src/models/tmx/parsed/TMXExportParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

export const createTmxExport = (attributes: TMXAttributes): TMXExportParsed => ({
  format: attributes.format ?? "",
  target: attributes.target ?? "",
});

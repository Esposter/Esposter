import type { ResourceBlade } from "#src/models/resource/ResourceBlade";

import { ResourceBladeSlug } from "#src/models/resource/ResourceBladeSlug";
import { ResourceBladeType } from "#src/models/resource/ResourceBladeType";

const resourceBlades = new Set<string>([...Object.values(ResourceBladeType), ...Object.values(ResourceBladeSlug)]);

const checkIsResourceBlade = (blade: string): blade is ResourceBlade => resourceBlades.has(blade);

// The route segment narrowed to the blade vocabulary once, at the page. A value no blade is named by falls back to
// Overview, so the blade components only ever receive a blade; the page's own 404 still judges the segment as typed
export const parseResourceBlade = (blade: string): ResourceBlade =>
  checkIsResourceBlade(blade) ? blade : ResourceBladeType.Overview;

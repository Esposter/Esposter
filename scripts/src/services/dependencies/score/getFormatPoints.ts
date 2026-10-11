import type { PackageFormat } from "#src/models/dependencies/score/PackageFormat";

import { FORMAT_POINTS } from "#src/services/dependencies/score/constants";

export const getFormatPoints = (format: PackageFormat): number => FORMAT_POINTS[format];

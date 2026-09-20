// Where each section the report reads starts and stops in `pnpm-lock.yaml`, and how deep its package keys sit:
// The catalogs list a package two levels in, an importer's dependencies three. Named once because the bench
// Slices the same sections the two readers do.
export const CATALOGS_SECTION_START = "\ncatalogs:";

export const CATALOGS_SECTION_ENDS: string[] = ["\npackages:", "\nsnapshots:", "\nimporters:"];

export const CATALOG_PACKAGE_INDENT = 4;

export const IMPORTERS_SECTION_START = "\nimporters:";

export const IMPORTERS_SECTION_ENDS: string[] = ["\npackages:"];

export const IMPORTER_PACKAGE_INDENT = 6;

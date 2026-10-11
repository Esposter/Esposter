import type { KitModuleSite } from "#src/models/genshinAssets/kits/module/KitModuleSite";
import type ts from "typescript";

// What reads a kit module's sites: the ids of the sites under each root a scope evaluates, read again where the scope
// Starts, and every site read so far
export interface KitSiteCollector {
  collectSites: (roots: readonly ts.Node[], scope: ts.Node) => string[];
  sites: KitModuleSite[];
}

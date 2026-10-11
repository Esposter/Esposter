import type { KitModuleRegistration } from "#src/models/genshinAssets/kits/module/KitModuleRegistration";
import type { KitModuleSite } from "#src/models/genshinAssets/kits/module/KitModuleSite";

// What a kit module's text gives the builder: its file, its create function's name and its character id export's, each
// Site a value of its record is read from, and the spans a probe wraps to read them
export interface KitModuleAnalysis {
  characterIdName?: string;
  createName: string;
  file: string;
  registrations: KitModuleRegistration[];
  sites: KitModuleSite[];
}

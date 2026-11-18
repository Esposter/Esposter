import type { ShaderListingPass } from "#src/models/genshinAssets/effects/ShaderListingPass";

// One exported shader as the effect listing shows it: whether an effect's blend marks it, its keywords and its passes'
// State. A shader whose serialized form is not read is listed with no name, keywords or passes, and `isRead` false
export interface ShaderListing {
  block: string;
  folder: string;
  isEffect: boolean;
  isRead: boolean;
  keywords: string[];
  name: string;
  passes: ShaderListingPass[];
}

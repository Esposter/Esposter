import { AssetType } from "#src/models/genshinAssets/shared/AssetType";

export interface ExportRequest {
  block: string;
  names: Set<string>;
  type: AssetType;
}

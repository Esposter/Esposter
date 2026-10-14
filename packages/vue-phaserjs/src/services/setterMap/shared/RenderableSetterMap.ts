import { AlphaSetterMap } from "#src/services/setterMap/components/AlphaSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { TintSetterMap } from "#src/services/setterMap/components/TintSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";

export const RenderableSetterMap = {
  ...AlphaSetterMap,
  ...SceneObjectSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...TintSetterMap,
  ...GlobalSetterMap,
};

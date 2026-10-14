import { BlendModeSetterMap } from "#src/services/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/services/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "#src/services/setterMap/components/MaskSetterMap";
import { ScrollFactorSetterMap } from "#src/services/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "#src/services/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/services/setterMap/components/VisibleSetterMap";

export const SceneObjectSetterMap = {
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...MaskSetterMap,
  ...ScrollFactorSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
};

import type { TextConfiguration } from "#src/models/configuration/TextConfiguration";
import type { TextEventEmitsOptions } from "#src/models/emit/TextEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "#src/services/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "#src/services/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "#src/services/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "#src/services/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "#src/services/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/services/setterMap/components/ScrollFactorSetterMap";
import { TintSetterMap } from "#src/services/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "#src/services/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/services/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";

export const TextSetterMap: SetterMap<TextConfiguration, GameObjects.Text, TextEventEmitsOptions> = {
  padding: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setPadding(value);
  },
  style: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setStyle(value);
  },
  text: (gameObject, emit) => (value) => {
    if (value === undefined) return;
    // Setting the text changes the derived width values too, and vue cannot see a phaser property change,
    // So they are emitted back explicitly
    gameObject.setText(value);
    emit("update:width", gameObject.width);
    emit("update:displayWidth", gameObject.displayWidth);
  },
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...ComputedSizeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};

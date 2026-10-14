import type { ContainerConfiguration } from "#src/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "#src/models/emit/ContainerEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";

export const ContainerSetterMap: SetterMap<ContainerConfiguration, GameObjects.Container, ContainerEventEmitsOptions> =
  { ...AlphaSingleSetterMap, ...SceneObjectSetterMap, ...GlobalSetterMap };

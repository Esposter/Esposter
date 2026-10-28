import type { SceneExport } from "#src/models/scene/SceneExport";
import type { WitnessMaterialFactory } from "#src/models/scene/WitnessMaterialFactory";

import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { WITNESS_LAYOUT_FILE_NAME } from "#src/services/scene/constants";
import { loadSceneExport } from "#src/services/scene/loadSceneExport";
import { readSceneExportComponents } from "#src/services/scene/readSceneExportComponents";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";

// The game's own exports of the components a scene wants, which a host serves in development from the developer's own
// Extraction, and the scene draws in place of its stand-ins of each family they hold. A component is loaded once it is
// Wanted and the host holds it, with only the families its map names, and freed once it is no longer wanted or the
// Scene goes; one still loading when it stops being wanted is freed as it arrives. With no host, an index that fails to
// Load or a component that fails, each logged, nothing of it is drawn and the stand-ins stay
export const useSceneExports = (
  sceneExportBaseUrl: string | undefined,
  getComponents: () => readonly string[],
  componentFamilyMeshRegexMap: Readonly<Record<string, Readonly<Record<string, RegExp>>>>,
  createMaterial: WitnessMaterialFactory,
) => {
  const sceneExportMap = shallowReactive(new Map<string, SceneExport>());
  if (!sceneExportBaseUrl) return sceneExportMap;
  const heldComponents = shallowRef<ReadonlySet<string>>(new Set());
  const pendingComponents = new Set<string>();
  let wantedComponents = new Set<string>();
  getSynchronizedFunction(() =>
    readSceneExportComponents(sceneExportBaseUrl).match(
      (components) => {
        heldComponents.value = new Set(components);
      },
      (error) => {
        console.error(error);
      },
    ),
  )();
  // A component's exports, kept only if it is still wanted once they arrive
  const load = (component: string, familyMeshRegexMap: Readonly<Record<string, RegExp>>): void => {
    pendingComponents.add(component);
    getSynchronizedFunction(() =>
      getResultAsync(() =>
        measureLoadStep(
          "scene-exports",
          loadSceneExport(
            `${sceneExportBaseUrl}/${component}/${WITNESS_LAYOUT_FILE_NAME}`,
            createMaterial,
            familyMeshRegexMap,
          ),
        ),
      ).match(
        (sceneExport) => {
          pendingComponents.delete(component);
          if (wantedComponents.has(component)) sceneExportMap.set(component, sceneExport);
          else sceneExport.dispose();
        },
        (error) => {
          pendingComponents.delete(component);
          console.error(error);
        },
      ),
    )();
  };
  watch([getComponents, heldComponents], ([components, held]) => {
    wantedComponents = new Set(components.filter((component) => held.has(component)));
    for (const [component, sceneExport] of sceneExportMap)
      if (!wantedComponents.has(component)) {
        sceneExport.dispose();
        sceneExportMap.delete(component);
      }
    for (const component of wantedComponents) {
      const familyMeshRegexMap = componentFamilyMeshRegexMap[component];
      if (familyMeshRegexMap && !sceneExportMap.has(component) && !pendingComponents.has(component))
        load(component, familyMeshRegexMap);
    }
  });
  onUnmounted(() => {
    wantedComponents = new Set();
    for (const { dispose } of sceneExportMap.values()) dispose();
    sceneExportMap.clear();
  });
  return sceneExportMap;
};

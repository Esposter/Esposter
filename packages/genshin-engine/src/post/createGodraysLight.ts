import { DirectionalLight } from "three";

// A second sun that lights nothing, whose one shadow map covers the whole view for the god rays to march through.
// The sun's own shadow is split into cascades, each covering only a slice of the view, and three's god rays read one
// Light's single map. The ground and the landmarks stand still, so the map is drawn once and again only when
// `shadow.needsUpdate` is set: when the sun turns, or the ground under the view is replaced
export const createGodraysLight = (shadowMapSize: number, halfExtent: number): DirectionalLight => {
  const godraysLight = new DirectionalLight(0xffffff, 0);
  godraysLight.castShadow = true;
  godraysLight.shadow.autoUpdate = false;
  godraysLight.shadow.needsUpdate = true;
  godraysLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  const { camera } = godraysLight.shadow;
  camera.left = -halfExtent;
  camera.right = halfExtent;
  camera.top = halfExtent;
  camera.bottom = -halfExtent;
  camera.far = halfExtent * 4;
  return godraysLight;
};

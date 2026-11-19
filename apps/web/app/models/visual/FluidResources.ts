import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Inspector } from "three/examples/jsm/inspector/Inspector.js";
import type { SkyMesh } from "three/examples/jsm/objects/SkyMesh.js";
import type { WaterMesh } from "three/examples/jsm/objects/WaterMesh.js";
import type {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  RenderPipeline,
  WebGPURenderer,
} from "three/webgpu";

// Everything the teardown must dispose, assembled before the renderer's init is awaited, so an unmount at any point
// Finds it
export interface FluidResources {
  box: Mesh<BoxGeometry, MeshStandardMaterial>;
  controls: OrbitControls;
  disposeRenderTarget: () => void;
  inspector: Inspector;
  pmremGenerator: PMREMGenerator;
  renderer: WebGPURenderer;
  renderPipeline: RenderPipeline;
  sky: SkyMesh;
  stopResize: () => void;
  water: WaterMesh;
}

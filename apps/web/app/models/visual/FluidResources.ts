import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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

// Everything the teardown must dispose, assembled only after onMounted finishes wiring three.js
export interface FluidResources {
  box: Mesh<BoxGeometry, MeshStandardMaterial>;
  controls: OrbitControls;
  disposeRenderTarget: () => void;
  pmremGenerator: PMREMGenerator;
  renderer: WebGPURenderer;
  renderPipeline: RenderPipeline;
  sky: SkyMesh;
  stopResize: () => void;
  water: WaterMesh;
}

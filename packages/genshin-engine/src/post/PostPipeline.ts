import type BloomNode from "three/examples/jsm/tsl/display/BloomNode.js";
import type GodraysNode from "three/examples/jsm/tsl/display/GodraysNode.js";
import type { RenderPipeline } from "three/webgpu";

// The pipeline, and the passes whose own uniforms the tuning panel reaches; a pass the tier leaves out is absent
export interface PostPipeline {
  bloomNode?: BloomNode;
  godraysNode?: GodraysNode;
  renderPipeline: RenderPipeline;
}

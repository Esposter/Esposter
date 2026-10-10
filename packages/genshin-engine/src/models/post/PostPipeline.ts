import type BloomNode from "three/examples/jsm/tsl/display/BloomNode.js";
import type GodraysNode from "three/examples/jsm/tsl/display/GodraysNode.js";
import type { RenderPipeline } from "three/webgpu";

// The pipeline, the passes whose own uniforms the tuning panel reaches (a pass the tier leaves out is absent), and the
// Release of the pipeline with every pass it draws through, since the pipeline's own releases only its quad's material.
// Awaiting `compileAsync` draws every object of the scene once, unseen, outlines included, and waits for the GPU to finish
// It, so a host awaits it before it shows and nothing it shows builds a material or a pipeline mid-frame
export interface PostPipeline {
  bloomNode?: BloomNode;
  compileAsync: () => Promise<void>;
  dispose: () => void;
  godraysNode?: GodraysNode;
  renderPipeline: RenderPipeline;
}

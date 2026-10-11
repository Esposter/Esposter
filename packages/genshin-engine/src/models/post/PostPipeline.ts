import type BloomNode from "three/examples/jsm/tsl/display/BloomNode.js";
import type GodraysNode from "three/examples/jsm/tsl/display/GodraysNode.js";
import type { RenderPipeline } from "three/webgpu";

// The pipeline, the passes whose own uniforms the tuning panel reaches (a pass the tier leaves out is absent), and the
// Release of the pipeline with every pass it draws through, since the pipeline's own releases only its quad's material.
// Awaiting `compileAsync` waits for the next frame's draw of the view, outlines included, and for the GPU to finish it, so
// A host awaits it before it shows and the view it first shows builds no material or pipeline mid-frame
export interface PostPipeline {
  bloomNode?: BloomNode;
  compileAsync: () => Promise<void>;
  dispose: () => void;
  godraysNode?: GodraysNode;
  renderPipeline: RenderPipeline;
}

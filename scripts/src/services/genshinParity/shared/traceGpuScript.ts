// Records each WebGPU call that can stall a frame: pipelines, shader modules, textures, buffers and uploads. Each call keeps its
// Duration, the animation frame it ran in, its label and a short detail of its descriptor. A script string rather than a
// Function, as the stall recorder's is: the TypeScript runner rewrites an inner function with a helper the page does not have
export const TRACE_GPU_SCRIPT = `
  window.__traceTimes = [];
  window.__gpuCalls = [];
  const countFrame = (time) => {
    window.__traceTimes.push(time);
    requestAnimationFrame(countFrame);
  };
  requestAnimationFrame(countFrame);
  const codeLengths = new WeakMap();
  const traceCall = (owner, name, describe) => {
    const original = owner[name];
    owner[name] = function (...args) {
      const start = performance.now();
      const result = original.apply(this, args);
      const call = {
        detail: describe(args, result),
        duration: performance.now() - start,
        frame: window.__traceTimes.length - 1,
        label: args[0]?.label ?? args[0]?.texture?.label ?? args[1]?.texture?.label ?? "",
        name,
        start,
      };
      window.__gpuCalls.push(call);
      if (result instanceof Promise) result.then(() => { call.settled = performance.now() - start; }, () => {});
      return result;
    };
  };
  const describePipeline = (args) => {
    const stage = args[0].vertex ?? args[0].compute;
    return "entry " + stage.entryPoint + " code " + codeLengths.get(stage.module);
  };
  const describeExtent = (size) => {
    const [width, height] = Array.isArray(size) ? size : [size.width, size.height];
    return width + "x" + height;
  };
  const describeBytes = (data) => (data.byteLength ?? data.length) + " B";
  traceCall(GPUDevice.prototype, "createBuffer", (args) => args[0].size + " B usage " + args[0].usage);
  traceCall(GPUDevice.prototype, "createComputePipeline", describePipeline);
  traceCall(GPUDevice.prototype, "createRenderPipeline", describePipeline);
  traceCall(GPUDevice.prototype, "createRenderPipelineAsync", describePipeline);
  traceCall(GPUDevice.prototype, "createShaderModule", (args, result) => {
    codeLengths.set(result, args[0].code.length);
    return "code " + args[0].code.length;
  });
  traceCall(GPUDevice.prototype, "createTexture", (args) => describeExtent(args[0].size) + " " + args[0].format);
  traceCall(GPUQueue.prototype, "copyExternalImageToTexture", (args) => describeExtent(args[2]));
  traceCall(GPUQueue.prototype, "writeBuffer", (args) => describeBytes(args[2]));
  traceCall(GPUQueue.prototype, "writeTexture", (args) => describeBytes(args[1]) + " " + describeExtent(args[3]));
  traceCall(GPUQueue.prototype, "submit", (args) => args[0].length + " command buffers");
  traceCall(GPUCanvasContext.prototype, "getCurrentTexture", () => "swap chain");
`;

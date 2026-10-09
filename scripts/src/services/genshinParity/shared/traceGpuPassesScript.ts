// Times every render and compute pass the page encodes on the GPU, where the adapter has timestamp queries: each pass is
// Given a pair of the device's queries, its encoder resolves them as it finishes, and once the queue has run what it
// Submitted they are read back beside the page's time at the submit. A pass whose queries the GPU left unwritten reads
// As ending before it began and is dropped. A pass keeps its encoder's label, its first attachment's texture and the
// Animation frame it was begun in. It runs
// Ahead of the call trace, holding the WebGPU methods as the browser gives them, so its own buffers and reads are not
// Traced as the page's. A script string, as the call trace's is
export const TRACE_GPU_PASSES_SCRIPT = `
  window.__gpuPasses = [];
  window.__hasGpuTimestamps = false;
  const QUERY_COUNT = 4096;
  const PASSES_PER_ENCODER = 16;
  const RESOLVE_STRIDE = 256;
  const READBACK_SIZE = PASSES_PER_ENCODER * RESOLVE_STRIDE;
  const NANOSECONDS_PER_MS = 1e6;
  const { requestDevice } = GPUAdapter.prototype;
  const { createBuffer, createCommandEncoder, createQuerySet } = GPUDevice.prototype;
  const { beginComputePass, beginRenderPass, copyBufferToBuffer, finish, resolveQuerySet } = GPUCommandEncoder.prototype;
  const { submit } = GPUQueue.prototype;
  const { getMappedRange, mapAsync, unmap } = GPUBuffer.prototype;
  const { createView } = GPUTexture.prototype;
  const deviceStates = new WeakMap();
  const encoderStates = new WeakMap();
  const encoderPasses = new WeakMap();
  const pendingReads = new WeakMap();
  const viewTextures = new WeakMap();
  GPUAdapter.prototype.requestDevice = function (descriptor = {}) {
    if (!this.features.has("timestamp-query")) return requestDevice.call(this, descriptor);
    const requiredFeatures = [...new Set([...(descriptor.requiredFeatures ?? []), "timestamp-query"])];
    return requestDevice.call(this, { ...descriptor, requiredFeatures }).then((device) => {
      window.__hasGpuTimestamps = true;
      const querySet = createQuerySet.call(device, { count: QUERY_COUNT, type: "timestamp" });
      deviceStates.set(device, { device, nextQuery: 0, querySet, readbacks: [] });
      return device;
    });
  };
  GPUDevice.prototype.createCommandEncoder = function (...args) {
    const encoder = createCommandEncoder.apply(this, args);
    const state = deviceStates.get(this);
    if (state) encoderStates.set(encoder, state);
    return encoder;
  };
  GPUTexture.prototype.createView = function (...args) {
    const view = createView.apply(this, args);
    viewTextures.set(view, this);
    return view;
  };
  const describeView = (view) => {
    const texture = viewTextures.get(view);
    return texture ? (texture.label || "unlabelled") + " " + texture.width + "x" + texture.height + " " + texture.format : "";
  };
  const describePass = (descriptor) => {
    const colorAttachments = [...(descriptor.colorAttachments ?? [])].filter((attachment) => attachment);
    const depthView = descriptor.depthStencilAttachment?.view;
    if (colorAttachments.length > 0)
      return colorAttachments.length + " colour, " + describeView(colorAttachments[0].view) + (depthView ? " and depth" : "");
    return depthView ? "depth only, " + describeView(depthView) : "compute";
  };
  const timePass = (beginPass) =>
    function (descriptor = {}) {
      const state = encoderStates.get(this);
      const passes = encoderPasses.get(this) ?? [];
      if (!state || descriptor.timestampWrites || passes.length === PASSES_PER_ENCODER) return beginPass.call(this, descriptor);
      const query = state.nextQuery;
      state.nextQuery = (query + 2) % QUERY_COUNT;
      passes.push({ detail: describePass(descriptor), frame: window.__traceTimes.length - 1, label: this.label, query });
      encoderPasses.set(this, passes);
      const timestampWrites = { beginningOfPassWriteIndex: query, endOfPassWriteIndex: query + 1, querySet: state.querySet };
      return beginPass.call(this, { ...descriptor, timestampWrites });
    };
  GPUCommandEncoder.prototype.beginRenderPass = timePass(beginRenderPass);
  GPUCommandEncoder.prototype.beginComputePass = timePass(beginComputePass);
  GPUCommandEncoder.prototype.finish = function (...args) {
    const state = encoderStates.get(this);
    const passes = encoderPasses.get(this);
    if (!state || !passes) return finish.apply(this, args);
    const readback = state.readbacks.pop() ?? {
      read: createBuffer.call(state.device, { size: READBACK_SIZE, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }),
      resolve: createBuffer.call(state.device, { size: READBACK_SIZE, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC }),
    };
    for (const [index, pass] of passes.entries())
      resolveQuerySet.call(this, state.querySet, pass.query, 2, readback.resolve, index * RESOLVE_STRIDE);
    copyBufferToBuffer.call(this, readback.resolve, 0, readback.read, 0, READBACK_SIZE);
    const commandBuffer = finish.apply(this, args);
    pendingReads.set(commandBuffer, { passes, readback, state });
    return commandBuffer;
  };
  GPUQueue.prototype.submit = function (commandBuffers) {
    const submittedMs = performance.now();
    const result = submit.call(this, commandBuffers);
    for (const commandBuffer of commandBuffers) {
      const pending = pendingReads.get(commandBuffer);
      if (!pending) continue;
      const { passes, readback, state } = pending;
      mapAsync.call(readback.read, GPUMapMode.READ).then(
        () => {
          const times = new BigUint64Array(getMappedRange.call(readback.read));
          for (const [index, { detail, frame, label }] of passes.entries()) {
            const beginMs = Number(times[(index * RESOLVE_STRIDE) / 8]) / NANOSECONDS_PER_MS;
            const endMs = Number(times[(index * RESOLVE_STRIDE) / 8 + 1]) / NANOSECONDS_PER_MS;
            if (beginMs > 0 && endMs >= beginMs)
              window.__gpuPasses.push({ beginMs, detail, frame, gpuMs: endMs - beginMs, label, submittedMs });
          }
          unmap.call(readback.read);
          state.readbacks.push(readback);
        },
        () => {},
      );
    }
    return result;
  };
`;

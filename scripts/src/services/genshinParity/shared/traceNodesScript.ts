// Records, beside the GPU calls, each node material three builds on the main thread and each program it adds, once the
// Renderer is handed over. A build keeps its material's type and the object it was built for: its type, name, geometry,
// Vertex count and colour, and whether a pass drew it in a material of its own (a shadow or an outline). A string, as
// The GPU trace's is
export const TRACE_NODES_SCRIPT = `
  (() => {
    const renderer = window.__renderer;
    const nodes = renderer._nodes;
    const builds = new WeakMap();
    const record = (name, label, detail, start) => {
      window.__gpuCalls.push({ detail, duration: performance.now() - start, frame: window.__traceTimes.length - 1, label, name, start });
    };
    const createNodeBuilder = nodes._createNodeBuilder;
    nodes._createNodeBuilder = function (renderObject, material) {
      const builder = createNodeBuilder.call(this, renderObject, material);
      const { object } = renderObject;
      const { geometry } = object;
      const vertexCount = geometry?.attributes?.position?.count ?? 0;
      // A grouped mesh holds a material per group and draws each in its own, so a draw is the object's own when its
      // Material is any of them, and its colour is that group's
      const ownMaterials = [object.material].flat();
      const isOwnMaterial = ownMaterials.includes(material);
      const colorMaterial = isOwnMaterial ? material : ownMaterials[0];
      const color = colorMaterial?.color ? " #" + colorMaterial.color.getHexString() : "";
      const pass = isOwnMaterial ? "" : " in a pass material";
      builds.set(builder, {
        detail: object.type + " " + (object.name || geometry?.type) + " " + vertexCount + " vertices" + color + pass,
        label: material.type,
        start: performance.now(),
      });
      return builder;
    };
    const createNodeBuilderState = nodes._createNodeBuilderState;
    nodes._createNodeBuilderState = function (builder) {
      const build = builds.get(builder);
      if (build) record("buildNodes", build.label, build.detail, build.start);
      return createNodeBuilderState.call(this, builder);
    };
    const createProgram = renderer.info.createProgram;
    renderer.info.createProgram = function (program) {
      record("createProgram", program.stage, program.name, performance.now());
      return createProgram.call(this, program);
    };
  })();
`;

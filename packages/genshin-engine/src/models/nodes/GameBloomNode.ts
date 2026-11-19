import type { GameBloomStructure } from "#src/models/nodes/GameBloomStructure";
import type { NodeBuilder, NodeFrame, Renderer, TextureNode, UniformNode } from "three/webgpu";

import {
  BLOOM_BLUR_TEXELS,
  BLOOM_ROTATED_TAPS,
  GENSHIN_BLOOM_INTENSITY,
  GENSHIN_BLOOM_SCALER,
  GENSHIN_BLOOM_STRUCTURE,
  GENSHIN_BLOOM_THRESHOLD,
  GENSHIN_BLOOM_WEIGHTS,
} from "#src/renderer/constants";
import { HalfFloatType, Vector2 } from "three";
import { context, float, max, texture, uniform, uv, vec2, vec3, vec4 } from "three/tsl";
import { Node, NodeMaterial, NodeUpdateType, QuadMesh, RendererUtils, RenderTarget } from "three/webgpu";

declare module "three/webgpu" {
  interface NodeBuilder {
    // The runtime builder has this method, which three's declarations leave out, so the bloom's materials can share its context
    getSharedContext: () => Record<string, unknown>;
  }
}

// One tap of a pass, its offset from the pixel in texels, and the taps a pass reads, each weighed alike
type Tap = readonly [number, number];
type TapSet = readonly Tap[];

// The four taps a box-downsample reads, at the given distance from its pixel's centre in the source's texels
const createBoxTaps = (offset: number): TapSet => [
  [-offset, -offset],
  [offset, -offset],
  [-offset, offset],
  [offset, offset],
];
// The separable pair's row and column, each two taps a side at each distance of the blur's texels
const SEPARABLE_ROW_TAPS: TapSet = BLOOM_BLUR_TEXELS.flatMap((distance): Tap[] => [
  [distance, 0],
  [-distance, 0],
]);
const SEPARABLE_COLUMN_TAPS: TapSet = BLOOM_BLUR_TEXELS.flatMap((distance): Tap[] => [
  [0, distance],
  [0, -distance],
]);
// The passes a level's blur takes in order, each a set of taps: a rotated application is one pass, a separable one is a
// Row and then a column
const getBlurPassTaps = ({ blurForm, blurPasses }: GameBloomStructure): TapSet[] =>
  Array.from({ length: blurPasses }).flatMap(() =>
    blurForm === "rotated" ? [BLOOM_ROTATED_TAPS] : [SEPARABLE_ROW_TAPS, SEPARABLE_COLUMN_TAPS],
  );
const createRenderTarget = (name: string): RenderTarget => {
  const renderTarget = new RenderTarget(1, 1, { depthBuffer: false, type: HalfFloatType });
  renderTarget.texture.name = name;
  renderTarget.texture.generateMipmaps = false;
  return renderTarget;
};
// The mean colour a texture reads at each tap, the taps moved by the inverse size of the texture in texels
const createTapMean = (source: TextureNode, inverseSize: UniformNode<"vec2", Vector2>, taps: TapSet): Node<"vec3"> =>
  taps
    .map(([x, y]) => source.sample(uv().add(inverseSize.mul(vec2(x, y)))).rgb)
    .reduce((sum, tap) => sum.add(tap))
    .mul(float(1 / taps.length));

// One blur pass of every level: its taps are read from its source texture, which is set each frame with the source's inverse size
interface GameBloomBlurPass {
  inverseSize: UniformNode<"vec2", Vector2>;
  material: NodeMaterial;
  source: TextureNode;
}

// One level of the chain: its box-downsample, the two targets its blur passes alternate between, the last of which is
// The blurred result, and the texture the compose reads it through with the weight the compose sums it by
interface GameBloomLevel {
  blurred: RenderTarget;
  downsampled: RenderTarget;
  ping: RenderTarget;
  pong: RenderTarget;
  sampled: TextureNode;
  weight: number;
}

// The game's bloom over a scene colour, drawn as the game's own programs draw it (`Login/Scene/Display.reference.ts`): the
// Prefilter takes max(0, colour - threshold) times the scaler of each channel, or of the mean of four taps for the four-tap
// Form, the chain box-downsamples the prefiltered frame by four taps a level and blurs each level, and the compose sums the
// Four levels by their weights and scales the sum by the intensity. The output is the bloom alone, added onto the scene by
// The caller as three's BloomNode's is. The structure's choices are the game's own shapes, GENSHIN_BLOOM_STRUCTURE the default
export class GameBloomNode extends Node<"vec4"> {
  readonly #blurPasses: GameBloomBlurPass[];
  readonly #composeMaterial = new NodeMaterial();
  readonly #composeTarget = createRenderTarget("GameBloom.compose");
  readonly #copyMaterial = new NodeMaterial();
  readonly #downsampleInverseSize = uniform(new Vector2());
  readonly #downsampleMaterial = new NodeMaterial();
  readonly #downsampleTexture = texture();
  readonly #inputInverseSize = uniform(new Vector2());
  readonly #inputTarget = createRenderTarget("GameBloom.input");
  readonly #inputTexture = texture();
  readonly #isFourTapPrefilter: boolean;
  readonly #levels: GameBloomLevel[];
  readonly #materials: NodeMaterial[];
  #output?: Node<"vec4">;
  readonly #prefilterMaterial = new NodeMaterial();
  readonly #prefilterTarget = createRenderTarget("GameBloom.prefilter");
  readonly #quad = new QuadMesh(new NodeMaterial());
  #rendererState?: RendererUtils.RendererState;
  readonly #size = new Vector2();

  constructor(inputNode: Node<"vec4">, structure: GameBloomStructure = GENSHIN_BLOOM_STRUCTURE) {
    super("vec4");
    this.updateBeforeType = NodeUpdateType.FRAME;
    this.#isFourTapPrefilter = structure.prefilter === "fourTap";
    this.#blurPasses = getBlurPassTaps(structure).map((taps) => {
      const inverseSize = uniform(new Vector2());
      const source = texture();
      const material = new NodeMaterial();
      material.fragmentNode = vec4(createTapMean(source, inverseSize, taps), 1);
      return { inverseSize, material, source };
    });
    this.#levels = GENSHIN_BLOOM_WEIGHTS.map((weight, index) => {
      const ping = createRenderTarget(`GameBloom.ping${index}`);
      const pong = createRenderTarget(`GameBloom.pong${index}`);
      return {
        blurred: this.#blurPasses.length % 2 === 1 ? ping : pong,
        downsampled: createRenderTarget(`GameBloom.downsampled${index}`),
        ping,
        pong,
        sampled: texture(),
        weight,
      };
    });

    const prefiltered = this.#isFourTapPrefilter
      ? createTapMean(this.#inputTexture, this.#inputInverseSize, createBoxTaps(structure.tapOffset))
      : inputNode.rgb;
    this.#prefilterMaterial.fragmentNode = vec4(
      max(prefiltered.sub(float(GENSHIN_BLOOM_THRESHOLD)), vec3(0)).mul(float(GENSHIN_BLOOM_SCALER)),
      1,
    );
    this.#copyMaterial.fragmentNode = inputNode;

    const downsampled = createTapMean(
      this.#downsampleTexture,
      this.#downsampleInverseSize,
      createBoxTaps(structure.tapOffset),
    );
    this.#downsampleMaterial.fragmentNode = vec4(downsampled, 1);

    const composed = this.#levels
      .map(({ sampled, weight }) => sampled.sample(uv()).rgb.mul(float(weight)))
      .reduce((sum, level) => sum.add(level))
      .mul(float(GENSHIN_BLOOM_INTENSITY));
    this.#composeMaterial.fragmentNode = vec4(composed, 0);
    this.#materials = [
      this.#prefilterMaterial,
      this.#copyMaterial,
      this.#downsampleMaterial,
      ...this.#blurPasses.map(({ material }) => material),
      this.#composeMaterial,
    ];
  }

  override dispose(): void {
    super.dispose();
    for (const renderTarget of [
      this.#prefilterTarget,
      this.#inputTarget,
      this.#composeTarget,
      ...this.#levels.flatMap(({ blurred, downsampled, ping, pong }) => [blurred, downsampled, ping, pong]),
    ])
      renderTarget.dispose();
    for (const material of this.#materials) material.dispose();
  }

  // The bloom is the compose's result, read by the frame's final pass through the compose target's texture, which the
  // Node's updateBefore has drawn before the frame reads it
  override setup(builder: NodeBuilder): Node<"vec4"> {
    const sharedContext = context(builder.getSharedContext());
    for (const material of this.#materials) {
      material.contextNode = sharedContext;
      material.needsUpdate = true;
    }
    this.#output ??= texture(this.#composeTarget.texture);
    return this.#output;
  }

  // Each frame the prefilter (after a copy of the input, for the four-tap form), then every level's box-downsample and
  // Blur passes, then the compose, all drawn into their own targets before the frame's final pass reads the output. The
  // Renderer's state is saved into one object the Node keeps, so a frame builds none
  override updateBefore(frame: NodeFrame): boolean | undefined {
    const { renderer } = frame;
    if (!renderer) return undefined;
    this.#rendererState = RendererUtils.saveRendererState(renderer, this.#rendererState);
    const size = renderer.getDrawingBufferSize(this.#size);
    this.#setSize(size.width, size.height);
    if (this.#isFourTapPrefilter) {
      this.#renderPass(renderer, this.#inputTarget, this.#copyMaterial);
      this.#inputTexture.value = this.#inputTarget.texture;
      this.#inputInverseSize.value.set(1 / this.#inputTarget.width, 1 / this.#inputTarget.height);
    }
    this.#renderPass(renderer, this.#prefilterTarget, this.#prefilterMaterial);
    let input = this.#prefilterTarget;
    for (const level of this.#levels) {
      this.#downsampleTexture.value = input.texture;
      this.#downsampleInverseSize.value.set(1 / input.width, 1 / input.height);
      this.#renderPass(renderer, level.downsampled, this.#downsampleMaterial);
      let source = level.downsampled;
      for (const [index, pass] of this.#blurPasses.entries()) {
        const target = index % 2 === 0 ? level.ping : level.pong;
        this.#renderBlur(renderer, pass, source, target);
        source = target;
      }
      input = level.blurred;
    }
    for (const level of this.#levels) level.sampled.value = level.blurred.texture;
    this.#renderPass(renderer, this.#composeTarget, this.#composeMaterial);
    RendererUtils.restoreRendererState(renderer, this.#rendererState);
    return undefined;
  }

  #renderBlur(renderer: Renderer, pass: GameBloomBlurPass, source: RenderTarget, target: RenderTarget): void {
    pass.source.value = source.texture;
    pass.inverseSize.value.set(1 / source.width, 1 / source.height);
    this.#renderPass(renderer, target, pass.material);
  }

  #renderPass(renderer: Renderer, target: RenderTarget, material: NodeMaterial): void {
    this.#quad.material = material;
    renderer.setRenderTarget(target);
    this.#quad.render(renderer);
  }

  // Each level is half the one above, and the prefilter, the input copy and the compose sit at the drawing buffer's full size
  #setSize(width: number, height: number): void {
    this.#prefilterTarget.setSize(width, height);
    this.#inputTarget.setSize(width, height);
    this.#composeTarget.setSize(width, height);
    let levelWidth = width;
    let levelHeight = height;
    for (const level of this.#levels) {
      levelWidth = Math.max(1, Math.floor(levelWidth / 2));
      levelHeight = Math.max(1, Math.floor(levelHeight / 2));
      for (const target of [level.downsampled, level.ping, level.pong]) target.setSize(levelWidth, levelHeight);
    }
  }
}

import type { NodeBuilder, NodeFrame, Renderer, TextureNode } from "three/webgpu";

import {
  BLOOM_BLUR_TEXELS,
  GENSHIN_BLOOM_INTENSITY,
  GENSHIN_BLOOM_SCALER,
  GENSHIN_BLOOM_THRESHOLD,
  GENSHIN_BLOOM_WEIGHTS,
} from "#src/renderer/constants";
import { HalfFloatType, Vector2 } from "three";
import { context, float, max, texture, uniform, uv, vec2, vec3, vec4 } from "three/tsl";
import { Node, NodeMaterial, NodeUpdateType, QuadMesh, RendererUtils, RenderTarget } from "three/webgpu";

// Each blur's four taps are two a side at each distance in texels, each weighed alike so the four sum to one
const BLUR_TAP_WEIGHT = 1 / (2 * BLOOM_BLUR_TEXELS.length);
// The four taps a box-downsample reads, at the centres of the 2 by 2 block of the level above that a texel covers
const DOWNSAMPLE_TAP_OFFSETS: readonly (readonly [number, number])[] = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [-0.5, 0.5],
  [0.5, 0.5],
];
// The two blur directions, along the rows and down the columns, hoisted so no frame builds one
const BLUR_ROW_DIRECTION = new Vector2(1, 0);
const BLUR_COLUMN_DIRECTION = new Vector2(0, 1);

// One level of the chain: its box-downsample, the blur's horizontal pass and its blurred result, each half the one
// Above, with the texture the compose reads the blurred result through and the weight the compose sums it by
interface GameBloomLevel {
  blurred: RenderTarget;
  downsampled: RenderTarget;
  horizontal: RenderTarget;
  sampled: TextureNode;
  weight: number;
}

const createRenderTarget = (name: string): RenderTarget => {
  const renderTarget = new RenderTarget(1, 1, { depthBuffer: false, type: HalfFloatType });
  renderTarget.texture.name = name;
  renderTarget.texture.generateMipmaps = false;
  return renderTarget;
};

// The game's bloom over a scene colour, drawn as the game's own programs draw it (`Login/Scene/Display.reference.ts`): the
// Prefilter takes max(0, colour - threshold) times the scaler of each channel, the chain box-downsamples the prefiltered
// Frame by four taps a level and blurs each level by four taps, and the compose sums the four levels by their weights and
// Scales the sum by the intensity. The output is the bloom alone, added onto the scene by the caller as three's BloomNode's is
export class GameBloomNode extends Node<"vec4"> {
  readonly #blurDirection = uniform(new Vector2(1, 0));
  readonly #blurInverseSize = uniform(new Vector2());
  readonly #blurMaterial = new NodeMaterial();
  readonly #blurTexture = texture(null);
  readonly #composeMaterial = new NodeMaterial();
  readonly #composeTarget = createRenderTarget("GameBloom.compose");
  readonly #downsampleInverseSize = uniform(new Vector2());
  readonly #downsampleMaterial = new NodeMaterial();
  readonly #downsampleTexture = texture(null);
  readonly #levels: GameBloomLevel[];
  readonly #materials: NodeMaterial[];
  #output?: Node<"vec4">;
  readonly #prefilterMaterial = new NodeMaterial();
  readonly #prefilterTarget = createRenderTarget("GameBloom.prefilter");
  readonly #quad = new QuadMesh(new NodeMaterial());
  readonly #rendererState: RendererUtils.RendererState = {};
  readonly #size = new Vector2();

  constructor(inputNode: Node<"vec4">) {
    super("vec4");
    this.updateBeforeType = NodeUpdateType.FRAME;
    this.#levels = GENSHIN_BLOOM_WEIGHTS.map((weight, index) => ({
      blurred: createRenderTarget(`GameBloom.blurred${index}`),
      downsampled: createRenderTarget(`GameBloom.downsampled${index}`),
      horizontal: createRenderTarget(`GameBloom.horizontal${index}`),
      sampled: texture(null),
      weight,
    }));

    const prefilter = max(inputNode.rgb.sub(float(GENSHIN_BLOOM_THRESHOLD)), vec3(0)).mul(float(GENSHIN_BLOOM_SCALER));
    this.#prefilterMaterial.fragmentNode = vec4(prefilter, 1);

    const downsampled = DOWNSAMPLE_TAP_OFFSETS.map(
      ([x, y]) => this.#downsampleTexture.sample(uv().add(this.#downsampleInverseSize.mul(vec2(x, y)))).rgb,
    )
      .reduce((sum, tap) => sum.add(tap))
      .mul(float(1 / DOWNSAMPLE_TAP_OFFSETS.length));
    this.#downsampleMaterial.fragmentNode = vec4(downsampled, 1);

    const blurred = BLOOM_BLUR_TEXELS.flatMap((distance) => [distance, -distance])
      .map(
        (distance) =>
          this.#blurTexture.sample(uv().add(this.#blurDirection.mul(this.#blurInverseSize).mul(float(distance)))).rgb,
      )
      .reduce((sum, tap) => sum.add(tap))
      .mul(float(BLUR_TAP_WEIGHT));
    this.#blurMaterial.fragmentNode = vec4(blurred, 1);

    const composed = this.#levels
      .map(({ sampled, weight }) => sampled.sample(uv()).rgb.mul(float(weight)))
      .reduce((sum, level) => sum.add(level))
      .mul(float(GENSHIN_BLOOM_INTENSITY));
    this.#composeMaterial.fragmentNode = vec4(composed, 0);
    this.#materials = [this.#prefilterMaterial, this.#downsampleMaterial, this.#blurMaterial, this.#composeMaterial];
  }

  override dispose(): void {
    super.dispose();
    for (const renderTarget of [
      this.#prefilterTarget,
      this.#composeTarget,
      ...this.#levels.flatMap(({ blurred, downsampled, horizontal }) => [blurred, downsampled, horizontal]),
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

  // Each frame the prefilter, then every level's box-downsample and two blur passes, then the compose, all drawn into
  // Their own targets before the frame's final pass reads the output. The renderer's state is saved into one object the
  // Node keeps, so a frame builds none
  override updateBefore(frame: NodeFrame): boolean | undefined {
    const { renderer } = frame;
    RendererUtils.saveRendererState(renderer, this.#rendererState);
    const size = renderer.getDrawingBufferSize(this.#size);
    this.#setSize(size.width, size.height);
    this.#renderPass(renderer, this.#prefilterTarget, this.#prefilterMaterial);
    let input = this.#prefilterTarget;
    for (const level of this.#levels) {
      this.#downsampleTexture.value = input.texture;
      this.#downsampleInverseSize.value.set(1 / input.width, 1 / input.height);
      this.#renderPass(renderer, level.downsampled, this.#downsampleMaterial);
      this.#renderBlur(renderer, level.downsampled, level.horizontal, BLUR_ROW_DIRECTION);
      this.#renderBlur(renderer, level.horizontal, level.blurred, BLUR_COLUMN_DIRECTION);
      input = level.blurred;
    }
    for (const level of this.#levels) level.sampled.value = level.blurred.texture;
    this.#renderPass(renderer, this.#composeTarget, this.#composeMaterial);
    RendererUtils.restoreRendererState(renderer, this.#rendererState);
    return undefined;
  }

  #renderBlur(renderer: Renderer, source: RenderTarget, target: RenderTarget, direction: Vector2): void {
    this.#blurTexture.value = source.texture;
    this.#blurDirection.value.copy(direction);
    this.#blurInverseSize.value.set(1 / source.width, 1 / source.height);
    this.#renderPass(renderer, target, this.#blurMaterial);
  }

  #renderPass(renderer: Renderer, target: RenderTarget, material: NodeMaterial): void {
    this.#quad.material = material;
    renderer.setRenderTarget(target);
    this.#quad.render(renderer);
  }

  // Each level is half the one above, and the prefilter and the compose sit at the drawing buffer's full size
  #setSize(width: number, height: number): void {
    this.#prefilterTarget.setSize(width, height);
    this.#composeTarget.setSize(width, height);
    let levelWidth = width;
    let levelHeight = height;
    for (const level of this.#levels) {
      levelWidth = Math.max(1, Math.floor(levelWidth / 2));
      levelHeight = Math.max(1, Math.floor(levelHeight / 2));
      level.downsampled.setSize(levelWidth, levelHeight);
      level.horizontal.setSize(levelWidth, levelHeight);
      level.blurred.setSize(levelWidth, levelHeight);
    }
  }
}

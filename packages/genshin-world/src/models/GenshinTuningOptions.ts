import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { DevRenderer } from "#src/models/dev/DevRenderer";
import type {
  FogUniforms,
  GameClock,
  GradeOptions,
  LightUniforms,
  PostPipeline,
  PostUniforms,
  RampOptions,
  SkyUniforms,
  WaterUniforms,
  WindUniforms,
} from "genshin-engine";
import type { Data3DTexture, DataTexture, DirectionalLight } from "three";
import type { Ref } from "vue";

export interface GenshinTuningOptions {
  devRegistry: DevRegistry;
  fogUniforms: FogUniforms;
  gameClock: GameClock;
  getRenderer: () => DevRenderer | undefined;
  gradeLutTexture: Data3DTexture;
  gradeOptions: GradeOptions;
  isTemporalAntialiasingOn: Ref<boolean>;
  lightUniforms: LightUniforms;
  postPipeline: Readonly<Ref<PostPipeline | undefined>>;
  postUniforms: PostUniforms;
  rampOptions: RampOptions;
  rampTexture: DataTexture;
  skyUniforms: SkyUniforms;
  sun: DirectionalLight;
  waterUniforms: WaterUniforms;
  windUniforms: WindUniforms;
}

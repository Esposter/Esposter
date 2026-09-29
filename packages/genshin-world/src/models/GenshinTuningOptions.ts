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
import type { Data3DTexture, DataTexture } from "three";
import type { Ref } from "vue";

export interface GenshinTuningOptions {
  fogUniforms: FogUniforms;
  gameClock: GameClock;
  gradeLutTexture: Data3DTexture;
  gradeOptions: GradeOptions;
  lightUniforms: LightUniforms;
  postPipeline: Readonly<Ref<PostPipeline | undefined>>;
  postUniforms: PostUniforms;
  rampOptions: RampOptions;
  rampTexture: DataTexture;
  skyUniforms: SkyUniforms;
  waterUniforms: WaterUniforms;
  windUniforms: WindUniforms;
}

import type { FogUniforms, GradeOptions, LightUniforms, PostPipeline, PostUniforms, RampOptions } from "genshin-engine";
import type { Data3DTexture, DataTexture } from "three";

export interface GenshinTuningOptions {
  fogUniforms: FogUniforms;
  gradeLutTexture: Data3DTexture;
  gradeOptions: GradeOptions;
  lightUniforms: LightUniforms;
  postPipeline: Readonly<Ref<PostPipeline | undefined>>;
  postUniforms: PostUniforms;
  rampOptions: RampOptions;
  rampTexture: DataTexture;
}

import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { Impostor } from "#src/models/vegetation/Impostor";
import type { DataTexture } from "three";
import type { Node } from "three/webgpu";

export interface ImpostorMaterialOptions {
  // How far the impostor has faded in over its mesh, from none to all
  fade: Node<"float">;
  impostor: Impostor;
  // The matrix the card is placed by when it is one instance of a mesh drawn for all of them, its own turn included
  instanceMatrix?: Node<"mat4">;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

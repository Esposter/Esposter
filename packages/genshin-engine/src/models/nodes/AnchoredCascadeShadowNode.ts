import type { CSMFrustum } from "three/examples/jsm/csm/CSMFrustum.js";
import type { CSMShadowNodeData } from "three/examples/jsm/csm/CSMShadowNode.js";
import type { NodeFrame } from "three/webgpu";

import { FOLLOW_CAMERA_MAX_DISTANCE } from "#src/camera/constants";
import { DirectionalLight, Matrix4, PerspectiveCamera, Vector3 } from "three";
import { CSMShadowNode } from "three/examples/jsm/csm/CSMShadowNode.js";

const UP = new Vector3(0, 1, 0);
const NOT_DRAWN = new Vector3(NaN, NaN, NaN);
// The anchor snaps to a step this many texels wide, so a cascade is drawn again only once the anchor has moved that far
const ANCHOR_STEP_TEXELS = 16;

// The sun's cascades fitted to a sphere about an anchor, the point the camera orbits, rather than to each slice of the
// View. A slice's bounds swing with every degree of the look, so three's fit moves the map and every cascade is drawn
// Each frame. A sphere about the anchor is the same whichever way the eye faces, so a turn draws nothing, and a cascade
// Is drawn again only when the anchor moves a step of its map, since the origin snaps to that grid. Each sphere reaches
// The follow camera's arm past the slice's far corner, so the eye's orbit stays inside it
export class AnchoredCascadeShadowNode extends CSMShadowNode {
  // Where the cascades are centred, which the owner sets each frame to the point the camera orbits
  anchor: Vector3 = new Vector3();
  readonly #anchorLight = new Vector3();
  readonly #center = new Vector3();
  readonly #drawnCenters: Vector3[] = [];
  readonly #lightDirection = new Vector3();
  readonly #lightOrientation = new Matrix4();
  readonly #lightOrientationInverse = new Matrix4();
  readonly #sunLight: DirectionalLight;

  constructor(light: DirectionalLight, data: CSMShadowNodeData) {
    super(light, data);
    this.#sunLight = light;
  }

  override updateBefore(frame: NodeFrame): undefined {
    // Places the placeholder lights in the scene, which the snapped positions below then overwrite
    super.updateBefore(frame);
    const sunLight = this.#sunLight;
    this.#lightOrientation.lookAt(sunLight.position, sunLight.target.position, UP);
    this.#lightOrientationInverse.copy(this.#lightOrientation).invert();
    this.#anchorLight.copy(this.anchor).applyMatrix4(this.#lightOrientationInverse);
    this.#lightDirection.subVectors(sunLight.target.position, sunLight.position).normalize();
    for (let index = 0; index < this.lights.length; index++) {
      const lwLight = this.lights[index]!;
      const { shadow } = lwLight;
      if (shadow === undefined) continue;
      const shadowCamera = shadow.camera;
      // The sphere grows by the snap, which moves the anchor by up to half a step on each axis, so the map still holds it
      const reach = FOLLOW_CAMERA_MAX_DISTANCE + this.#getFrustumExtent(this.frustums[index]!);
      const radius = reach / (1 - ANCHOR_STEP_TEXELS / shadow.mapSize.width);
      const step = (ANCHOR_STEP_TEXELS * 2 * radius) / shadow.mapSize.width;
      // The origin snaps to a step of the map's texels, and the depth is pushed past the sphere by the light margin, so a
      // Move within a step leaves the map's contents, and so the map, as they were
      this.#center.set(
        Math.round(this.#anchorLight.x / step) * step,
        Math.round(this.#anchorLight.y / step) * step,
        Math.ceil((this.#anchorLight.z + radius + this.lightMargin) / step) * step,
      );
      const drawnCenter = (this.#drawnCenters[index] ??= new Vector3().copy(NOT_DRAWN));
      if (!drawnCenter.equals(this.#center) || shadowCamera.right !== radius) {
        drawnCenter.copy(this.#center);
        shadow.needsUpdate = true;
      }
      lwLight.position.copy(this.#center).applyMatrix4(this.#lightOrientation);
      lwLight.target.position.copy(lwLight.position).add(this.#lightDirection);
      shadowCamera.left = -radius;
      shadowCamera.right = radius;
      shadowCamera.top = radius;
      shadowCamera.bottom = -radius;
      shadowCamera.far = 2 * radius + 2 * this.lightMargin + step;
      shadowCamera.updateProjectionMatrix();
      lwLight.updateMatrixWorld();
      lwLight.target.updateMatrixWorld();
    }
    return undefined;
  }

  // The farthest corner of a slice from the eye, plus the margin the cascades fade across when they fade
  #getFrustumExtent(frustum: CSMFrustum): number {
    let extent = 0;
    for (const vertices of [frustum.vertices.near, frustum.vertices.far])
      for (const vertex of vertices) extent = Math.max(extent, vertex.length());
    if (this.fade && this.camera instanceof PerspectiveCamera) {
      const far = Math.max(this.camera.far, this.maxFar);
      const linearDepth = frustum.vertices.far[0]!.z / (far - this.camera.near);
      extent += 0.25 * linearDepth ** 2 * (far - this.camera.near);
    }
    return extent;
  }
}

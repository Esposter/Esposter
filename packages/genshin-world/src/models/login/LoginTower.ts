import type { LoginTowerKind } from "#src/models/login/LoginTowerKind";

// One tower of the login screen, in metres: the walkway's surface is at zero and the camera looks down -z
export interface LoginTower {
  // Its shaft's, which every other measure of its kind is a share of
  diameter: number;
  kind: LoginTowerKind;
  // Its axis on the ground plane, as x and z
  position: [number, number];
  // The height of its highest point
  top: number;
}

import type { KitBody } from "#src/models/kit/KitBody";

// The body an absorb check or a drain acts from, standing on the given point of the ground and facing none
export const createKitBody = (position: KitBody["position"]): KitBody => ({ facing: 0, height: 0, position });

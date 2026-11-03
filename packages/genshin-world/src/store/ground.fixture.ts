import { useWorldGroundStore } from "#src/store/ground";

// The ground store started over one flat ground at this height, outside the realm, for a suite that tests a feature
// Standing on it. Called after the session is started, since that makes the Pinia it starts into
export const startTestWorldGround = (height = 0) => {
  const worldGroundStore = useWorldGroundStore();
  worldGroundStore.start({
    baseGrounds: [{ base: height, features: [], hills: [] }],
    getIsInHomeRealm: () => false,
    getRegionGrounds: () => [],
  });
  return worldGroundStore;
};

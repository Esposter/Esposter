// What a component's `Index.fixture.ts` holds, which the parity page and the visual suite render it with
export interface ScreenFixture {
  // A screen that is only a motion, such as a sequence of screens each with its own fixture, is shot on the page but
  // Kept out of the visual suite, whose screenshot finishes running animations and so races through it
  isMotionOnly?: boolean;
  // Props applied after the first frame, so a transition they start plays and can be shot at a known time
  motionProps?: Record<string, unknown>;
  props: Record<string, unknown>;
  // The event a screen emits once it has drawn, for one that draws later than it mounts (a 3D scene compiling its
  // Pipelines), which the page and the suite wait on before a shot
  readyEvent?: string;
  // Props the visual suite alone draws a moving screen under to hold it still, over its own and each variant's: a
  // Scene's glide held and drawn at a tier whose anti-aliasing does not jitter from frame to frame, so a screenshot
  // Settles where the parity page and the references keep drawing it as it moves
  stillProps?: Record<string, unknown>;
  // Other states the screen is approved in, each its props over `props` by a name its image is kept under
  variants?: Record<string, Record<string, unknown>>;
  // For a scene, the game's meshes each family of its parts stands in for, which a witness render groups its exports by
  witnessFamilies?: Record<string, RegExp>;
}

import type { Group } from "three";
import type { UniformNode } from "three/webgpu";

// The login sky's clouds: each band's cover by its name, their release, the group every band's sprite is in, and the
// Scroll that carries the sea's clouds with the world
export interface LoginClouds {
  covers: Record<string, UniformNode<"float", number>>;
  dispose: () => void;
  group: Group;
  scroll: (scrolled: number) => void;
}

import type { SceneWithPlugins } from "vue-phaserjs";

import { describe } from "vitest";

// A scene with no Phaser state, for a suite whose code only passes the scene on or never reads it
export const createSceneWithPlugins = () => ({}) as SceneWithPlugins;

describe.todo("createSceneWithPlugins");

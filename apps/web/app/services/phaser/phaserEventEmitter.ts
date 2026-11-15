import type { PhaserEvents } from "#src/models/phaser/PhaserEvents";

import { TypedEventEmitter } from "@esposter/shared";

export const phaserEventEmitter = new TypedEventEmitter<PhaserEvents>();

import type { PhaserEvents } from "@/models/phaser/PhaserEvents";

import { EventEmitter } from "eventemitter3";

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();

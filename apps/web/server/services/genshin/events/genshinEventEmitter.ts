import type { GenshinEvents } from "#server/models/genshin/events/GenshinEvents";

import { EventEmitter } from "node:events";

export const genshinEventEmitter = new EventEmitter<GenshinEvents>();

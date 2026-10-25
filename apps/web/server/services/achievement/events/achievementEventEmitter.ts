import type { AchievementEvents } from "#server/models/achievement/events/AchievementEvents";

import { EventEmitter } from "node:events";

export const achievementEventEmitter = new EventEmitter<AchievementEvents>();

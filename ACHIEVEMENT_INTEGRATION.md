# Achievement System Integration

## 1. Database Migration

```bash
cd packages/app
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## 2. Apply tRPC Middleware

Add to procedures that should track achievements (e.g., `standardAuthedProcedure`):

```typescript
import { achievementMiddleware } from "@@/server/trpc/middleware/achievement";

export const yourProcedure = baseProcedure
  .use(achievementMiddleware)
  .use(otherMiddleware);
```

## 3. Add UI Components

**Layout:**
```vue
<template>
  <AchievementNotification />
</template>
```

**Subscribe (in plugin or layout):**
```typescript
$trpc.achievement.onUnlockAchievement.subscribe(undefined, {
  onData(data) {
    useAchievementStore().handleUnlock(data);
  },
});
```

## 4. Add New Achievements

Edit `server/services/achievement/achievementDefinitions.ts`:

```typescript
{
  key: "new_achievement",
  name: "Achievement Name",
  description: "Description",
  icon: "mdi-icon-name",
  category: AchievementCategory.Social,
  type: AchievementType.Progressive,
  points: 50,
  targetProgress: 10,
  metadata: { eventType: "router.procedure" },
  checkCriteria: (eventData: any) => 1,
}
```

Done!

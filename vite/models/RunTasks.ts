import type { UserConfig } from "vite-plus";

// `vite-plus` types the tasks only through its config, so the map is read off it
export type RunTasks = NonNullable<NonNullable<UserConfig["run"]>["tasks"]>;

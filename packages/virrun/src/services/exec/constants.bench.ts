import { describe } from "vitest";

export const OS_BACKEND_BENCH_TASK_NAME: string = process.platform === "win32" ? "os/wsl" : "os/linux";

describe.todo("constants");

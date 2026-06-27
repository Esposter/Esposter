import { BackendType } from "@/models/virrun/BackendType";
import { describe } from "vitest";

export const OS_BACKEND_BENCH_TASK_NAME: string =
  process.platform === "win32" ? `${BackendType.Os}/wsl` : `${BackendType.Os}/linux`;

describe.todo("constants");

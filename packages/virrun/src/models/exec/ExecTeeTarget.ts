// The host stream a tee mirrors the child's stdout onto.
export type ExecTeeTarget = keyof Pick<NodeJS.Process, "stderr" | "stdout">;

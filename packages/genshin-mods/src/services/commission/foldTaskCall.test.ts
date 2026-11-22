import { describe, expect, test } from "vitest";

import { TaskStatus } from "../../models/TaskStatus";
import { TaskTool } from "../../models/TaskTool";
import { foldTaskCall } from "./foldTaskCall";

describe(foldTaskCall, () => {
  const id = "0";
  const subject = "a";
  const pending = { id, status: TaskStatus.Pending, subject } as const;

  test("adds a created task as pending", () => {
    expect.hasAssertions();

    expect(foldTaskCall([], { id, subject, tool: TaskTool.TaskCreate })).toStrictEqual([pending]);
  });

  test("updates only the fields an update names", () => {
    expect.hasAssertions();

    expect(foldTaskCall([pending], { id, status: TaskStatus.Completed, tool: TaskTool.TaskUpdate })).toStrictEqual([
      { ...pending, status: TaskStatus.Completed },
    ]);
  });

  test("removes a deleted task", () => {
    expect.hasAssertions();

    expect(foldTaskCall([pending], { id, status: "deleted", tool: TaskTool.TaskUpdate })).toStrictEqual([]);
  });

  test("replaces the list with a todo list, ids by place", () => {
    expect.hasAssertions();

    expect(
      foldTaskCall([pending], { todos: [{ content: subject, status: TaskStatus.Pending }], tool: TaskTool.TodoWrite }),
    ).toStrictEqual([pending]);
  });
});

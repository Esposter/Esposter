import { parseSearchCandidates } from "#src/services/genshinParity/shared/parseSearchCandidates";
import { describe, expect, test } from "vitest";

describe(parseSearchCandidates, () => {
  const fullLine = JSON.stringify({
    chapters: [
      { start_time: 0, title: "Intro" },
      { start_time: 75.5, title: "Pick up" },
    ],
    duration: 605,
    fps: 60,
    height: 1080,
    title: "Pick up items",
    upload_date: "19700101",
    uploader: "Guide Channel",
    webpage_url: "https://www.youtube.com/watch?v=abcdefghijk",
  });

  test("reads a full line into a candidate, its upload date written with dashes", () => {
    expect.hasAssertions();

    expect(parseSearchCandidates(fullLine)).toStrictEqual([
      {
        chapters: [
          { startSeconds: 0, title: "Intro" },
          { startSeconds: 75.5, title: "Pick up" },
        ],
        durationSeconds: 605,
        fps: 60,
        height: 1080,
        title: "Pick up items",
        uploadDate: new Date(0).toISOString().slice(0, 10),
        uploader: "Guide Channel",
        url: "https://www.youtube.com/watch?v=abcdefghijk",
      },
    ]);
  });

  test("leaves out the height, frame rate and chapters of a line that has none", () => {
    expect.hasAssertions();

    const line = JSON.stringify({
      duration: 42,
      title: "Short",
      upload_date: "19700101",
      uploader: null,
      webpage_url: "https://www.bilibili.com/video/BV1xx411c7mD",
    });

    expect(parseSearchCandidates(line)).toStrictEqual([
      {
        durationSeconds: 42,
        title: "Short",
        uploadDate: new Date(0).toISOString().slice(0, 10),
        url: "https://www.bilibili.com/video/BV1xx411c7mD",
      },
    ]);
  });

  test("skips a line that is not JSON and keeps the candidates either side of it", () => {
    expect.hasAssertions();

    expect(parseSearchCandidates(`${fullLine}\nWARNING: not a video\n${fullLine}`)).toHaveLength(2);
  });
});

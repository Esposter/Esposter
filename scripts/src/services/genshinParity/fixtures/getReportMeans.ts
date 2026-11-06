// Each reference's mean difference in the committed report, by its id, for the rows of its table that carry one. The cells
// Are padded to the table's width, so the separators take any run of spaces
export const getReportMeans = (report: string): Map<string, number> =>
  new Map(
    Array.from(report.matchAll(/^\| `(?<id>[^`]+)` +\|[^|]*\| +(?<mean>[\d.]+)% +\|/gmu), ({ groups }) => [
      groups?.id ?? "",
      Number(groups?.mean),
    ]),
  );

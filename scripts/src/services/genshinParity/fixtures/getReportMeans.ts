// Each reference's mean difference in the committed report, by its id, for the rows of its table that carry one
export const getReportMeans = (report: string): Map<string, number> =>
  new Map(
    Array.from(report.matchAll(/^\| `(?<id>[^`]+)` \| [^|]* \| (?<mean>[\d.]+)% /gmu), ({ groups }) => [
      groups?.id ?? "",
      Number(groups?.mean),
    ]),
  );

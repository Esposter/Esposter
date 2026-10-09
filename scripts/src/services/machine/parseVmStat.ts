import { InvalidOperationError, Operation } from "@esposter/shared";

const PAGE_SIZE_REGEX = /page size of (\d+) bytes/;
const PAGE_LINE_REGEX = /^(Pages [a-z]+):\s+(\d+)\.$/;
// Free memory plus what macOS hands back on demand: the inactive, speculative and purgeable pages
const RECLAIMABLE_PAGE_LABELS: readonly string[] = [
  "Pages free",
  "Pages inactive",
  "Pages speculative",
  "Pages purgeable",
];

// The bytes `vm_stat` reports available, as its page counts times the page size it names in its header
export const parseVmStat = (output: string): number => {
  const pageSizeMatch = PAGE_SIZE_REGEX.exec(output);
  if (!pageSizeMatch) throw new InvalidOperationError(Operation.Read, "vm_stat", "reports no page size in its header");
  const pageCount = output.split("\n").reduce((total, line) => {
    const pageLineMatch = PAGE_LINE_REGEX.exec(line.trim());
    return pageLineMatch && RECLAIMABLE_PAGE_LABELS.includes(pageLineMatch[1] ?? "")
      ? total + Number(pageLineMatch[2])
      : total;
  }, 0);
  return pageCount * Number(pageSizeMatch[1]);
};

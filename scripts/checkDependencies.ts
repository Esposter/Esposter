import { spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const registryUrl = "https://registry.npmjs.org";
const registryConcurrency = 4;
const registryRetryCount = 3;
const startedAt = performance.now();
const isColorEnabled = !process.env.NO_COLOR;
const color = {
  cyan: (text: string) => (isColorEnabled ? `\u001B[36m${text}\u001B[39m` : text),
  green: (text: string) => (isColorEnabled ? `\u001B[32m${text}\u001B[39m` : text),
  red: (text: string) => (isColorEnabled ? `\u001B[31m${text}\u001B[39m` : text),
  yellow: (text: string) => (isColorEnabled ? `\u001B[33m${text}\u001B[39m` : text),
};
// oxlint-disable-next-line no-control-regex -- matching ANSI escape sequences requires the ESC control character
const ansiPattern = /\u001B\[[\d;]+m/gu;

const getVisibleLength = (text: string) => text.replace(ansiPattern, "").length;

const padEndVisible = (text: string, length: number) =>
  `${text}${" ".repeat(Math.max(length - getVisibleLength(text), 0))}`;

interface DependencyEntry {
  group: string;
  pkg: string;
  specifier: string;
}

interface ManifestDependency {
  field: string;
  manifestName: string;
  manifestPath: string;
  pkg: string;
  specifier: string;
}

interface Mismatch {
  group: string;
  pkg: string;
  resolved: string;
  specifier: string;
}

interface OutdatedDependency {
  current: string;
  dependencyType: string;
  dependents: string[];
  latest: string;
  pkg: string;
  specifier: string;
}

interface PnpmOutdatedDependency {
  current?: string;
  dependencyType?: string;
  dependentPackages?: { name: string }[];
  latest: string;
}

interface RegistryCheckError {
  error: string;
  pkg: string;
}

const workspaceYaml = readFileSync(resolve(root, "pnpm-workspace.yaml"), "utf8");
const lockYaml = readFileSync(resolve(root, "pnpm-lock.yaml"), "utf8");

const getSection = (name: string, text: string) =>
  new RegExp(`^${name}:\\n(?<section>[\\s\\S]*?)(?=^\\S|(?![\\s\\S]))`, "mu").exec(text)?.groups?.section ?? "";

const parseWorkspaceEntries = (group: string, section: string) => {
  const entries: DependencyEntry[] = [];

  for (const { groups } of section.matchAll(/^[ ]{2}['"]?(?<pkg>[^'":\n]+)['"]?:\s*(?<specifier>.+)$/gmu)) {
    const pkg = groups?.pkg;
    const specifier = groups?.specifier;
    if (!pkg || !specifier) continue;

    entries.push({ group, pkg: pkg.trim(), specifier: specifier.trim() });
  }

  return entries;
};

const getSpecifierBase = (specifier: string) => specifier.replace(/^[\^~>=< ]+/u, "");

const getVersionParts = (version: string) => {
  const [versionBase = "", prerelease] = version.split("-", 2);
  const [major = 0, minor = 0, patch = 0] = versionBase.split(".").map((part) => Number.parseInt(part, 10) || 0);
  return { major, minor, patch, prerelease };
};

const compareVersionBase = (left: string, right: string) => {
  const leftParts = getVersionParts(left);
  const rightParts = getVersionParts(right);

  for (const key of ["major", "minor", "patch"] as const) {
    const difference = leftParts[key] - rightParts[key];
    if (difference !== 0) return difference;
  }

  return 0;
};

const getVersionChangeLevel = (current: string, latest: string) => {
  const currentParts = getVersionParts(current);
  const latestParts = getVersionParts(latest);
  if (currentParts.major !== latestParts.major) return 2;
  if (currentParts.minor !== latestParts.minor) return 1;
  return 0;
};

const isVersionOutdated = (current: string, latest: string) => {
  const baseComparison = compareVersionBase(current, latest);
  if (baseComparison > 0) return false;
  if (baseComparison < 0) return true;

  const currentPrerelease = getVersionParts(current).prerelease;
  const latestPrerelease = getVersionParts(latest).prerelease;

  if (currentPrerelease && !latestPrerelease) return true;
  if (!currentPrerelease) return false;

  return currentPrerelease !== latestPrerelease;
};

const getColorizedLatestVersion = (current: string, latest: string) => {
  const changeLevel = getVersionChangeLevel(current, latest);
  const latestParts = getVersionParts(latest);

  if (changeLevel === 2) return color.red(latest);
  if (changeLevel === 1) return `${latestParts.major}${color.yellow(latest.slice(String(latestParts.major).length))}`;

  const currentParts = getVersionParts(current);
  if (currentParts.patch !== latestParts.patch || currentParts.prerelease !== latestParts.prerelease) {
    const prefix = `${latestParts.major}.${latestParts.minor}.`;
    return `${prefix}${color.green(latest.slice(prefix.length))}`;
  }

  return latest;
};

const sliceLockSection = (startMarker: string, endMarkers: string[]) => {
  const start = lockYaml.indexOf(startMarker);
  if (start === -1) return "";

  let end = lockYaml.length;
  for (const marker of endMarkers) {
    const index = lockYaml.indexOf(marker, start + 1);
    if (index !== -1 && index < end) end = index;
  }

  return lockYaml.slice(start, end);
};

const parseLockResolvedVersions = (sectionText: string, pkgIndent: number) => {
  const childIndent = pkgIndent + 2;
  const pattern = new RegExp(
    `[ ]{${pkgIndent}}['"]?(?<pkg>[^'":\\n]+)['"]?:\\s*\\n[ ]{${childIndent}}specifier: [^\\n]+\\n[ ]{${childIndent}}version: (?<version>[^\\n]+)`,
    "gu",
  );
  const versions = new Map<string, string>();

  for (const { groups } of sectionText.matchAll(pattern)) {
    const pkg = groups?.pkg;
    const version = groups?.version;
    if (!pkg || !version) continue;

    versions.set(pkg.trim(), version.trim().split(/[(@]/u)[0]?.trim() ?? "");
  }

  return versions;
};

const getLockCatalogVersions = () =>
  parseLockResolvedVersions(sliceLockSection("\ncatalogs:", ["\npackages:", "\nsnapshots:", "\nimporters:"]), 4);

const getLockConfigDependencyVersions = () =>
  parseLockResolvedVersions(sliceLockSection("\nimporters:", ["\npackages:"]), 6);

const getMismatches = (entries: DependencyEntry[], resolvedVersions: Map<string, string>) => {
  const mismatches: Mismatch[] = [];

  for (const { group, pkg, specifier } of entries) {
    const resolved = resolvedVersions.get(pkg);
    if (!resolved) continue;

    const specifierBase = getSpecifierBase(specifier);
    if (specifierBase !== resolved) mismatches.push({ group, pkg, resolved, specifier });
  }

  return mismatches;
};

const dependencyFields = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"] as const;

const getPackageJsonPaths = () => [
  resolve(root, "package.json"),
  ...readdirSync(resolve(root, "packages"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(root, "packages", entry.name, "package.json")),
];

const getManifestDependencies = () => {
  const manifestDependencies: ManifestDependency[] = [];

  for (const manifestPath of getPackageJsonPaths()) {
    const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!manifest || typeof manifest !== "object") continue;

    const manifestName = (manifest as Record<string, unknown>).name;
    if (typeof manifestName !== "string") continue;

    for (const field of dependencyFields) {
      const dependencies: unknown = (manifest as Record<string, unknown>)[field];
      if (!dependencies || typeof dependencies !== "object") continue;

      for (const [pkg, specifier] of Object.entries(dependencies)) {
        if (typeof specifier !== "string") continue;

        manifestDependencies.push({ field, manifestName, manifestPath, pkg, specifier });
      }
    }
  }

  return manifestDependencies;
};

const getDependencyType = (field: string) => {
  if (field === "devDependencies") return "dev";
  if (field === "optionalDependencies") return "optional";
  if (field === "peerDependencies") return "peer";

  return "";
};

const getUncatalogedManifestDependencies = (manifestDependencies: ManifestDependency[]) =>
  manifestDependencies.filter(
    ({ specifier }) => !specifier.startsWith("catalog:") && !specifier.startsWith("workspace:"),
  );

const createTableBorder = (left: string, separator: string, right: string, widths: number[]) =>
  `${left}${widths.map((width) => "─".repeat(width + 2)).join(separator)}${right}`;

const printTable = (headers: string[], rows: string[][]) => {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => getVisibleLength(row[index] ?? ""))),
  );

  console.log(createTableBorder("┌", "┬", "┐", widths));
  console.log(`│ ${headers.map((header, index) => color.cyan(header.padEnd(widths[index] ?? 0))).join(" │ ")} │`);
  console.log(createTableBorder("├", "┼", "┤", widths));

  for (const [index, row] of rows.entries()) {
    console.log(`│ ${row.map((cell, cellIndex) => padEndVisible(cell, widths[cellIndex] ?? 0)).join(" │ ")} │`);
    console.log(
      createTableBorder(
        index === rows.length - 1 ? "└" : "├",
        index === rows.length - 1 ? "┴" : "┼",
        index === rows.length - 1 ? "┘" : "┤",
        widths,
      ),
    );
  }
};

const printUncatalogedManifestDependencies = (dependencies: ManifestDependency[]) => {
  if (dependencies.length === 0) return;

  printTable(
    ["Package", "Specifier", "Dependents"],
    dependencies.map(({ field, manifestName, pkg, specifier }) => {
      const dependencyType = getDependencyType(field);
      const packageLabel = dependencyType ? `${pkg} (${dependencyType})` : pkg;

      return [color.yellow(packageLabel), color.red(specifier), manifestName];
    }),
  );
};

const printMismatches = (mismatches: Mismatch[]) => {
  if (mismatches.length === 0) return;

  printTable(
    ["Package", "Specifier", "Resolved", "Group"],
    mismatches.map(({ group, pkg, resolved, specifier }) => [pkg, color.red(specifier), color.green(resolved), group]),
  );
};

const getLatestVersion = async (pkg: string) => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= registryRetryCount; attempt++)
    try {
      const response = await fetch(`${registryUrl}/${encodeURIComponent(pkg).replace(/^%40/u, "@")}/latest`);
      if (!response.ok) throw new Error(`${pkg}: ${response.status} ${response.statusText}`);

      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || !("version" in body) || typeof body.version !== "string")
        throw new Error(`${pkg}: registry response did not include a version`);

      return body.version;
    } catch (error) {
      lastError = error;
    }

  throw lastError instanceof Error ? lastError : new Error(`${pkg}: ${String(lastError)}`);
};

// Only `latest` is required; pnpm omits or reshapes the other fields for some entries
// (catalog/deprecated packages), so treat them as optional and fall back when building.
const isPnpmOutdatedDependency = (value: unknown): value is PnpmOutdatedDependency => {
  if (!value || typeof value !== "object") return false;

  const dependency = value as Record<string, unknown>;

  return typeof dependency.latest === "string";
};

const getOutdatedDependents = (dependentPackages: unknown) => {
  if (!Array.isArray(dependentPackages)) return [];

  return dependentPackages.flatMap((dependentPackage) =>
    dependentPackage && typeof dependentPackage === "object" && typeof dependentPackage.name === "string"
      ? [dependentPackage.name]
      : [],
  );
};

const runPnpmOutdated = () =>
  new Promise<{ error?: string; status: number | null; stderr: string; stdout: string }>((resolvePromise) => {
    const command = process.platform === "win32" ? "cmd.exe" : "pnpm";
    const args =
      process.platform === "win32"
        ? ["/d", "/s", "/c", "pnpm", "outdated", "-r", "--format", "json"]
        : ["outdated", "-r", "--format", "json"];
    const child = spawn(command, args, { cwd: root });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => (stdout += chunk));
    child.stderr.on("data", (chunk: string) => (stderr += chunk));
    child.on("error", (error) => resolvePromise({ error: error.message, status: null, stderr, stdout }));
    child.on("close", (status) => resolvePromise({ status, stderr, stdout }));
  });

const getRegularOutdatedDependencies = async () => {
  const result = await runPnpmOutdated();

  if (result.error) return { errors: [{ error: result.error, pkg: "pnpm outdated -r" }], outdatedDependencies: [] };

  // Pnpm interleaves "[WARN] ..." retry notices into stdout, so isolate the JSON object (printed at column 0).
  const jsonStart = result.stdout.search(/^\{/mu);
  if (jsonStart === -1) {
    if (result.status && result.status !== 0)
      return {
        errors: [{ error: result.stderr.trim() || `exit code ${result.status}`, pkg: "pnpm outdated -r" }],
        outdatedDependencies: [],
      };

    return { errors: [], outdatedDependencies: [] };
  }

  const parsed: unknown = JSON.parse(result.stdout.slice(jsonStart));
  if (!parsed || typeof parsed !== "object")
    return { errors: [{ error: "unexpected JSON output", pkg: "pnpm outdated -r" }], outdatedDependencies: [] };

  const outdatedDependencies: OutdatedDependency[] = [];
  for (const [pkg, dependency] of Object.entries(parsed)) {
    if (!isPnpmOutdatedDependency(dependency))
      return {
        errors: [{ error: `unexpected JSON entry for ${pkg}`, pkg: "pnpm outdated -r" }],
        outdatedDependencies: [],
      };

    outdatedDependencies.push({
      current: dependency.current ?? "",
      dependencyType: getDependencyType(dependency.dependencyType ?? ""),
      dependents: getOutdatedDependents(dependency.dependentPackages),
      latest: dependency.latest,
      pkg,
      specifier: "",
    });
  }

  return { errors: [], outdatedDependencies };
};

const getConfigDependencyRegistryChecks = async (entries: DependencyEntry[]) => {
  const outdatedDependencies: OutdatedDependency[] = [];
  const errors: RegistryCheckError[] = [];
  const queue = [...entries];

  const workers = Array.from({ length: registryConcurrency }, async () => {
    for (;;) {
      const entry = queue.shift();
      if (!entry) return;

      const { group, pkg, specifier } = entry;
      try {
        const latest = await getLatestVersion(pkg);
        const current = getSpecifierBase(specifier);
        if (isVersionOutdated(current, latest))
          outdatedDependencies.push({
            current,
            dependencyType: group === "configDependencies" ? "config" : "",
            dependents: group === "configDependencies" ? ["configDependencies"] : [],
            latest,
            pkg,
            specifier,
          });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push({ error: message, pkg });
      }
    }
  });

  await Promise.all(workers);
  const outdatedDependencyMap = new Map(outdatedDependencies.map((dependency) => [dependency.pkg, dependency]));
  const orderedOutdatedDependencies: OutdatedDependency[] = [];
  for (const { pkg } of entries) {
    const dependency = outdatedDependencyMap.get(pkg);
    if (dependency) orderedOutdatedDependencies.push(dependency);
  }

  return {
    errors: errors.toSorted((left, right) => left.pkg.localeCompare(right.pkg)),
    outdatedDependencies: orderedOutdatedDependencies.toSorted((left, right) => {
      const changeLevelDifference =
        getVersionChangeLevel(left.current, left.latest) - getVersionChangeLevel(right.current, right.latest);
      if (changeLevelDifference !== 0) return changeLevelDifference;

      return left.pkg.localeCompare(right.pkg);
    }),
  };
};

const printOutdatedDependencies = (outdatedDependencies: OutdatedDependency[]) => {
  if (outdatedDependencies.length === 0) return;

  printTable(
    ["Package", "Current", "Latest", "Dependents"],
    outdatedDependencies.map(({ current, dependencyType, dependents, latest, pkg }) => {
      const packageLabel = dependencyType ? `${pkg} (${dependencyType})` : pkg;

      return [packageLabel, current, getColorizedLatestVersion(current, latest), dependents.join(", ")];
    }),
  );
};

const printRegistryErrors = (errors: RegistryCheckError[]) => {
  if (errors.length === 0) return;

  printTable(
    ["Package", "Error"],
    errors.map(({ error, pkg }) => [pkg, color.red(error)]),
  );
};

const printExecutionTime = () => {
  const elapsedSeconds = ((performance.now() - startedAt) / 1000).toFixed(1);
  console.log(`Done in ${elapsedSeconds}s`);
};

const catalogEntries = parseWorkspaceEntries("catalog", getSection("catalog", workspaceYaml));
const configDependencyEntries = parseWorkspaceEntries(
  "configDependencies",
  getSection("configDependencies", workspaceYaml),
);
const manifestDependencies = getManifestDependencies();
const uncatalogedManifestDependencies = getUncatalogedManifestDependencies(manifestDependencies);
const mismatches = [
  ...getMismatches(catalogEntries, getLockCatalogVersions()),
  ...getMismatches(configDependencyEntries, getLockConfigDependencyVersions()),
];

printUncatalogedManifestDependencies(uncatalogedManifestDependencies);
printMismatches(mismatches);

const [regularChecks, configDependencyChecks] = await Promise.all([
  getRegularOutdatedDependencies(),
  getConfigDependencyRegistryChecks(configDependencyEntries),
]);
const outdatedDependencies = [...regularChecks.outdatedDependencies, ...configDependencyChecks.outdatedDependencies];
const errors = [...regularChecks.errors, ...configDependencyChecks.errors];
printOutdatedDependencies(outdatedDependencies);
printRegistryErrors(errors);
printExecutionTime();

/**
 * Runs `npm run build` for every workspace under examples/ that defines a `build` script.
 * Used by CI and `npm run build:examples` from the repo root.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const examplesDir = join(process.cwd(), "examples");

for (const ent of readdirSync(examplesDir, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const manifestPath = join(examplesDir, ent.name, "package.json");
  if (!existsSync(manifestPath)) continue;

  const pkg = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!pkg.scripts?.build) continue;

  console.log(`Building example workspace ${pkg.name}...`);
  const r = spawnSync(
    "npm",
    ["run", "build", `--workspace=${pkg.name}`],
    { stdio: "inherit", env: process.env, shell: false },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

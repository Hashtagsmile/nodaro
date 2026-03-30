/**
 * prepublishOnly for `nodaro`: compile TypeScript and ensure the client was built
 * into `public/` (run `npm run build` from the repo root before publishing).
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const publicIndex = join(root, "..", "public", "index.html");

execSync("npm run build", { cwd: join(root, ".."), stdio: "inherit" });

if (!existsSync(publicIndex)) {
  console.error(
    "[nodaro] Missing public/index.html. Build the client from the repo root:\n" +
      "  npm run build\n",
  );
  process.exit(1);
}

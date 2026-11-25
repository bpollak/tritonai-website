// Copies the TritonAI Harness Chat site from its own repository into
// mirrors/harness-chat/, so it is also served at tritonai.ucsd.edu/harness-chat/.
//
// The site stays a separate project: it is edited in bpollak/harness-chat, published
// by that repository to GitHub Pages, and mirrored here unchanged. Do not edit the
// copy in this repository; edit the source and run `npm run sync:harness-chat`.
//
//   node scripts/sync-harness-chat.mjs            copy from GitHub
//   node scripts/sync-harness-chat.mjs <folder>   copy from a local checkout
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, rm, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const REPOSITORY = "https://github.com/bpollak/harness-chat.git";
const TARGET = path.resolve("mirrors/harness-chat");
const SKIP = new Set([".git", ".github", "README.md", ".gitignore", ".DS_Store"]);

let source = process.argv[2] ? path.resolve(process.argv[2]) : null;
let scratch = null;
if (!source) {
  scratch = await mkdtemp(path.join(os.tmpdir(), "harness-chat-"));
  execFileSync("git", ["clone", "--quiet", "--depth", "1", REPOSITORY, scratch], { stdio: "inherit" });
  source = scratch;
}
const commit = execFileSync("git", ["-C", source, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();

await rm(TARGET, { recursive: true, force: true });
for (const name of await readdir(source)) {
  if (SKIP.has(name)) continue;
  await cp(path.join(source, name), path.join(TARGET, name), { recursive: true });
}
await writeFile(path.join(TARGET, "SOURCE.txt"), `Mirrored from ${REPOSITORY.replace(/\.git$/, "")} at ${commit}.\nDo not edit here. Edit the source and run: npm run sync:harness-chat\n`);
if (scratch) await rm(scratch, { recursive: true, force: true });
console.log(`harness-chat ${commit} -> ${path.relative(process.cwd(), TARGET)}`);

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, extractSection, loadConfig, preservationErrors, sectionSnapshot } from "./lib.mjs";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const sourceFile = option("--source");
const sectionId = option("--section");
if (!sourceFile || !sectionId) throw new Error("Use --source <file> --section <id>");
const config = await loadConfig();
const section = config.sections.find((entry) => entry.id === sectionId && entry.sourceFile === sourceFile);
if (!section) throw new Error("Section is not configured for UX-agent verification");
const changed = execFileSync("git", ["diff", "--name-only"], { cwd: ROOT, encoding: "utf8" }).trim().split("\n").filter(Boolean);
if (changed.some((filename) => filename !== sourceFile)) throw new Error(`Proposal changed files outside its source boundary: ${changed.join(", ")}`);
if (!changed.includes(sourceFile)) throw new Error("Proposal did not change its declared source file");
const beforeSource = execFileSync("git", ["show", `HEAD:${sourceFile}`], { cwd: ROOT, encoding: "utf8" });
const afterSource = await readFile(path.join(ROOT, sourceFile), "utf8");
const errors = preservationErrors(sectionSnapshot(extractSection(beforeSource, sectionId).content), sectionSnapshot(extractSection(afterSource, sectionId).content));
if (errors.length) throw new Error(errors.join("; "));
process.stdout.write("UX recipe preservation verification passed.\n");

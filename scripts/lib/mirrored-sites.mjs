// Sites that are separate projects, mirrored into this one so they are also served
// under tritonai.ucsd.edu. Each lives in mirrors/<name>/ and is copied into the build
// byte for byte, after every page of this site has been generated: the build does not
// rewrite it, and the checks that hold this site to the Decorator do not read it.
//
// Do not edit a mirror here. Edit its own repository and re-run its sync script.
import { cp } from "node:fs/promises";
import path from "node:path";

export const MIRRORED_SITES = ["harness-chat"];
export const MIRROR_DIR = path.resolve("mirrors");

/** True for a build-relative file path ("harness-chat/index.html") inside a mirror. */
export function isMirrored(relativePath) {
  const top = relativePath.replace(/^\/+/, "").split("/")[0];
  return MIRRORED_SITES.includes(top);
}

export async function copyMirroredSites(outputDir) {
  for (const name of MIRRORED_SITES) {
    await cp(path.join(MIRROR_DIR, name), path.join(outputDir, name), { recursive: true });
  }
}

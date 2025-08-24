import { execSync } from "child_process";

export async function getStagedDiff() {
  try {
    return execSync("git diff --cached", { encoding: "utf8" });
  } catch {
    return null;
  }
}

export async function makeCommit(message) {
  execSync(`git commit -m "${message}"`, { stdio: "inherit" });
}

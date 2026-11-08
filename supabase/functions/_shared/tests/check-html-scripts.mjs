import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const root = process.cwd();
const temp = mkdtempSync(join(tmpdir(), "imro-html-check-"));
try {
  for (const file of ["index.html", "dashboard.html", "admin.html"]) {
    const html = readFileSync(join(root, file), "utf8");
    const scripts = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)];
    let inlineIndex = 0;
    for (const match of scripts) {
      if (/\\bsrc\\s*=/.test(match[1])) continue;
      const path = join(temp, file.replace(/\\W/g, "_") + "_" + (++inlineIndex) + ".js");
      writeFileSync(path, match[2]);
      const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
      if (result.status !== 0) {
        console.error(file + " inline script " + inlineIndex + " has a syntax error:");
        console.error(result.stderr || result.stdout);
        process.exitCode = 1;
      }
    }
    assert.ok(inlineIndex > 0, file + " should contain inline JavaScript");
  }

  const index = readFileSync(join(root, "index.html"), "utf8");
  assert.match(index, /name="avatar_id"/, "registration should submit an avatar ID");
  assert.match(index, /get_public_leaderboard/, "public leaderboard should call the safe RPC");
  const dashboard = readFileSync(join(root, "dashboard.html"), "utf8");
  assert.match(dashboard, /admin_confirm_match_winner/, "admin should confirm results through the RPC");
  assert.match(dashboard, /admin_start_tournament/, "admin should explicitly start the tournament");
  console.log("HTML inline JavaScript and feature wiring checks passed.");
} finally {
  rmSync(temp, { recursive: true, force: true });
}

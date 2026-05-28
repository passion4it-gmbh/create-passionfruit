#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, basename, join } from "node:path";
import { spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import * as tar from "tar";
import prompts from "prompts";
import kleur from "kleur";

const TEMPLATE_REPO = "passion4it-gmbh/passionfruit";

async function main() {
  console.log("");
  console.log(kleur.bold().magenta("  🍇 create-passionfruit"));
  console.log(kleur.dim("  Everyone can cook. Professional websites, powered by Claude Code."));
  console.log("");

  const cliTarget = process.argv[2];

  const { target } = await prompts(
    {
      type: cliTarget ? null : "text",
      name: "target",
      message: "Project directory",
      initial: "my-site",
      validate: (value) => (value && /^[a-z0-9-_]+$/i.test(value) ? true : "Use letters, numbers, hyphens, underscores"),
    },
    { onCancel: () => process.exit(0) },
  );

  const dir = resolve(process.cwd(), cliTarget ?? target);

  if (existsSync(dir)) {
    console.log(kleur.red(`  ✗ ${basename(dir)} already exists`));
    process.exit(1);
  }

  const { confirm } = await prompts(
    {
      type: "confirm",
      name: "confirm",
      message: `Create site in ${kleur.cyan(dir)}?`,
      initial: true,
    },
    { onCancel: () => process.exit(0) },
  );

  if (!confirm) process.exit(0);

  mkdirSync(dir, { recursive: true });

  console.log("");
  console.log(kleur.dim("  ↓ downloading latest passionfruit release..."));
  await downloadTemplate(dir);

  resetProjectMetadata(dir, basename(dir));

  console.log(kleur.dim("  ⚙ initializing git..."));
  run("git", ["init", "-q", "-b", "main"], dir);
  run("git", ["add", "-A"], dir);
  // Initial commit before installing deps — lefthook isn't installed yet, so hooks can't fire
  run("git", ["commit", "-q", "-m", "chore: initial commit from passionfruit template"], dir);

  console.log(kleur.dim("  ⚙ installing dependencies (this may take a minute)..."));
  const install = run("pnpm", ["install", "--silent"], dir, { allowFail: true });

  if (install.status !== 0) {
    console.log(kleur.yellow("  ⚠ pnpm install failed — install manually after opening the project"));
  }

  console.log("");
  console.log(kleur.green().bold("  ✓ Done!"));
  console.log("");
  console.log("  Next steps:");
  console.log("");
  console.log(`    ${kleur.cyan(`cd ${basename(dir)}`)}`);
  console.log(`    ${kleur.cyan("claude")}                ${kleur.dim("# open Claude Code")}`);
  console.log(`    ${kleur.cyan("/onboard")}              ${kleur.dim("# personalize for your business")}`);
  console.log("");
  console.log(kleur.dim("  Don't have Claude Code? https://claude.com/claude-code"));
  console.log("");
}

function resetProjectMetadata(dir, projectName) {
  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

  pkg.name = projectName;
  pkg.version = "0.1.0";
  pkg.private = true;
  delete pkg.description;
  delete pkg.homepage;
  delete pkg.bugs;
  delete pkg.repository;
  delete pkg.author;

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

async function downloadTemplate(dir) {
  const tarballUrl = `https://api.github.com/repos/${TEMPLATE_REPO}/tarball`;
  const res = await fetch(tarballUrl, {
    headers: { "User-Agent": "create-passionfruit" },
    redirect: "follow",
  });

  if (!res.ok || !res.body) {
    console.log(kleur.red(`  ✗ Failed to download template: HTTP ${res.status}`));
    rmSync(dir, { recursive: true, force: true });
    process.exit(1);
  }

  await pipeline(
    Readable.fromWeb(res.body),
    tar.x({ cwd: dir, strip: 1 }),
  );
}

function run(cmd, args, cwd, { allowFail = false } = {}) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  if (result.status !== 0 && !allowFail) {
    console.log(kleur.red(`  ✗ ${cmd} ${args.join(" ")} failed`));
    process.exit(result.status ?? 1);
  }
  return result;
}

main().catch((err) => {
  console.error(kleur.red(`  ✗ ${err.message}`));
  process.exit(1);
});

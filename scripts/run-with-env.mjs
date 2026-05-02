#!/usr/bin/env node
/**
 * Runs `node` with `--env-file=.env.local` when that file exists.
 * Usage: node scripts/run-with-env.mjs ./node_modules/tsx/dist/cli.mjs prisma/verify-seed.ts
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const envLocal = join(cwd, ".env.local");
const useEnvLocal = existsSync(envLocal);
const rest = process.argv.slice(2);

const execPath = process.execPath;
const args = useEnvLocal ? ["--env-file=.env.local", ...rest] : rest;

const result = spawnSync(execPath, args, { stdio: "inherit", cwd, shell: false });
process.exit(result.status ?? 1);

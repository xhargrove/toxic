#!/usr/bin/env node
/**
 * Runs Prisma CLI with `.env.local` when the file exists (Next.js convention),
 * otherwise inherits `process.env` (CI with DATABASE_URL injected).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const prismaJs = join(process.cwd(), "node_modules/prisma/build/index.js");
const args = process.argv.slice(2);
const envLocal = join(process.cwd(), ".env.local");
const useEnvLocal = existsSync(envLocal);

const execArgs = useEnvLocal ? ["--env-file=.env.local", prismaJs, ...args] : [prismaJs, ...args];

const result = spawnSync(process.execPath, execArgs, {
  stdio: "inherit",
  shell: false,
});
process.exit(result.status ?? 1);

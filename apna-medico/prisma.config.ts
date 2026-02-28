import * as fs from "fs";
import * as path from "path";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), then fall back to .env
function loadEnv() {
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  const envPath = path.resolve(process.cwd(), ".env");
  
  function parseLine(line: string) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }

  for (const p of [envLocalPath, envPath]) {
    if (fs.existsSync(p)) {
      fs.readFileSync(p, "utf-8").split("\n").forEach(parseLine);
    }
  }
}

loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

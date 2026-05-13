import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(backendDir, "../.env.local") });
dotenv.config({ path: resolve(backendDir, "../.env") });

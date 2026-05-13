import "./env.js";
import express from "express";
import cors from "cors";
import ValidatorRouter from "./routes/validatorroute.js";
import UpperManagementRouter from "./routes/u-m-router.js";
import AdminRouter from "./routes/adminroute.js";
import TeacherRouter from "./routes/teacherrouters.js";
import StudentRouter from "./routes/studentroute.js";
import { ensureTargetDatabaseExists, parseDatabaseNameFromUrl } from "./ensure-database.js";
import { runPrismaMigrateDeploy } from "./prisma-migrate.js";
import { seedRootValidator } from "./seed.js";
import {
  isDatabaseConnectionError,
  isDatabaseMissingError,
  isSchemaMissingError,
  printDatabaseConnectionHelp,
  printDatabaseMissingHelp,
  printRunMigrationsHelp,
} from "./startup-db.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/validator", ValidatorRouter);
app.use("/uppermanagement", UpperManagementRouter);
app.use("/admin", AdminRouter);
app.use("/teacher", TeacherRouter);
app.use("/student", StudentRouter);

async function main() {
  const skipSeed =
    process.env.SKIP_ROOT_VALIDATOR_SEED === "true" ||
    process.env.SKIP_ROOT_VALIDATOR_SEED === "1";

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[http-backend] DATABASE_URL is not set. Add it to apps/http-backend/.env");
    process.exit(1);
  }

  if (skipSeed) {
    console.warn(
      "[http-backend] SKIP_ROOT_VALIDATOR_SEED is set; skipping root validator seed.",
    );
  } else {
    try {
      await ensureTargetDatabaseExists(databaseUrl);
      runPrismaMigrateDeploy();
      await seedRootValidator();
    } catch (error) {
      if (isSchemaMissingError(error)) {
        printRunMigrationsHelp();
        console.error(error);
        process.exit(1);
      }
      if (isDatabaseMissingError(error)) {
        printDatabaseMissingHelp(parseDatabaseNameFromUrl(databaseUrl));
        console.error(error);
        process.exit(1);
      }
      if (isDatabaseConnectionError(error)) {
        printDatabaseConnectionHelp();
        console.error(error);
        process.exit(1);
      }
      throw error;
    }
  }

  app.listen(3002, () => {
    console.log("Server is running on port 3002");
  });
}

main().catch((error) => {
  console.error("HTTP backend startup failed:", error);
  process.exit(1);
});

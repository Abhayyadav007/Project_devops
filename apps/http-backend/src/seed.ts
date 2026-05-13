import bcrypt from "bcrypt";

import { prisma } from "@repo/db/client";

function resolveRootPasswordHash() {
  const hash = process.env.ROOT_VALIDATOR_PASSWORD_HASH;
  if (hash) {
    return hash;
  }

  const password = process.env.ROOT_VALIDATOR_PASSWORD;
  if (!password) {
    throw new Error("ROOT_VALIDATOR_PASSWORD_HASH or ROOT_VALIDATOR_PASSWORD is required");
  }

  return bcrypt.hashSync(password, 10);
}

export async function seedRootValidator() {
  const rawId = process.env.ROOT_VALIDATOR_ID;
  if (!rawId) {
    return;
  }

  const validatorId = Number(rawId);
  if (!Number.isInteger(validatorId) || validatorId <= 0) {
    throw new Error("ROOT_VALIDATOR_ID must be a positive integer");
  }

  const name = process.env.ROOT_VALIDATOR_NAME ?? "Root Validator";
  const email = process.env.ROOT_VALIDATOR_EMAIL ?? `root.validator.${validatorId}@example.com`;
  const password = resolveRootPasswordHash();

  await prisma.validator.upsert({
    where: { validatorId },
    create: {
      name,
      validatorId,
      email,
      password,
    },
    update: {
      name,
      email,
      password,
    },
  });
}

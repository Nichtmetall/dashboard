import "server-only";

import { PrismaClient } from "@prisma/client";

import { decryptNullable, encryptNullable } from "@/lib/crypto";

/**
 * Token fields on the `Account` model that must be encrypted at rest.
 */
const ENCRYPTED_ACCOUNT_FIELDS = [
  "access_token",
  "refresh_token",
  "id_token",
] as const;

type EncryptedField = (typeof ENCRYPTED_ACCOUNT_FIELDS)[number];
type AccountLike = Partial<Record<EncryptedField, string | null | undefined>>;

function encryptAccountData<T extends AccountLike | undefined | null>(
  data: T,
): T {
  if (!data) return data;
  for (const field of ENCRYPTED_ACCOUNT_FIELDS) {
    if (field in data) {
      data[field] = encryptNullable(data[field]);
    }
  }
  return data;
}

function decryptAccountResult<T>(result: T): T {
  if (!result) return result;

  const decryptOne = (row: AccountLike) => {
    for (const field of ENCRYPTED_ACCOUNT_FIELDS) {
      if (field in row) {
        row[field] = decryptNullable(row[field]);
      }
    }
  };

  if (Array.isArray(result)) {
    for (const row of result) {
      if (row && typeof row === "object") decryptOne(row as AccountLike);
    }
  } else if (typeof result === "object") {
    decryptOne(result as AccountLike);
  }

  return result;
}

/**
 * Prisma Client extension that transparently encrypts OAuth tokens on write
 * and decrypts them on read for the `Account` model. This keeps the rest of
 * the codebase (and the Auth.js adapter) blissfully unaware of encryption.
 */
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    name: "encrypt-account-tokens",
    query: {
      account: {
        async create({ args, query }) {
          encryptAccountData(args.data as AccountLike);
          return decryptAccountResult(await query(args));
        },
        async update({ args, query }) {
          encryptAccountData(args.data as AccountLike);
          return decryptAccountResult(await query(args));
        },
        async upsert({ args, query }) {
          encryptAccountData(args.create as AccountLike);
          encryptAccountData(args.update as AccountLike);
          return decryptAccountResult(await query(args));
        },
        async createMany({ args, query }) {
          if (Array.isArray(args.data)) {
            args.data.forEach((row) => encryptAccountData(row as AccountLike));
          } else {
            encryptAccountData(args.data as AccountLike);
          }
          return query(args);
        },
        async findUnique({ args, query }) {
          return decryptAccountResult(await query(args));
        },
        async findUniqueOrThrow({ args, query }) {
          return decryptAccountResult(await query(args));
        },
        async findFirst({ args, query }) {
          return decryptAccountResult(await query(args));
        },
        async findFirstOrThrow({ args, query }) {
          return decryptAccountResult(await query(args));
        },
        async findMany({ args, query }) {
          return decryptAccountResult(await query(args));
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma: ExtendedPrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

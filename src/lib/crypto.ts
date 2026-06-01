import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

/**
 * Transparent, authenticated encryption for OAuth tokens at rest.
 *
 * Tokens are encrypted with AES-256-GCM. The persisted value has the shape:
 *
 *   v1:<base64(iv | authTag | ciphertext)>
 *
 * The `v1:` prefix lets us detect whether a stored value is already encrypted
 * so we never double-encrypt and can transparently read legacy plaintext rows.
 */

const PREFIX = "v1:";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit nonce, recommended for GCM
const AUTH_TAG_LENGTH = 16;

let cachedKey: Buffer | null = null;

/**
 * Derive a 32-byte key from `TOKEN_ENCRYPTION_KEY`.
 *
 * Accepts a 32-byte base64 or hex string directly; otherwise the provided
 * secret is hashed with SHA-256 to obtain a deterministic 32-byte key.
 */
function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32`.",
    );
  }

  const fromBase64 = tryDecode(secret, "base64");
  if (fromBase64 && fromBase64.length === 32) {
    cachedKey = fromBase64;
    return cachedKey;
  }

  const fromHex = tryDecode(secret, "hex");
  if (fromHex && fromHex.length === 32) {
    cachedKey = fromHex;
    return cachedKey;
  }

  cachedKey = createHash("sha256").update(secret).digest();
  return cachedKey;
}

function tryDecode(value: string, encoding: "base64" | "hex"): Buffer | null {
  try {
    const buf = Buffer.from(value, encoding);
    // Guard against silent partial decodes (e.g. invalid hex).
    if (buf.length === 0) return null;
    return buf;
  } catch {
    return null;
  }
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}

/** Encrypt a plaintext string. Returns the prefixed, base64-encoded payload. */
export function encrypt(plaintext: string): string {
  if (isEncrypted(plaintext)) return plaintext;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return PREFIX + Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/** Decrypt a value produced by {@link encrypt}. Plaintext is returned as-is. */
export function decrypt(value: string): string {
  if (!isEncrypted(value)) return value;

  const payload = Buffer.from(value.slice(PREFIX.length), "base64");
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

/** Encrypt a nullable value, preserving null/undefined. */
export function encryptNullable<T extends string | null | undefined>(
  value: T,
): T {
  if (value === null || value === undefined) return value;
  return encrypt(value) as T;
}

/** Decrypt a nullable value, preserving null/undefined. */
export function decryptNullable<T extends string | null | undefined>(
  value: T,
): T {
  if (value === null || value === undefined) return value;
  return decrypt(value) as T;
}

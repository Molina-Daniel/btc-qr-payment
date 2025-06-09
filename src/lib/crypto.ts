import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

export function encrypt(text: string): string {
  try {
    // Generate a random initialization vector for each encryption
    const iv = randomBytes(16);

    // Create cipher with AES-256-GCM algorithm
    const cipher = createCipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY!, "hex"),
      iv
    );

    // Encrypt the data
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get the authentication tag
    const authTag = cipher.getAuthTag().toString("hex");

    // Return IV + Auth Tag + Encrypted data - all needed for decryption
    return iv.toString("hex") + ":" + authTag + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

export function decrypt(encryptedText: string): string {
  try {
    // Split the stored data to get IV, auth tag and encrypted content
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(":");

    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error("Invalid encrypted format");
    }

    // Convert from hex strings back to buffers
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    // Create decipher
    const decipher = createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY!, "hex"),
      iv
    );

    // Set auth tag for verification
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

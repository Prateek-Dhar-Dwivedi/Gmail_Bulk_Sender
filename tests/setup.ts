process.env.TOKEN_ENCRYPTION_KEY =
  process.env.TOKEN_ENCRYPTION_KEY ||
  "b4c59d1a3e874f26b5d901428c04e287fa3198cd6819eb7b3401569a714e82d1";

process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || "dev-session-secret-key-at-least-32-chars-long";

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || "./private-uploads";

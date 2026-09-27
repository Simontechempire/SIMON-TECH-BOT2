require("dotenv").config();

module.exports = {
  // Owner & Bot Info
  owner: process.env.OWNER_NUMBER || "234XXXXXXXXXX",
  botName: process.env.BOT_NAME || "SIMON TECH BOT",
  prefix: process.env.PREFIX || ".",
  version: process.env.BOT_VERSION || "2.0.0",

  // Telegram
  telegramToken: process.env.TELEGRAM_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  // Telegram user ID is different from the owner's WhatsApp phone number.
  telegramAdminId: process.env.TELEGRAM_ADMIN_ID || process.env.TELEGRAM_CHAT_ID,

  // Bot Settings
  botMode: process.env.BOT_MODE || "public", // public, private, maintenance
  autoRead: process.env.AUTO_READ === "true",
  autoTyping: process.env.AUTO_TYPING === "true",
  autoRecord: process.env.AUTO_RECORD === "true",

  // API Keys
  openaiKey: process.env.OPENAI_API_KEY || "",
  imgurKey: process.env.IMGUR_API_KEY || "",
  youtubeKey: process.env.YOUTUBE_API_KEY || "",

  // Paths
  dbPath: process.env.DB_PATH || "./database",
  sessionsPath: "./sessions",
  logsPath: "./logs",

  // Server
  port: process.env.PORT || 3000,
  host: process.env.HOST || "0.0.0.0",

  // Maintenance
  maintenance: process.env.MAINTENANCE === "true"
};

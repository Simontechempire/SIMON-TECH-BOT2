const TelegramBot = require("node-telegram-bot-api");
const config = require("../config");

function startTelegramBot() {
  if (!config.telegramToken) {
    throw new Error("TELEGRAM_TOKEN is not configured. Add it as a Render environment variable.");
  }

  const bot = new TelegramBot(config.telegramToken, { polling: true });
  const isAdmin = (msg) => Boolean(config.telegramAdminId) &&
    String(msg.from?.id) === String(config.telegramAdminId);
  const adminOnly = (msg) => {
    if (isAdmin(msg)) return true;
    bot.sendMessage(msg.chat.id, "❌ This command is restricted to the bot owner.");
    return false;
  };

  bot.onText(/^\/start(?:@\w+)?$/, (msg) => {
    const firstName = msg.from?.first_name || "there";
    const welcomeText = `
🤖 Welcome to SIMON TECH BOT

👋 Hey ${firstName}!

This is a public WhatsApp bot. Basic commands are available to everyone.

📖 Commands:
/start
/help
/ping
/status
/info
/menu

🔒 Owner-only commands are protected.
`;
    bot.sendMessage(msg.chat.id, welcomeText);
  });

  bot.onText(/^\/help(?:@\w+)?$/, (msg) => {
    const helpText = `
📖 *SIMON TECH BOT - Commands Guide*

🎯 *Public Commands:*
/start - Welcome message
/help - This help message
/ping - Check if bot is responding
/status - Get bot status
/info - Bot information
/menu - Show the menu

🔒 *Owner-only commands:*
/pair <number> - Pair WhatsApp number
/qr - Get WhatsApp QR code
/restart - Restart the bot
/broadcast <message> - Send broadcast
/logs - View bot logs
/stats - Bot statistics
`;
    bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
  });

  bot.onText(/^\/ping(?:@\w+)?$/, (msg) => {
    const started = Date.now();
    bot.sendMessage(msg.chat.id, "🏓 Pinging...").then((sent) => {
      const ping = Date.now() - started;
      return bot.editMessageText(`🏓 *Pong!*\nLatency: \`${ping}ms\``, {
        chat_id: msg.chat.id,
        message_id: sent.message_id,
        parse_mode: "Markdown"
      });
    }).catch(() => {});
  });

  bot.onText(/^\/status(?:@\w+)?$/, (msg) => {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const statusText = `🟢 *Bot Status: ONLINE*\n\n• Version: ${config.version}\n• Mode: ${config.botMode.toUpperCase()}\n• Uptime: ${hours}h ${minutes}m ${seconds}s\n• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n• Node: ${process.version}`;
    bot.sendMessage(msg.chat.id, statusText, { parse_mode: "Markdown" });
  });

  bot.onText(/^\/info(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id, `ℹ️ ${config.botName}\nVersion: ${config.version}\nType: WhatsApp Multi-Device Bot`);
  });

  bot.onText(/^\/menu(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id, "🤖 SIMON TECH BOT 2.0\n\nUse .menu in WhatsApp to see the full menu.");
  });

  bot.onText(/^\/pair\s+(.+)$/, async (msg, match) => {
    if (!adminOnly(msg)) return;
    await bot.sendMessage(msg.chat.id, `⏳ Pairing requested for +${match[1].trim()}\n\n⚠️ Feature coming soon.`);
  });

  bot.onText(/^\/qr(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    await bot.sendMessage(msg.chat.id, "📸 WhatsApp QR code is available in the server terminal.");
  });

  bot.on("polling_error", (error) => console.error("Telegram polling error:", error.message));
  console.log("✅ Telegram Bot Started");
}

module.exports = startTelegramBot;

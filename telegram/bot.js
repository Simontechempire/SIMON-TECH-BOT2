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

  // /start command
  bot.onText(/^\/start(?:@\w+)?$/, (msg) => {
    const firstName = msg.from?.first_name || "there";
    const welcomeText = `🤖 Welcome to SIMON TECH BOT

👋 Hey ${firstName}!

This is a public WhatsApp bot. Basic commands are available to everyone.

📖 Commands:
/help - Show all available commands
/ping - Check if bot is responding
/status - Get bot status
/info - Bot information
/menu - Show the menu

🔒 Owner-only commands are protected.`;
    
    bot.sendMessage(msg.chat.id, welcomeText);
  });

  // /help command
  bot.onText(/^\/help(?:@\w+)?$/, (msg) => {
    const helpText = `📖 *SIMON TECH BOT - Commands Guide*

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
/broadcast - Send broadcast message
/logs - View bot logs
/stats - Bot statistics`;
    
    bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
  });

  // /ping command
  bot.onText(/^\/ping(?:@\w+)?$/, (msg) => {
    const started = Date.now();
    bot.sendMessage(msg.chat.id, "🏓 Pinging...").then((sent) => {
      const ping = Date.now() - started;
      return bot.editMessageText(`🏓 *Pong!*\nLatency: \`${ping}ms\``, {
        chat_id: msg.chat.id,
        message_id: sent.message_id,
        parse_mode: "Markdown"
      }).catch(() => {});
    }).catch(() => {});
  });

  // /status command
  bot.onText(/^\/status(?:@\w+)?$/, (msg) => {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    
    const statusText = `🟢 *Bot Status: ONLINE*

• Version: ${config.version}
• Mode: ${config.botMode.toUpperCase()}
• Uptime: ${hours}h ${minutes}m ${seconds}s
• Memory: ${memoryUsage}MB
• Node: ${process.version}
• Status: Active ✅`;
    
    bot.sendMessage(msg.chat.id, statusText, { parse_mode: "Markdown" });
  });

  // /info command
  bot.onText(/^\/info(?:@\w+)?$/, (msg) => {
    const infoText = `ℹ️ *SIMON TECH BOT Information*

• Name: ${config.botName}
• Version: ${config.version}
• Type: WhatsApp Multi-Device Bot
• Framework: Baileys + Telegram Bot API
• Mode: ${config.botMode}

Developed by: SIMON TECH`;
    
    bot.sendMessage(msg.chat.id, infoText, { parse_mode: "Markdown" });
  });

  // /menu command
  bot.onText(/^\/menu(?:@\w+)?$/, (msg) => {
    const menuText = `🤖 SIMON TECH BOT 2.0
WhatsApp Multi-Device

Use the .menu command in WhatsApp to see the full menu with all 800+ commands.

Telegram Commands: /help`;
    
    bot.sendMessage(msg.chat.id, menuText);
  });

  // /pair command (Owner only)
  bot.onText(/^\/pair\s+(.+)$/, async (msg, match) => {
    if (!adminOnly(msg)) return;
    
    const number = match[1].trim();
    const pairingText = `⏳ *Pairing WhatsApp*

Phone Number: +${number}

Status: Generating pair code...

⚠️ Feature coming soon in the next update.`;
    
    await bot.sendMessage(msg.chat.id, pairingText, { parse_mode: "Markdown" });
  });

  // /qr command (Owner only)
  bot.onText(/^\/qr(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    
    const qrText = `📸 *WhatsApp QR Code*

Your QR code is being displayed in the server terminal.

Steps:
1. Open WhatsApp on your phone
2. Scan the QR code from the terminal
3. You will be logged in

Check the server logs for the QR code.`;
    
    await bot.sendMessage(msg.chat.id, qrText, { parse_mode: "Markdown" });
  });

  // /restart command (Owner only)
  bot.onText(/^\/restart(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    await bot.sendMessage(msg.chat.id, "🔄 Restarting bot... This will take a few moments.");
    // Implement restart logic here
  });

  // /broadcast command (Owner only)
  bot.onText(/^\/broadcast\s+(.+)$/, async (msg, match) => {
    if (!adminOnly(msg)) return;
    const message = match[1];
    await bot.sendMessage(msg.chat.id, `📢 Broadcast message queued:\n\n${message}`);
    // Implement broadcast logic here
  });

  // /logs command (Owner only)
  bot.onText(/^\/logs(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    await bot.sendMessage(msg.chat.id, "📋 Bot logs:\n\nCheck your Render dashboard for detailed logs.");
  });

  // /stats command (Owner only)
  bot.onText(/^\/stats(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const statsText = `📊 *Bot Statistics*

• Memory Usage: ${memoryUsage}MB
• Node Version: ${process.version}
• Uptime: ${Math.floor(process.uptime())}s
• Version: ${config.version}`;
    
    await bot.sendMessage(msg.chat.id, statsText, { parse_mode: "Markdown" });
  });

  // Error handling
  bot.on("polling_error", (error) => {
    console.error("Telegram polling error:", error.message);
  });

  console.log("✅ Telegram Bot Started");
}

module.exports = startTelegramBot;

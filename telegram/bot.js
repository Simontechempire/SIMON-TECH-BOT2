const TelegramBot = require("node-telegram-bot-api");
const config = require("../config");
const { getSocket } = require("../whatsapp/connection");

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

  // /pair command (Owner only) - Request pairing code from Baileys
  bot.onText(/^\/pair\s+(.+)$/, async (msg, match) => {
    if (!adminOnly(msg)) return;
    
    const number = match[1].trim().replace(/[^0-9]/g, "");
    
    if (!number || number.length < 10) {
      return await bot.sendMessage(msg.chat.id, "❌ Invalid phone number. Please provide a valid number without special characters.");
    }

    try {
      const sock = getSocket();
      
      if (!sock) {
        return await bot.sendMessage(msg.chat.id, "❌ WhatsApp socket not initialized. Please ensure the bot is fully started.");
      }

      await bot.sendMessage(msg.chat.id, "⏳ Requesting pairing code...");

      // Request pairing code from Baileys
      const pairingCode = await sock.requestPairingCode(number);
      
      if (!pairingCode) {
        return await bot.sendMessage(msg.chat.id, "❌ Failed to generate pairing code. Please try again.");
      }

      const pairingText = `✅ *WhatsApp Pairing Code Generated*

📞 Phone Number: +${number}

🔐 *Pairing Code:*
\`${pairingCode}\`

📝 Instructions:
1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices
3. Tap "Link a Device"
4. Enter the code shown above

⏱️ Code expires in 10 minutes`;
      
      await bot.sendMessage(msg.chat.id, pairingText, { parse_mode: "Markdown" });
      console.log(`✅ Pairing code requested for +${number}`);

    } catch (error) {
      console.error("Pairing error:", error);
      let errorMsg = "❌ Error requesting pairing code.";
      
      if (error.message.includes("already")) {
        errorMsg = "❌ This number is already paired or in use.";
      } else if (error.message.includes("invalid")) {
        errorMsg = "❌ Invalid phone number format.";
      }
      
      await bot.sendMessage(msg.chat.id, errorMsg);
    }
  });

  // /qr command (Owner only)
  bot.onText(/^\/qr(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    
    try {
      const sock = getSocket();
      
      if (!sock || !sock.user) {
        const qrText = `📸 *WhatsApp QR Code Scan*

To connect WhatsApp:
1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices
3. Tap "Link a Device"
4. Scan the QR code in the server terminal

Check Render logs to see the QR code.`;
        return await bot.sendMessage(msg.chat.id, qrText, { parse_mode: "Markdown" });
      }

      const connectedText = `✅ *WhatsApp Already Connected*

📱 Account: ${sock.user.name || sock.user.id}

No QR code needed - you're already linked!`;
      
      await bot.sendMessage(msg.chat.id, connectedText, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("QR error:", error);
      await bot.sendMessage(msg.chat.id, "❌ Error retrieving QR code. Check Render logs.");
    }
  });

  // /restart command (Owner only)
  bot.onText(/^\/restart(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    await bot.sendMessage(msg.chat.id, "🔄 Restarting bot...");
    setTimeout(() => process.exit(0), 1000);
  });

  // /broadcast command (Owner only)
  bot.onText(/^\/broadcast\s+(.+)$/, async (msg, match) => {
    if (!adminOnly(msg)) return;
    const message = match[1];
    await bot.sendMessage(msg.chat.id, `📢 Broadcast queued:\n\n${message}`);
  });

  // /logs command (Owner only)
  bot.onText(/^\/logs(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    await bot.sendMessage(msg.chat.id, "📋 Check your Render dashboard for bot logs.");
  });

  // /stats command (Owner only)
  bot.onText(/^\/stats(?:@\w+)?$/, async (msg) => {
    if (!adminOnly(msg)) return;
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const statsText = `📊 *Bot Statistics*

• Memory: ${memoryUsage}MB
• Node: ${process.version}
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

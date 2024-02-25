const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Command to start the bot and display available commands
bot.command('start', async (ctx) => {
  ctx.reply(`Welcome to the bot!\n\n` +
            `Commands available:\n/start - Start the bot`);
});

// Middleware to handle /start command
bot.hears('/start', async (ctx) => {
  ctx.reply(`You sent /start. This is the beginning!`);
});

// Launch the bot
bot.launch();

const { Telegraf } = require('telegraf');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Define User and Admin models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define associations if needed

// Sync models with the database
sequelize.sync();

// Initialize Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Command to start the bot and display available commands
bot.command('start', async (ctx) => {
  ctx.reply(`Welcome to the bot!\n\n` +
            `Commands available:\n/register - Register as a user\n/adminregister - Register as an admin`);
});

// Register command for users
bot.command('register', async (ctx) => {
  const { message } = ctx;
  const username = message.from.username;
  try {
    await User.create({ username: username, role: 'user' });
    ctx.reply(`Registration successful!`);
  } catch (error) {
    ctx.reply(`Error registering user: ${error.message}`);
  }
});

// Command to display user's registration info
bot.command('myinfo', async (ctx) => {
  const { message } = ctx;
  const username = message.from.username;
  try {
    const user = await User.findOne({ where: { username: username } });
    if (user) {
      ctx.reply(`Your registration date: ${user.createdAt}`);
    } else {
      ctx.reply(`You are not registered.`);
    }
  } catch (error) {
    ctx.reply(`Error fetching user info: ${error.message}`);
  }
});

// Register command for admins
bot.command('adminregister', async (ctx) => {
  const { message } = ctx;
  const username = message.from.username;
  try {
    await Admin.create({ username: username });
    ctx.reply(`Admin registration successful!`);
  } catch (error) {
    ctx.reply(`Error registering admin: ${error.message}`);
  }
});

// Command to list all registered users
bot.command('listusers', async (ctx) => {
  try {
    const users = await User.findAll();
    if (users.length > 0) {
      let response = 'Registered Users:\n';
      users.forEach(user => {
        response += `Username: ${user.username}, Registration Date: ${user.createdAt}\n`;
      });
      ctx.reply(response);
    } else {
      ctx.reply(`No users registered.`);
    }
  } catch (error) {
    ctx.reply(`Error fetching users: ${error.message}`);
  }
});

// Launch the bot
bot.launch();

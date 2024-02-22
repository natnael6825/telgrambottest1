const { Telegraf } = require('telegraf');
const session = require('telegraf/session');
const { Sequelize } = require('sequelize');

// Configure SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Test database connection
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testDatabaseConnection();

// Define Sequelize models
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING,
  role: Sequelize.STRING,
  createdAt: Sequelize.DATE
});

const Admin = sequelize.define('Admin', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING
});

// Initialize Telegraf bot
const bot = new Telegraf('7025523362:AAFEV1XhagZjJBjJGhzMMKhQKshrWIxr17k');

// Middleware to check if user is admin
bot.use((ctx, next) => {
  if (ctx.session.isAdmin) {
    return next();
  } else {
    ctx.reply('You are not authorized to perform this action.');
  }
});

// Command to register user
bot.command('register', async (ctx) => {
  const { id, username } = ctx.from;
  try {
    await User.create({ id, username });
    ctx.reply('You have been successfully registered.');
  } catch (error) {
    ctx.reply('Registration failed. Please try again later.');
  }
});

// Command to register admin
bot.command('adminregister', async (ctx) => {
  const { id, username } = ctx.from;
  try {
    await Admin.create({ id, username });
    ctx.reply('Admin registration successful.');
  } catch (error) {
    ctx.reply('Admin registration failed. Please try again later.');
  }
});

// Command to list users (for admins only)
bot.command('listusers', async (ctx) => {
  try {
    const users = await User.findAll();
    users.forEach(user => {
      ctx.reply(`Username: ${user.username}, Registration Date: ${user.createdAt}`);
    });
  } catch (error) {
    ctx.reply('Failed to list users.');
  }
});

// Command to show user registration date
bot.command('myinfo', async (ctx) => {
  const { id } = ctx.from;
  try {
    const user = await User.findOne({ where: { id } });
    ctx.reply(`Your registration date: ${user.createdAt}`);
  } catch (error) {
    ctx.reply('Failed to retrieve registration date.');
  }
});

// Launch the bot
bot.launch();

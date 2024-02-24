const { Telegraf, session } = require('telegraf');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Enable session middleware
bot.use(session());

// Connect to SQLite database using Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Define Admin model
const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

// Middleware to check if the user is an admin
bot.use(async (ctx, next) => {
  const { id } = ctx.from;
  const admin = await Admin.findOne({ where: { username: id } });
  if (admin) {
    // If the user is an admin, attach isAdmin flag to ctx object
    ctx.isAdmin = true;
  } else {
    ctx.isAdmin = false;
  }
  next();
});

// Command to register as a user
bot.command('register', async (ctx) => {
  const { id, username } = ctx.from;
  try {
    const user = await User.create({ username });
    ctx.reply(`You have been successfully registered as a user. Your registration date is: ${user.createdAt}`);
  } catch (error) {
    console.error('Error registering user:', error);
    ctx.reply('Error registering user.');
  }
});

// Command to start the bot and display available commands
bot.command('start', async (ctx) => {
  ctx.reply(`Welcome to the bot!\n\n` +
            `Commands available:\n/register - Register as a user\n/adminregister - Register as an admin\n/myinfo - View your registration info\n/listusers - List all registered users`);
});

// Command to register as an admin
bot.command('adminregister', async (ctx) => {
  const { id, username } = ctx.from;
  try {
    const admin = await Admin.create({ username });
    ctx.reply(`You have been successfully registered as an admin.`);
  } catch (error) {
    console.error('Error registering admin:', error);
    ctx.reply('Error registering admin.');
  }
});

// Command to list all registered users
bot.command('listusers', async (ctx) => {
  if (!ctx.isAdmin) {
    ctx.reply('You are not authorized to use this command.');
    return;
  }
  try {
    const users = await User.findAll();
    let userList = '';
    users.forEach(user => {
      userList += `Username: ${user.username}, Registration Date: ${user.createdAt}\n`;
    });
    ctx.reply(`List of registered users:\n${userList}`);
  } catch (error) {
    console.error('Error listing users:', error);
    ctx.reply('Error listing users.');
  }
});
bot.command('myinfo', async (ctx) => {
  const { username } = ctx.from;
  console.log('User ID:', username); // Log the user's ID

  try {
    const user = await User.findOne({ where: { username: username } });
    console.log('User found:', user); // Log the user object retrieved from the database
    if (user) {
      ctx.reply(`Your registration date is: ${user.createdAt}`);
    } else {
      ctx.reply('You are not registered yet.');
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    ctx.reply('Error fetching user info.');
  }
});


// Synchronize the defined models with the database
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
    // Launch the bot after the database is synced
    bot.launch();
  })
  .catch(err => console.error('Error syncing database:', err));

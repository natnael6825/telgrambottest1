const { Telegraf } = require("telegraf");
const { Sequelize } = require("sequelize");

// Initialize Sequelize with MySQL
// const sequelize = new Sequelize("sql3686735", "sql3686735", "TwI5XPdAaz", {
//   host: "sql3.freesqldatabase.com",
//   port: 3306,
//   dialect: "mysql",
// });

// Define User and Admin models
// const User = sequelize.define("User", {
//   username: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   role: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   createdAt: {
//     type: Sequelize.DATE,
//     defaultValue: Sequelize.NOW,
//   },
// });

// const Admin = sequelize.define("Admin", {
//   username: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
// });

// Define associations if needed

// Rest of your code...

bot.launch();

// Sync models with the database
sequelize.sync();

// Initialize Telegraf bot
const bot = new Telegraf("7049705525:AAH9t3-CarYGBv-PaHSefo1kovh_R0eOi9A");
console.log("Bot Token:", process.env.BOT_TOKEN);

// Command to start the bot and display available commands
bot.command("start", async (ctx) => {
  ctx.reply(
    `Welcome to the bot!\n\n` +
      `Commands available:\n/register - Register as a user\n/adminregister - Register as an admin`
  );
});

const { Telegraf } = require("telegraf");
const { Sequelize } = require("sequelize");

// Initialize Sequelize with MySQL
const sequelize = new Sequelize("sql3686735", "sql3686735", "TwI5XPdAaz", {
  host: "sql3.freesqldatabase.com",
  port: 3306,
  dialect: "mysql",
});

// Define User and Admin models
const User = sequelize.define("User", {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const Admin = sequelize.define("Admin", {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Define associations if needed

// Sync models with the database
sequelize.sync();

// Initialize Telegraf bot
//const bot = new Telegraf("7049705525:AAH9t3-CarYGBv-PaHSefo1kovh_R0eOi9A");
console.log("Bot Token:", process.env.BOT_TOKEN);

// Command to start the bot and display available commands
bot.command("start", async (ctx) => {
  ctx.reply(
    `Welcome to the bot!\n\n` +
      `Commands available:\n/register - Register as a user\n/adminregister - Register as an admin`
  );
});

// Register command for users
bot.command("register", async (ctx) => {
  const { message } = ctx;
  const username = message.from.username;

  // Check if the user is an admin
  if (AUTHORIZED_ADMINS.includes(username)) {
    ctx.reply(`You are an admin, you can't register as a user.`);
    return;
  }

  try {
    // Check if the user is already registered
    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      ctx.reply(`Already registered as a user.`);
    } else {
      // If not registered, create a new user
      await User.create({ username: username, role: "user" });
      ctx.reply(`Registration successful!`);
    }
  } catch (error) {
    ctx.reply(`Error registering user: ${error.message}`);
  }
});

// Command to display user's registration info
bot.command("myinfo", async (ctx) => {
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

const allowedAdminUsernames = ["admin1", "admin2", "admin3"];

// Register command for admins
bot.command("adminregister", async (ctx) => {
  const { message } = ctx;
  const username = message.from.username;

  if (allowedAdminUsernames.includes(username)) {
    try {
      await Admin.create({ username: username });
      ctx.reply(`Admin registration successful!`);
    } catch (error) {
      ctx.reply(`Error registering admin: ${error.message}`);
    }
  } else {
    ctx.reply(`You are not authorized to register as an admin.`);
  }
});

// Command to list all registered users
bot.command("listusers", async (ctx) => {
  try {
    const users = await User.findAll();
    if (users.length > 0) {
      let response = "Registered Users:\n";
      users.forEach((user) => {
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

// // Launch the bot
// bot.launch();
// // Command to display user's registration info
// bot.command("myinfo", async (ctx) => {
//   const { message } = ctx;
//   const username = message.from.username;
//   try {
//     const user = await User.findOne({ where: { username: username } });
//     if (user) {
//       ctx.reply(`Your registration date: ${user.createdAt}`);
//     } else {
//       ctx.reply(`You are not registered.`);
//     }
//   } catch (error) {
//     ctx.reply(`Error fetching user info: ${error.message}`);
//   }
// });

// // Register command for admins
// bot.command("adminregister", async (ctx) => {
//   const { message } = ctx;
//   const username = message.from.username;
//   try {
//     await Admin.create({ username: username });
//     ctx.reply(`Admin registration successful!`);
//   } catch (error) {
//     ctx.reply(`Error registering admin: ${error.message}`);
//   }
// });

// // Command to list all registered users
// bot.command("listusers", async (ctx) => {
//   try {
//     const users = await User.findAll();
//     if (users.length > 0) {
//       let response = "Registered Users:\n";
//       users.forEach((user) => {
//         response += `Username: ${user.username}, Registration Date: ${user.createdAt}\n`;
//       });
//       ctx.reply(response);
//     } else {
//       ctx.reply(`No users registered.`);
//     }
//   } catch (error) {
//     ctx.reply(`Error fetching users: ${error.message}`);
//   }
// });

// Launch the bot
bot.launch();

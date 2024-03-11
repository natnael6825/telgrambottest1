const { Telegraf } = require("telegraf");
const { Sequelize } = require("sequelize");

// Initialize Sequelize with MySQL
const sequelize = new Sequelize("sql11690341", "sql11690341", "lnyAKMFlA4", {
  host: "sql11.freesqldatabase.com",
  port: 3306,
  dialect: "mysql",
});

// Define User and Admin models
const User = sequelize.define("User", {
  username: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  chatId: {
    type: Sequelize.BIGINT,
    allowNull: false,
    unique: true,
  },
});

const Admin = sequelize.define("Admin", {
  username: {
    
    type: Sequelize.STRING,
    allowNull: true,
  },
  chatId: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
});

// Define associations if needed

// Sync models with the database
sequelize.sync();

// Initialize Telegraf bot
const bot = new Telegraf("7049705525:AAH9t3-CarYGBv-PaHSefo1kovh_R0eOi9A");
console.log("Bot Token:", process.env.BOT_TOKEN);

// Command to start the bot and display available commands
bot.command("start", async (ctx) => {
  ctx.reply(
    "Welcome to the bot!\n\nCommands available:\n/register - Register as a user\n/adminregister - Register as an admin\n/myinfo - View your registration info\n/listusers - List all registered users"
  );
});

// Register command for users
bot.command("register", async (ctx) => {
  const { from } = ctx.message;

  if (!from) {
    console.warn("Warning: Unable to get valid information about the sender.");
  }

  const username = from ? from.username || null : null;
  const chatId = from ? from.id : null;

  try {
    // Check if the user is an admin
    const isAdmin = await Admin.findOne({ where: { chatId: chatId } });

    if (isAdmin) {
      ctx.reply(`You are an admin, you can't register as a user.`);
      return;
    }

    // Check if the user is already registered
    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      ctx.reply(`Already registered as a user.`);
    } else {
      // If not registered, create a new user
      await User.create({ username: username, role: "user", chatId: chatId });
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

// const allowedAdmins = [
//   { chatId: 499416454 },
//   { chatId: 123 },
//Add more admins as needed
// ];

// Register command for admins
bot.command("adminregister", async (ctx) => {
  const { from } = ctx.message;
  const chatId = from.id;

  try {
    // Check if the user is already registered as admin
    const existingAdmin = await Admin.findOne({ where: { chatId: chatId } });

    if (existingAdmin) {
      ctx.reply(`You are already registered as an admin.`);
    } else {
      // If not registered, send request to all admins for approval
      const allAdmins = await Admin.findAll();
      allAdmins.forEach(async (admin) => {
        if (admin.chatId !== chatId) {
          // Avoid sending a request to the user trying to register
          await bot.telegram.sendMessage(
            admin.chatId,
            `User ${from.username} (${chatId}) wants to register as an admin.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "Approve", callback_data: `/approve_${chatId}` },
                    { text: "Decline", callback_data: `/decline_${chatId}` },
                  ],
                ],
              },
            }
          );
        }
      });
      ctx.reply(
        `Your request to register as an admin has been sent for approval.`
      );
    }
  } catch (error) {
    ctx.reply(`Error processing admin registration: ${error.message}`);
  }
});

// Handle callback data
bot.action(/\/approve_(\d+)/, async (ctx) => {
  const userIdToApprove = ctx.match[1];

  try {
    // Register the user with userIdToApprove as an admin
    await Admin.create({ chatId: userIdToApprove });

    // Delete the user from the User table
    await User.destroy({ where: { chatId: userIdToApprove } });

    // Notify the user about the approval
    await bot.telegram.sendMessage(
      userIdToApprove,
      `Congratulations! You are now registered as an admin.`
    );
    ctx.reply(`User with ID ${userIdToApprove} is now registered as an admin.`);
  } catch (error) {
    ctx.reply(`Error registering admin: ${error.message}`);
  }
});

// Handle decline action
bot.action(/\/decline_(\d+)/, async (ctx) => {
  const userIdToDecline = ctx.match[1];
  // Notify the user about the decline
  await bot.telegram.sendMessage(
    userIdToDecline,
    `Your request to register as an admin has been declined.`
  );
  ctx.reply(`User with ID ${userIdToDecline} is declined as an admin.`);
});

// Command to list all registered users
bot.command("listusers", async (ctx) => {
  const { from } = ctx.message;
  const chatId = from ? from.id : null;

  try {
    // Check if the user is an admin
    const isAdmin = await Admin.findOne({ where: { chatId: chatId } });

    if (isAdmin) {
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
    } else {
      ctx.reply(`You are not authorized to use this command.`);
    }
  } catch (error) {
    ctx.reply(`Error fetching users: ${error.message}`);
  }
});

bot.on("text", (ctx) => {
  ctx.reply("Unknown text. Please use valid commands.");
});

bot.on("message", (ctx) => {
  ctx.reply("WHAT IS THIS!!!\n Am I a joke to you ");
});

// Launch the bot
bot.launch();

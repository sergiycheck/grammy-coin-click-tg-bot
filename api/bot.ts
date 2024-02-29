import dotenv from "dotenv";
import path from "path";
import process from "process";

export const config = {
  runtime: "nodejs",
};

const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

import { Bot, GrammyError, HttpError, InlineKeyboard, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

const gameName = process.env.GAME_NAME;
const gameUrl = process.env.GAME_URL;

const keyboard = new InlineKeyboard().game(`Start ${gameName}`);

bot.command("start", async (ctx) => {
  console.log("Received a command from", ctx.from.id);
  await ctx.replyWithGame(gameName, { reply_markup: keyboard });
});

bot.on("callback_query:game_short_name", async (ctx) => {
  console.log("Received a callback query from", ctx.from.id);
  const chatId = ctx.from.id;
  const username = ctx.from.username;
  const params = new URLSearchParams();
  params.append("userName", username);
  params.append("chatId", chatId.toString());
  const gameUrlWithParams = `${gameUrl}?${params.toString()}`;
  await ctx.answerCallbackQuery({ url: gameUrlWithParams });
});

bot.on("message", async (ctx) => {
  const chatId = ctx.from.id;
  console.log("Received a message from", chatId);
  console.log("Message:", ctx.message.text);
  ctx.reply("Click the coin to earn money!");
});

bot
  .start()
  .then(() => console.log("Bot is up and running!"))
  .catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

export default webhookCallback(bot, "http");

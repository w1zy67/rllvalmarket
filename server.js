require("dotenv").config();
const express = require("express");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "RivalMarket" }));

// Demo catalog only. Replace with products stored in a database before launch.
const products = [
  { id: "digital-1", title: "Цифровой товар", description: "Демонстрационная позиция каталога", price: 5.00, currency: "USD" },
  { id: "service-1", title: "Цифровая услуга", description: "Демонстрационная позиция каталога", price: 10.00, currency: "USD" }
];

app.get("/api/products", (_req, res) => res.json(products));

app.post("/api/orders", (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Корзина пуста" });
  }
  // This starter intentionally does not charge money or create real orders.
  res.status(501).json({
    error: "Демо-режим: подключите базу данных и проверенный платёжный провайдер для реальных заказов."
  });
});

if (BOT_TOKEN && BOT_TOKEN !== "PASTE_YOUR_BOT_TOKEN_HERE") {
  const bot = new Telegraf(BOT_TOKEN);

  bot.start(async (ctx) => {
    const keyboard = WEB_APP_URL && WEB_APP_URL.startsWith("https://")
      ? Markup.inlineKeyboard([[Markup.button.webApp("Открыть магазин", WEB_APP_URL)]])
      : Markup.inlineKeyboard([[Markup.button.url("Инструкция по запуску", "https://core.telegram.org/bots/webapps")]]);
    await ctx.reply(
      "Добро пожаловать в RivalMarket! Нажмите кнопку, чтобы открыть магазин.",
      keyboard
    );
  });

  bot.command("shop", async (ctx) => {
    if (WEB_APP_URL && WEB_APP_URL.startsWith("https://")) {
      return ctx.reply("Открыть RivalMarket:", Markup.inlineKeyboard([
        [Markup.button.webApp("Открыть магазин", WEB_APP_URL)]
      ]));
    }
    return ctx.reply("Mini App ещё не опубликован. Сначала укажите HTTPS WEB_APP_URL в .env.");
  });

  bot.launch().then(() => console.log("Telegram bot started")).catch(console.error);
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
} else {
  console.log("BOT_TOKEN is missing. Website will run, Telegram bot will stay disabled.");
}

app.listen(PORT, () => console.log(`RivalMarket running at http://localhost:${PORT}`));

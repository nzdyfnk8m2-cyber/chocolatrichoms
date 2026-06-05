import asyncio
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

TOKEN = "8974944600:AAG7w7leXkMsN9QVp8fyl5WoaqKNbKShmyc"
WEB_APP_URL = "https://nzdyfnk8m2-cyber.github.io/chocolatrichoms/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[
        InlineKeyboardButton(
            "🛍 Ouvrir la boutique",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "🌿 *Bienvenue chez ChocolaTrichoms\\&Terps\\!*\n\n"
        "Découvrez notre sélection de produits CBD premium\\.\n"
        "Appuyez sur le bouton ci\\-dessous pour accéder à la boutique 👇",
        reply_markup=reply_markup,
        parse_mode="MarkdownV2"
    )

async def shop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[
        InlineKeyboardButton(
            "🛍 Ouvrir la boutique",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Voici la boutique 👇",
        reply_markup=reply_markup
    )

if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("shop", shop))
    print("✅ Bot ChocolaTrichoms démarré!")
    app.run_polling()

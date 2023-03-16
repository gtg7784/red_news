import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN as string;

const bot = new TelegramBot(token, {polling: false});

export const send_messege = async (chat_id: TelegramBot.ChatId, text: string) => {
  const res = await bot.sendMessage(chat_id, text);
}

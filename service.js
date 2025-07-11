import { MongoClient } from 'mongodb';
import { TelegramBot } from 'node-telegram-bot-api';

const MONGO_URI = "mongodb+srv://kolosovmatveymk:AFblRZu9hLe70Sks@cluster0.414nj.mongodb.net/?retryWrites=true&w=majority"
const token = "8022738459:AAHqxjyrBwhVFVAU9Q1925rzSC9gEanEtbY"
const TELEGRAM_CHAT_MT = "555207329"
const TELEGRAM_CHAT_DEA = "644190724"

const bot = new TelegramBot(token, { polling: true });


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }
});


export async function getDataFromMongoDB() {
  const dbName = 'TodoDB';
  const collectionName = 'tasks';
  const client = new MongoClient(MONGO_URI);

  try {
    // Подключение к MongoDB
    await client.connect();

    // Получение базы данных и коллекции
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Получение данных из коллекции (все документы)
    const data = await collection.find({}).toArray(); // {} - пустой фильтр, возвращает всё
    return data;
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    throw error;
  } finally {
    // Закрытие подключения
    await client.close();
  }
}

export async function sendToTelegram(message, user) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const userToSend = user === 'MT' ? TELEGRAM_CHAT_MT : TELEGRAM_CHAT_DEA
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: userToSend,
      text: message,
    }),
  });

  if (!response.ok) {
    console.error('Ошибка отправки сообщения в Telegram: ', await response.text());
  }
}


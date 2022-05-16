const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN;
const notionKey = process.env.NOTION_KEY;
const dataBaseId = process.env.DATABASE_ID;

const bot = new TelegramBot(token, { polling: true });

async function saveToNotion(text) {
  const [title, content] = text.split("===");

  const { Client } = require("@notionhq/client");
  const notion = new Client({ auth: notionKey });
  const date = new Date();
  try {
    const response = await notion.pages.create({
      parent: { database_id: dataBaseId },
      icon: {
        type: "emoji",
        emoji: require("./random-emoji")(),
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Created: {
          date: {
            start: date.toISOString().split("T")[0],
          },
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: content,
                },
              },
            ],
          },
        },
      ],
    });
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

bot.onText(/\/add (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  console.log(resp);
  const response = await saveToNotion(resp);
  if (response.url) {
    bot.sendMessage(chatId, `创建成功 ${response.url}`);
  } else {
    bot.sendMessage(chatId, `创建失败 ${response.message}`);
  }
});

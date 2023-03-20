import * as dotenv from 'dotenv'
import Telebot from 'telebot'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()
const userMessages = new Map()
const bot = new Telebot(process.env.TELEGRAM_BOT_TOKEN)

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

async function chatgpt(messages) {
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  })

  const answer = completion.data.choices[0].message.content

  return answer
}

bot.on('text', msg => {
  const userId = msg.from.id
  const text = msg.text

  if (!userMessages.has(userId)){
    userMessages.set(userId, [])
  }

  const messages = userMessages.get(userId)
  messages.push({ role: 'user', content: text })

  chatgpt(messages).then((message) => {
    bot.sendMessage(userId, message)
    messages.push({ role: 'assistant', content: message })
  }).catch(console.log)
})

bot.start()
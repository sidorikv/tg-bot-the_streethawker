require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const converter = require('current-currency');

const bot = new TelegramBot(process.env.API_KEY, {
    polling: true
})

const commands = [
    {
        command: 'info',
        description: 'Информация и возможности бота'
    }
]

bot.setMyCommands(commands)

bot.on('text', async (message) => {

    if (message.text === '/start' || message.text === '/info') {
        await bot.sendPhoto(message.chat.id, 'src/img/startedLogo.jpg', {
            caption: '*Привет!* Это бот StreetHawker\nЯ помогу быстро посчитать цену и оформить заказ с сайта *POIZON*',
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Калькулятор цен 🧮', callback_data: 'price_calculator'}],
                    [{text: 'Оформить заказ 💴', callback_data: 'checkout'}],
                    [{text: 'Про скам 💩', callback_data: 'about_scam'}, {text: 'Про курс 🇨🇳', callback_data: 'about_course'}],
                    [{text: 'Отзывы 📢', callback_data: 'feedback'}]
                ]
            }
        })
    }

})

bot.on('callback_query', async (callback) => {
    switch(callback.data) {
        case 'about_course':
            const current_currency = (((await converter.convert('CNY', 1, 'RUB')).amount + 1).toFixed(2))
            await bot.sendMessage(
                callback.message.chat.id,
                `*Про курс*:\nКурс юаня к рублю на сегодня: ${current_currency}\n\nПочему у меня  такой большой курс юаня?🇨🇳\nЕсли вы задались таким вопросом, значит вы зашли на сайт [Центробанка РФ](http://cbr.ru/) и справа снизу посмотрели официальный курс и увидели, что он отличается от моего  примерно на 2 рубля (специально не привожу точных цифр, т.к. ситуация меняется каждый день)\n\nСамый простой ответ на вопрос о высоком курсе:\n❗️В текущих реалиях нельзя купить валюту даже близко к курсу ЦБ\nНапример, можно посмотреть по какой цене *ПРОДАЕТ* [Сбербанк](http://www.sberbank.ru/ru/quotes/currencies?currency=CNY) юань Обычно это плюс 3,5 рубля к официальному курсу ЦБ\n\nЯ совершаю операции  с валютой "день в день" - вы перевели мне рубли, я сразу оплатили заказ в юанях "из своих", сразу же поменял ваши рубли на юань. Я не занимаюсь накоплением рублей в ожидании падения курса, чтобы на этом заработать - это не мой бизнес. (темболее, чаще всего происходит обратное)\n\nЯ стараюсь  закупать валюту максимально дешево и оперативно.\nСверьте мой курс с курсом у конкурентов и вы поймете, что я молодец , даже без учета комиссий\n\nКакой будет курс завтра?💴🇨🇳💴\nМы не знаем также как и не знаете вы. Всем клиентам(хоть на 100 юаней, хоть на 100 000 юаней) мы советуем не ждать завтра, потому что завтра в большинстве случаев хуже. В таком мире живем.`,
                {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                }
            )
            break
        
        case 'about_scam':
            await bot.sendMessage(
                callback.message.chat.id,
                '*Про скам*:\nИтак, вы задались вопросом скам ли *The Street Hawker* или не скам. Можно ли у меня заказывать? Расскажу немного, почему я не скам, а окончательное решение принимать конечно же Вам. В карман за вашими деньгами я не лезу. Я просто стараюсь оказывать хороший сервис\n\n1. У меня есть *СВОЙ* склад в Китае, за него отвечает мой партнер мистер Эньяо. Я плачу за этот склад ежемесячно. Это склад не знакомых, не друзей, не какой-то другой компании... - это полностью мой склад, на который я принимаю большое количество грузов, в том числе и с *Poizon*.\n\n',
                {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                }
            )
            break

        case 'feedback':
            await bot.sendMessage(
                callback.message.chat.id,
                '[Здесь](https://www.instagram.com/s/aGlnaGxpZ2h0OjE3OTk3NTk1ODM3NTYzMDcy) вы можете посмотреть мои отзывы:)',
                {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                }
            )
            break
    
        case 'price_calculator':
            const user_price_question = await bot.sendMessage(
                callback.message.chat.id,
                'Введите сумму в *юанях ¥*:\n\n(_Цена указана с учетом достаки до Москвы и моей комиссией_)',
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        force_reply: true
                    }
                }
            )
            bot.onReplyToMessage(callback.message.chat.id, user_price_question.message_id, async (message_name) => {
                const price = Number(message_name.text).toFixed(2)
                const current_currency = (((await converter.convert('CNY', 1, 'RUB')).amount + 1).toFixed(2))
                if (price === 'NaN') {
                    await bot.sendMessage(
                        callback.message.chat.id,
                        `Пожалуйста, укажите сумму в *цифрах*`,
                        {
                            parse_mode: 'Markdown'
                        }
                    )
                } else {
                    const multiplier = current_currency
                    const tax = 1500
                    const percent = price * 0.15
                    await bot.sendMessage(
                        callback.message.chat.id,
                        `Ваша цена будет составлять: *${(price * multiplier) + tax + percent}*₽`,
                        {
                            parse_mode: 'Markdown'
                        }
                    )
                }
            })
            break
        
        case 'checkout':
            const photoGroup = [
                {
                    type: 'photo',
                    media: 'src/img/checkoutInstruction.jpg',
                    caption: 'Инструкция'
                },
                {
                    type: 'photo',
                    media: 'src/img/checkoutExampleFirst.jpg',
                    caption: 'Пример #1'
                },
                {
                    type: 'photo',
                    media: 'src/img/checkoutExampleSecond.jpg',
                    caption: 'Пример #2'
                },
            ]
            await bot.sendMediaGroup(
                callback.message.chat.id,
                photoGroup
            )
            const user_order = await bot.sendMessage(
                callback.message.chat.id,
                'Для того чтобы совершить заказ, вам необходимо выполнить *два* шага:\n\n*1*: Скриншот товара ( который вас интересует )\n*2*: Скриншот размера\n\n*Примеры* фото находятся в сообщении выше',
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        force_reply: true
                    }
                }
            )
            bot.onReplyToMessage(
                callback.message.chat.id,
                user_order.message_id,
                async (order) => {
                    await bot.sendMessage(
                        `${process.env.ADMIN_USERID}`,
                        `*Новый заказ*\n\nПользователь: @${order.from.username}\n Имя: ${order.from.first_name}`,
                        {
                            parse_mode: 'Markdown'
                        }
                    )
                    await bot.forwardMessage(
                        `${process.env.ADMIN_USERID}`,
                        callback.message.chat.id,
                        order.message_id
                    )
                    await bot.sendMessage(
                        callback.message.chat.id,
                        '*Заказ* успешно *создан* ✅',
                        {
                            parse_mode: 'Markdown'
                        }
                    )
                }
            )
            break
    }
})

bot.on('polling_error', async (error) => {
    console.log(error)
})
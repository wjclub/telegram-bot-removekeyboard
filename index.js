const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const TelegrafLocalSession = require('telegraf-session-local')
const path = require('path')


// Prepare i18n
const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: true,
  directory: path.resolve(__dirname, 'locales')
})

// Prepare sessions
const LocalSession = new TelegrafLocalSession({
  storage: TelegrafLocalSession.storageMemory
})

// Create bot and load middlewares
const botToken = process.env.BOT_TOKEN
const bot = new Telegraf(botToken)
bot.context.botID = parseInt(botToken.split(':')[0])
bot.use(i18n.middleware())
bot.use(LocalSession.middleware())


bot.start(ctx => {

  // 1-1 CHAT HANDLING
  if (ctx.update.message.chat.type === 'private') {
    ctx.replyWithHTML(ctx.i18n.t('start') + ctx.i18n.t('help'))
  }


  // GROUP CHAT HANDLING
  else {
    // TODO
    console.debug(ctx.update.message.chat)
  }

})


bot.on('new_chat_members', ctx => {

  // Only proceed if the bot itself is one of the added chat members
  const newMembers = ctx.update.message.new_chat_members
  

  if (newMembers.find(e => (e.id === ctx.botID)) === undefined) {
    console.debug('No bot found')
    return
  }

  console.debug('delete!!!')

  // Purge all the inline buttons
  deleteInlineButtons(ctx)

  console.debug(ctx.botID, newMembers)
})

bot.command('deletekeyboard', ctx => {
  deleteInlineButtons(ctx)
})



bot.help(ctx => ctx.replyWithHTML(ctx.i18n.t('help')))



/*
-----------------------------------------------------------
    Helper Functions
-----------------------------------------------------------
*/

async function deleteInlineButtons(ctx, leaveAfterDeleting = true) {

  try {
    // Send a new message with an inline keyboard to overwrite any current keyboards
    const mockKeyboardMsg = await ctx.reply(ctx.i18n.t('start_removing_keyboard'), {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [{
            text: ctx.i18n.t('removing_keyboard_btn_placeholder')
          }]
        ]
      }
    })
    
    // attempt to delete it again
    await ctx.deleteMessage(mockKeyboardMsg.message_id)

    // send a new message to delete the just sent keyboard
    await ctx.reply(ctx.i18n.t('done_removing_keyboard'), {
      reply_markup: {
        remove_keyboard: true
      }
    })

  } catch (error) {
    console.error(Date.now(), ' Failed to remove a keyboard in chat ', ctx.update.message.chat.id,'. Error:\n', error)
  }

  try {
    if (leaveAfterDeleting)
      await ctx.leaveChat()
  } catch (error) {/* Whatever, screw it.*/}

}



// Start bot
bot.startPolling()
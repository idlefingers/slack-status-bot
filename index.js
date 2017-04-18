const slack = require("slack")

const bot = slack.rtm.client()
const token = process.env.SLACK_TOKEN

const statuses = {}

slack.users.list({ token }, (err, data) => {
  data.members.map(member => (
    statuses[member.id] = {
      status_text: member.profile.status_text,
      status_emoji: member.profile.status_emoji
    }
  ))
})

bot.user_change(message => {
  const oldStatus = statuses[message.user.id]
  const { status_text, status_emoji } = message.user.profile
  if (status_text !== oldStatus.status_text || status_emoji !== oldStatus.status_emoji) {
    const text = `@${message.user.name} changed status to: ${status_emoji} ${status_text}`
    slack.chat.postMessage({ token, channel: "#status", text }, (err, data) => (
      console.log(err, data)
    ))
  }
})

bot.listen({ token })

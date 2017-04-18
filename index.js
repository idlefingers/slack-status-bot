const slack = require("slack")

const bot = slack.rtm.client()
const token = process.env.SLACK_TOKEN

const statuses = {}

const setMemberStatus = (member, statusText, statusEmoji) => {
  statuses[member.id] = {
    statusText,
    statusEmoji
  }
}

const postMessage = (user, statusText, statusEmoji) => {
  const text = `@${user.name} changed status to: ${statusEmoji} ${statusText}`
  slack.chat.postMessage({ token, channel: "#status", text }, (err, data) => (
    console.log(err, data)
  ))
}

slack.users.list({ token }, (err, data) => {
  data.members.map(member =>
    setMemberStatus(member, member.profile.status_text, member.profile.status_emoji)
  )
})

bot.user_change(message => {
  const oldStatus = statuses[message.user.id]
  const statusText = message.user.profile.status_text
  const statusEmoji = message.user.profile.status_emoji

  if (statusText !== oldStatus.statusText || statusEmoji !== oldStatus.statusEmoji) {
    setMemberStatus(message.user, statusText, statusEmoji)
    postMessage(message.user, statusText, statusEmoji)
  }
})

bot.listen({ token })

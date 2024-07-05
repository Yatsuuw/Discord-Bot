import { ActivityType } from 'discord.js'
import { event } from '../utils'

export default event('ready', ({ log }, client) => {
    log(`Successful connection to the client "${client.user.username}" (${client.user.id}).`)
    client.user.setPresence({ activities: [{ name: 'Discord servers.', type: ActivityType.Watching }], status: 'dnd' })
})

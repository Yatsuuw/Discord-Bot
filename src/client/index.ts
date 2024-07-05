import { Client, GatewayIntentBits } from 'discord.js'
import { registerEvents } from '../utils'
import events from '../events'
import keys from '../keys'

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping
    ],
})

registerEvents(client, events)

client.login(keys.clientToken)
    .catch((err) => {
        console.error('[Login Error]', err)
        process.exit(1)
    })

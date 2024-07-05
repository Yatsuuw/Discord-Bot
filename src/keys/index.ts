import { Keys } from '../types'

const keys: Keys = {
    clientToken: process.env.CLIENT_TOKEN ?? 'nil',
    testGuild: process.env.TEST_GUILD ?? 'nil',
    ownerId: process.env.OWNER_ID ?? 'nil',
    botId: process.env.BOT_ID ?? 'nil',
    version: process.env.VERSION ?? 'nil',
}

if (Object.values(keys).includes('nil'))
    throw new Error('Not all ENV variables are defined!')

export default keys

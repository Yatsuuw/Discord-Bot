import { category } from '../../utils'
import kick from './kick'
import ban from './ban'
import clear from './clear'
import mute from './mute'
import unmute from './unmute'
import channel from './channel'
import userinfo from './userinfo'
import warn from './warn'
import warnslist from './warnslist'
import unwarn from './unwarn'
import thread from './thread'
import managelevels from './managelevels'

export default category('Moderation', [
    kick,
    ban,
    clear,
    mute,
    unmute,
    channel,
    userinfo,
    warn,
    warnslist,
    unwarn,
    thread,
    managelevels,
])

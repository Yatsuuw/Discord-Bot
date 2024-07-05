import { Event } from '../../types'
import guildMemberAdd from './guildMemberAdd'
import guildMemberRemove from './guildMemberRemove'

const events: Event<any>[] = [
    guildMemberAdd,
    guildMemberRemove,
]

export default events

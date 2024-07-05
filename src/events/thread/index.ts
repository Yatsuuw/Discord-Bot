import { Event } from '../../types'
import threadCreate from './threadCreate'
import threadUpdate from './threadUpdate'

const events: Event<any>[] = [
    threadCreate,
    threadUpdate
]

export default events

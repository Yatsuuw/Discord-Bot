import { category } from '../../utils'
import setup from './setup'
import bdd from './bdd'
import emit from './emit'
import reload from './reload'
import adminInfo from './admininfo'

export default category('Administration', [
    setup,
    bdd,
    emit,
    reload,
    adminInfo,
])

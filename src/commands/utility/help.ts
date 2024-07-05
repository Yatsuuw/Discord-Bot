import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'
import { getCategoryRoot } from '../../pages/help'

const meta = new SlashCommandBuilder ()
    .setName('help')
    .setDescription('Get a list of bot commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(true)

export default command(meta, ({ interaction }) => {
    return interaction.reply(getCategoryRoot(true))
})

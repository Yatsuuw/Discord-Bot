import { SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('paf')

export default command(meta, async ({ interaction }) => {
    return interaction.reply({
        ephemeral: true,
        content: 'Paf'
    })
})

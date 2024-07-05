import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('jsdoc')
    .setDescription('Sends the documentation for the Discord.JS library')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(true)

export default command(meta, async ({ interaction }) => {
    const jsdoc = new EmbedBuilder()
        .setTitle("Discord.JS documentation")
        .addFields([{ name: 'Link', value: '[Click here](https://discord.js.org/#/)' }])
        .setTimestamp()
        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

    return interaction.reply({
        ephemeral: true,
        embeds: [jsdoc]
    })
})

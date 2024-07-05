import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { command } from '../../utils'
import keys from '../../keys'

const meta = new SlashCommandBuilder()
    .setName('admininfo')
    .setDescription('Development version of the bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(true)

export default command(meta, async({ interaction, client }) => {
    const guildsCount: number = (client.guilds.cache.size) || 0;
    const usersCount: number = (client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)) || 0;

    const info = new EmbedBuilder()
        .setTitle('Bot informations')
        .setDescription('List of bot\'s informations')
        .setColor('Aqua')
        .addFields([
            { name: 'Bot owner', value: `<@${keys.ownerId}>` },
            { name: 'Bot version', value: `${keys.version}` },
            { name: 'Servers number', value: `${guildsCount}` },
            { name: 'Users number', value: `${usersCount}` },
        ])
        .setTimestamp()
        .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

    if (interaction.user.id == keys.ownerId)

        return await interaction.reply({
            ephemeral: true,
            embeds: [info]
        });

    else

        return await interaction.reply({ content: 'You do not have the permission for this command.', ephemeral: true })

});
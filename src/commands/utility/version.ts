import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { command } from '../../utils'
import keys from '../../keys'

const meta = new SlashCommandBuilder()
    .setName('version')
    .setDescription('Development version of the bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(true)

export default command(meta, async({ interaction, client }) => {

    const linkButton = new ButtonBuilder()
        .setLabel('Paper Website')
        .setURL('https://yatsuu.fr/')
        .setStyle(ButtonStyle.Link);

    const topggButton = new ButtonBuilder()
        .setLabel('Top.gg')
        .setURL('https://top.gg/bot/1219725345616564254')
        .setStyle(ButtonStyle.Link)

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(linkButton, topggButton)

    const version = new EmbedBuilder()
        .setTitle("Version")
        .setDescription("Development version of the bot.")
        .setColor('DarkAqua')
        .setThumbnail(client.user?.displayAvatarURL() || null)
        .addFields([
            { name: `Version ${keys.version}`, value: '→ End of the first phase of development of the bot.\n→ Addition of details about the servers in the console errors.\n→ Addition of the command to restart the bot.\n→ Switch to permanent hosting of the bot.\n→ Level system added.\n→ A few optimisations have been made.' },
            { name: 'Note', value: `If you have any comments about the bot, please contact <@${keys.ownerId}>.` }
        ])
        .setTimestamp()
        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

    return await interaction.reply({
        ephemeral: true,
        embeds: [version],
        components: [row]
    });

});

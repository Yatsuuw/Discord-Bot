import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder()
    .setName('message')
    .setDescription('Send a message by bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('message')
            .setDescription('Message to send')
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true)
    )

export default command(meta, ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error(`Error when retrieving the "logChannelId" parameter from the database for the ${guildName} server (${guildId}).\nError :\n`, err);
            return;
        }

        const message = interaction.options.getString('message')
        const logChannelId = row?.logChannelId;

        await interaction.channel?.send({
            content: message || undefined
        });

        await interaction.reply({
            ephemeral: true,
            content: 'Message sent ✅'
        });

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    const logMessage = new EmbedBuilder()
                        .setTitle('Message command log')
                        .setColor("White")
                        .setDescription(`${interaction.user.tag} used the \`/message\` command in the <#${interaction.channel?.id}> channel.`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Content', value: `${message}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                    return logChannel.send({ embeds: [logMessage] });
                } else {
                    console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving the log room for server ${guildName} (${guildId}). Error : `, error);
            }
        } else {
            console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`)
        }
    });
});

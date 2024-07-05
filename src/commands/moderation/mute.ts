import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import ms from 'ms'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('mute')
    .setDescription('Remove a user\'s voice')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('User who will lose the right to speak')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Reasons for losing the right to speak')
            .setRequired(false)
    )
    .addStringOption((option) =>
        option
            .setName('duration')
            .setDescription('Duration of loss of right to speak (enter time units!)')
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error(`Error when retrieving the "logChannelId" parameter from the database for the ${guildName} server (${guildId}).\nError :\n`, err);
            return;
        }

        const target = (interaction.options.getMember('target') || '') as GuildMember;
        const duration = interaction.options.getString('duration') || '1s';
        const convertedTime = ms(duration);
        const reason = interaction.options.getString('reason') || 'No reason';
        const logChannelId = row?.logChannelId;

        if (!target.moderatable) return await interaction.reply({ content: 'This user cannot be muted!', ephemeral: true });
        if (!convertedTime) return await interaction.reply({ content: 'Specifies a valid duration!', ephemeral: true });

        const muteServer = new EmbedBuilder()
            .setTitle("Speech")
            .setDescription("Unfortunately, a new user has just lost his right to speak!")
            .setColor("Red")
            .addFields([
                { name: `User`, value: `${target}` },
                { name: `Duration`, value: `${duration} `},
                { name: `Reason`, value: `${reason}` }
            ])
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
            .setTimestamp()

        const muteDm = new EmbedBuilder()
            .setTitle("Speech")
            .setDescription(`You have just lost your voice on the \`${target.guild.name}\` server.`)
            .setColor("Red")
            .addFields([
                { name: 'Reason :', value: `${reason}` },
                { name: 'Duration', value: `${duration}` }
            ])
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        await target.timeout(convertedTime, reason);
                        await target.send({ embeds: [muteDm] });
                        await interaction.reply({ embeds: [muteServer] });
                    } catch (error) {
                        await interaction.reply({ content: `An error has occurred during mute. Error :\n${error}`, ephemeral: true });
                    }
        
                    const logMute = new EmbedBuilder()
                        .setTitle('Mute command log')
                        .setColor('Purple')
                        .setDescription(`${interaction.user.tag} used the command \`/mute\` on the user ${target.user.tag}`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Target user', value: `<@${target.user.id}>` },
                            { name: 'Reason', value: `${reason}` },
                            { name: 'Duration', value: `${duration}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
        
                    return logChannel.send({ embeds: [logMute] })
                } else {
                    console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving the log room for server ${guildName} (${guildId}). Error : `, error);
            }
        } else {
            console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`);
        }
    });
});

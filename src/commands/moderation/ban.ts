import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string;
}

const meta = new SlashCommandBuilder ()
    .setName('ban')
    .setDescription('Ban a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('User to ban')
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('reason')
            .setDescription('Reason for ban')
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

        const target = interaction.options.getMember('target') as GuildMember;
        const reason = interaction.options.getString('reason') || 'No reason.';
        const logChannelId = row?.logChannelId;

        if (!target.bannable) return await interaction.reply({ content: 'This member cannot be banned.', ephemeral: true });

        const banServer = new EmbedBuilder()
            .setTitle("Ban")
            .setColor("Red")
            .setDescription("Unfortunately, a new user has just been banned!")
            .addFields([
                { name: `User`, value: `${target.user.username}` },
                { name: `Reason`, value: `${reason}` }
            ])
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
            .setTimestamp()

        const banDm = new EmbedBuilder()
            .setTitle("Ban")
            .setDescription(`You have just been banned from the server ${target.guild.name}\`..`)
            .setColor("Red")
            .addFields([
                { name: 'Reason :', value: `${reason}` },
                { name: 'Staff', value: `${interaction.user.username}` }
            ])
            .setImage(target.user.displayAvatarURL())
            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        await target.send({ embeds: [banDm] });
                        await target.ban({ reason });
                        await interaction.reply({ embeds: [banServer] });
                    } catch (error) {
                        await interaction.reply({ content: `An error has occurred while banning the user !\n${error}`, ephemeral: true });
                    }

                    const logBan = new EmbedBuilder()
                        .setTitle('Ban order log')
                        .setColor('Red')
                        .setDescription(`${interaction.user.tag} used the command \`/ban\` on the user ${target.user.tag}`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Target user', value: `<@${target.user.id}>` },
                            { name: 'Reason', value: `${reason}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                    return logChannel.send({ embeds: [logBan] })
                } else {
                    console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving log channel for server ${guildName} (${guildId}) : `, error);
            }
        } else {
            console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`);
        }
    });
});

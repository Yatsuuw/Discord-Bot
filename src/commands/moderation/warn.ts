import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { command } from '../../utils'
import { db } from '../../utils/database'
import { format } from 'date-fns';

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Giving a warning to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('User to warn')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Reason for warning')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;
    const target = interaction.options.getMember('user') as GuildMember;
    const moderatorId = interaction.user.id;
    const moderatorName = interaction.user.tag;
    const reason = interaction.options.getString('reason')!;

    const currentDate = format(new Date(), 'yyyy-MM-dd | HH:mm:ss');

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error(`Error when retrieving the "logChannelId" parameter from the database for the ${guildName} server (${guildId}).\nError :\n`, err);
            return;
        }

        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        if (target.user.id != interaction.user.id) {
                            db.run(`INSERT INTO servers_users_warns (guildId, guildName, user, username, moderateur, moderateurName, date, raison) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [guildId, guildName, target.id, target.user.tag, moderatorId, moderatorName, currentDate, reason], (err) => {
                                if (err) {
                                    console.error(`Error saving warning in database for server ${guildName} (${guildId}) :`, err);
                                    return interaction.reply('An error occurred while recording the warning.');
                                }
                        
                                const warn = new EmbedBuilder()
                                    .setTitle("Warning")
                                    .setColor('Red')
                                    .setDescription(`${target.user.tag} has just received a warning.`)
                                    .setThumbnail(target.displayAvatarURL())
                                    .addFields([
                                        { name: 'Staff', value: `<@${interaction.user.id}>` },
                                        { name: 'Warned user', value: `<@${target.user.id}>` },
                                        { name: 'Reason', value: `${reason}` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
                        
                                const warnDm = new EmbedBuilder()
                                    .setTitle("Warning")
                                    .setColor('Red')
                                    .setDescription(`You have just received a warning.`)
                                    .addFields([
                                        { name: 'Server concerned', value: `${guildName}` },
                                        { name: 'Staff', value: `<@${interaction.user.id}>` },
                                        { name: 'Reason', value: `${reason}` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
                        
                                interaction.reply({ embeds: [warn] });
                                target.send({ embeds: [warnDm] })
                            });
                        } else {
                            await interaction.reply({ content: 'You can\'t warn yourself.', ephemeral: true });
                        }
                    } catch (error) {
                        await interaction.reply({ content: `An error occurred when registering the ${target.user.tag} warning. Error :\n${error}` });
                    }

                    const logWarn = new EmbedBuilder()
                        .setTitle('Warn command log')
                        .setColor('DarkRed')
                        .setDescription(`${interaction.user.tag} used the \`/warn\` command on the user ${target.user.tag}.`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Target user', value: `<@${target.user.id}>` },
                            { name: 'Reason', value: `${reason}` },
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                    if (target.user.id != interaction.user.id) {
                        logWarn.addFields([{ name: 'Reason', value: `${reason}` }])
                    } else {
                        logWarn.addFields([{ name: 'Failure', value: `<@${interaction.user.id}> attempted to apply a warning to itself.` }])
                    }

                    return await logChannel.send({ embeds: [logWarn] })
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

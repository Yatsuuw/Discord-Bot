import { EmbedBuilder, ThreadChannel, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('thread')
    .setDescription('Allows you to manage discussion threads')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addStringOption(option =>
        option
            .setName("event")
            .setDescription("Action to be given to the bot")
            .setRequired(true)
            .addChoices(
                { name: 'Join', value: 'join' },
                { name: 'Quit', value: 'leave' },
                { name: 'Archive', value: 'archive' },
                { name: 'Unarchive', value: 'unarchive' },
                { name: 'Delete', value: 'delete' }
            )
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;

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
                        const key = interaction.options.getString('event');
                        const thread = interaction.channel;

                        if (!thread?.isThread()) return interaction.reply({ content: 'Impossible to enter this command. You are not in a thread.', ephemeral: true });
                        await thread.join()

                        if (key === "join") {
                            try {
                                const joinThread = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('Green')
                                    .addFields([
                                        { name: 'Action', value: `I've just joined the \`${thread.name}\` thread! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                const threadLog = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('White')
                                    .addFields([
                                        { name: 'Action', value: `I've just joined the \`${thread.name}\` thread! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                if (thread.joinable) await thread.join();
                                await interaction.reply({ embeds: [joinThread] });
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                return await interaction.reply({ content: `I was unable to join the thread. Error :\n${error}`, ephemeral: true });
                            };
                        };

                        if (key === "leave") {
                            try {
                                const leaveThread = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('Red')
                                    .addFields([
                                        { name: 'Action', value: `I've just left the thread ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                const threadLog = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('DarkRed')
                                    .addFields([
                                        { name: 'Action', value: `I've just left the thread ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                await interaction.reply({ embeds: [leaveThread] });
                                await thread.leave();
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                interaction.reply({ content: `JI was unable to leave the thread. Error :\n${error}`, ephemeral: true });
                            };
                        };

                        if (key === "archive") {
                            try {
                                const archiveThread = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('Grey')
                                    .addFields([
                                        { name: 'Action', value: `I've just archived the thread $${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                const threadLog = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('DarkAqua')
                                    .addFields([
                                        { name: 'Action', value: `I've just archived the thread $${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                await interaction.reply({ embeds: [archiveThread] });
                                await thread.setArchived(true);
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                interaction.reply({ content: `I was unable to archive the thread. Error :\n${error}`, ephemeral: true });
                            };
                        };

                        if (key === "unarchive") {
                            try {
                                const unarchiveThread = new EmbedBuilder()
                                    .setTitle("Thread")
                                    .setColor('DarkGrey')
                                    .addFields([
                                        { name: 'Action', value: `I've just unarchived the \`${thread.name}\` thread! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                const threadLog = new EmbedBuilder()
                                    .setTitle("Thread")
                                    .setColor('Aqua')
                                    .addFields([
                                        { name: 'Action', value: `I've just unarchived the \`${thread.name}\` thread! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                await thread.setArchived(false);
                                await interaction.reply({ embeds: [unarchiveThread] });
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                interaction.reply({ content: `I couldn't unarchive the thread. Error :\n${error}`, ephemeral: true });
                            };
                        };

                        if (key === "delete") {
                            try {
                                const deleteThread = new EmbedBuilder()
                                    .setTitle("Thread")
                                    .setColor('DarkGrey')
                                    .addFields([
                                        { name: 'Action', value: `I've just deleted the thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                const threadLog = new EmbedBuilder()
                                    .setTitle("Thread")
                                    .setColor('LightGrey')
                                    .addFields([
                                        { name: 'Action', value: `I've just deleted the thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                await interaction.reply({ embeds: [deleteThread] });
                                await thread.delete();
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                interaction.reply({ content: `I was unable to delete the thread. Error :\n${error}`, ephemeral: true });
                            };
                        };
                    } catch (error) {
                        await interaction.reply({ content: `An error has occurred while executing the command.\n${error}`, ephemeral: true });
                    }
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
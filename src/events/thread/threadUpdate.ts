import { EmbedBuilder, TextChannel, ThreadChannel } from 'discord.js';
import { event } from '../../utils';
import { db } from '../../utils/database';

interface ServerSettings {
    logChannelId?: string;
}

function formatAutoArchiveDuration(minutes: number | null): string {
    if (minutes === null) {
        return 'never';
    }

    const hours = Math.floor(minutes / 60);

    if (hours === 1) {
        return '1 hour';
    } else if (hours === 24) {
        return '1 day';
    } else if (hours === 24 * 3) {
        return '3 days';
    } else if (hours === 24 * 7) {
        return '1 week';
    } else {
        return 'undefined';
    }
}

export default event('threadUpdate', async (client, oldThread: ThreadChannel<boolean>, newThread: ThreadChannel<boolean>) => {
    const guildId = newThread.guild?.id;
    const guildName = newThread.guild?.name;
    const ownerId = newThread.ownerId;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error(`Error retrieving "logChannelId" parameter for server ${guildName} (${guildId}) :`, err);
            return;
        }

        if (oldThread.archived && !newThread.archived) {
            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = newThread.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        const threadUpdateLog = new EmbedBuilder()
                            .setTitle('Thread')
                            .setColor('DarkVividPink')
                            .addFields([
                                {
                                    name: 'Action',
                                    value: `The thread \`${newThread.name}\` was unarchived by <@${ownerId}> (\`${ownerId}\`).\nSo I joined it again.`
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' });

                        if (newThread.isTextBased()) {
                            newThread.join().then(() => {
                                logChannel.send({ embeds: [threadUpdateLog] });
                            }).catch((error) => {
                                console.error(`Error when trying to join the thread: ${newThread.name} for the server ${guildName} (${guildId}). Error: ${error}`);
                            });
                        } else {
                            logChannel.send(`The ${newThread.name} thread is not textual, so I can't join it.`);
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
        }

        if (oldThread.name !== newThread.name) {
            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = newThread.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        const threadUpdateLog = new EmbedBuilder()
                            .setTitle('Thread')
                            .setColor('DarkVividPink')
                            .addFields([
                                {
                                    name: 'Action',
                                    value: `The thread \`${oldThread.name}\` has been renamed to \`${newThread.name}\` by <@${ownerId}> (\`${ownerId}\`).`
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' });

                        logChannel.send({ embeds: [threadUpdateLog] });
                    } else {
                        console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                    }
                } catch (error) {
                    console.error(`Error retrieving the log room for server ${guildName} (${guildId}). Error : `, error);
                }
            } else {
                console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`);
            }
        }

        if (oldThread.rateLimitPerUser !== newThread.rateLimitPerUser) {
            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = newThread.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        const threadUpdateLog = new EmbedBuilder()
                            .setTitle('Thread')
                            .setColor('DarkVividPink')
                            .addFields([
                                {
                                    name: 'Action',
                                    value: `The delay between messages in the \`${newThread.name}\` thread has been changed from \`${oldThread.rateLimitPerUser} seconds\` to \`${newThread.rateLimitPerUser} seconds\`.`
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' });

                        logChannel.send({ embeds: [threadUpdateLog] });
                    } else {
                        console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                    }
                } catch (error) {
                    console.error(`Error retrieving the log room for server ${guildName} (${guildId}). Error : `, error);
                }
            } else {
                console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`);
            }
        }

        if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
            const logChannelId = row?.logChannelId;

            const oldDuration = formatAutoArchiveDuration(oldThread.autoArchiveDuration);
            const newDuration = formatAutoArchiveDuration(newThread.autoArchiveDuration);

            if (logChannelId) {
                try {
                    const logChannel = newThread.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {

                        const threadUpdateLog = new EmbedBuilder()
                            .setTitle('Thread')
                            .setColor('DarkVividPink')
                            .addFields([
                                {
                                    name: 'Action',
                                    value: `The period of inactivity required to automatically hide the thread \`${newThread.name}\` has been changed from \`${oldDuration}\` to \`${newDuration}\`.`
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' });

                        logChannel.send({ embeds: [threadUpdateLog] });
                    } else {
                        console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                    }
                } catch (error) {
                    console.error(`Error retrieving the log room for server ${guildName} (${guildId}). Error : `, error);
                }
            } else {
                console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`);
            }
        }
    })
});

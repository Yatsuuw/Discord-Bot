import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('channel')
    .setDescription('Administering channel settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addChannelOption((option) => 
        option
            .setName('channel')
            .setDescription('Channel where you want to change the status.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("status")
            .setDescription("Choose the status change you want.")
            .setRequired(true)
            .addChoices({ name: 'Lock', value: 'Lock' }, { name: 'Unlock', value: 'Unlock' }, { name: 'Slowmode', value: 'Slowmode' })
    )
    .addNumberOption((option) =>
        option
            .setName("cooldown")
            .setDescription("Slow mode time in seconds.")
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

        const channel_modify = interaction.options.getChannel("channel") as TextChannel;
        const key = interaction.options.getString('status');
        const cooldown = interaction.options.getNumber('cooldown') || 0;
        const logChannelId = row?.logChannelId;

        const lockMessage = new EmbedBuilder()
            .setTitle("Channel status")
            .setDescription("The status of the channel has just been changed")
            .setColor("Red")
            .addFields([
                { name: `Condition`, value: `Locked` },
                { name: `Channel`, value: `${channel_modify}` },
            ])
            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
            .setTimestamp()


        const unlockMessage = new EmbedBuilder()
            .setTitle("Channel status")
            .setDescription("The status of the channel has just been changed")
            .setColor("Green")
            .addFields([
                { name: `Condition`, value: `Unlocked` },
                { name: `Channel`, value: `${channel_modify}` },
            ])
            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
            .setTimestamp()

        const cooldownMessageOn = new EmbedBuilder()
            .setTitle("Slow mode")
            .setDescription("Slow mode has just been activated! ✅")
            .setColor("Red")
            .addFields([
                { name: 'Slow mode time', value: `${cooldown} secondes` },
                { name: `Channel`, value: `${channel_modify}` },
            ])
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
            .setTimestamp()

        const cooldownMessageOff = new EmbedBuilder()
            .setTitle("Slow mode")
            .setDescription("Slow mode has just been deactivated! ❌")
            .setColor("Green")
            .addFields([
                { name: 'Slow mode time', value: `${cooldown} secondes` },
                { name: `Channel`, value: `${channel_modify}` },
            ])
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    if (key == 'Lock') {
                        try {
                            await channel_modify.permissionOverwrites.edit(channel_modify.guild.id, { SendMessages: false });
                            await interaction.reply({
                                ephemeral: false,
                                embeds: [lockMessage]
                            })
                            const logLock = new EmbedBuilder()
                                .setTitle('Channel-Lock command log')
                                .setColor('White')
                                .setDescription(`${interaction.user.tag} used the command \`/channel <channel> <lock>\` for the channel ${channel_modify}`)
                                .addFields([
                                    { name: 'User', value: `<@${interaction.user.id}>` }
                                ])
                                .setTimestamp()
                                .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                            return logChannel.send({ embeds: [logLock] })
                        } catch (error) {
                            await interaction.reply({ content: `An error has occurred when changing the state of the channel. Error :\n${error}`, ephemeral: true });
                        }
                    }
                    if (key == 'Unlock') {
                        try {
                            await channel_modify.permissionOverwrites.edit(channel_modify.guild.id, { SendMessages: true });
                            await interaction.reply({
                                ephemeral: false,
                                embeds: [unlockMessage]
                            })
                            const logUnlock = new EmbedBuilder()
                                .setTitle('Log of the Channel-Unlock command')
                                .setColor('White')
                                .setDescription(`${interaction.user.tag} used the command \`/channel <channel> <unlock>\` for the channel ${channel_modify}`)
                                .addFields([
                                    { name: 'User', value: `<@${interaction.user.id}>` }
                                ])
                                .setTimestamp()
                                .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                            return logChannel.send({ embeds: [logUnlock] })
                        } catch (error) {
                            await interaction.reply({ content: `An error is generated when the channel changes state. Error :\n${error}`, ephemeral: true });
                        }
                    }
                    if (key == 'Slowmode') {
                        try {
                            if (cooldown == 0) {
                                await channel_modify.setRateLimitPerUser(0)
                                await interaction.reply({
                                    ephemeral: false,
                                    embeds: [cooldownMessageOff]
                                })
                                const logSlowmode = new EmbedBuilder()
                                    .setTitle('Channel-Slowmode command log')
                                    .setColor('White')
                                    .setDescription(`${interaction.user.tag} used the command \`/channel <channel> <slowmode>\` for the channel ${channel_modify}`)
                                    .addFields([
                                        { name: 'User', value: `<@${interaction.user.id}>` },
                                        { name: 'Slow mode', value: `${cooldown} seconds` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                return logChannel.send({ embeds: [logSlowmode] })
                            } if (cooldown > 0) {
                                await channel_modify.setRateLimitPerUser(cooldown)
                                await interaction.reply({
                                    ephemeral: false,
                                    embeds: [cooldownMessageOn]
                                })
                                const logSlowmode = new EmbedBuilder()
                                    .setTitle('Channel-Slowmode command log')
                                    .setColor('White')
                                    .setDescription(`${interaction.user.tag} used the command \`/channel <channel> <slowmode>\` for the channel ${channel_modify}`)
                                    .addFields([
                                        { name: 'User', value: `<@${interaction.user.id}>` },
                                        { name: 'Slow mode', value: `${cooldown} seconds` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                                return logChannel.send({ embeds: [logSlowmode] })
                            }
                        } catch (error) {
                            await interaction.reply({ content: `An error occurred when applying the cooldown. Error :\n${error}`, ephemeral: true });
                        }
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

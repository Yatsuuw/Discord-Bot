import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import { command } from '../../utils';
import { db } from '../../utils';

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('manage-level')
    .setDescription('Manage user level or experience')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('User to see the level')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName("choice")
            .setDescription("Value to be modified")
            .setRequired(true)
            .addChoices(
                { name: 'Level', value: 'lvl' },
                { name: 'Experience', value: 'xp' },
            )
    )
    .addIntegerOption(option =>
        option
            .setName("value")
            .setDescription("Value for level or experience user's")
            .setRequired(true)
            .setMinValue(1)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = String(interaction.guild?.id);
    const guildName = interaction.guild?.name;
    const target = interaction.options.getMember('target') as GuildMember;
    const integer = interaction.options.getInteger('value');
    const key = interaction.options.getString('choice')

    const manageLevelsLog = new EmbedBuilder()
        .setTitle('Manage-levels command log')
        .setColor('DarkRed')
        .setDescription(`${interaction.user.tag} used the command \`/manage-level\` on the user ${target.user.tag} with the key ${key}.`)
        .setTimestamp()
        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

    if (interaction.guild) {

        db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error(`Error when retrieving the "logChannelId" parameter from the database for the ${guildName} server (${guildId}).\nError :\n`, err);
                return
            }

            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        db.get(`SELECT level, experience FROM levels WHERE guildId = ? AND userId = ?`, [guildId, target.id], (err) => {
                            if (err) {
                                console.error('Error retrieving user level and experience :', err);
                                return;
                            }
            
                            if (key == 'lvl')
                                db.run('SELECT level FROM levels WHERE guildId = ? AND userId = ?', [guildId, target.id], async (err) => {
                                    if (err) {
                                        console.error('Error to find user level :', err);
                                        return;
                                    }
                                    try {
                                        db.run('UPDATE levels SET level = ? WHERE guildId = ? AND userId = ?', [integer, guildId, target.id], async (err) => {
                                            if (err) {
                                                console.error('Error to modify user\'s level :', err);
                                                return;
                                            }

                                            manageLevelsLog.addFields([ { name: 'Value modificated', value: 'Level' }, { name: 'New value', value: `${integer} (level(s))` } ])
            
                                            await interaction.reply({ content: `User's level has been modified to ${integer}`, ephemeral: true });
                                            return await logChannel.send({ embeds: [manageLevelsLog] });
                                        })
                                    } catch (error) {
                                        console.error(`An error occurred when modifying the user's level from ${interaction.guild?.name} server. Error :\n(${guildId}).\nError :\n`, error);
                                        interaction.reply({ content: `An error occurred when modifying the user's level.`, ephemeral: true });
                                    }
                                })
                            if (key == 'xp')
                                db.run('SELECT experience FROM levels WHERE guildId = ? AND userId = ?', [guildId, target.id], async (err) => {
                                    if (err) {
                                        console.error('Error to find user experience :', err);
                                        return;
                                    }
                                    try {
                                        db.run('UPDATE levels SET experience = ? WHERE guildId = ? AND userId = ?', [integer, guildId, target.id], async (err) => {
                                            if (err) {
                                                console.error('Error to modify user\'s experience :', err);
                                                return;
                                            }

                                            manageLevelsLog.addFields([ { name: 'Value modificated', value: 'Experience' }, { name: 'New value', value: `${integer} (experience point(s))` } ])
            
                                            await interaction.reply({ content: `User's experience has been modified to ${integer}`, ephemeral: true });
                                            return await logChannel.send({ embeds: [manageLevelsLog] });
                                        })
                                    } catch (error) {
                                        console.error(`An error occurred when modifying the user's experience from ${interaction.guild?.name} server. Error :\n(${guildId}).\nError :\n`, error);
                                        interaction.reply({ content: `An error occurred when modifying the user's experience.`, ephemeral: true });
                                    }
                                })
                        });
                    } catch (error) {
                        console.error(`Error retrieving log channel for server ${guildName} (${guildId}) : `, error);
                    }
                } else {
                    console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`);
                }
            }

            
        });
    } else { return; }
});

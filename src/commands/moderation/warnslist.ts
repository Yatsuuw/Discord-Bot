import { GuildMember, PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, TextChannel } from "discord.js";
import { command } from '../../utils'
import { db } from '../../utils/database'

interface UserSettings {
    length: number;
    warnId?: number;
    guildName?: string,
    username?: string,
    user?: string,
    moderateur?: string,
    moderateurName?: string,
    date?: string,
    raison?: string,
}

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder()
    .setName('warnslist')
    .setDescription('Displays a user\'s list of warnings')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('The user who wants to see the warnings')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const target = interaction.options.getMember('target') as GuildMember;
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
                        db.all('SELECT * FROM servers_users_warns WHERE guildId = ? AND user = ?', [guildId, target.user.id], async (err, rows: UserSettings[]) => {
                            if (err) {
                                console.error(`Error retrieving parameters from the database for the server ${guildName} (${guildId}).\nError :\n`, err);
                                return;
                            }
                        
                            if (rows.length === 0) {
                                return interaction.reply("No warnings found for this user.");
                            }
                        
                            const warnsEmbed = new EmbedBuilder()
                                .setTitle(`List of warns`)
                                .setDescription(`This list of warns belongs to the user \`${target.user.tag}\`.`)
                                .setThumbnail(target.displayAvatarURL())
                                .setColor("DarkBlue");
                        
                            rows.forEach((row) => {
                                warnsEmbed.addFields([{name: `Warn #${row.warnId}`, value:`**Staff :** ${row.moderateurName} (${row.moderateur})\n**Date :** ${row.date}\n**Reason :** ${row.raison}`}]);
                            });
                        
                            warnsEmbed.setTimestamp()
                                .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' });
                        
                            interaction.reply({ embeds: [warnsEmbed] });
                        });
                    } catch (error) {
                        await interaction.reply({ content: `An error occurred when sending the message containing the warnings for ${target.user.tag}. Error :\n${error}` });
                    }

                    const logWarnslist = new EmbedBuilder()
                        .setTitle('Warnslist command log')
                        .setColor('DarkGreen')
                        .setDescription(`${interaction.user.tag} used the \`/warnslist\` command on the user ${target.user.tag}.`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Target user', value: `<@${target.user.id}>` },
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                    return await logChannel.send({ embeds: [logWarnslist] })
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

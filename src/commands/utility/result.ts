import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('result')
    .setDescription('Sends the result of a sports or e-sport match.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('team-1')
            .setDescription('Name of the first team.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('composition-1')
            .setDescription('Composition of the first team.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('team-2')
            .setDescription('Name of the second team.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('composition-2')
            .setDescription('Composition of the second team.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('score')
            .setDescription('Final result of the match. The score is Team1 - Team2.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('embed-color')
            .setDescription('If victory is yours, take victory! If defeat is yours, take defeat :(.')
            .setRequired(true)
            .addChoices({ name: 'Victory', value: 'Victoire' }, { name: 'Defeat', value: 'Défaite' })
    )
    .addStringOption((option) => 
        option
            .setName('comment')
            .setDescription('Add a comment to the meeting (100 characters maximum)')
            .setMinLength(1)
            .setMaxLength(100)
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

        const team1 = interaction.options.getString('team-1')
        const team2 = interaction.options.getString('team-2')
        const composition1 = interaction.options.getString('team-1')
        const composition2 = interaction.options.getString('team-2')
        const score = interaction.options.getString('score')
        const commentaire = interaction.options.getString('comment') || 'No comment';
        const key = interaction.options.getString('embed-color')
        const logChannelId = row?.logChannelId;

        const mdt = new EmbedBuilder()
            .setTitle("Résultat de la rencontre")
            .addFields([
                { name: 'Team 1 :', value: `${team1}`, inline: true },
                { name: 'Team 2 :', value: `${team2}`, inline: true },
                { name: 'Composition of the first team :', value: `${composition1}`, inline: true },
                { name: 'Composition of the second team : ', value: `${composition2}`, inline: true },
                { name: 'Score of the match :', value: `${score}`, inline: true },
                { name: 'Comment :', value: `${commentaire}`, inline: true },
            ])
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        if (key == "Victoire")
                            mdt.setColor("Green")
                        if (key == "Défaite")
                            mdt.setColor("Red")
            
                        interaction.deferReply();
                        setTimeout(() => interaction.deleteReply());
                        await interaction.channel?.send({
                            embeds: [mdt]
                        })
                    } catch (error) {
                        await interaction.reply({ content: `An error occurred when sending the result of the match. Error :\n${error}` });
                    }

                    const logResult = new EmbedBuilder()
                        .setTitle('Result command log')
                        .setColor('Navy')
                        .setDescription(`${interaction.user.tag} used the \`/result\` command in the <#${interaction.channel?.id}> channel.`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Result', value: `${score}` },
                            { name: 'Teams', value: `${team1} - ${team2}` },
                            { name: 'Comment', value: `${commentaire}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord" })

                    return logChannel.send({ embeds: [logResult] })
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

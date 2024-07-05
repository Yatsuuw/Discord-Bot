import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, CommandInteraction } from 'discord.js';
import { command } from '../../utils/command';
import { db } from '../../utils/database';

interface UserLevel {
    userId: string;
    level: number;
    experience: number;
}

const meta = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the leaderboard of users with the highest levels.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false);

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    if (!guildId) {
        return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    }

    db.all('SELECT userId, level, experience FROM levels WHERE guildId = ? ORDER BY level DESC, experience DESC', [guildId], async (err, rows: UserLevel[]) => {
        if (err) {
            console.error('Error fetching leaderboard data:', err);
            return interaction.reply({ content: 'An error occurred while fetching the leaderboard data.', ephemeral: true });
        }

        if (!rows || rows.length === 0) {
            return interaction.reply({ content: 'No data found for the leaderboard.', ephemeral: true });
        }

        const usersPerPage = 10;
        const totalPages = Math.ceil(rows.length / usersPerPage);
        let currentPage = 1;

        const generateLeaderboardEmbed = (page: number) => {
            const start = (page - 1) * usersPerPage;
            const end = start + usersPerPage;
            const currentPageData = rows.slice(start, end);

            const leaderboardEmbed = new EmbedBuilder()
                .setTitle(`Leaderboard - Page ${page}/${totalPages}`)
                .setColor('Blue')
                .setTimestamp()
                .setFooter({ text: `Page ${page} of ${totalPages}, By yatsuuw @ Discord` });

            currentPageData.forEach((row, index) => {
                leaderboardEmbed.addFields({
                    name: `#${start + index + 1} ${interaction.guild?.members.cache.get(row.userId)?.user.tag || 'Unknown User'}`,
                    value: `Level: ${row.level}, Experience: ${row.experience}`,
                });
            });

            return leaderboardEmbed;
        };

        const leaderboardEmbed = generateLeaderboardEmbed(currentPage);

        const message = await interaction.reply({ embeds: [leaderboardEmbed], fetchReply: true, ephemeral: true });

        if (totalPages > 1) {
            await message.react('⬅️');
            await message.react('➡️');

            const filter = (reaction: any, user: any) => {
                return ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot;
            };

            const collector = message.createReactionCollector({ filter, time: 60000 });

            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === '⬅️') {
                    if (currentPage > 1) {
                        currentPage--;
                        const newEmbed = generateLeaderboardEmbed(currentPage);
                        message.edit({ embeds: [newEmbed] });
                    }
                } else if (reaction.emoji.name === '➡️') {
                    if (currentPage < totalPages) {
                        currentPage++;
                        const newEmbed = generateLeaderboardEmbed(currentPage);
                        message.edit({ embeds: [newEmbed] });
                    }
                }
                reaction.users.remove(user.id);
            });

            collector.on('end', () => {
                message.reactions.removeAll();
            });
        }
    });
});

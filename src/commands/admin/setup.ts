import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

const meta = new SlashCommandBuilder ()
    .setName('setup')
    .setDescription('Initialise the bot in the database.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;

    if (!guildId) {
        return interaction.reply({
            ephemeral: true,
            content: "This command must be used on a server."
        });
    }

    const existingServer = await new Promise<boolean>((resolve) => {
        db.get('SELECT 1 FROM servers_settings WHERE guildId = ?', [guildId], (err, row) => {
            resolve(!!row);
            if (err) {
                console.error('Error when creating the server in the database.', err);
                return;
            }
        });
    });

    if (existingServer) {
        const existingServerEmbed = new EmbedBuilder()
            .setTitle("Server initialisation")
            .setDescription("The server is already initialised in the database.\n**→ /bdd** for configure your server database.\n**→ /help** for more informations.\n**→ /version** for the current version of the bot.")
            .setColor("Yellow")
            .setTimestamp()
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

        return interaction.reply({
            ephemeral: true,
            embeds: [existingServerEmbed]
        });
    }

    db.run(`
        INSERT OR IGNORE INTO servers_settings (guildId, logChannelId, welcomeChannelId, leaveChannelId, welcomeGifUrl, leaveGifUrl, levelChannelID, levelSystem)
        VALUES (?, NULL, NULL, NULL, 'https://c.tenor.com/A8bNTOeNznQAAAAC/tenor.gif', 'https://c.tenor.com/A8bNTOeNznQAAAAC/tenor.gif', NULL, 0)
    `, [guildId], (err) => {
        if (err) {
            console.error(`Server initialization error in the database for server ${guildName} (${guildId}). Error`, err)
            return interaction.reply({
                ephemeral: true,
                content: "An error has occurred during database initialisation."
            });
        }

        const successEmbed = new EmbedBuilder()
            .setTitle("Server initialisation")
            .setDescription("The server has been successfully initialised in the database.\n**→ /bdd** for configure your server database.\n**→ /help** for more informations.\n**→ /version** for the current version of the bot.")
            .setColor("Green")
            .setTimestamp()
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

        return interaction.reply({
            ephemeral: false,
            embeds: [successEmbed]
        });
    });
});

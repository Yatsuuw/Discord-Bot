import { event, db } from '../utils';
import { Message } from 'discord.js';
import { addExperience } from '../utils/UserRankDB';

interface ServerSettings {
    levelSystem?: string,
}

export default event('messageCreate', async (client, message: Message) => {
    if (!message.author.bot && message.guild) {
        const guildId = message.guild.id;
        const userId = message.author.id;

        db.get('SELECT * FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error('Error retrieving the all parameters from the database.', err);
            }

            const levelSystemBool = row?.levelSystem;

            if (levelSystemBool == "1")
                addExperience(guildId, userId);
            else
                return;
        })
    }
});
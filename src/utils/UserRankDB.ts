import { db } from "./database";
import { Xp } from "./Xp";
import { client } from '../client'
import { TextChannel } from "discord.js";

interface Levels {
    guildId?: string,
    userId?: string,
    level?: number,
    experience?: number,
}

interface ServerSettings {
    logChannelId?: string,
}

export function addExperience(guildId: string, userId: string) {
    const xpToAdd = 0; // Fixed amount of experience : 0 <=> 10

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error(`Error when retrieving the "logChannelId" parameter from the database for the server ${guildId}.\nError :\n`, err);
            return;
        }
        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            const logChannel = client.channels.cache.get(`${logChannelId}`) as TextChannel;

            if (logChannel) {
                try {
                    db.get('SELECT * FROM levels WHERE guildId = ? AND userId = ?', [guildId, userId], (err, row: Levels) => {
                        if (err) {
                            console.error('Error recovering user data :', err);
                            return;
                        }
                
                        if (!row) {
                            db.run(`INSERT INTO levels (guildId, userId, level, experience) VALUES (?, ?, 1, ?)`, [guildId, userId, xpToAdd], (err) => {
                                if (err) {
                                    console.error('Error adding user:', err);
                                    return;
                                }
                            });
                        } else {
                            const level = Math.floor(row.level || 1);
                            const experience = Math.floor(row.experience || 0);
                            const { level: newLevel, xp: remainingXp } = Xp(level, experience + xpToAdd);
                            db.run('UPDATE levels SET level = ?, experience = ? WHERE guildId = ? AND userId = ?', [newLevel, remainingXp, String(guildId), userId], (err) => {
                                if (err) {
                                    console.error('Error updating user experience:', err);
                                    return;
                                }
                
                                if (newLevel > level) {
                                    logChannel.send({ content: `Congratulations to <@${userId}> for reaching the level ${newLevel}! 🎉` });
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.error(`Error retrieving log channel for server ${guildId} : `, error);
                }
            } else {
                console.error(`The log channel ID is empty in the database for the server ${guildId}.`);
            }
        }
    });
}

export function getUserLevel(guildId: string, userId: string) {
    db.get(`SELECT level, experience FROM levels WHERE guildId = ? AND userId = ?`, [guildId, userId], (err, row: Levels) => {
        if (err) {
            console.error('Error retrieving user level :', err);
            return;
        }

        if (!row) {
        } else {
            const level = Math.floor(row?.level || 1);
            const experience = Math.floor(row?.experience || 0);
            const { xp: remainingXp } = Xp(level, experience);
            console.log(`User level: ${level}\nRemaining experience until next level: ${remainingXp}`);
        }
    });
}

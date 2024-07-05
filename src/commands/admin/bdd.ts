import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
    welcomeChannelID?: string,
    leaveChannelID?: string,
    welcomeGifUrl?: string,
    leaveGifUrl?: string,
    levelChannelID?: string,
    levelSystem?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('bdd')
    .setDescription('Modify database values.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption(option =>
        option
            .setName("data")
            .setDescription("Value to be modified")
            .setRequired(false)
            .addChoices(
                { name: 'Log Channel ID', value: 'logchannelid' },
                { name: 'Welcome Channel ID', value: 'welcomechannelid' },
                { name: 'Leave Channel ID', value: 'leavechannelid' },
                { name: 'Welcome Gif URL', value: 'welcomegifurl' },
                { name: 'Leave Gif URL', value: 'leavegifurl' },
                { name: 'Level Channel ID', value: 'levelchannelid' },
            )
    )
    .addStringOption(option =>
        option
            .setName("element")
            .setDescription("Element that replaces the previous one.")
            .setRequired(false)
    )
    .addBooleanOption(option =>
        option
            .setName('levels-system')
            .setDescription('Activate or unactivate ?')
            .setRequired(false)
    )

export default command(meta, async ({ interaction, log }) => {
    const key = interaction.options.getString('data');
    const guildId = interaction.guild?.id;
    const logChannelId = interaction.options.getString("element");
    const welcomeChannelId = interaction.options.getString("element");
    const leaveChannelId = interaction.options.getString("element");
    const welcomeGifUrl = interaction.options.getString("element");
    const leaveGifUrl = interaction.options.getString("element");
    const levelChannelId = interaction.options.getString("element");
    const levelSystemBool = interaction.options.getBoolean("levels-system");
    const guildName = interaction.guild?.name;

    if (key == "logchannelid")
        db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error(`Error when retrieving the "logChannelId" parameter from the database for the ${guildName} server (${guildId}).\nError :\n`, err);
            }
            if (logChannelId !== null) {
                try {
                    db.run(`UPDATE servers_settings SET logChannelId = ? WHERE guildId = ?`, [logChannelId, guildId]);
                    interaction.reply({
                        ephemeral: true,
                        content: `The log channel ID has been modified.\nNew ID : ${logChannelId}`
                    })
                } catch (error) {
                    console.error(`An error occurred when modifying the log channel ID on the ${interaction.guild?.name} server. Error :\n(${guildId}).\nError :\n`, error);
                    interaction.reply({
                        ephemeral: true,
                        content: `An error occurred when modifying the log channel ID.`
                    });
                };
            } else {
                const logChannel = row?.logChannelId;
                interaction.reply({
                    ephemeral: true,
                    content: `The log channel ID : ${logChannel}`
                })
            }
        })
    if (key == "welcomechannelid")
        db.get('SELECT welcomeChannelID FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error('Error retrieving the "welcomeChannelId" parameter from the database.', err);
            }
            if (welcomeChannelId !== null) {
                try {
                    db.run(`UPDATE servers_settings SET welcomeChannelID = ? WHERE guildId = ?`, [welcomeChannelId, guildId]);
                    interaction.reply({
                        ephemeral: true,
                        content: `The ID of the welcome message channel has been changed.\nNew ID : ${welcomeChannelId}`
                    })
                } catch (error) {
                    console.error(`An error occurred when modifying the ID of the welcome message channel on the ${interaction.guild?.name} server. Error :\n`, error);
                    interaction.reply({
                        ephemeral: true,
                        content: `An error occurred when changing the channel ID for welcome messages.`
                    });
                };
            } else {
                const welcomeChannel = row?.welcomeChannelID;
                interaction.reply({
                    ephemeral: true,
                    content: `Welcome message channel ID: ${welcomeChannel}`
                })
            }
        })
    if (key == "leavechannelid")
        db.get('SELECT leaveChannelID FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error('Error retrieving the "leaveChannelId" parameter from the database.', err);
            }
            if (leaveChannelId !== null) {
                try {
                    db.run(`UPDATE servers_settings SET leaveChannelID = ? WHERE guildId = ?`, [leaveChannelId, guildId]);
                    interaction.reply({
                        ephemeral: true,
                        content: `The ID of the outgoing message channel has been changed.\nNew ID : ${leaveChannelId}`
                    })
                } catch (error) {
                    console.error(`An error occurred when modifying the ID of the departure message channel on the ${interaction.guild?.name} server. Error :\n`, error);
                    interaction.reply({
                        ephemeral: true,
                        content: `An error occurred when modifying the outgoing message channel ID.`
                    });
                };
            } else {
                const leaveChannel = row?.leaveChannelID;
                interaction.reply({
                    ephemeral: true,
                    content: `The outgoing message channel ID: ${leaveChannel}`
                });
            }
        })
    if (key == "welcomegifurl")
        db.get('SELECT welcomeGifUrl FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error('Error retrieving the "welcomeGifUrl" parameter from the database.', err);
            }
            if (welcomeGifUrl !== null) {
                try {
                    db.run(`UPDATE servers_settings SET welcomeGifUrl = ? WHERE guildId = ?`, [welcomeGifUrl, guildId]);
                    interaction.reply({
                        ephemeral: true,
                        content: `The link in the welcome message gif has been changed.\nNew link: ${leaveChannelId}`
                    })
                } catch (error) {
                    console.error(`An error occurred when modifying the welcome gif link on the ${interaction.guild?.name} server. Error :\n`, error);
                    interaction.reply({
                        ephemeral: true,
                        content: `An error occurred when modifying the welcome gif link.`
                    });
                };
            } else {
                const welcomeGif = row?.welcomeGifUrl;
                interaction.reply({
                    ephemeral: true,
                    content: `The link for the welcome gif is: ${welcomeGif}`
                });
            }
        })
    if (key == "leavegifurl")
        db.get('SELECT leaveGifUrl FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error('Error retrieving the "leaveGifUrl" parameter from the database.', err);
            }
            if (leaveGifUrl !== null) {
                try {
                    db.run(`UPDATE servers_settings SET leaveGifUrl = ? WHERE guildId = ?`, [leaveGifUrl, guildId]);
                    interaction.reply({
                        ephemeral: true,
                        content: `The link in the gif of the original message has been changed. New link: ${leaveChannelId}`
                    })
                } catch (error) {
                    console.error(`An error occurred when modifying the link of the starting gif on the ${interaction.guild?.name} server. Error :\n`, error);
                    interaction.reply({
                        ephemeral: true,
                        content: `An error occurred when modifying the link of the starting gif.`
                    });
                };
            } else {
                const leaveGif = row?.leaveGifUrl;
                interaction.reply({
                    ephemeral: true,
                    content: `The starting gif link is: ${leaveGif}`
                });
            }
        })
    if (key == "levelchannelid")
        db.get('SELECT levelChannelID, levelSystem FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error('Error retrieving the "levelChannelID" parameter from the database.', err);
            }
            if (levelChannelId !== null) {
                try {
                    db.run(`UPDATE servers_settings SET levelChannelID = ? WHERE guildId = ?`, [levelChannelId, guildId]);
                    interaction.reply({
                        ephemeral: true,
                        content: `The level channel ID has been modified.\nNew ID : ${levelChannelId}`
                    })
                } catch (error) {
                    console.error(`An error occurred when modifying the link of the starting gif on the ${interaction.guild?.name} server. Error :\n`, error);
                    interaction.reply({
                        ephemeral: true,
                        content: `An error occurred when modifying the link of the starting gif.`
                    });
                };
            } else {
                const levelChannel = row?.levelChannelID;
                if (row?.levelSystem == "1")
                    interaction.reply({
                        ephemeral: true,
                        content: `The level message channel ID is : ${levelChannel}\nThe status of the level system is : \`Enabled\``
                    });
                else if (row?.levelSystem == "0")
                    interaction.reply({
                        ephemeral: true,
                        content: `The level message channel ID is : ${levelChannel}\nThe status of the level system is : \`Disabled\``
                    });
                else
                    interaction.reply({
                        ephemeral: true,
                        content: `The level message channel ID is : ${levelChannel}\nThe status of the level system is : \`Not Defined\``
                    })
            }
        })
    if (levelSystemBool !== null)
        db.get('SELECT levelSystem FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
            if (err) {
                console.error('Error retrieving the "levelSystem" parameter from the database.', err);
            }
            if (levelSystemBool == true) {
                try {
                    db.run(`UPDATE servers_settings SET levelSystem = ? WHERE guildId = ?`, [levelSystemBool, guildId]);
                    interaction.reply({
                        ephemeral: true,
                        content: `Leveling system was activated.`
                    });
                } catch (error) {
                    console.error(`An error occured when modifying the value for the leveling system on the ${interaction.guild?.name} server. Error :\n`, error);
                    interaction.reply({
                        ephemeral: true,
                        content: `An error occured when modifying the value for the leveling system.`
                    });
                };
            } else if (levelSystemBool == false) {
                try {
                    db.run(`UPDATE servers_settings SET levelSystem = ? WHERE guildId = ?`, [levelSystemBool, guildId]);
                    interaction.reply({
                        ephemeral: true,
                        content: `Leveling system was desactivated.`
                    });
                } catch (error) {
                    console.error(`An error occured when modifying the value for the leveling system on the ${interaction.guild?.name} server. Error :\n`, error);
                    interaction.reply({
                        ephemeral: true,
                        content: `An error occured when modifying the value for the leveling system.`
                    });
                };
            } else {
                const levelSystem = row?.levelSystem;
                interaction.reply({
                    ephemeral: true,
                    content: `Leveling system : ${levelSystem}`
                });
            }
        })
});

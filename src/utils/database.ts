import * as sqlite from 'sqlite3';

export const db = new sqlite.Database('./client.db');

db.run(`
    CREATE TABLE IF NOT EXISTS servers_settings (
        guildId INTEGER PRIMARY KEY,
        logChannelId TEXT,
        welcomeChannelID TEXT,
        leaveChannelID TEXT,
        levelChannelID TEXT,
        welcomeGifUrl TEXT,
        leaveGifUrl TEXT,
        levelChannelID TEXT,
        levelSystem TEXT
    );
`)

db.run(`
    CREATE TABLE IF NOT EXISTS servers_users_warns (
        warnId INTEGER PRIMARY KEY AUTOINCREMENT,
        guildId INTEGER,
        guildName TEXT,
        user TEXT,
        username TEXT,
        moderateur TEXT,
        moderateurName TEXT,
        date DATE,
        raison TEXT,
        FOREIGN KEY (guildId) REFERENCES servers_settings(guildId)
    );
`)

db.run(`
    CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guildId INTEGER,
        userId TEXT,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        FOREIGN KEY (guildId) REFERENCES servers_settings(guildId)
    );
`)

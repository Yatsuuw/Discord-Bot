# Discord-Bot

A Discord Bot wich are developed in the TypeScript language.

# Commands

## Admin

- emit : Issue an event.
- bdd : Modify database values.
- admininfo : Development version of the bot.
- reload : Restart the bot.
- setup : Initialise the bot in the database.


## Moderation

- ban : Ban a user.
- channel : Administering channel settings.
- clear : Delete a specific number of messages.
- kick : Kick a user.
- managelevels : Manage user level or experience.
- mute : Remove a user's voice.
- thread : Allows you to manage discussion threads.
- unmute : Giving users a voice.
- unwarn : Delete a user's warn.
- userinfo : Sends a user's profile information.
- warn : Giving a warning to a user.
- warnslist : Displays a user's list of warnings.

## Utility

- avatar : Sends the target user's avatar.
- help : Get a list of bot commands.
- jsdoc : Sends the documentation for the Discord.JS library.
- leaderboard : Displays the leaderboard of users with the highest levels.
- level : Send the level for the user who was executed this command.
- message : Send a message by bot.
- ping : Ping the bot for a response.
- poll : Start a poll.
- result : Sends the result of a sports or e-sport match.
- version : Development version of the bot.

## Events

- guildMemberAdd : Detect a user joining the server.
- guildMemberRemove : Detect a user leaving the server.
- threadCreate : Detect the creation of a discussion thread.
- threadUpdate : Detect changes to a thread.
- messageCreate : Detect when a user sends a message to the server. (Used by the level system).
- ready : Detect when the bot is online.
- interactionCreate : Record commands in the Discord API.

# Installation

Download the Github directory, unzip the folder, configure the ".example.env" file, then rename it to ".env". Open a command prompt, then perform the following commands:

- ```cd C:/users/{user}/desktop/"Discord-Bot"``` : Go to the bot folder.
- ```npm run deploy-prod``` : Deploy the bot's commands in the Discord API.
- ```npm run build``` : Transform the bot's TypeScript files into JavaScript files.
- ```npm run start``` : Start the bot with the JavaScript files.

The ```npm run dev``` command starts the bot with the TypeScript files. For online bot maintenance and hosting, this is not recommended. It is better to use the JavaScript files.

The ```npm run deploy``` command saves the bot's commands locally on the server specified in the ".env" file. This avoids going through the API and waiting for them to be recorded. Recommended during the bot development phase only.


# Author

- [@Yatsuuw](https://www.github.com/Yatsuuw)


# License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

[![Apache 2.0 License](https://img.shields.io/badge/License-Apache-red.svg)](https://www.apache.org/licenses/LICENSE-2.0)
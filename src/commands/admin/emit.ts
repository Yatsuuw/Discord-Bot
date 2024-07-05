import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command, db } from '../../utils'
import keys from '../../keys';

const meta = new SlashCommandBuilder ()
    .setName('emit')
    .setDescription('Issue an event.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('event')
            .setDescription('Event to issue')
            .setRequired(true)
            .addChoices(
                { name: 'guildMemberAdd', value: 'guildMemberAdd' },
                { name: 'guildMemberRemove', value: 'guildMemberRemove' },
                { name: 'threadCreate', value: 'threadCreate' },
            )
    )

export default command(meta, async ({ interaction }) => {

    if (interaction.user.id === keys.ownerId) {
        const choices = interaction.options.getString('event');
        
        if (choices) {
            switch (choices) {
                case 'guildMemberAdd':
                    if (interaction.member) {
                        const emitSelfAdd = await interaction.guild?.members.fetch(interaction.user.id);
                        if (emitSelfAdd) {
                            interaction.client.emit('guildMemberAdd', emitSelfAdd);
                        }
                    }
                    break;
                case 'guildMemberRemove':
                    if (interaction.member) {
                        const emitSelfRemove = await interaction.guild?.members.fetch(interaction.user.id);
                        if (emitSelfRemove) {
                            interaction.client.emit('guildMemberRemove', emitSelfRemove);
                        }
                    }
                    break;
                case 'threadCreate':
                    if (interaction.channel && interaction.channel.isTextBased()){
                        const textChannel = interaction.channel as TextChannel;
                        const thread = await textChannel.threads.create({
                            name: 'Emit Test',
                            autoArchiveDuration: 60,
                        });

                        await thread.delete();
                    }
                    break;
            } 
            const embed = new EmbedBuilder()
                .setTitle('An event has been issued')
                .setColor('Greyple')
                .setTimestamp()
                .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' });

            if (choices === 'threadCreate') {
                embed.addFields([
                    { name: 'Event :', value: `${choices}` },
                    { name: 'Information', value: `The \`Emit Test\` thread was created and then deleted automatically.` }
                ])
            } else {
                embed.addFields([
                    { name: 'Event :', value: `${choices}` },
                ])
            };
        
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ content: 'The choice of event is null.', ephemeral: true});
        }
    } else {
        const no_permission = new EmbedBuilder()
            .setTitle("Error")
            .setColor("Red")
            .setDescription('You do not have permission to run this command.')
            .addFields([
                { name: 'Permission', value: 'OwnerID\nOnly the bot developer can execute this command at the moment.' }
            ])
            .setTimestamp()
            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

        await interaction.reply({ embeds: [no_permission], ephemeral: true })
    }
});
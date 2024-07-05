import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('avatar')
    .setDescription('Sends the target user\'s avatar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('The user whose avatar you want to retrieve.')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const target = interaction.options.getMember('target') as GuildMember;

    const avatar = new EmbedBuilder()
        .setAuthor({ name: `${target.user.tag}` })
        .setColor("White")
        .setImage(target.user.displayAvatarURL({ size: 4096 }))
        .setFooter({ text: `By yatsuuw @ Discord`, iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

    return interaction.reply({
        ephemeral: true,
        embeds: [avatar]
    });
});

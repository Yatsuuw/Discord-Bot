import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "@discordjs/builders"
import { APIEmbedField, ButtonStyle, EmbedBuilder, InteractionReplyOptions, StringSelectMenuOptionBuilder } from "discord.js"
import CategoryRoot from '../commands'
import { chunk, createId, readId } from "../utils"

export const Namespaces = {
    root: 'help_category_root',
    select: 'help_category_select',
    action: 'help_category_action'
}

export const Actions = {
    next: '+',
    back: '-'
}

const N = Namespaces
const A = Actions

export function getCategoryRoot(ephemeral?: boolean): InteractionReplyOptions {
    const mappedCategories = CategoryRoot.map(({ name, description, emoji }) => 
        new StringSelectMenuOptionBuilder({
            label: name,
            description,
            emoji,
            value: name,
        })
    )

    const embed = new EmbedBuilder()
        .setTitle('Help menu')
        .setDescription('Search for information relating to your request.')
        .addFields([
            { name: 'About', value: '→ /version for the current version and the about bot.' }
        ])
        .setColor("Aqua")
        .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

    const selectId = createId(N.select)
    const select = new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder('Commands categories')
        .setMaxValues(1)
        .setOptions(mappedCategories)

    const component = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select)

    return {
        embeds: [embed],
        components: [component],
        ephemeral,
    }
}

export function getCategoryPage(interactionId: string): InteractionReplyOptions {
    const [_namespace, categoryName, action, currentOffset] = readId(interactionId)

    const categoryChunks = CategoryRoot.map((c) => {
        const commands: APIEmbedField[] = c.commands.map((c) => ({
            name: c.meta.name,
            value: c.meta.description,
        }))

        return {
            ...c,
            commands: chunk(commands, 10),
        }
    })

    const category = categoryChunks.find(({ name }) => name === categoryName)
    if (!category)
        throw new Error('invalid interactionId ; The page for the corresponding category was not found !')

        let offset = parseInt(currentOffset)
        if (isNaN(offset)) offset = 0
        if (action === A.next) offset++
        else if (action === A.back) offset--

        const emoji = category.emoji ? `${category.emoji} ` : ''
        const defaultDescription = `I found ${category.commands.flat().length} commands in the ${emoji}${category.name} category.`

        const embed = new EmbedBuilder()
            .setTitle(`Commands | ${emoji}${category.name}`)
            .setDescription(category.description ?? defaultDescription)
            .setColor("Aqua")
            .setFields(category.commands[offset])
            .setFooter({ text: `${offset + 1} / ${category.commands.length} - By yatsuuw @ Discord`, iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

        const backId = createId(N.action, category.name, A.back, offset)
        const backButton = new ButtonBuilder()
            .setCustomId(backId)
            .setLabel('Back')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(offset <= 0)

        const rootId = createId(N.root)
        const rootButton = new ButtonBuilder()
            .setCustomId(rootId)
            .setLabel('Categories')
            .setStyle(ButtonStyle.Secondary)

        const nextId = createId(N.action, category.name, A.next, offset)
        const nextButton = new ButtonBuilder()
            .setCustomId(nextId)
            .setLabel('Next')
            .setStyle(ButtonStyle.Success)
            .setDisabled(offset >= category.commands.length - 1)

        const component = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(backButton, rootButton, nextButton)

        return {
            embeds: [embed],
            components: [component]
        }
}

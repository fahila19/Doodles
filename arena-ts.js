const prepareBlock = (content) => {
    let blocks = [
        'audioEmbed',
        'audioFile',
        'image',
        'link',
        'pdf',
        'videoEmbed',
        'videoFile',
    ]

    blocks.forEach((type) => {
        let typeClass = type.replace(/[A-Z]/g, "-$&").toLowerCase()
        let typeName = type.split(/[A-Z]/g)[0];
        (typeName == 'pdf') ? typeName = typeName.toUpperCase() : typeName = typeName[0].toUpperCase() + typeName.slice(1)

        let typeContainers = document.querySelectorAll(`.${typeClass}-blocks`)
        let typeTemplate = document.getElementById(`${typeClass}-block`)

        blocks[type] = {
            name: typeName,
            containers: typeContainers,
            template: typeTemplate ? typeTemplate.content : null,
        }
    })

    content.forEach((block) => {
        switch (block.class) {
            case 'Attachment':
                let attachment = block.attachment.content_type
                if (attachment.includes('audio')) {
                    renderBlock(block, blocks.audioFile)
                }
                else if (attachment.includes('pdf')) {
                    renderBlock(block, blocks.pdf)
                }
                else if (attachment.includes('video')) {
                    renderBlock(block, blocks.videoFile)
                }
                break

            case 'Image':
                renderBlock(block, blocks.image)
                break

            case 'Link':
                renderBlock(block, blocks.link)
                break

            case 'Media':
                let media = block.embed.type
                if (media.includes('rich')) {
                    renderBlock(block, blocks.audioEmbed)
                }
                else if (media.includes('video')) {
                    renderBlock(block, blocks.videoEmbed)
                }
                break
        }
    })
}

const renderBlock = (block, type) => {
    if (!type.template || !type.containers) return

    type.containers.forEach((container) => {
        let template = type.template.cloneNode(true)
        let elements = [
            'image',
            'link',
        ]

        elements = Object.assign({},
            ...elements.map(string => ({
                [string]: template.querySelectorAll(`.${string.replace(/[A-Z]/g, "-$&").toLowerCase()}`)
            }))
        )

        const srcOrSrcset = (element, size) => element.tagName == 'IMG' ? element.src = block.image[size].url : element.srcset = block.image[size].url

        elements.image.forEach((element) => block.image ? srcOrSrcset(element, 'large') : element.remove())
        elements.link.forEach((element) => {
            if (block.source) {
                element.href = block.source.url
            }
            else if (block.attachment) {
                element.href = block.attachment.url
            }
        })
        container.append(template)
    })

}

fetch(`https://api.are.na/v2/channels/lucine_keke?per=100`, { cache: 'no-store' })
    .then(response => response.json())
    .then(data => {
        prepareBlock(data.contents);
    })
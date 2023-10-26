//file: messageTypes.js

const truncatedMessage = {
    user: (MAX_CHARACTER_LIMIT) => `O usuário enviou uma mensagem que excedeu o limite máximo de ${MAX_CHARACTER_LIMIT} caracteres. A mensagem foi truncada para conter apenas os primeiros ${MAX_CHARACTER_LIMIT} caracteres. Caso necessário, informe esse fato em sua resposta. A seguir, a mensagem já truncada:`,
    system: (MAX_CHARACTER_LIMIT) => `O sistema de busca na internet retornou uma mensagem que excedeu o limite máximo de ${MAX_CHARACTER_LIMIT} caracteres. A mensagem foi truncada para conter apenas os primeiros ${MAX_CHARACTER_LIMIT} caracteres. Caso necessário, informe esse fato em sua resposta. A seguir, a mensagem já truncada:`,
};

export const messageTypes = {
    'text': {
        log: 'O usuário enviou: text',
        response: '_digitando..._'
    },
    'sticker': {
        log: 'O usuário enviou: sticker',
        response: 'Vi que você me enviou um sticker. Infelizmente, não consigo interagir com stickers hoje. Porém, em breve, receberei uma atualização para visualizar e interpretar stickers. Também poderei criar e enviar stickers para você em breve.'
    },
    'location': {
        log: 'O usuário enviou: location',
        response: 'Vi que você me enviou uma localização. Infelizmente, ainda não consigo interagir com localizações aqui no WhatsApp. Porém, em breve, receberei uma atualização para visualizar e interpretar localizações.'
    },
    'image': {
        log: 'O usuário enviou: image',
        response: 'Vi que você me enviou uma imagem. Infelizmente, não consigo interagir com imagens hoje. Porém, em breve, receberei uma atualização para visualizar e interpretar imagens. Também poderei criar e enviar imagens para você em breve.'
    },
    'audio': {
        log: 'O usuário enviou: audio',
        response: 'Ouvindo...'
        // response: 'Vi que você me enviou um áudio. Infelizmente, ainda não consigo escutar áudios. Porém, em breve, receberei uma atualização para ouvir e interpretar áudios. Também poderei criar e enviar respostas em áudio para você em breve.'
    },
    'video': {
        log: 'O usuário enviou: video',
        response: 'Vi que você me enviou um vídeo. Infelizmente, ainda não consigo assistir vídeos. Porém, em breve, receberei uma atualização para ver e interpretar vídeos. Também poderei criar e enviar vídeos para você em breve.'
    },
    'document': {
        log: 'O usuário enviou: document',
        response: 'Vi que você me enviou um arquivo e parece ser um documento. Infelizmente, ainda não consigo ver os dados desse documento. Porém, em breve, receberei uma atualização para lidar com documentos aqui no WhatsApp. Também poderei criar e enviar documentos para você em breve.'
    },
    'contact': {
        log: 'O usuário enviou: contact ou contacts',
        response: 'Vi que você me enviou um contato. Infelizmente, ainda não consigo ver os dados do contato. Porém, em breve, receberei uma atualização para lidar com contatos aqui no WhatsApp. Também poderei enviar contatos para você em breve.'
    },
    'contacts': {
        log: 'O usuário enviou: contact ou contacts',
        response: 'Vi que você me enviou um contato. Infelizmente, ainda não consigo ver os dados do contato. Porém, em breve, receberei uma atualização para lidar com contatos aqui no WhatsApp. Também poderei enviar contatos para você em breve.'
    }
};

export const chatTemplates = {
    premiumUpsellMessage: `Já te respondo, aguarde!
Se quiser prioridade, considere se tornar um cliente Premium. Você terá respostas imediatas e outras vantagens exclusivas! 
`,

    premiumUpsellLink: `https://produtivi.com.br/html/pricing.html?back=1`,

    callToAction: `Clique no link para ver os planos e fazer sua assinatura.`,

    dontWorryReplyingSoon: `Mas não se preocupe, vou responder à sua mensagem assim que possível.`,

    context_length_exceeded: `A mensagem que você enviou é extensa demais, infelizmente não consigo ler e processar textos grandes. 
Por favor, reduza o tamanho do texto e me envie novamente.`,

    truncatedMessage: truncatedMessage,

    endFreeMessages: `Você atingiu o limite de uso gratuito. Para continuar usando o serviço, considere assinar um dos nossos planos. Você terá respostas imediatas e outras vantagens exclusivas!`

};


const config = require('../config');

const { checkoutUrl } = config.product;
const coverImageUrl = config.product.coverImageUrl;

/**
 * Respostas automáticas por palavras-chave
 * Economiza chamadas à Claude API respondendo objeções conhecidas
 */
const autoResponses = [
  {
    id: 'saudacao',
    keywords: ['oi', 'olá', 'ola', 'quem é', 'quem e', 'quem é você', 'quem e voce', 'com quem eu falo', 'com quem falo', 'boa tarde', 'boa noite', 'bom dia', 'diga', 'fala', 'fala comigo', 'pode falar', 'te conheço', 'te conheco', 'quem ta falando', 'quem tá falando', 'quem fala', 'eai', 'e aí', 'e ai', 'oii', 'oie', 'opa', 'hello', 'hey'],
    exactMatch: ['?', '??', '???', 'oi', 'ola', 'olá', 'oii', 'oie', 'opa', 'diga', 'fala', 'eai', 'hey', 'hello'],
    sendImage: true,
    response: (nome) =>
      `Olá tudo bem? Fico feliz que você tenha tomado essa decisão de buscar mais sobre Cristo!\n\n` +
      `Você chegou até aqui por um motivo.\n` +
      `Não foi curiosidade.\n` +
      `Não foi impulso.\n\n` +
      `Quando alguém abandona esse livro, quase nunca é por preço.\n` +
      `É porque a verdade começou a incomodar.\n\n` +
      `*Identidade Desbloqueada* não é um livro confortável.\n` +
      `Ele confronta o silêncio que você aprendeu a carregar.\n\n` +
      `Se você sente que ainda não é o momento, tudo bem.\n` +
      `Mas se você sabe que está evitando uma decisão...\n` +
      `talvez esse seja exatamente o ponto.\n\n` +
      `O acesso continua disponível.\n` +
      `Retomar acesso ao livro: ${checkoutUrl}`,
  },
  {
    id: 'preco',
    keywords: ['quanto custa', 'qual o valor', 'qual o preco', 'qual o preço', 'quanto é', 'quanto e', 'quanto ta', 'quanto tá', 'qual preco', 'qual preço', 'quanto ficou', 'quanto fica'],
    response: (nome) =>
      `O Identidade Desbloqueada está por R$ 29,90.\n\n` +
      `Mas deixa eu te ser sincero: o valor do livro não está no preço. Está no que ele vai te fazer enxergar.\n\n` +
      `Tem gente que gastou mais do que isso num jantar e esqueceu no dia seguinte. Esse livro fica com você pra sempre.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'formato',
    keywords: ['livro fisico', 'livro físico', 'é fisico', 'é físico', 'é impresso', 'versao fisica', 'versão física', 'é digital', 'ebook', 'e-book', 'livro digital', 'entrega', 'envio', 'frete', 'correio'],
    response: (nome) =>
      `O Identidade Desbloqueada é um livro digital — e isso foi uma escolha proposital.\n\n` +
      `Eu queria que você pudesse começar a leitura agora. Não daqui a 7 dias, não quando o correio entregar. Agora.\n\n` +
      `Você lê no celular, no tablet, no computador... onde estiver. Na fila do banco, no intervalo do trabalho, de madrugada quando o sono não vem e a alma pesa.\n\n` +
      `Um livro físico fica na estante. Esse aqui foi feito pra ficar com você o tempo todo.\n\n` +
      `E o acesso é imediato — assim que concluir a compra, já pode começar a ler.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'sem_dinheiro',
    keywords: ['nao tenho dinheiro', 'não tenho dinheiro', 'ta caro', 'tá caro', 'caro', 'nao tenho condicoes', 'não tenho condições', 'nao posso pagar', 'não posso pagar', 'sem dinheiro', 'nao posso', 'não posso', 'nao da', 'não dá', 'sem condicoes', 'sem condições'],
    response: (nome) =>
      `Eu entendo. De verdade. E não vou te pressionar.\n\n` +
      `Mas deixa eu te falar uma coisa com sinceridade: R$ 29,90 é menos do que um lanche no shopping. E esse livro não vai te alimentar por uma hora — ele vai te confrontar pra vida inteira.\n\n` +
      `Às vezes a gente diz "não posso" quando na verdade o coração tá dizendo "ainda não estou pronto". E tudo bem. Mas se for só uma questão de momento, o link vai continuar aqui quando você decidir.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'gratuito',
    keywords: ['de graca', 'de graça', 'gratis', 'grátis', 'gratuito', 'free', 'versao gratis', 'versão grátis', 'sem pagar', 'sem custo'],
    response: (nome) =>
      `Não, o Identidade Desbloqueada não é gratuito — e existe um motivo pra isso.\n\n` +
      `O que é de graça, a gente consome e esquece. O que tem valor, a gente leva a sério.\n\n` +
      `Esse livro custou meses de oração, escrita e confronto pessoal. Ele não foi feito pra ser mais um PDF esquecido no celular. Foi feito pra te marcar.\n\n` +
      `Por R$ 29,90, você tem acesso imediato a algo que pode mudar a forma como você se enxerga diante de Deus. É menos que um jantar — e dura pra sempre.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'sem_tempo',
    keywords: ['nao tenho tempo', 'não tenho tempo', 'sem tempo', 'muito ocupado', 'tô ocupado', 'to ocupado', 'nao consigo ler', 'não consigo ler', 'correria', 'estou sem tempo'],
    response: (nome) =>
      `Eu entendo a correria. Mas me deixa te fazer uma pergunta sincera: você não tem tempo, ou tem dado seu tempo pra tudo, menos pra aquilo que realmente importa?\n\n` +
      `O Identidade Desbloqueada não é um livro de 500 páginas. Ele é direto, cada capítulo vai no ponto. Você consegue ler no celular, em qualquer lugar — 15 minutos por dia já é o suficiente.\n\n` +
      `Às vezes o que mais transforma a nossa vida não é tempo. É decisão.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'vale_a_pena',
    keywords: ['vale a pena', 'sera que e bom', 'será que é bom', 'funciona', 'funciona mesmo', 'é bom', 'e bom', 'é confiavel', 'é confiável', 'presta', 'serve', 'recomenda'],
    response: (nome) =>
      `Eu não vou te dizer que vale a pena — porque isso você só vai sentir quando ler.\n\n` +
      `O que eu posso te dizer é que esse livro não foi escrito pra te entreter. Foi escrito pra te confrontar. Cada capítulo mexe com algo que você talvez tenha evitado por anos.\n\n` +
      `Quem já leu sabe: depois que você enxerga, não tem como voltar atrás. E se não fizer sentido pra você, o risco é zero — são apenas R$ 29,90.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'adiar',
    keywords: ['vou pensar', 'depois eu vejo', 'deixa pra depois', 'ainda nao', 'ainda não', 'nao e o momento', 'não é o momento', 'talvez depois', 'vou ver', 'preciso pensar', 'deixa eu pensar'],
    response: (nome) =>
      `Tudo bem, sem pressão nenhuma.\n\n` +
      `Mas me permite ser honesto? A maioria das pessoas que diz "vou pensar" já sabe a resposta. Só tá adiando.\n\n` +
      `Esse livro não vai mudar sozinho. Mas a decisão de ler, sim. Se quando você ler essa mensagem sentir algo — pode ser que seja exatamente o sinal que você tava esperando.\n\n` +
      `O link fica disponível quando você estiver pronto.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'seguranca',
    keywords: ['é seguro', 'e seguro', 'posso confiar', 'confiavel', 'confiável', 'golpe', 'fraude', 'pirataria', 'é golpe', 'e golpe', 'seguro', 'confio'],
    response: (nome) =>
      `A compra é feita pela Kiwify, uma das maiores plataformas de produtos digitais do Brasil. Milhares de pessoas compram por lá todos os dias.\n\n` +
      `O pagamento é 100% seguro — pode pagar por Pix, cartão ou boleto. E o acesso ao livro é liberado na hora após a confirmação.\n\n` +
      `Se tiver qualquer problema, estou aqui pra te ajudar.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'outros_livros',
    keywords: ['ja li', 'já li', 'ja tentei', 'já tentei', 'nao mudou nada', 'não mudou nada', 'livro nao muda', 'livro não muda', 'nao funciona', 'não funciona', 'outros livros', 'outro livro'],
    response: (nome) =>
      `Eu entendo essa frustração. Tem muita coisa por aí que promete transformação e entrega só palavras bonitas.\n\n` +
      `O Identidade Desbloqueada é diferente porque ele não tenta te motivar — ele te confronta. Não é um livro de autoajuda com frases prontas. É um livro que te obriga a olhar pra dentro e encarar o silêncio que você carrega.\n\n` +
      `Se os outros livros não funcionaram, talvez seja porque nenhum deles teve coragem de falar o que você precisava ouvir.\n\n` +
      `${checkoutUrl}`,
  },
  {
    id: 'nao_quer',
    keywords: ['nao quero', 'não quero', 'nao tenho interesse', 'não tenho interesse', 'nao me interessa', 'não me interessa', 'para de mandar', 'para de me mandar', 'nao quero comprar', 'não quero comprar', 'nao obrigado', 'não obrigado', 'desisto', 'nao preciso', 'não preciso'],
    response: (nome) =>
      `Tudo bem, respeito sua decisão. Não vou mais te enviar mensagens sobre isso.\n\n` +
      `Só quero te deixar uma última coisa: se um dia algo dentro de você voltar a inquietar — aquele silêncio que não te deixa em paz — saiba que esse livro foi escrito exatamente pra esse momento.\n\n` +
      `Te desejo tudo de bom. Que Deus te abençoe!`,
  },
  {
    id: 'audio',
    keywords: ['[audio]', '[áudio]', '[voice]', '[voz]'],
    isAudio: true,
    response: (nome) =>
      `Desculpa, mas no momento eu só consigo responder por texto. 😊\n\n` +
      `Se puder me escrever sua dúvida ou pergunta aqui, vou te responder com o maior prazer!`,
  },
];

/**
 * Normaliza texto para comparação (remove acentos, lowercase)
 */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Tenta encontrar uma resposta automática baseada em palavras-chave
 * @param {string} customerName - Nome do cliente
 * @param {string} message - Mensagem do cliente
 * @returns {{ text: string, matched: boolean, matchedId: string|null, sendImage: boolean }}
 */
function getAutoResponse(customerName, message) {
  const normalizedMessage = normalize(message);

  for (const item of autoResponses) {
    // Verifica exact match primeiro (mensagens curtas como "oi", "?")
    if (item.exactMatch) {
      for (const exact of item.exactMatch) {
        if (normalizedMessage === normalize(exact)) {
          console.log(`[AutoResponder] Exact match encontrado: "${item.id}" (exact: "${exact}")`);
          return {
            text: item.response(customerName),
            matched: true,
            matchedId: item.id,
            sendImage: item.sendImage || false,
          };
        }
      }
    }

    // Verifica keywords (contém)
    for (const keyword of item.keywords) {
      const normalizedKeyword = normalize(keyword);
      if (normalizedMessage.includes(normalizedKeyword)) {
        console.log(`[AutoResponder] Match encontrado: "${item.id}" (keyword: "${keyword}")`);
        return {
          text: item.response(customerName),
          matched: true,
          matchedId: item.id,
          sendImage: item.sendImage || false,
        };
      }
    }
  }

  return { text: null, matched: false, matchedId: null, sendImage: false };
}

/**
 * Retorna a resposta automática para áudio
 * @param {string} customerName - Nome do cliente
 * @returns {{ text: string, matched: boolean, matchedId: string }}
 */
function getAudioResponse(customerName) {
  const audioItem = autoResponses.find(item => item.id === 'audio');
  return {
    text: audioItem.response(customerName),
    matched: true,
    matchedId: 'audio',
    sendImage: false,
  };
}

module.exports = { getAutoResponse, getAudioResponse, coverImageUrl };

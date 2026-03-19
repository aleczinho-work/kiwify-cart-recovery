const config = require('../config');

const { name: produto, price: preco, checkoutUrl, guarantee } = config.product;

const messages = {
  // =============================================
  // CARRINHO ABANDONADO
  // =============================================
  abandonedCart: {
    first: (nome) =>
      `Ola tudo bem? Fico feliz que voce tenha tomado essa decisao de buscar mais sobre Cristo!\n\n` +
      `Voce chegou ate aqui por um motivo.\n` +
      `Nao foi curiosidade.\n` +
      `Nao foi impulso.\n\n` +
      `Quando alguem abandona esse livro, quase nunca e por preco.\n` +
      `E porque a verdade comecou a incomodar.\n\n` +
      `*Identidade Desbloqueada* nao e um livro confortavel.\n` +
      `Ele confronta o silencio que voce aprendeu a carregar.\n\n` +
      `Se voce sente que ainda nao e o momento, tudo bem.\n` +
      `Mas se voce sabe que esta evitando uma decisao...\n` +
      `talvez esse seja exatamente o ponto.\n\n` +
      `O acesso continua disponivel.\n` +
      `Retomar acesso ao livro: ${checkoutUrl}`,

    second: (nome) =>
      `${nome}, eu nao sei o que te travou.\n\n` +
      `Talvez tenha sido o momento. Talvez a duvida.\n` +
      `Talvez algo dentro de voce disse "ainda nao".\n\n` +
      `Mas eu preciso ser honesto com voce:\n` +
      `o *Identidade Desbloqueada* nao foi escrito pra quem esta pronto.\n` +
      `Foi escrito pra quem esta cansado de esperar estar pronto.\n\n` +
      `Cada capitulo desse livro foi pensado pra quebrar uma camada de silencio.\n` +
      `E quem ja leu sabe: depois que voce enxerga, nao tem como voltar atras.\n\n` +
      `Se voce sente que esse livro e pra voce, o link ainda esta ativo:\n` +
      `${checkoutUrl}\n\n` +
      `E lembre-se: voce tem ${guarantee}. Se nao fizer sentido, devolvemos cada centavo.`,

    third: (nome) =>
      `${nome}, essa e a ultima vez que vou falar sobre isso.\n\n` +
      `Eu nao vou insistir. Nao e assim que funciona.\n\n` +
      `Mas antes de encerrar, quero te deixar uma reflexao:\n\n` +
      `_Quantas vezes voce sentiu que Deus estava te chamando pra algo maior...\n` +
      `e deixou passar?_\n\n` +
      `O *Identidade Desbloqueada* existe pra ser o ponto de virada.\n` +
      `O fim do silencio. O inicio do seu proposito.\n\n` +
      `Se for pra voce, voce sabe.\n` +
      `${checkoutUrl}\n\n` +
      `Deus te abencoe, independente da sua decisao.`,
  },

  // =============================================
  // PIX GERADO
  // =============================================
  pix: {
    first: (nome) =>
      `Ola ${nome}! Vi que voce gerou o Pix para o *Identidade Desbloqueada*.\n\n` +
      `Voce ja deu o passo mais importante: decidiu.\n` +
      `Agora so falta concluir.\n\n` +
      `O codigo Pix tem validade limitada. Se expirou, sem problema, e so gerar um novo aqui:\n` +
      `${checkoutUrl}\n\n` +
      `O pagamento e instantaneo e o acesso e liberado na hora.\n\n` +
      `Se tiver qualquer duvida ou dificuldade com o pagamento, me chama aqui que te ajudo!`,

    second: (nome) =>
      `${nome}, percebi que o Pix do *Identidade Desbloqueada* ainda nao foi concluido.\n\n` +
      `Eu entendo que as vezes a correria do dia atrapalha.\n` +
      `Mas nao deixe essa decisao esfriar.\n\n` +
      `Voce sentiu algo quando chegou ate aquele checkout.\n` +
      `Aquilo nao foi por acaso.\n\n` +
      `Gere um novo Pix aqui (leva menos de 1 minuto):\n` +
      `${checkoutUrl}\n\n` +
      `Lembrando: ${guarantee}. Zero risco pra voce.`,
  },

  // =============================================
  // BOLETO GERADO
  // =============================================
  boleto: {
    first: (nome) =>
      `Oi ${nome}! Vi que voce gerou um boleto para o *Identidade Desbloqueada*.\n\n` +
      `So passando pra lembrar: o boleto tem data de vencimento, entao nao deixe passar!\n\n` +
      `Se precisar de uma segunda via ou quiser acessar o boleto novamente:\n` +
      `${checkoutUrl}\n\n` +
      `Qualquer duvida sobre o pagamento, e so me chamar aqui.`,

    second: (nome) =>
      `${nome}, o boleto do *Identidade Desbloqueada* vence em breve.\n\n` +
      `Se ainda nao conseguiu pagar, tenho uma sugestao:\n` +
      `voce pode pagar via *Pix* que e instantaneo e o acesso e liberado na hora!\n\n` +
      `Acesse aqui e escolha Pix como forma de pagamento:\n` +
      `${checkoutUrl}\n\n` +
      `E mais rapido, mais facil, e voce ja comeca a leitura hoje mesmo.`,

    third: (nome) =>
      `${nome}, vi que o boleto nao foi pago.\n\n` +
      `Eu sei que boleto as vezes complica. Esquece, vence, da trabalho.\n\n` +
      `Por isso quero te oferecer uma alternativa:\n` +
      `pague via *Pix* e o acesso ao *Identidade Desbloqueada* e liberado na hora.\n\n` +
      `${checkoutUrl}\n\n` +
      `E lembre-se: voce tem ${guarantee}.\n` +
      `Se o livro nao fizer sentido pra voce, devolvemos o valor.\n` +
      `Sem perguntas, sem burocracia.\n\n` +
      `Essa e a minha ultima mensagem. A decisao e sua.\n` +
      `Que Deus te ilumine nessa escolha.`,
  },

  // =============================================
  // COMPRA APROVADA
  // =============================================
  purchaseApproved: (nome) =>
    `${nome}, sua compra do *Identidade Desbloqueada* foi aprovada!\n\n` +
    `Que alegria ter voce nessa jornada!\n\n` +
    `Esse livro foi escrito com proposito, e eu creio que vai transformar a forma como voce se enxerga diante de Deus.\n\n` +
    `Seu acesso sera liberado em instantes.\n` +
    `Qualquer duvida, estou por aqui.\n\n` +
    `Que Deus te abencoe nessa leitura!\n` +
    `- Alec Guimel`,

  // =============================================
  // MENSAGEM DE FALLBACK (IA nao soube responder)
  // =============================================
  humanHandoff: (nome) =>
    `${nome}, otima pergunta!\n\n` +
    `Vou encaminhar para que alguem do nosso time possa te dar a melhor resposta.\n\n` +
    `Em breve voce recebera um retorno. Obrigado pela paciencia!`,
};

module.exports = messages;

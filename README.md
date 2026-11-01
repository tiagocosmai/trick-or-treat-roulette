# 🎃 Trick or Treat Roulette

Uma brincadeira de Halloween em React + TypeScript, pronta para hospedar na Vercel.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## Como brincar

1. Em **Configurações**, escolha **Produtos** (padrão) ou **Doces**. Produtos contém somente as oito casas da imagem de referência: CPM do Capeta, CTR do Terror, ROAS Sobrenatural, Frequência 666, Always On, Atribuição Paranormal, Alcance do Além e Otimização Infinita. Doces preserva o catálogo original de 16 opções, com oito inicialmente ativas. Cada modo guarda sua seleção separadamente; mantenha ao menos uma opção ativa.
2. A **roleta coringa** começa habilitada e pode ser desligada nas configurações. Sem ela, a participação termina após o primeiro sorteio. Modo e configuração ficam salvos no navegador.
3. Gire a roleta principal, pelo botão ou pelo ícone central. Todas as fatias têm a mesma chance.
4. Se habilitada, gire a roleta coringa: novo giro (1/6, ≈16,7%), troque o doce (2/6, ≈33,3%), fim dos giros (2/6, ≈33,3%) ou ganhe em dobro (1/6, ≈16,7%). As seis fatias são intercaladas, sem opções iguais vizinhas, inclusive no fechamento do círculo. “Ganhe em dobro” ocupa uma única fatia por roleta; pode sair novamente em outras rodadas.
5. Entregue o prêmio e avance para o próximo participante. Se sair um giro extra, use o botão para sortear somente o segundo doce. O primeiro doce é mantido e a participação termina automaticamente após o segundo sorteio: não há nova coringa nem outros giros extras.

A troca e a entrega dos doces são feitas presencialmente. A configuração e os últimos 12 resultados ficam salvos neste navegador. Não há backend ou dados enviados ao servidor. O botão de som ativa uma trilha assustadora contínua, cliques mecânicos sincronizados às fatias e um efeito ao revelar o prêmio. O áudio é sintetizado no navegador e começa após o toque no botão; o modo Doces usa emojis, cuja aparência depende do dispositivo, enquanto Produtos usa ícones locais transparentes. Cada giro dura entre 6,3 e 14,7 segundos (exceto com movimento reduzido). Uma roleta aparece por vez. O layout funciona em celulares, tablets e computadores. As referências a Nubank, Wandinha, Duo e Lily são lúdicas; não há integração com essas marcas.

## Editar o catálogo

Edite `candies` em `src/game.mjs`: cada objeto tem `id`, `name`, `icon` e `color`. A roleta acompanha automaticamente as opções ativas. O catálogo inicial oferece 16 combinações de ícones e cores.

## Publicar na Vercel

1. Envie este projeto para `https://github.com/tiagocosmai/trick-or-treat-roulette`.
2. Na Vercel, escolha **Add New → Project** e importe o repositório.
3. Use o preset **Vite**, comando de build `npm run build` e diretório de saída `dist`.
4. Clique em **Deploy**. Não são necessárias variáveis de ambiente.

Nenhuma publicação ou push é feito automaticamente pelos comandos locais.

## Asset de marca

O logo Nubank em `public/nubank.svg` é uma cópia local do [arquivo Nubank logo 2021, no Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nubank_logo_2021.svg), identificado como de autoria do Nubank. A assinatura do evento homenageia o FuFu Squad.

## Núcleo das roletas

`public/wheel-mascot.png` é a versão tratada da segunda imagem fornecida pelo usuário, gerada com a ferramenta integrada de imagens. Prompt: limpar e redesenhar com nitidez o adesivo roxo, remover fundo fotografado e margem branca, preservar rosto cansado e texto exato “TAMO AON / MAS / FADIGADO”, com transparência externa e sem novos elementos. O adesivo é usado no centro das duas roletas.

## Ícones dos produtos

`src/assets/product-icons.png` contém oito ícones transparentes, recriados a partir da roleta de referência usando a ferramenta integrada de imagens. Prompt: reconstruir chama amarela, cursor lilás, gráfico roxo, 666 laranja, infinito lilás, fantasma lilás, pessoas laranja e engrenagem roxa, em uma grade de quatro colunas e duas linhas, sem rótulos ou fundos, mantendo o estilo de silhuetas da referência. Não são recortes literais do cartaz.

A imagem compartilhada é carregada uma única vez e cada produto exibe sua região. Ela e o núcleo em `src/assets/wheel-mascot.png` são importados pelo Vite, que gera URLs com hash de conteúdo no build. Isso atualiza o cache quando a arte muda. Ambos têm preload para antecipar o carregamento.

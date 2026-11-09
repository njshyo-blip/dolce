# Dolce — Sorveteria de Verão

## Como abrir
1. Extraia o ZIP inteiro.
2. Abra `index.html` no Chrome, Firefox, Edge ou Safari atualizado.
3. Clique em **Abrir a sorveteria**.

Não precisa instalar dependências, usar terminal ou conectar à internet.
No Android, alguns gerenciadores de arquivos abrem HTML em uma visualização que não executa JavaScript. Nesse caso, abra com um navegador ou sirva a pasta como site estático.

Opcional para desenvolvimento: com Python instalado, execute `python3 -m http.server 8000` nesta pasta e acesse `http://localhost:8000`.

## Controles
- Clique/toque em uma casquinha e depois em cada sabor, ou arraste os sabores até a bancada.
- Durante o arraste, uma colher com a bola acompanha o movimento. Soltar fora da bancada cancela o movimento.
- Cada seleção adiciona somente uma bola; o jogo não monta pedidos automaticamente.
- Selecione coberturas na aba **Coberturas**, após desbloqueá-las.
- **Desfazer** remove a cobertura ou a última bola; **Limpar** recomeça a montagem.
- **Entregar pedido** confere recipiente, sabores, quantidades e cobertura. A ordem dos sabores não é exigida nesta versão.
- Use Tab e Enter/Espaço para selecionar ingredientes pelo teclado.
- Escape pausa a rodada. Trocar de aba também pausa.
- O botão de som liga pequenos efeitos sintetizados; não há música de fundo.

## O que está incluído
- Rodadas de três minutos e tempo individual de espera.
- Cinco recipientes e dez sabores iniciais, com mais dois na loja.
- Montagem com ilustrações SVG, cliques, toque e arraste.
- Conferência automática, dinheiro, pontos, rapidez, combos e resumo final.
- Progressão por quatro pedidos corretos, com mais bolas e menos tempo.
- Melhorias: Manga, Lavanda, cerejas, confeitos, visitantes e jardim.
- Recorde e compras persistidos neste navegador quando localStorage está disponível.

O nível depende dos acertos da rodada atual e volta a 1 ao reiniciar. As compras permanecem. O dinheiro é moeda fictícia do jogo.

## Origem e limites desta entrega
Esta é uma **adaptação independente em HTML/CSS/JavaScript** baseada no código de Dolce disponível na conversa. Não é uma exportação direta nem uma cópia byte a byte do projeto Floot: o limite diário impediu buscar os arquivos hospedados.

A versão hospedada usa React/TypeScript, componentes e hospedagem Floot. Esta adaptação substitui essas dependências por APIs nativas do navegador, mantendo o ciclo de jogo. Tipografia usa fontes do sistema para funcionar sem internet; o visual pode variar em relação ao Floot. Uma colher visual foi acrescentada ao arraste local.

A expansão completa solicitada anteriormente **não está implementada**: chantilly, caldas e biscoitos, personalidades com paciência própria, pedidos especiais, estrelas por precisão/apresentação, catálogo de receitas, eventos sazonais e novas personalizações permanecem pendentes. A avaliação final por estrelas desta versão considera apenas a quantidade de acertos.

Salvamentos locais desta versão usam `dolce-standalone-v1` e não são sincronizados nem importados automaticamente do Floot.

## Arquivos
- `index.html`: estrutura da interface.
- `styles.css`: identidade visual e layout responsivo.
- `game.js`: regras, montagem, desenhos SVG, efeitos sonoros e salvamento.
- `assets/icone.svg`: ícone vetorial.
- `tests/regras.test.cjs`: testes das regras; opcional, exige Node.js.
- `VALIDACAO.md`: verificações realizadas e seus limites.

## Editar
Os sabores, recipientes e melhorias estão nas constantes `FLAVORS`, `CONES` e `UPGRADES` no início de `game.js`. O tempo da rodada está no estado inicial e na função `start`. Cores principais ficam em `:root` no CSS. Os desenhos são gerados pelas funções `art`, `avatar` e `spoon`.

## Recursos visuais e sonoros
Desenhos vetoriais e efeitos sonoros foram criados em código para esta entrega. Não há imagens ou músicas copiadas do site de referência, bibliotecas externas ou fontes baixadas. Alguns símbolos usam os glifos/emoji do sistema do dispositivo.

# Meu Dia — versão com sincronização real entre aparelhos

Essa versão salva os post-its num banco de dados de verdade (Netlify Blobs), então
o mesmo "código de quadro" abre os mesmos post-its em qualquer celular ou computador.

## O que mudou em relação ao arquivo único que você tinha

Agora são **4 arquivos**, porque a sincronização precisa de uma função rodando no
servidor da Netlify (não dá pra fazer isso só com HTML/JS estático):

```
meu-dia-netlify/
├── index.html                     ← o app (igual a antes, mas fala com o servidor)
├── netlify/functions/notes.js     ← a função que salva/lê os post-its
├── netlify.toml                   ← diz pra Netlify onde estão as funções
└── package.json                   ← lista a dependência (@netlify/blobs)
```

Por causa disso, o deploy não pode mais ser feito arrastando um único arquivo
`.html` na Netlify — precisa ser a pasta inteira, via Git ou Netlify CLI.

## Como colocar no ar (passo a passo)

### Opção A — pelo GitHub (recomendado)

1. Crie um repositório novo no GitHub (pode ser privado).
2. Suba estes 4 arquivos mantendo a mesma estrutura de pastas.
3. Na Netlify, vá em **Add new site → Import an existing project** e conecte esse
   repositório.
4. Configuração de build: **deixe "Build command" vazio** e **"Publish directory"
   como `.`** (a Netlify detecta a pasta `netlify/functions` sozinha).
5. Clique em Deploy. Depois de alguns segundos o site fica no ar.

### Opção B — pela linha de comando (Netlify CLI)

Se você tiver Node.js instalado:

```bash
npm install -g netlify-cli
cd meu-dia-netlify
npm install
netlify deploy --prod
```

Siga as instruções na tela (ele pede pra logar na sua conta Netlify e escolher
o site).

## Como funciona o "código do quadro"

- Na primeira vez que você abre o app, ele gera um código aleatório (tipo `a8k3fz`)
  e mostra ele no campo abaixo da barra de ferramentas.
- Esse código fica salvo no navegador daquele aparelho, então ele continua usando
  o mesmo quadro nas próximas visitas.
- **Para sincronizar com outro celular/computador**: abra o app no outro aparelho,
  digite o mesmo código no campo e clique em "usar em outro aparelho". Os dois
  aparelhos passam a compartilhar os mesmos post-its daquele dia.
- Guarde esse código em algum lugar (Notas, por exemplo) se quiser continuar
  acessando o mesmo quadro no futuro.

## Sobre a sincronização com o Google Agenda

O botão de sincronizar com o Google Agenda **continua funcionando só dentro do
Claude.ai** (ele usa uma chamada de API que só é autenticada lá dentro). Fora
do Claude, esse botão vai mostrar "não consegui conectar à agenda agora" — é
esperado. Se você quiser essa integração funcionando também na versão hospedada,
me avise: aí entra a etapa de criar um Client ID OAuth no Google Cloud Console
que comentamos antes.

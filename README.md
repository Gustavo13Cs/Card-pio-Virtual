# Cardápio Virtual Dinâmico com Painel de Controle

![Badge HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Badge CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Badge JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Badge Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

Um projeto full-stack completo que oferece uma solução moderna e gerenciável para confeitarias e pequenos negócios, substituindo cardápios estáticos por uma experiência interativa e dinâmica para o cliente e um painel de controle poderoso para o administrador.

**[➡️ Acesse a demonstração ao vivo AQUI!](https://cardapiocintiatrufados.vercel.app/)**


---


## ✨ Funcionalidades Principais

Este projeto foi desenvolvido com duas interfaces distintas em mente: uma para o cliente final e outra para o administrador do negócio.

### 👩‍🍳 Para o Cliente (Cardápio Público)

* **Cardápio 100% Dinâmico:** Todo o conteúdo do cardápio é carregado em tempo real a partir do banco de dados Firebase, permitindo atualizações instantâneas.
* **Design Responsivo:** A interface se adapta perfeitamente a qualquer tamanho de tela, do celular ao desktop.
* **Configurador de Bolos Interativo:** Uma interface dedicada para que o cliente possa montar um bolo personalizado, escolhendo tamanho, massa, até 2 recheios e adicionais.
* **"Carrinho de Compras":** Um resumo do pedido que é atualizado em tempo real conforme o cliente adiciona ou remove itens.
* **Integração com WhatsApp:** Ao finalizar, o pedido é formatado em uma mensagem clara e enviado diretamente para o WhatsApp do vendedor, pronto para ser confirmado.
* **Notificações Modernas:** Feedbacks visuais elegantes (toasts e modais) para ações como "item adicionado", melhorando a experiência do usuário.

### 🔑 Para o Administrador (Painel de Controle)

* **Acesso Seguro:** Página de login com autenticação via e-mail e senha gerenciada pelo Firebase Authentication.
* **Proteção de Rota:** Acesso ao painel de controle é restrito apenas a usuários autenticados.
* **Gerenciamento Completo de Categorias (CRUD):**
    * **Criar:** Adicionar novas categorias ao cardápio (ex: "Brownies").
    * **Ler:** Visualizar todas as categorias existentes de forma organizada.
    * **Editar:** Alterar nome, ordem de exibição e preço fixo de categorias.
    * **Excluir:** Remover categorias do cardápio.
* **Gerenciamento Completo de Itens (CRUD):**
    * **Adicionar:** Cadastrar novos itens dentro de cada categoria, seja com preço fixo ou variável.
    * **Editar:** Alterar o nome e o preço de itens individuais.
    * **Excluir:** Remover itens específicos de uma categoria.
* **Suporte a Estruturas de Dados Complexas:** O painel possui uma interface especial para gerenciar a categoria "Bolos", permitindo o gerenciamento de suas sub-coleções (tamanhos, massas, recheios e adicionais) de forma independente.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando uma arquitetura moderna, separando o Frontend do Backend (BaaS).

* **Frontend:**
    * HTML5 (Estrutura semântica)
    * CSS3 (Estilização com Flexbox, Grid e Media Queries para responsividade)
    * JavaScript (Vanilla JS, ES6+) para manipulação do DOM, interatividade e comunicação com a API.
* **Backend como Serviço (BaaS):**
    * **Firebase Firestore:** Como banco de dados NoSQL em tempo real para armazenar e servir todos os dados do cardápio.
    * **Firebase Authentication:** Para o sistema de login seguro do painel de administração.
* **Bibliotecas Externas:**
    * [SweetAlert2](https://sweetalert2.github.io/): Para a criação de modais e alertas elegantes.
    * [Toastify.js](https://apvarun.github.io/toastify-js/): Para notificações "toast" não-intrusivas.
    * [Font Awesome](https://fontawesome.com/): Para a biblioteca de ícones.
* **Hospedagem:**
    * O frontend da aplicação está hospedado na **Vercel** (ou Netlify).

---

## 🛠️ Como Rodar o Projeto Localmente

Para rodar este projeto em sua máquina local, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/Card-pio-Virtual.git](https://github.com/seu-usuario/Card-pio-Virtual.git)
    ```
2.  **Navegue para a pasta do projeto:**
    ```bash
    cd Card-pio-Virtual
    ```
3.  **Configuração do Firebase:**
    * Crie um projeto no [Firebase](https://firebase.google.com/).
    * Ative os serviços **Firestore** e **Authentication** (com provedor de E-mail/Senha).
    * Na pasta `js/`, crie um arquivo chamado `firebase-config.js`.
    * Vá nas configurações do seu projeto no Firebase, encontre e copie o objeto de configuração `firebaseConfig`.
    * Cole o objeto no seu `firebase-config.js` e inicialize o Firebase, como no exemplo abaixo:
        ```javascript
        const firebaseConfig = {
          // Suas chaves e IDs do Firebase aqui
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        ```
4.  **Execute o projeto:**
    * Como este é um projeto de frontend estático, você pode simplesmente abrir os arquivos `.html` no navegador. Para uma melhor experiência e para evitar problemas com CORS, é recomendado usar um servidor local. Se você usa o VS Code, a extensão **Live Server** é uma ótima opção.

---

## 👨‍💻 Autor

Projeto desenvolvido com muito café e código por **Gustavo Cunha**.

* **GitHub:** [seu-usuario-aqui](https://github.com/seu-usuario-aqui)
* **LinkedIn:** [seu-perfil-aqui](https://www.linkedin.com/in/seu-perfil-aqui/)
***FrontEnd***

Tecnologias:
Código: React 19.1.1 (Javascript) / React Router DOM 7.9.1 / Vite 7.1.9
Design: HeroUI 2.8.5 (componentes) / Tailwind 3.4.18 (framework) / Framer Motion 12.23.25 (animações) / Lucide React 0.555.0 (ícones)  / Font Awesome 7.1.0 (ícones)

Ferramentas:
ESLint 9.33.0 (limpeza do código)
JSON Server (Serviu para todos testes e protótipos feitos com dados mockados antes da API estar completa)

Arquitetura:
Páginas conectadas por um sistema de roteamento de react (router), utilizamos contextos para gerenciar os estados dos usuários nas páginas (se está logado ou não e como isso afeta a usabilidade), sistema de cache para otimizar performance e carregamentos das páginas, consumo da Gemona-API para comunicação com o banco e alterações diretas nele.

Gemona-Final/
│
├── public/
│   └── vite.svg
│
├── src/
│   ├── assets/                      # Imagens e recursos estáticos
│   │   ├── anemona.png              # Background da página Contact
│   │   ├── gemo.jpg                 # Mascote do projeto
│   │   ├── logo.jpg                 # Logo principal
│   │   └── peixe.png                
│   │
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── layout/                  # Componentes de estrutura
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── ui/                      # Componentes de interface
│   │   │   ├── HorizontalCarousel.jsx
│   │   │   ├── Icons.jsx            # Sistema de ícones por categoria
│   │   │   └── Logo.jsx
│   │   │
│   │   ├── RatingForm.jsx           # Formulário de avaliações
│   │   └── RatingForm.css
│   │
│   ├── contexts/                    # Context API do React
│   │   └── AuthContext.jsx          # Gerenciamento de autenticação
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   └── useForm.js               # Hook para gerenciar formulários
│   │
│   ├── pages/                       # Páginas da aplicação
│   │   ├── user/                    # Páginas do cliente
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx          # Perfil e agenda do cliente
│   │   │   └── Register.jsx
│   │   │
│   │   ├── business/                # Páginas do estabelecimento
│   │   │   ├── CompanyProfile.jsx   # Perfil da empresa
│   │   │   ├── EditCompany.jsx      # Editar empresa
│   │   │   ├── NewCompany.jsx       # Criar nova empresa
│   │   │   └── NewService.jsx       # Criar novo serviço
│   │   │
│   │   ├── Contact.jsx              # Página Sobre/Contato
│   │   ├── Home.jsx                 # Página inicial
│   │   └── Services.jsx             # Catálogo de serviços
│   │
│   ├── services/                    # Camada de serviços/API
│   │   ├── api/                     # Módulos de API organizados
│   │   │   ├── auth.js              # Autenticação
│   │   │   ├── avaliacoes.js        # Avaliações
│   │   │   ├── categorias.js        # Categorias
│   │   │   ├── clientes.js          # Clientes
│   │   │   ├── config.js            # Configuração da API
│   │   │   ├── enderecos.js         # Endereços
│   │   │   ├── estabelecimentos.js  # Estabelecimentos
│   │   │   ├── imagens.js           # Upload/gerenciamento de imagens
│   │   │   ├── index.js             # Exportações centralizadas
│   │   │   ├── pedidos.js           # Pedidos/contratos
│   │   │   ├── profissionais.js     # Profissionais
│   │   │   ├── servicos.js          # Serviços
│   │   │   ├── subcategorias.js     # Subcategorias
│   │   │   └── utils.js             # Utilitários API
│   │   │
│   │   └── apiService.js            # Re-exportações (compatibilidade)
│   │
│   ├── styles/                      # Estilos CSS
│   │   ├── CompanyProfile.css
│   │   ├── EditCompany.css
│   │   ├── global.css               # Estilos globais
│   │   ├── HeroUICustom.css         # Customizações HeroUI
│   │   ├── NewCompany.css
│   │   └── Profile.css
│   │
│   ├── utils/                       # Utilitários gerais
│   │   └── cache.js                 # Sistema de cache para otimização
│   │
│   ├── App.jsx                      # Componente raiz + rotas
│   └── main.jsx                     # Entry point da aplicação
│
├── index.html                       # HTML base
├── package.json                     # Dependências e scripts
├── vite.config.js                   # Configuração Vite + proxy API
├── tailwind.config.js               # Configuração Tailwind CSS
├── postcss.config.js                # Configuração PostCSS
├── eslint.config.js                 # Configuração ESLint
└── README.md                        # Documentação do projeto
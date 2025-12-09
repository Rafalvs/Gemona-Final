***FrontEnd***

Tecnologias:
Código: React 19.1.1 (Javascript) / React Router DOM 7.9.1 / Vite 7.1.9
Design: HeroUI 2.8.5 (componentes) / Tailwind 3.4.18 (framework) / Framer Motion 12.23.25 (animações) / Lucide React 0.555.0 (ícones)  / Font Awesome 7.1.0 (ícones)

Ferramentas:
ESLint 9.33.0 (limpeza do código)
JSON Server (Serviu para todos testes e protótipos feitos com dados mockados antes da API estar completa)

Arquitetura:
Páginas conectadas por um sistema de roteamento de react (router), utilizamos contextos para gerenciar os estados dos usuários nas páginas (se está logado ou não e como isso afeta a usabilidade), sistema de cache para otimizar performance e carregamentos das páginas, consumo da Gemona-API para comunicação com o banco e alterações diretas nele.
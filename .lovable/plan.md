

# GST Sourcing Manager — Sistema de Gestão de Projetos

## Visão Geral
Sistema completo de gestão de procurement/sourcing com dashboard executivo, gestão de pacotes e part numbers. Interface em português, tema escuro industrial, dados mock iniciais.

---

## Estrutura & Navegação
- **Sidebar persistente** (Deep Slate #0F172A) com logo "GST Sourcing Manager" e links: Visão Geral, Pacotes, Part Numbers
- **Header** com trigger do sidebar e botão "Exportar" (Excel + PDF)
- **Autenticação** com Supabase (login/senha), tela de login/cadastro, reset de senha

---

## Página 1 — Visão Geral
- **4 KPI Cards** no topo: Total Projetos, Pacotes GST, Part Numbers, Progresso Médio
- **Cards de Projeto** (grid 3 colunas): nome, status badge (Em Andamento/Planejamento/Finalizado), contagem de pacotes e PNs, barra de progresso com percentual
- **Cards clicáveis** → abre página dedicada do projeto com:
  - Dashboard com gráficos: Commodity by Phase (barras empilhadas), Prediction Target (donut), Current Phase Target (barras horizontais), Packages Closed by Month (área)
  - Tabs internas: Visão Geral, Pacotes do projeto, PNs do projeto
- **Hover effects**: elevação sutil nos cards, transições rápidas (<200ms)

## Página 2 — Pacotes
- **Tabela densa** com 13+ colunas: Source Package Number, Descrição, PPM, PB, DM Division, Categoria, Status, Current Phase Target Days Status, Total Weeks, Total Prediction Weeks, Recommendation Prediction Date, TKO, OT, OTOP
- **Lógica de cores semânticas** nas datas TKO/OT/OTOP: verde (done), vermelho (atrasado), neutro (dentro do prazo)
- **Status badges** pill-shaped com cores: Late (rose), At Risk (amber), On Track (emerald), Closed (verde)
- **Barra de filtros** horizontal: DM Division, Status, Projeto, Categoria
- **Busca em tempo real** com input de pesquisa
- **Zebra striping** e hover em linhas

## Página 3 — Part Numbers
- **Tabela densa** com colunas: PN, PN ERA, Projeto, Descrição, PB, Fornecedor, Modal (IRF/Direct Buy/Nacional), Status PO, PO, Previsão Emissão PO, RDA, Status RDA, TPO, Status TPO, Previsão Emissão TPO
- **Indicadores visuais** para status PO/RDA/TPO: Com PO (verde), Pendente (amber), In Process (azul), NA (cinza)
- **Filtros e busca** similares à página de pacotes
- **Estatísticas resumidas** no topo (total PNs, % com PO, pendentes)

---

## Design System
- **Paleta**: Background #0F172A (dark), Cards #1E293B, Success #10B981, Warning #F59E0B, Danger #E11D48
- **Tipografia**: Inter (Medium para labels, Semi-Bold para KPIs)
- **Componentes**: Cards flat sem sombras pesadas, badges pill-shaped, tabelas compactas com sticky headers
- **Gráficos**: Recharts para donut, barras empilhadas, barras horizontais, gráfico de área

## Dados Mock
- 3 projetos de exemplo (Alpha SUV 2026, Beta Sedan 2027, Gamma Pickup 2026)
- ~15 pacotes com dados realistas de sourcing
- ~20 part numbers com status variados


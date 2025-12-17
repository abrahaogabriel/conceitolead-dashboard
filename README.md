# 🚀 Conceito Lead Dashboard

Bem-vindo ao repositório do **Hub Conceito Lead**.
Este projeto é a plataforma central de operações da **Conceito Lead**, focada em gestão de performance comercial, controle de acesso de clientes e visualização de dados estratégicos.

> **Para AIs e Devs:** Este documento serve como o "Source of Truth" sobre o propósito, arquitetura e regras de negócio do sistema.

---

## 🏢 Sobre a Conceito Lead (Business Context)

A **Conceito Lead** opera gerenciando clientes e performance de vendas. O Dashboard serve três propósitos principais:
1.  **Gestão de Vendas (Gamificação):** Permitir que vendedores acompanhem suas metas diárias, comissões ("Níveis") e pacing de vendas em tempo real.
2.  **Gestão de Acessos:** Centralizar credenciais e acessos de clientes de forma segura.
3.  **Visão Administrativa:** Permitir que gestores acompanhem o macro (equipe) e o micro (individual) de cada vendedor.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando tecnologias modernas visando performance e escalabilidade:

*   **Frontend Framework:** React 18 + Vite.
*   **Linguagem:** TypeScript (Strict Mode).
*   **Backend / Database:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Edge Functions).
*   **Estilização:** CSS Modules (Scultped CSS) + Variáveis CSS Globais (Tema Verde/Dark).
*   **Bibliotecas Chave:**
    *   `recharts`: Para visualização de dados (Gráficos de evolução, pizza).
    *   `lucide-react`: Ícones consistentes.
    *   `date-fns` (ou nativo `Intl`): Manipulação de datas e moedas.

---

## 🔑 Estrutura e Funcionalidades

### 1. Autenticação e Perfis (Supabase Auth)
O sistema utiliza **Role-Based Access Control (RBAC)** via tabela `profiles`:
*   **`admin`**: Acesso total (Ver todos os vendedores, editar usuários, ver financeiro global).
*   **`sales`** (Vendedor): Vê apenas suas próprias metas, leads e comissões.
*   **`client`** (Cliente): Acesso restrito a dashboards de visualização (em desenvolvimento).

### 2. Página de Metas (`/sales-goals` | `SalesGoals.tsx`)
O coração da gamificação comercial.
*   **Conceito de Pacing:** A meta não é estática. 
    *   *Dias Passados:* Mostra a meta que deveria ter sido cumprida (Estática). Se bateu = Verde, Se não = Vermelho.
    *   *Hoje:* Mostra uma meta fixa calculada no início do dia (Saldo Restante / Dias Restantes).
    *   *Futuro:* Mostra a projeção dinâmica necessária para alcançar o objetivo no fim do mês (Bola de Neve).
*   **Níveis (Tiers):** Sistema de comissões progressivas (T1=0.9%, T2=1.0%... até T4=1.5%) baseado na % da meta atingida.
*   **Filtro Admin:** Administradores podem filtrar a visão por vendedor específico ou ver o acumulado geral.

### 3. Dashboard Principal (`/` | `Dashboard.tsx`)
Visão geral rápida com "Top Clientes" e atalhos para funcionalidades frequentes.

### 4. Gestão de Acessos (`/access-data`)
CRUD seguro para armazenar logins e senhas de ferramentas dos clientes.

---

## 🎨 Design System e UI

A identidade visual é **Premium e Corporativa**, com foco na cor **Verde Conceito Lead** (`#10b981` primary).
*   **Regra de Ouro:** Evitar interfaces genéricas. Usar sombras suaves, bords radius consistentes e tipografia limpa (Inter/Roboto).
*   **Feedback Visual:** O uso de cores (Verde/Vermelho) deve ser semântico para indicar sucesso ou atenção nas metas.

---

## ⚙️ Configuração Local

1.  **Clone o repositório:**
    ```bash
    git clone <repo-url>
    ```
2.  **Instale dependências:**
    ```bash
    npm install
    ```
3.  **Configuração de Ambiente (.env):**
    Crie um arquivo `.env` na raiz com as chaves do Supabase:
    ```env
    VITE_SUPABASE_URL=seu_supabase_url
    VITE_SUPABASE_ANON_KEY=sua_anon_key
    ```
4.  **Execute:**
    ```bash
    npm run dev
    ```

---
*Documentação gerada pela IA Antigravity - Dezembro/2025*

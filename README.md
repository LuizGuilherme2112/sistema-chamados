# Central de Chamados

Sistema de abertura de chamados de TI. Funcionários abrem chamados; a TI gerencia
prioridade, categoria, status e responsável.

## Passo a passo para colocar no ar

### 1. Criar o banco de dados (Supabase — gratuito)

1. Acesse https://supabase.com e crie uma conta gratuita.
2. Clique em "New project", dê um nome (ex: `central-chamados`) e escolha uma senha
   para o banco (guarde-a, mas não vai precisar dela no dia a dia).
3. Aguarde o projeto ser criado (1-2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase-setup.sql` (nesta pasta), copie todo o conteúdo, cole no
   editor e clique em **Run**. Isso cria a tabela de chamados.
6. Vá em **Project Settings** → **API**. Copie:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (uma chave longa)

### 2. Configurar o projeto

1. Extraia o arquivo .zip em uma pasta no seu computador.
2. Renomeie `.env.example` para `.env`.
3. Abra o `.env` e cole os valores que você copiou do Supabase:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-aqui
   ```

### 3. Testar localmente (opcional, mas recomendado)

Requer [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente `http://localhost:5173`) e
teste o sistema.



### 5. Uso no dia a dia

- Cada pessoa que acessar o link escolhe um nome e se é "Funcionário" ou "TI"
  (fica salvo só no navegador dela).
- Não existe senha/login corporativo nesta versão — é um controle por confiança,
  adequado para uso interno inicial. Se depois quiser adicionar login de verdade,
  dá para evoluir com Supabase Auth.

## Estrutura do projeto

```
central-de-chamados/
├── src/
│   ├── App.jsx           → interface completa (funcionário + TI)
│   ├── main.jsx          → ponto de entrada do React
│   ├── supabaseClient.js → conexão com o banco
│   ├── ticketsApi.js     → funções de ler/criar/atualizar chamados
│   └── index.css
├── supabase-setup.sql    → script para criar a tabela no Supabase
├── .env.example          → modelo do arquivo de variáveis (renomeie para .env)
└── package.json
```

## Dúvidas comuns

**"Configure VITE_SUPABASE_URL..." aparece no console**
→ O arquivo `.env` não foi criado ou está com valores errados. Confira o passo 2.

**Quero mudar cores, campos ou textos**
→ Edite `src/App.jsx`. As cores estão centralizadas no objeto `COLORS` no topo do
arquivo.



# ai-school-financial-app

App de modelagem financeira interativa para o projeto AI School Brazil (educação K-12 com IA): dashboard de projeções de 10 anos, controles dinâmicos de parâmetros, unit economics e modo de apresentação para investidores. SPA client-side, sem backend.

## Stack

- **Linguagem:** JavaScript (JSX), ES modules (`"type": "module"`).
- **Framework:** React 18 + **Vite 5**.
- **Estilo:** Tailwind CSS 3 (+ PostCSS/autoprefixer). Ícones Lucide React.
- **Gráficos/planilhas:** Recharts; `exceljs` + `xlsx` + `file-saver` para export.
- **Banco:** nenhum. Persistência via `localStorage` no navegador.
- **Deploy:** Vercel (`framework: null`, output `dist`).
- **Package manager:** npm.

Há também `.claude/skills/` com agentes `cfo-agent` e `financial-planner-agent` (ver `.claude.json`).

## Comandos

Do `package.json`:

- `npm run dev` — Vite dev server (porta 3000, host exposto).
- `npm run build` — build de produção em `dist/`.
- `npm run preview` — pré-visualiza o build.
- `npm run lint` — ESLint (`--max-warnings 0`) sobre `.js`/`.jsx`.

Não há suíte de testes.

## Estrutura

- `src/main.jsx` — entrypoint React.
- `src/App.jsx` — app raiz.
- `src/components/` — telas: `IntegratedDashboard`, `Dashboard`, `CashFlow`, `UnitEconomics`, `AllExpenses`, `PublicPartnerships`, `PresentationMode`, `YearByYearEditor`, modais (`MonthDetailModal`, `ExpenseDetailModal`), `ExportButton`, `ErrorBoundary`, `ParameterControl`.
- `src/utils/` — `financialModel.js` (motor de cálculo), `connectionBridge.js`, `integrationService.js`.
- `index.html` — shell Vite. `generate-financial-spreadsheet.cjs` — script Node que gera a planilha Excel do plano.
- `AI_School_Brazil_10Year_Financial_Plan.xlsx` — plano financeiro de referência.

## Convenções de código

- React funcional com hooks; sem TypeScript (JS/JSX puro).
- ESLint com `eslint-plugin-react`, `react-hooks`, `react-refresh`; regra `--max-warnings 0` → warnings quebram o lint, mantenha limpo.
- Tailwind com paleta custom (`primary`/`success`/`warning`) em `tailwind.config.js` — reutilize os tokens em vez de cores hardcoded.
- Toda lógica de números vive em `src/utils/financialModel.js`; componentes só consomem/apresentam.

## Variáveis de ambiente

App puramente client-side — nenhuma env obrigatória hoje. Se adicionar chaves, use o prefixo `VITE_` (exigido pelo Vite para expor ao cliente) e configure na Vercel. Lembre: tudo com `VITE_` vai para o bundle público — **não** coloque segredos aí.

## CI/CD & Deploy

Sem workflows em `.github/`. Deploy pela integração Vercel a partir da `main` (build `npm run build`, output `dist`).

Recomendado (via PR): workflow mínimo rodando `npm ci` + `npm run lint` + `npm run build` em push/PR para `main`, para não depender só do build da Vercel.

## Boas práticas de PR

- Branches: `feat/...`, `fix/...`, `chore/...`.
- Conventional Commits.
- PRs pequenos e focados; ao mexer no modelo financeiro, explique premissas alteradas.
- Checklist: `npm run build` passa, `npm run lint` sem warnings, **sem segredos**, screenshots para mudanças de UI/dashboard/apresentação.
- ≥1 review; squash merge; `main` sempre deployável.

## Testes

Sem testes. Proporcional ao projeto: o candidato natural a testes unitários é `src/utils/financialModel.js` — validar receita/EBITDA/CAPEX por cenário protege contra regressões silenciosas em números mostrados a investidores.

## Segurança & dados

- Nunca commitar `.env`/chaves; qualquer var exposta ao cliente (`VITE_`) é pública.
- Dados são premissas de negócio (não pessoais) — sem implicação direta de LGPD, mas trate o plano financeiro como confidencial.
- Não commitar arquivos temporários do Excel (ex.: `~$*.xlsx`).
- Revisar dependências (`xlsx`, `exceljs`) periodicamente.

## Gotchas

- **Sem backend:** persistência é `localStorage` — dados não são compartilhados entre navegadores/usuários.
- **`start-server.sh`/caminhos absolutos** e o `.cjs` de geração de planilha assumem ambiente local; ajuste antes de rodar em outra máquina.
- **`framework: null` no `vercel.json`** — o deploy depende de `buildCommand`/`outputDirectory` explícitos; não remova.
- `.claude/skills` (cfo-agent, financial-planner-agent) são específicos deste repo — mantenha ao mexer no modelo.

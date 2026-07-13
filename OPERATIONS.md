# Operações — ai-school-financial-app

## 1. O que é

Aplicação web interativa de modelagem financeira do projeto AI School Brazil (educação K-12 com IA): dashboard com projeções de 10 anos, controles de parâmetros em tempo real e modo de apresentação para investidores. Público-alvo: fundadores, investidores e equipe de planejamento do negócio. Status: estável/pausado — sem novos commits desde 2026-04-20 (último ciclo foi a auditoria do plano de negócios); segue no ar como ferramenta de apresentação.

## 2. Onde roda

- **URL de produção:** https://ai-school-financial-app.vercel.app (verificada em 2026-07-12, HTTP 200)
- **Hospedagem:** Vercel, projeto `ai-school-financial-app` (conta conectada ao GitHub `Rruiz270/ai-school-financial-app`)
- **Deploy:** automático — todo push na branch `main` gera deploy de produção; pushes em outras branches geram Preview URLs
- **Build na Vercel** (`vercel.json`): `buildCommand: npm run build`, `outputDirectory: dist`, framework não fixado (app Vite servido como site estático)

## 3. Dados

Sem banco — app estático. Todo o modelo financeiro roda no navegador (`src/utils/financialModel.js`); nada é persistido em servidor. Exportações (Excel/PDF) são geradas no cliente via `exceljs`/`xlsx`/`file-saver`.

## 4. Env vars

Nenhuma. O projeto não usa variáveis de ambiente (não há `.env*` no repo nem leitura de `import.meta.env` no código). Se algum dia precisar, configure em Vercel → Settings → Environment Variables do projeto.

## 5. Como rodar local

Pré-requisito: Node.js 18+ e npm.

```bash
cd /Users/raphaelruiz/Projects/ai-school-financial-app
npm install        # instala dependências
npm run dev        # dev server em http://localhost:3000 (porta fixada no vite.config.js)
npm run build      # build de produção em dist/
npm run preview    # serve o build de dist/ localmente
npm run lint       # ESLint (js/jsx, zero warnings permitidos)
```

## 6. Crons & automations

Nenhum. Não há `.github/workflows/`, nem crons na Vercel — a única automação é o deploy automático por push (GitHub → Vercel).

## 7. Diagnóstico rápido

- **Está no ar?** Abra https://ai-school-financial-app.vercel.app — deve responder HTTP 200 com o dashboard.
- **Deu 404:** o deployment de produção foi removido ou o domínio foi desvinculado. No dashboard da Vercel (projeto `ai-school-financial-app` → aba Deployments), promova o último deployment bom para Production ("Promote to Production").
- **Deu 500 / tela branca:** app é estático, então erro de servidor é raro — normalmente é build quebrado. Veja os Build Logs do último deployment no dashboard da Vercel; se o build falhou, o deploy anterior continua servindo. Corrija e faça push em `main`, ou faça rollback/promote de um deployment anterior.
- **Logs:** dashboard da Vercel → projeto `ai-school-financial-app` → Deployments → (deployment) → Build Logs. Não há runtime logs relevantes (sem funções serverless).
- **Reproduzir localmente:** `npm run build && npm run preview` — se o build falhar local, falhará na Vercel também.

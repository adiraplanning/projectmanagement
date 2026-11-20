# Gestão de Projeto

Site estático (GitHub Pages) com base de dados na cloud (Supabase).
Vários projetos em simultâneo, cada um com as suas próprias tarefas (planeadas, por planear, concluídas).

```
index.html          → lista de projetos (criar, abrir, botão direito → propriedades / estado / duplicar / apagar)
projeto.html        → Gantt Planeado / Real / Progresso / Concluídos de UM projeto (?id=…)
js/config.js        → URL + chave anon do Supabase  ← único ficheiro a editar
js/db.js            → acesso aos dados
supabase/schema.sql → tabela, segurança (RLS) e triggers
_legacy/            → versão antiga (só localStorage). Não é publicada.
```

## 1. Supabase (uma vez)

1. Cria conta/projeto em <https://supabase.com> (região Europa, p.ex. *West EU*).
2. **SQL Editor → New query** → cola o conteúdo de `supabase/schema.sql` → **Run**.
3. **Project Settings → API**: copia *Project URL* e a chave *anon public* para `js/config.js`.

Não há login: quem tiver o link do site vê, edita e apaga projetos.
**Nunca** coloques a chave `service_role` no site.

## 2. GitHub Pages

Sem instalar nada (pelo browser):

1. Em <https://github.com/new> cria um repositório (p.ex. `gestao-projeto`).
2. **Add file → Upload files** → arrasta: `index.html`, `projeto.html`, `adira-logo.png`,
   `.nojekyll`, as pastas `js/` e `supabase/`, e este `README.md`. **Não** envies `_legacy/` nem `.claude/`.
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`** → Save.
4. Ao fim de 1–2 min o site fica em `https://<utilizador>.github.io/gestao-projeto/`.

Nota: GitHub Pages em repositório **privado** exige plano pago (GitHub Pro/Team).

## 3. Trazer os projetos antigos

Na versão antiga: ⚙ → Backup → *Descarregar ficheiro* (um `.json` por projeto).
No site novo: **+ Novo Projeto → "Migrar dados de um ficheiro de backup antigo"** → escolhe o `.json`.

## Como funciona a gravação

- Cada alteração é gravada automaticamente (~1 s). O estado aparece no canto superior direito
  (*Gravado* / *A gravar…* / *Erro*).
- Se duas pessoas alterarem o mesmo projeto ao mesmo tempo, quem gravar em segundo recebe um
  aviso e escolhe entre recarregar a versão atual ou substituir — nada é sobrescrito em silêncio.
- Preferências de vista (separador aberto, página) ficam no browser de cada pessoa.

## Testar sem Supabase

Com `js/config.js` vazio o site corre em **modo local** (dados só nesse browser),
útil para experimentar. Tem de ser aberto através de um servidor (não com duplo-clique).

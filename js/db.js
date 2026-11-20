/* ============================================================
   CAMADA DE DADOS — Supabase (produção) ou Local (testes)
   Uma linha por projeto: { id, name, client, description, status,
   data: { pieces, workSaturdays }, created_at, updated_at }
   Acesso aberto (sem login).
   ============================================================ */
(function () {
  'use strict';

  const cfg = window.APP_CONFIG || {};
  const hasSupabase = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  const COLUMNS = 'id,name,client,description,status,data,created_at,updated_at';
  const EMPTY_DATA = () => ({ pieces: [], workSaturdays: [] });

  function conflictError() {
    const e = new Error('O projeto foi alterado por outra pessoa entretanto.');
    e.conflict = true;
    return e;
  }

  /* ---------------- Supabase ---------------- */
  function SupabaseBackend() {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Biblioteca Supabase não carregou (verifica a ligação à internet).');
    }
    const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const ok = ({ data, error }) => { if (error) throw error; return data; };

    return {
      mode: 'supabase',
      async listProjects() {
        return ok(await sb.from('projects').select(COLUMNS).order('updated_at', { ascending: false }));
      },
      async getProject(id) {
        return ok(await sb.from('projects').select(COLUMNS).eq('id', id).maybeSingle());
      },
      async createProject(fields) {
        const row = Object.assign({ status: 'ativo', data: EMPTY_DATA() }, fields);
        return ok(await sb.from('projects').insert(row).select(COLUMNS).single());
      },
      /* expectedUpdatedAt: se indicado, só grava se ninguém alterou entretanto. */
      async updateProject(id, patch, expectedUpdatedAt) {
        let q = sb.from('projects').update(patch).eq('id', id);
        if (expectedUpdatedAt) q = q.eq('updated_at', expectedUpdatedAt);
        const row = ok(await q.select(COLUMNS).maybeSingle());
        if (!row) throw conflictError();
        return row;
      },
      async deleteProject(id) {
        ok(await sb.from('projects').delete().eq('id', id));
      }
    };
  }

  /* ---------------- Local (sem Supabase configurado) ---------------- */
  function LocalBackend() {
    const KEY = 'gp_local_projects_v1';
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
    const write = (rows) => localStorage.setItem(KEY, JSON.stringify(rows));
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
        }));

    return {
      mode: 'local',
      async listProjects() {
        return clone(read()).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      },
      async getProject(id) { return clone(read().find(r => r.id === id) || null); },
      async createProject(fields) {
        const now = new Date().toISOString();
        const row = Object.assign({ status: 'ativo', data: EMPTY_DATA(), client: null, description: null }, clone(fields), {
          id: uuid(), created_at: now, updated_at: now
        });
        const rows = read(); rows.push(row); write(rows);
        return clone(row);
      },
      async updateProject(id, patch, expectedUpdatedAt) {
        const rows = read();
        const row = rows.find(r => r.id === id);
        if (!row || (expectedUpdatedAt && row.updated_at !== expectedUpdatedAt)) throw conflictError();
        Object.assign(row, clone(patch), { updated_at: new Date().toISOString() });
        write(rows);
        return clone(row);
      },
      async deleteProject(id) { write(read().filter(r => r.id !== id)); }
    };
  }

  window.DB = hasSupabase ? SupabaseBackend() : LocalBackend();
  window.DB.EMPTY_DATA = EMPTY_DATA;
})();

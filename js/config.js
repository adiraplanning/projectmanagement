/* ============================================================
   CONFIGURAÇÃO SUPABASE
   Supabase → Project Settings → API:
     - "Project URL"            → SUPABASE_URL
     - "anon public" API key    → SUPABASE_ANON_KEY
   A chave anon é pública por natureza (fica visível no site);
   os dados ficam protegidos pelo login + RLS (ver supabase/schema.sql).

   Enquanto estes valores estiverem vazios, a app corre em
   MODO LOCAL (dados só neste browser) — útil para testar.
   ============================================================ */
window.APP_CONFIG = {
  SUPABASE_URL: 'https://ymuoftryfyghtqbrluxd.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_DU_RawGX_UAqgevR86_-hg_xsfSfFiS'
};

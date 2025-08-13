
# Migração para Supabase Self-Hosted

## Informações do Ambiente

**URL Base:** https://dados.portalhikvision.com.br
**Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

## Dashboard de Administração
**Username:** supabase
**Password:** jeninha2399

## Próximos Passos

1. ✅ Cliente Supabase atualizado em `src/integrations/supabase/client.ts`
2. ✅ Configuração do projeto atualizada em `supabase/config.toml`

### Verificações Necessárias:

1. **Edge Functions:** Verifique se as edge functions `send-firmware-request` e `upload-contabo` estão funcionando no novo ambiente
2. **Storage:** Confirme se os buckets (banners, produtos, arquivos, teste) foram migrados corretamente
3. **Secrets:** Configure os secrets no novo Supabase:
   - CONTABO_S3_ENDPOINT
   - CONTABO_S3_ACCESS_KEY_ID
   - CONTABO_S3_SECRET_ACCESS_KEY
   - CONTABO_S3_BUCKET
   - CONTABO_S3_REGION
   - RESEND_API_KEY

### Testagens Recomendadas:

- [ ] Login de usuário
- [ ] Listagem de produtos
- [ ] Upload de arquivos
- [ ] Solicitação de firmware (formulário "Não Encontrei")
- [ ] Download de arquivos
- [ ] Painel administrativo

## URLs Importantes

- **Dashboard:** https://dados.portalhikvision.com.br/dashboard
- **API:** https://dados.portalhikvision.com.br/rest/v1/
- **Auth:** https://dados.portalhikvision.com.br/auth/v1/
- **Storage:** https://dados.portalhikvision.com.br/storage/v1/

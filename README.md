# AppCondomínio — Mansão Heitor Villa Lobos

Sistema de gestão de condomínio self-hosted: encomendas, reservas, reconhecimento facial e WhatsApp.

## Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend:** NestJS + Prisma
- **Banco:** PostgreSQL
- **WhatsApp:** Evolution API
- **Fotos:** Google Drive API (Service Account)
- **Exposição:** Cloudflare Tunnel → `mhvl.com.br`

---

## Instalação no LXC Debian (Proxmox)

```bash
curl -fsSL https://raw.githubusercontent.com/Strawyeye59900z/APPMHVL3/main/install.sh | bash
```

O script instala Node.js, PostgreSQL, Nginx, PM2 e cloudflared automaticamente.

---

## Cloudflare Tunnel

O Tunnel conecta o servidor local ao domínio `mhvl.com.br` sem abrir portas no roteador.

### 1. Criar o Tunnel no painel Cloudflare

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → seu domínio `mhvl.com.br`
2. Menu **Zero Trust** → **Networks** → **Tunnels** → **Create a tunnel**
3. Nomeie: `mhvl-lxc` → clique **Save tunnel**
4. Copie o **token** exibido na tela (começa com `eyJ...`)

### 2. Configurar o Tunnel no LXC

No terminal do LXC (como root):

```bash
cloudflared service install <TOKEN_COPIADO>
systemctl enable cloudflared
systemctl start cloudflared
```

### 3. Adicionar rotas no painel Cloudflare

Ainda na tela do Tunnel, clique **Add a public hostname**:

| Subdomínio | Domínio     | Tipo | URL                    |
|------------|-------------|------|------------------------|
| (vazio)    | mhvl.com.br | HTTP | `localhost:80`         |

Salve. Em 30 segundos `https://mhvl.com.br` já estará no ar com HTTPS automático.

---

## Atualização

```bash
bash /opt/appcondominio/update.sh
```

---

## Configurações pós-instalação obrigatórias

Edite `/opt/appcondominio/backend/.env`:

### Evolution API (WhatsApp)
```env
EVOLUTION_API_URL="http://localhost:8080"   # ou IP da sua instância
EVOLUTION_API_KEY="sua-chave"
EVOLUTION_INSTANCE="portaria"
```

### Google Drive (fotos faciais)
1. Google Cloud Console → criar projeto → ativar **Drive API**
2. Criar **Service Account** → baixar JSON de credenciais
3. Salvar em `/opt/appcondominio/backend/google-credentials.json`
4. Criar pasta no Drive → compartilhar com o e-mail da Service Account
5. Copiar o ID da pasta (na URL do Drive) e colocar em:
```env
GOOGLE_DRIVE_ROOT_FOLDER_ID="1AbC..."
```

Após editar o `.env`: `pm2 restart mhvl-backend`

---

## Acesso inicial

| Perfil | Login | Senha |
|--------|-------|-------|
| Síndico | admin@condominio.local | admin123 |

**Troque a senha do admin imediatamente após o primeiro login.**

---

## PM2 — comandos úteis

```bash
pm2 status                    # ver processos
pm2 logs mhvl-backend         # logs do backend
pm2 logs mhvl-frontend        # logs do frontend
pm2 restart mhvl-backend      # reiniciar backend
```

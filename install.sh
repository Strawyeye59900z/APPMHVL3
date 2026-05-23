#!/usr/bin/env bash
# ============================================================
# install.sh — AppCondomínio (Mansão Heitor Villa Lobos)
# Debian LXC no Proxmox · domínio mhvl.com.br via Cloudflare Tunnel
#
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/Strawyeye59900z/APPMHVL3/main/install.sh | bash
# ============================================================
set -euo pipefail

REPO="https://github.com/Strawyeye59900z/APPMHVL3.git"
APP_DIR="/opt/appcondominio"
NODE_VERSION="20"
DB_NAME="appcondominio"
DB_USER="appcondominio"
DB_PASS="$(openssl rand -hex 16)"
DOMAIN="mhvl.com.br"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[install]${NC} $*"; }
info() { echo -e "${CYAN}[info]${NC}    $*"; }
warn() { echo -e "${YELLOW}[aviso]${NC}  $*"; }
die()  { echo -e "${RED}[erro]${NC}   $*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Execute como root"

# ── 1. Pacotes base ──────────────────────────────────────────
log "Atualizando pacotes..."
apt-get update -qq
apt-get install -y -qq curl git postgresql postgresql-client openssl ca-certificates gnupg nginx

# ── 2. Node.js 20 via NodeSource ────────────────────────────
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt "$NODE_VERSION" ]]; then
  log "Instalando Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
log "Node: $(node -v) · NPM: $(npm -v)"

# ── 3. PM2 global ───────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  log "Instalando PM2..."
  npm install -g pm2
fi

# ── 4. PostgreSQL ────────────────────────────────────────────
log "Configurando PostgreSQL..."
service postgresql start || true
sleep 2

su -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'\"" postgres | grep -q 1 || \
  su -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';\"" postgres

su -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='$DB_NAME'\"" postgres | grep -q 1 || \
  su -c "psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\"" postgres

# ── 5. Clonar repositório ────────────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
  log "Repositório já existe — rodando update.sh..."
  bash "$APP_DIR/update.sh"
  exit 0
fi

log "Clonando repositório..."
git clone "$REPO" "$APP_DIR"
cd "$APP_DIR"

# ── 6. Variáveis de ambiente ─────────────────────────────────
if [ ! -f "$APP_DIR/backend/.env" ]; then
  JWT_SECRET="$(openssl rand -hex 32)"
  cat > "$APP_DIR/backend/.env" <<EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public"
PORT=3001
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="7d"
MAX_PHOTO_BYTES=1048576

# ── Preencha após configurar a Evolution API ──
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="sua-chave-evolution"
EVOLUTION_INSTANCE="portaria"

# ── Preencha com o Google Service Account ──
GOOGLE_CREDENTIALS_PATH="/opt/appcondominio/backend/google-credentials.json"
GOOGLE_DRIVE_ROOT_FOLDER_ID="id-da-pasta-raiz"
EOF
  warn "Edite $APP_DIR/backend/.env com as credenciais do WhatsApp e Google Drive."
fi

cat > "$APP_DIR/frontend/.env.local" <<EOF
NEXT_PUBLIC_API_URL="https://$DOMAIN"
EOF

# ── 7. Backend ───────────────────────────────────────────────
log "Instalando dependências do backend..."
cd "$APP_DIR/backend"
npm install

log "Compilando backend..."
npm run build

log "Gerando Prisma client..."
npx prisma generate

log "Aplicando migrations..."
npx prisma migrate deploy

log "Seed inicial..."
npx prisma db seed || warn "Seed ignorado (dados já existem)"

# ── 8. Frontend ──────────────────────────────────────────────
log "Instalando dependências do frontend..."
cd "$APP_DIR/frontend"
npm install

log "Build do frontend..."
npm run build

# ── 9. PM2 ──────────────────────────────────────────────────
log "Configurando PM2..."
cat > "$APP_DIR/ecosystem.config.js" <<'EOF'
module.exports = {
  apps: [
    {
      name: 'mhvl-backend',
      cwd: '/opt/appcondominio/backend',
      script: 'npm',
      args: 'run start:prod',
      env: { NODE_ENV: 'production' },
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'mhvl-frontend',
      cwd: '/opt/appcondominio/frontend',
      script: 'npm',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: '3000' },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
EOF

pm2 delete mhvl-backend mhvl-frontend 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ── 10. Nginx como proxy local ───────────────────────────────
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/mhvl <<EOF
server {
    listen 80;
    server_name localhost 192.168.10.20;

    # API backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 5M;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/mhvl /etc/nginx/sites-enabled/mhvl
rm -f /etc/nginx/sites-enabled/default
nginx -t && service nginx restart

# ── 11. Cloudflared (Cloudflare Tunnel) ──────────────────────
if ! command -v cloudflared &>/dev/null; then
  log "Instalando cloudflared..."
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" \
    > /etc/apt/sources.list.d/cloudflared.list
  apt-get update -qq && apt-get install -y cloudflared
fi

# ── 12. Resumo ───────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   AppCondomínio instalado com sucesso!   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  App local   : http://192.168.10.20"
echo -e "  Domínio     : https://$DOMAIN  (após configurar o Tunnel)"
echo -e "  Admin login : admin@condominio.local / admin123"
echo ""
echo -e "${YELLOW}PRÓXIMO PASSO OBRIGATÓRIO:${NC}"
echo -e "  Configure o Cloudflare Tunnel — veja as instruções:"
echo -e "  https://github.com/Strawyeye59900z/APPMHVL3#cloudflare-tunnel"
echo ""
echo -e "${YELLOW}Credenciais do banco (salve em local seguro):${NC}"
echo -e "  postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
echo ""
pm2 status

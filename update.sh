#!/usr/bin/env bash
# ============================================================
# update.sh — AppCondomínio
# Atualiza código, dependências, migrations e reinicia PM2.
# Uso: bash /opt/appcondominio/update.sh
# ============================================================
set -euo pipefail

APP_DIR="/opt/appcondominio"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[update]${NC} $*"; }
warn() { echo -e "${YELLOW}[aviso]${NC}  $*"; }
die()  { echo -e "${RED}[erro]${NC}   $*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Execute como root"
[ -d "$APP_DIR/.git" ] || die "$APP_DIR não é um repositório git. Execute install.sh primeiro."

cd "$APP_DIR"

log "Verificando atualizações..."
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  log "Já na versão mais recente ($(git rev-parse --short HEAD))."
  exit 0
fi

log "$(git rev-parse --short HEAD) → $(git rev-parse --short origin/main)"
git pull --rebase origin main

# Backend
log "Atualizando backend..."
cd "$APP_DIR/backend"
npm install
npm run build
npx prisma generate
npx prisma migrate deploy

# Frontend
log "Atualizando frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# Reiniciar
log "Reiniciando via PM2..."
cd "$APP_DIR"
pm2 reload ecosystem.config.js --update-env

echo ""
echo -e "${GREEN}Atualização concluída! Versão: $(git rev-parse --short HEAD)${NC}"
pm2 status

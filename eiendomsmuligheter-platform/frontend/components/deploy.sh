#!/bin/bash

# Eiendomsmuligheter Platform Deployment Script
# This script automates the deployment of the Eiendomsmuligheter platform to production

# Exit on error
set -e

# Configuration
DOMAIN="eiendomsmuligheter.no"
REPO_URL="https://github.com/Eiendomsmuligheter/eiendom-04.04.git"
BRANCH="main"
DEPLOY_DIR="/var/www/$DOMAIN"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR"
LOGS_DIR="/var/log/eiendomsmuligheter"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
SYSTEMD_SERVICE="/etc/systemd/system/eiendomsmuligheter.service"
PYTHON_VERSION="3.10"
NODE_VERSION="16"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Eiendomsmuligheter Deployment Script  ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Create deployment directory
echo -e "${YELLOW}Creating deployment directory...${NC}"
mkdir -p $DEPLOY_DIR
mkdir -p $LOGS_DIR

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
apt-get update
apt-get install -y nginx python$PYTHON_VERSION python$PYTHON_VERSION-venv python3-pip \
                   nodejs npm git certbot python3-certbot-nginx

# Clone or update repository
if [ -d "$DEPLOY_DIR/.git" ]; then
  echo -e "${YELLOW}Updating existing repository...${NC}"
  cd $DEPLOY_DIR
  git fetch
  git checkout $BRANCH
  git pull
else
  echo -e "${YELLOW}Cloning repository...${NC}"
  git clone $REPO_URL $DEPLOY_DIR
  cd $DEPLOY_DIR
  git checkout $BRANCH
fi

# Setup backend
echo -e "${YELLOW}Setting up backend...${NC}"
cd $BACKEND_DIR
python$PYTHON_VERSION -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create backend configuration
echo -e "${YELLOW}Creating backend configuration...${NC}"
cat > $BACKEND_DIR/config.py << EOF
# Production configuration
DEBUG = False
SECRET_KEY = '$(openssl rand -hex 24) '
ALLOWED_HOSTS = ['$DOMAIN', 'www.$DOMAIN', 'api.$DOMAIN']
DATABASE_URI = 'sqlite:///eiendomsmuligheter.db'
LOG_FILE = '$LOGS_DIR/backend.log'
EOF

# Setup frontend
echo -e "${YELLOW}Setting up frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build

# Create systemd service for backend
echo -e "${YELLOW}Creating systemd service...${NC}"
cat > $SYSTEMD_SERVICE << EOF
[Unit]
Description=Eiendomsmuligheter Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=$BACKEND_DIR
ExecStart=$BACKEND_DIR/venv/bin/python app.py
Restart=always
Environment="PYTHONPATH=$BACKEND_DIR"
Environment="FLASK_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
echo -e "${YELLOW}Creating Nginx configuration...${NC}"
cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root $FRONTEND_DIR/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static {
        alias $FRONTEND_DIR/build/static;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location /media {
        alias $DEPLOY_DIR/media;
    }

    access_log $LOGS_DIR/access.log;
    error_log $LOGS_DIR/error.log;
}
EOF

# Enable and configure services
echo -e "${YELLOW}Enabling and configuring services...${NC}"
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
systemctl enable eiendomsmuligheter.service
systemctl daemon-reload
systemctl restart eiendomsmuligheter.service
systemctl restart nginx

# Setup SSL with Certbot
echo -e "${YELLOW}Setting up SSL with Certbot...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Set permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chown -R www-data:www-data $DEPLOY_DIR
chown -R www-data:www-data $LOGS_DIR
chmod -R 755 $DEPLOY_DIR

# Final message
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Deployment completed successfully!     ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "Website: https://$DOMAIN"
echo -e "Backend API: https://$DOMAIN/api"
echo -e "Logs: $LOGS_DIR"
echo ""
echo -e "${YELLOW}Don't forget to:${NC}"
echo -e "1. Update DNS records to point to this server"
echo -e "2. Configure firewall to allow HTTP (80)  and HTTPS (443)"
echo -e "3. Set up regular backups"
echo ""

# Kleine webserver (Caddy) om de app op Railway te tonen; Railway geeft de poort mee in $PORT
FROM caddy:2.8-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html style.css app.js sw.js manifest.json logo.jpg /srv/

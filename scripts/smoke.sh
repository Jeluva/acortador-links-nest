#!/usr/bin/env bash
# Prueba de humo: levanta el build, recorre el flujo completo y falla si algo no responde como se espera.
set -euo pipefail
PORT=3999; export PORT LINKS_FILE="$(mktemp -u).json"
node dist/main.js >/dev/null 2>&1 & PID=$!
trap 'kill $PID 2>/dev/null; rm -f "$LINKS_FILE"' EXIT
for _ in $(seq 30); do curl -s localhost:$PORT/stats >/dev/null && break; sleep 0.3; done
B=localhost:$PORT; J='content-type: application/json'
check() { [ "$2" = "$3" ] && echo "ok   $1" || { echo "FALLO $1: esperado $3, obtuvo $2"; exit 1; }; }
check "crear con alias"   "$(curl -s -o /dev/null -w '%{http_code}' -XPOST $B/links -H "$J" -d '{"url":"https://example.com/a","alias":"demo"}')" 201
check "redireccion"       "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' $B/demo)" "302 https://example.com/a"
check "cuenta clicks"     "$(curl -s $B/links/demo | grep -o '"clicks":[0-9]*')" '"clicks":1'
check "alias repetido"    "$(curl -s -o /dev/null -w '%{http_code}' -XPOST $B/links -H "$J" -d '{"url":"https://b.com","alias":"demo"}')" 409
check "url invalida"      "$(curl -s -o /dev/null -w '%{http_code}' -XPOST $B/links -H "$J" -d '{"url":"nada"}')" 400
check "estadisticas"      "$(curl -s $B/stats | grep -o '"totalClicks":[0-9]*')" '"totalClicks":1'
check "borrar"            "$(curl -s -o /dev/null -w '%{http_code}' -XDELETE $B/links/demo)" 204
check "ya no existe"      "$(curl -s -o /dev/null -w '%{http_code}' $B/demo)" 404

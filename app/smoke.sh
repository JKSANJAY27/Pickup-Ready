#!/bin/sh
# Smoke test against a running app: ./smoke.sh [base_url]
B=${1:-http://localhost:3000}
set -e
curl -fsS "$B/api/health" | grep -q ok && echo "health ok"
curl -fsS "$B/" | grep -q "Pickup Ready" && echo "main screen ok"
curl -fsS "$B/api/config" && echo
curl -fsS -XPOST "$B/api/call/turn" -H 'content-type: application/json' -d '{"retailer_id":1,"text":"2 urad dal"}' && echo

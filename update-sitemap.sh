#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  AUTH_TOKEN=... ./sitemap-reindex.sh --org ORG --site SITE --ref main --sitemap-file ./sitemap.yaml [--index-path query-index.json]

Required:
  AUTH_TOKEN      Admin API key (sent as Authorization: token ...)

Options:
  --org           Organization name
  --site          Site id
  --ref           Git branch/ref (default: main)
  --sitemap-file  Path to local sitemap YAML file
  --index-path    Index resource to publish (default: query-index.json)

Example:
  AUTH_TOKEN='...' ./sitemap-reindex.sh \
    --org adobe \
    --site my-site \
    --ref main \
    --sitemap-file ./sitemap.yaml
EOF
}

ORG=""
SITE=""
REF="main"
SITEMAP_FILE=""
INDEX_PATH="query-index.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --org) ORG="${2:-}"; shift 2 ;;
    --site) SITE="${2:-}"; shift 2 ;;
    --ref) REF="${2:-}"; shift 2 ;;
    --sitemap-file) SITEMAP_FILE="${2:-}"; shift 2 ;;
    --index-path) INDEX_PATH="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "${AUTH_TOKEN:-}" ]]; then
  echo "AUTH_TOKEN is required." >&2
  exit 1
fi

if [[ -z "$ORG" || -z "$SITE" || -z "$SITEMAP_FILE" ]]; then
  echo "--org, --site, and --sitemap-file are required." >&2
  usage
  exit 1
fi

if [[ ! -f "$SITEMAP_FILE" ]]; then
  echo "Sitemap file not found: $SITEMAP_FILE" >&2
  exit 1
fi

AUTH_HEADER="Authorization: token ${AUTH_TOKEN}"

sitemap_url="https://admin.hlx.page/config/${ORG}/sites/${SITE}/content/sitemap.yaml"
reindex_url="https://admin.hlx.page/index/${ORG}/${SITE}/${REF}/${INDEX_PATH}"

call_with_status() {
  local method="$1"
  local url="$2"
  local body_file="${3:-}"
  local tmp_body
  tmp_body="$(mktemp)"
  local code

  if [[ -n "$body_file" ]]; then
    code="$(
      curl -sS -o "$tmp_body" -w "%{http_code}" \
        -X "$method" "$url" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: text/yaml" \
        --data-binary @"$body_file"
    )"
  else
    code="$(
      curl -sS -o "$tmp_body" -w "%{http_code}" \
        -X "$method" "$url" \
        -H "$AUTH_HEADER"
    )"
  fi

  echo "$code"
  cat "$tmp_body"
  rm -f "$tmp_body"
}

echo "Updating sitemap config..."
status_and_body="$(call_with_status POST "$sitemap_url" "$SITEMAP_FILE")"
status="${status_and_body%%$'\n'*}"
body="${status_and_body#*$'\n'}"

if [[ "$status" == "404" || "$status" == "405" || "$status" == "409" ]]; then
  echo "POST did not apply cleanly (HTTP $status). Trying PUT..."
  status_and_body="$(call_with_status PUT "$sitemap_url" "$SITEMAP_FILE")"
  status="${status_and_body%%$'\n'*}"
  body="${status_and_body#*$'\n'}"
fi

if [[ "$status" != "200" && "$status" != "201" && "$status" != "204" ]]; then
  echo "Sitemap update failed (HTTP $status):" >&2
  echo "$body" >&2
  exit 1
fi

echo "Sitemap config updated (HTTP $status)."

echo "Triggering reindex..."
status_and_body="$(call_with_status POST "$reindex_url")"
status="${status_and_body%%$'\n'*}"
body="${status_and_body#*$'\n'}"

if [[ "$status" != "200" ]]; then
  echo "Reindex trigger failed (HTTP $status):" >&2
  echo "$body" >&2
  exit 1
fi

echo "Reindex triggered successfully."
echo "$body"


#!/bin/sh
# 安全デプロイ: ローカルが origin/main と完全一致していること・作業ツリーがクリーンであることを
# 確認してからでないと vercel deploy --prod を実行しない。
# これにより「古い状態のまま本番へ上書きデプロイして、他セッションの作業を消す」事故を防ぐ。
set -e
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

echo "→ origin から最新を取得して確認中..."
git fetch origin

if [ -n "$(git status --porcelain)" ]; then
  echo "" >&2
  echo "✗ コミットされていない変更があります。先に commit してください。" >&2
  git status -s >&2
  exit 1
fi

local_head="$(git rev-parse HEAD)"
origin_head="$(git rev-parse origin/main)"

if [ "$local_head" != "$origin_head" ]; then
  echo "" >&2
  echo "✗ ローカルの main が origin/main と一致していません。" >&2
  echo "  local:  $local_head" >&2
  echo "  origin: $origin_head" >&2
  echo "  → 'git push origin main'（自分が進んでいる場合）または" >&2
  echo "    'git pull origin main'（自分が遅れている場合）で揃えてから、再度実行してください。" >&2
  exit 1
fi

echo "✓ origin/main と一致・作業ツリーもクリーンです。デプロイします。"
vercel deploy --prod --yes

#!/bin/sh
# npm install 時に自動実行され、originのみをpush先として許可するpre-pushフックを導入する。
set -e
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
hooks_dir="$repo_root/.git/hooks"

if [ ! -d "$repo_root/.git" ]; then
  # git管理外(例: Vercelのビルド環境)では何もしない
  exit 0
fi

mkdir -p "$hooks_dir"
cp "$repo_root/scripts/pre-push-guard.sh" "$hooks_dir/pre-push"
chmod +x "$hooks_dir/pre-push"
echo "✓ pre-push hook installed (origin以外へのpushをブロックします)"

#!/bin/sh
# git pre-push hook: originだけをこのリポジトリの正本として扱う。
# origin以外（mini等）へのpushをブロックし、事故での分岐/巻き戻りを防ぐ。
# 緊急時にどうしても他リモートへ押したい場合のみ、明示的に
#   ALLOW_NON_ORIGIN_PUSH=1 git push mini main
# のように環境変数を立てて実行すること（通常運用では使わない）。

remote_name="$1"

if [ "$remote_name" != "origin" ] && [ "$ALLOW_NON_ORIGIN_PUSH" != "1" ]; then
  echo "" >&2
  echo "✗ push先が 'origin' ではありません（remote: ${remote_name})" >&2
  echo "  このプロジェクトは GitHub(origin) を唯一の正本として運用しています。" >&2
  echo "  'mini' 等の別リモートへ直接pushすると、本番デプロイの巻き戻り事故につながります。" >&2
  echo "  → まず 'git pull origin main' → 作業 → 'git push origin main' の順にしてください。" >&2
  echo "  どうしても必要な場合のみ: ALLOW_NON_ORIGIN_PUSH=1 git push $remote_name ..." >&2
  echo "" >&2
  exit 1
fi

exit 0

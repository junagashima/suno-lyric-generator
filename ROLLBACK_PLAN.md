# 🚨 緊急ロールバック手順

## 即座の復旧方法

### 方法1: バックアップブランチへの復旧
```bash
cd /home/user/webapp
git checkout backup-suno-working-system
git checkout main
git reset --hard backup-suno-working-system
git push origin main --force-with-lease
```

### 方法2: 特定コミットへの復旧
```bash
cd /home/user/webapp
git reset --hard 30081c1  # Sunoネイティブ指示システム統合
git push origin main --force-with-lease
```

### 方法3: 特定ファイルのみ復旧
```bash
cd /home/user/webapp
git checkout backup-suno-working-system -- src/app/api/analyze/route.ts
git commit -m "rollback: Restore working analysis system"
git push origin main
```

## バックアップ情報
- **動作確認済みブランチ**: `backup-suno-working-system`
- **最新動作確認コミット**: `30081c1`
- **バックアップ作成日時**: $(date)

## 問題発生時の確認項目
1. APIエンドポイントが応答するか
2. JSON形式が正しく出力されるか  
3. TypeScriptコンパイルエラーがないか
4. 既存UI機能が動作するか
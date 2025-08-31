# 🚨 緊急ロールバック手順

## 即座の復旧方法

### 方法1: タイトル・構成改善前への復旧（最新推奨）
```bash
cd /home/user/webapp
git reset --hard backup-before-title-structure-improvements
git push origin main --force-with-lease
```

### 方法2: AI改善システムへの復旧
```bash
cd /home/user/webapp
git reset --hard backup-ai-improved-system
git push origin main --force-with-lease
```

### 方法3: 初期動作システムへの復旧
```bash
cd /home/user/webapp  
git reset --hard backup-suno-working-system
git push origin main --force-with-lease
```

### 方法4: 特定コミットへの復旧
```bash
cd /home/user/webapp
git reset --hard c1695f3  # タイトル・構成改善前
# または
git reset --hard 64e75f3  # AI改善版
# または
git reset --hard 30081c1  # 初期Sunoシステム
git push origin main --force-with-lease
```

## バックアップ情報
- **タイトル・構成改善前**: `backup-before-title-structure-improvements` (c1695f3) - 2025-08-29作成
- **最新AI改善版**: `backup-ai-improved-system` (64e75f3)
- **初期動作版**: `backup-suno-working-system` (30081c1)  
- **更新日**: タイトル生成・楽曲構成改善実装前

## 問題発生時の確認項目
1. APIエンドポイントが応答するか
2. JSON形式が正しく出力されるか  
3. TypeScriptコンパイルエラーがないか
4. 既存UI機能が動作するか
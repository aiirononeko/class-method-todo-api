# クラスメソッド技術課題 TODO アプリ概要

## アーキテクチャ

![](img/クラスメソッド技術課題_architecture.drawio.svg)

## API 仕様書の生成

```
redoc-cli bundle openapi/openapi.yaml --output openapi/app.html
```

## API のデプロイ

```
npm run build:all
```

```
terraform init
terraform plan
terraform apply
```

apiKey の有効化のみ手動で実施する

## API の削除

```
terraform destroy
```

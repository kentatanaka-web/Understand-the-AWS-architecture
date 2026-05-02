const scenarios = [
  {
    id: "three-tier",
    title: "構成図A: 3層Webアプリ",
    description:
      "典型的な3層構成です。ALBで受けたリクエストをEC2へ分散し、データはプライベートサブネットのRDS Multi-AZに保存します。",
    diagram: {
      viewBox: "0 0 1270 420",
      zones: [
        { label: "Internet",               x:  10, y:  30, w:  190, h: 360, tone: "#fff7db" },
        { label: "AWS Cloud / VPC",        x: 220, y:  30, w: 1020, h: 360, tone: "#eef8ff" },
        { label: "Public Layer (CF + ALB)", x: 250, y:  65, w:  345, h: 300, tone: "#f6fffd" },
        { label: "AZ-a",                   x: 620, y:  65, w:  590, h: 145, tone: "#edf6ff" },
        { label: "AZ-c",                   x: 620, y: 235, w:  590, h: 145, tone: "#f0fff8" }
      ],
      nodes: [
        { id: "users", label: "Users",          x:  25, y: 170, color: "#fef3c7" },
        { id: "cf",    label: "CloudFront",      x: 265, y: 145, color: "#e0f2fe" },
        { id: "alb",   label: "ALB",             x: 445, y: 145, color: "#dcfce7" },
        { id: "ec2a",  label: "EC2 App (AZ-a)",  x: 645, y:  95, color: "#f3e8ff" },
        { id: "ec2c",  label: "EC2 App (AZ-c)",  x: 645, y: 260, color: "#f3e8ff" },
        { id: "rds",   label: "RDS Multi-AZ",    x: 870, y: 192, color: "#fee2e2" }
      ],
      edges: [
        ["users", "cf"],
        ["cf", "alb"],
        ["alb", "ec2a"],
        ["alb", "ec2c"],
        ["ec2a", "rds"],
        ["ec2c", "rds"]
      ]
    },
    questions: [
      {
        prompt: "ALBをEC2の前段に置く主な理由として最も適切なのはどれですか？",
        options: [
          "EC2のOSパッチを自動適用するため",
          "リクエストを複数EC2へ分散し可用性を高めるため",
          "RDSのバックアップを高速化するため",
          "Route 53を不要にするため"
        ],
        answer: 1,
        wrongReasons: [
          "OSパッチ適用は主にSystems Manager Patch Managerや運用設計の領域です。ALBの役割はL7での振り分けとヘルスチェックなので、パッチ運用を目的に置くのは責務が異なります。パッチ自動化を狙うなら運用基盤を別途設計するのが推奨です。",
          "この選択肢は正解です。",
          "RDSバックアップ性能はRDS設定やスナップショット戦略で決まるため、ALBを追加しても改善しません。可用性の観点では、ALBで複数アプリノードへ分散する設計が直接的です。",
          "Route 53はDNS解決やルーティング制御を担い、ALBはアプリ層負荷分散を担います。役割が異なるため、ALBを入れてもRoute 53が不要になるわけではありません。"
        ],
        explanation:
          "ALBはL7ロードバランサとしてトラフィック分散・ヘルスチェックを行い、単一障害点を減らします。"
      },
      {
        prompt: "RDSをプライベートサブネットに配置する意図として正しいものはどれですか？",
        options: [
          "直接インターネット公開して遅延を減らすため",
          "外部アクセスを抑え、アプリ層経由の接続に限定するため",
          "CloudFrontから直接接続させるため",
          "ALBの料金を下げるため"
        ],
        answer: 1,
        wrongReasons: [
          "DBを直接公開すると攻撃面が広がり、認証・監査・アクセス制御が難しくなります。低遅延目的でも公開DBは基本的に非推奨で、アプリ層経由で接続制御するのが標準です。",
          "この選択肢は正解です。",
          "CloudFrontはCDNであり、通常はDBへ直接接続しません。CloudFrontは静的配信やキャッシュ最適化に使い、DBアクセスはアプリケーションから行う設計が原則です。",
          "DBの配置方針はセキュリティ要件で決めるべきで、ALB料金最適化とは別問題です。コストを理由に公開範囲を広げると、設計リスクが大きくなります。"
        ],
        explanation:
          "DBは通常インターネット公開を避け、アプリケーション層からのみアクセスできるようにするのが基本です。"
      },
      {
        prompt: "RDS Multi-AZを使う主目的として適切なのはどれですか？",
        options: [
          "読み取り性能のみを常に2倍にするため",
          "ストレージ容量を無制限にするため",
          "障害時の自動フェイルオーバーで可用性を高めるため",
          "SQLを書かなくてもデータ操作するため"
        ],
        answer: 2,
        wrongReasons: [
          "読み取り性能強化が主目的ならリードレプリカを検討します。Multi-AZは可用性のための待機系であり、通常は読み取りスケール用途ではありません。",
          "Multi-AZは耐障害性機能で、容量無制限化の機能ではありません。容量計画はストレージ設定や監視で別途管理する必要があります。",
          "この選択肢は正解です。",
          "SQL不要を目的にするならNoSQLサービスやORM選定の話になります。Multi-AZの採用理由は障害時継続性であり、データ操作言語の選択とは無関係です。"
        ],
        explanation:
          "Multi-AZは主に可用性向上が目的で、障害発生時にスタンバイへ切り替えます。"
      },
      {
        prompt: "CloudFrontをALBの前に置くメリットとして最も自然なのはどれですか？",
        options: [
          "EC2インスタンスタイプを自動で変更するため",
          "静的コンテンツ配信を高速化し、オリジン負荷を軽減するため",
          "VPC CIDRを自動設計するため",
          "RDSの暗号化を強制するため"
        ],
        answer: 1,
        wrongReasons: [
          "CloudFrontは配信レイヤーで、EC2タイプの変更はAuto Scalingや運用設計の責務です。性能最適化はできますが、インスタンスタイプ自動変更の仕組みではありません。",
          "この選択肢は正解です。",
          "VPC CIDR設計はネットワーク設計フェーズの作業であり、CloudFront導入で自動決定されるものではありません。",
          "RDS暗号化はKMSとDB設定で制御します。CloudFront導入は通信経路最適化には有効ですが、DB暗号化強制の手段にはなりません。"
        ],
        explanation:
          "CloudFrontはCDNとしてキャッシュを活用し、ユーザー体感速度とオリジン効率を改善します。"
      },
      {
        prompt: "EC2をAuto Scalingで運用する主目的として適切なのはどれですか？",
        options: [
          "RDSのSQL互換性を上げるため",
          "負荷に応じて台数を調整し、性能とコストを両立するため",
          "CloudFrontのキャッシュTTLを自動設定するため",
          "VPC CIDRを拡張するため"
        ],
        answer: 1,
        wrongReasons: [
          "SQL互換性はDBエンジン選定の問題で、Auto Scalingはアプリサーバー台数制御の仕組みです。責務が異なるためこの目的には合いません。",
          "この選択肢は正解です。",
          "TTL設定は配信戦略の領域で、EC2台数制御とは直接関係しません。負荷対策ならまずAuto Scalingで処理能力を可変にするのが有効です。",
          "CIDR拡張はネットワーク再設計が必要な作業で、Auto Scaling機能では実現できません。"
        ],
        explanation:
          "Auto Scalingによりピーク時の性能確保と通常時のコスト最適化を両立しやすくなります。"
      }
    ]
  },
  {
    id: "serverless-api",
    title: "構成図B: サーバーレスAPI",
    description:
      "API Gateway + Lambda + DynamoDBのサーバーレス構成です。認証にCognitoを使い、静的フロントはS3配信とします。",
    diagram: {
      viewBox: "0 0 1200 420",
      zones: [
        { label: "Client Side",                        x:  10, y:  30, w:  220, h: 360, tone: "#fff7db" },
        { label: "AWS Cloud (Multi-AZ managed)",        x: 250, y:  30, w:  930, h: 360, tone: "#eef8ff" },
        { label: "Identity",                           x: 280, y:  70, w:  320, h: 140, tone: "#fff6e8" },
        { label: "Application",                        x: 280, y: 240, w:  320, h: 130, tone: "#f2fcf9" },
        { label: "Data / Hosting",                     x: 630, y:  70, w:  520, h: 300, tone: "#fff4f3" }
      ],
      nodes: [
        { id: "client",  label: "Web/Mobile Client",  x:  25, y: 175, color: "#fef3c7" },
        { id: "cognito", label: "Cognito",             x: 310, y: 105, color: "#fde68a" },
        { id: "apigw",   label: "API Gateway",         x: 310, y: 270, color: "#dbeafe" },
        { id: "lambda",  label: "Lambda",              x: 660, y: 175, color: "#dcfce7" },
        { id: "ddb",     label: "DynamoDB",            x: 840, y: 270, color: "#fee2e2" },
        { id: "s3",      label: "S3 Static Hosting",   x: 820, y: 100, color: "#e0f2fe" }
      ],
      edges: [
        ["client", "cognito"],
        ["client", "apigw"],
        ["apigw", "lambda"],
        ["lambda", "ddb"],
        ["client", "s3"]
      ]
    },
    questions: [
      {
        prompt: "API Gatewayを使う理由として最も適切なのはどれですか？",
        options: [
          "Lambdaのコード容量を増やすため",
          "API公開の入口を統一し、認証・スロットリング等を制御するため",
          "DynamoDBの整合性モデルを変更するため",
          "VPCを自動作成するため"
        ],
        answer: 1,
        wrongReasons: [
          "Lambdaコード容量はLambdaサービス制約の話で、API Gatewayでは増やせません。API GatewayはAPI公開面の統制に使うのが本筋です。",
          "この選択肢は正解です。",
          "DynamoDB整合性はテーブル設計や読み取り設定で決まります。API Gatewayはデータ整合性モデルを変更する役割を持ちません。",
          "VPCはネットワーク基盤であり、API Gateway導入だけで自動作成されません。必要ならIaCで明示的に構築するのが推奨です。"
        ],
        explanation:
          "API Gatewayは公開APIのフロントドアで、認証・レート制御・ステージ管理などを担います。"
      },
      {
        prompt: "DynamoDBを選ぶ典型的な理由はどれですか？",
        options: [
          "固定スキーマの複雑JOINを多用したいから",
          "低レイテンシでスケールしやすいNoSQLが必要だから",
          "EC2にだけ接続できるDBが必要だから",
          "SQL標準機能を最優先したいから"
        ],
        answer: 1,
        wrongReasons: [
          "複雑JOIN中心ならRDBが適しています。DynamoDBはアクセスパターン先行で設計するNoSQLのため、JOIN前提設計とは相性がよくありません。",
          "この選択肢は正解です。",
          "DynamoDBは特定EC2専用DBではなく、IAM認可に基づいて各種コンピュートからアクセスできます。接続先をEC2限定で考える必要はありません。",
          "SQL標準機能を最優先する要件ならAuroraやRDSが候補です。DynamoDB選定理由はスケーラビリティと運用容易性側にあります。"
        ],
        explanation:
          "DynamoDBはマネージドNoSQLで高スループット・低レイテンシ要求に強い選択肢です。"
      },
      {
        prompt: "Cognitoを導入する価値として最も自然なのはどれですか？",
        options: [
          "OSログイン管理を統一するため",
          "ユーザー認証・認可の実装負荷を減らし、トークン連携を容易にするため",
          "S3容量を増加させるため",
          "Lambdaコールドスタートをゼロにするため"
        ],
        answer: 1,
        wrongReasons: [
          "Cognitoはアプリ利用者のID管理に強みがあり、サーバーOSログイン管理の主用途ではありません。OS運用はIAMやSSM等で設計するのが一般的です。",
          "この選択肢は正解です。",
          "Cognitoは認証基盤であり、S3容量の増減には関与しません。ストレージ容量はS3側の設計・課金管理のテーマです。",
          "コールドスタートはLambda実行特性の課題で、Cognito導入では解消できません。必要ならProvisioned Concurrency等を検討します。"
        ],
        explanation:
          "Cognitoにより認証基盤をマネージド化し、IDトークン連携を標準化できます。"
      },
      {
        prompt: "この構成で運用負荷を下げやすい理由として適切なのはどれですか？",
        options: [
          "常時サーバー台数を固定で管理できるため",
          "OSやミドルウェアのパッチ運用対象が減るため",
          "ネットワーク機器を手動設定しやすいため",
          "全処理を1台で実行できるため"
        ],
        answer: 1,
        wrongReasons: [
          "サーバーレスの価値は固定台数管理ではなく、需要追従のスケールと運用削減にあります。台数固定発想は従来IaaS寄りの考え方です。",
          "この選択肢は正解です。",
          "手動設定しやすさは運用負荷低減と逆方向です。サーバーレスではマネージド機能と自動化を活用し、手作業を減らす設計が推奨されます。",
          "単一ノード集約は障害時の影響範囲を拡大します。サーバーレス設計では責務分離し、可用性と保守性を上げるのが基本です。"
        ],
        explanation:
          "サーバーレスはインフラ管理責任の一部をAWS側へ移し、運用作業を軽減しやすくなります。"
      },
      {
        prompt: "Lambdaをステートレスに設計する理由として最も適切なのはどれですか？",
        options: [
          "コンテナイメージを使えなくするため",
          "同時実行や再実行時でも安定してスケールしやすくするため",
          "API Gatewayを不要にするため",
          "DynamoDBの課金を固定化するため"
        ],
        answer: 1,
        wrongReasons: [
          "Lambdaはコンテナイメージ対応も可能で、ステートレス設計の目的ではありません。",
          "この選択肢は正解です。",
          "ステートレス化は実行安定性のためであり、API公開入口の必要性とは別の論点です。",
          "DynamoDB課金はアクセス量に依存し、Lambdaの状態管理方針だけで固定化されるものではありません。"
        ],
        explanation:
          "ステートレス実装にすると、スケール時やリトライ時の予期せぬ副作用を減らしやすくなります。"
      }
    ]
  },
  {
    id: "async-processing",
    title: "構成図C: 非同期処理パイプライン",
    description:
      "ユーザー要求を即時応答しつつ重い処理を非同期化する構成です。SQSでバッファし、ECS Fargateワーカーで処理します。",
    diagram: {
      viewBox: "0 0 1340 440",
      zones: [
        { label: "Internet",                        x:  10, y:  30, w:  200, h: 380, tone: "#fff7db" },
        { label: "AWS Cloud / VPC",                 x: 230, y:  30, w: 1090, h: 380, tone: "#eef8ff" },
        { label: "AZ-a  (Ingress & Processing)",    x: 260, y:  65, w: 1030, h: 155, tone: "#edf6ff" },
        { label: "AZ-c  (Events & Data)",           x: 260, y: 245, w: 1030, h: 145, tone: "#f0fff8" }
      ],
      nodes: [
        { id: "user",   label: "User",           x:  20, y: 175, color: "#fef3c7" },
        { id: "alb2",   label: "ALB",            x: 290, y: 100, color: "#dbeafe" },
        { id: "api",    label: "API on ECS",     x: 480, y: 100, color: "#dcfce7" },
        { id: "sqs",    label: "SQS",            x: 670, y: 100, color: "#fde68a" },
        { id: "worker", label: "Fargate Worker", x: 870, y: 100, color: "#f3e8ff" },
        { id: "events", label: "EventBridge",    x: 650, y: 270, color: "#e0f2fe" },
        { id: "db",     label: "Aurora",         x: 1100, y: 270, color: "#fee2e2" }
      ],
      edges: [
        ["user", "alb2"],
        ["alb2", "api"],
        ["api", "sqs"],
        ["sqs", "worker"],
        ["worker", "db"],
        ["events", "worker"]
      ]
    },
    questions: [
      {
        prompt: "SQSを挟む設計の主な狙いとして最も適切なのはどれですか？",
        options: [
          "同期レスポンス時間を必ず0msにするため",
          "リクエスト急増時に処理を平準化し、疎結合化するため",
          "Auroraのバックアップを停止するため",
          "ALBを不要化するため"
        ],
        answer: 1,
        wrongReasons: [
          "SQSで非同期化しても処理時間は0msになりません。狙いは応答を軽くしつつ、バックエンド処理を安全に後段へ逃がすことです。",
          "この選択肢は正解です。",
          "SQS導入はAuroraバックアップ停止とは無関係です。バックアップはRPO/RTO要件に基づき継続すべき重要設計です。",
          "ALBは同期リクエスト入口として有効で、SQSは非同期バッファとして別役割です。どちらか一方で代替する関係ではありません。"
        ],
        explanation:
          "SQSはバッファとして機能し、プロデューサとコンシューマを疎結合にしてスパイク耐性を高めます。"
      },
      {
        prompt: "APIを即時応答にし、重い処理をワーカーへ渡す利点として適切なのはどれですか？",
        options: [
          "ユーザー体感を改善しタイムアウトを減らしやすい",
          "データ整合性を無条件で保証できる",
          "監視が不要になる",
          "セキュリティ設定が不要になる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "非同期化だけで整合性が自動保証されるわけではありません。冪等性設計、再試行戦略、順序要件の整理が必要です。",
          "非同期構成はむしろ監視項目が増えます。キュー滞留、再試行回数、DLQ件数などを可視化して運用品質を保つのが推奨です。",
          "セキュリティ設定は必須です。IAM最小権限、暗号化、通信制御を設計しないと非同期でもリスクは下がりません。"
        ],
        explanation:
          "重い処理を非同期化するとフロント応答を短くでき、ユーザー体感と可用性の改善につながります。"
      },
      {
        prompt: "EventBridgeを使う意味として自然なものはどれですか？",
        options: [
          "時刻ベースやイベント駆動でワーカー実行を制御するため",
          "EC2のストレージを増設するため",
          "SQSメッセージ順序を完全に保証するため",
          "RDSをNoSQL化するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "EventBridgeはイベント連携サービスであり、EC2ストレージ拡張機能は持ちません。インフラ拡張は別サービスで設計します。",
          "順序保証が必要ならSQS FIFOや処理設計を検討します。EventBridge単体でSQS順序を完全保証するものではありません。",
          "RDSのデータモデル変更はアプリとDB移行計画のテーマです。EventBridge導入でDB種別は変わりません。"
        ],
        explanation:
          "EventBridgeはスケジュール・イベント連携のハブとして定期処理や疎結合なトリガを実現します。"
      },
      {
        prompt: "この構成で可観測性を高める時に重要な観点はどれですか？",
        options: [
          "SQSキュー長や処理遅延をメトリクス監視する",
          "ALB名を短くする",
          "常に単一AZに固定する",
          "ログを保存しない"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "命名は運用性に影響しますが、可観測性の本質ではありません。まずは遅延やエラー率などの品質指標を監視するのが優先です。",
          "単一AZ固定は障害耐性を下げる方向です。可観測性以前に可用性リスクが高くなり、実運用では推奨されません。",
          "ログ非保存では原因追跡が不可能になります。メトリクス・ログ・トレースを残して根本原因分析できる設計が必要です。"
        ],
        explanation:
          "非同期系ではキュー滞留や再試行状況が品質劣化の先行指標になるため、監視が重要です。"
      },
      {
        prompt: "SQSのDLQ（Dead Letter Queue）を設定する主目的はどれですか？",
        options: [
          "処理失敗メッセージを隔離し、原因分析と再処理を可能にする",
          "ALBのSSL証明書を管理する",
          "Auroraのストレージを拡張する",
          "EventBridgeの料金を無料にする"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "SSL証明書管理はACMやALB設定の領域で、DLQの用途ではありません。",
          "DLQはメッセージ処理失敗時の退避先であり、DB容量管理とは無関係です。",
          "料金体系はサービス仕様で決まり、DLQ設定で無料化されることはありません。"
        ],
        explanation:
          "DLQを使うと失敗メッセージを本流から分離でき、再発防止や運用改善に役立ちます。"
      }
    ]
  },
  {
    id: "ecs-cache",
    title: "構成図D: ECS + ElastiCache",
    description:
      "ALBからのリクエストをECS Fargate上のアプリが処理し、ElastiCache（Redis）でセッション/キャッシュを管理。永続データはRDSに保存します。",
    diagram: {
      viewBox: "0 0 1320 440",
      zones: [
        { label: "Internet",         x:  10, y:  30, w:  200, h: 380, tone: "#fff7db" },
        { label: "AWS Cloud / VPC",  x: 230, y:  30, w: 1070, h: 380, tone: "#eef8ff" },
        { label: "AZ-a",             x: 260, y:  65, w:  490, h: 155, tone: "#edf6ff" },
        { label: "AZ-c",             x: 260, y: 240, w:  490, h: 150, tone: "#f0fff8" },
        { label: "Data Layer",       x: 780, y:  65, w:  490, h: 325, tone: "#fff4f3" }
      ],
      nodes: [
        { id: "user",     label: "User",             x:  20, y: 170, color: "#fef3c7" },
        { id: "alb",      label: "ALB",              x: 285, y:  90, color: "#dbeafe" },
        { id: "ecsA",     label: "ECS Fargate (AZ-a)", x: 455, y:  90, color: "#dcfce7" },
        { id: "ecsC",     label: "ECS Fargate (AZ-c)", x: 455, y: 265, color: "#dcfce7" },
        { id: "redis",    label: "ElastiCache Redis", x: 810, y: 120, color: "#fde68a" },
        { id: "rds",      label: "RDS (Primary)",    x: 810, y: 280, color: "#fee2e2" }
      ],
      edges: [
        ["user",  "alb"],
        ["alb",   "ecsA"],
        ["alb",   "ecsC"],
        ["ecsA",  "redis"],
        ["ecsC",  "redis"],
        ["ecsA",  "rds"],
        ["ecsC",  "rds"]
      ]
    },
    questions: [
      {
        prompt: "ElastiCache（Redis）をアプリの手前に置く主目的はどれですか？",
        options: [
          "DBへの問い合わせ回数を減らしレスポンスを高速化する",
          "ECSコンテナイメージを配布する",
          "IAMロールを自動生成する",
          "ALBのSSL終端を担う"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "コンテナ配布はECR（Elastic Container Registry）の役割です。ElastiCacheはキャッシュ/セッションストアに特化しています。",
          "IAM管理はIAMサービスの責務で、ElastiCacheには該当機能がありません。",
          "SSL終端はALBまたはACMが担います。ElastiCacheはデータキャッシュの層です。"
        ],
        explanation: "頻繁に参照されるデータをRedisにキャッシュすると、DBアクセスを削減し低レイテンシを実現できます。"
      },
      {
        prompt: "ECSタスクをFargateで動かすメリットとして最も適切なのはどれですか？",
        options: [
          "EC2インスタンスのOS管理が必要になる",
          "コンテナ実行基盤のOSパッチ管理をAWSに委ねられる",
          "ストレージの物理配線を設計する",
          "Route 53のゾーン設定が不要になる"
        ],
        answer: 1,
        wrongReasons: [
          "FargateはサーバーレスコンテナでEC2自体を管理する必要がなくなります。EC2管理が増えるのは逆です。",
          "この選択肢は正解です。",
          "物理インフラはAWSが管理しており、利用者が配線設計する必要はありません。",
          "DNS設計はRoute 53の話であり、Fargate採用で不要になるものではありません。"
        ],
        explanation: "Fargateにより実行基盤の運用負荷を大幅に削減でき、アプリロジックに集中しやすくなります。"
      },
      {
        prompt: "セッション情報をElastiCacheに保持するメリットはどれですか？",
        options: [
          "特定のECSインスタンスにセッションが固定される",
          "複数ECSインスタンスでセッションを共有できスケール時に安定する",
          "RDSへの書き込みが必ず増える",
          "ALBがElastiCacheを直接管理できる"
        ],
        answer: 1,
        wrongReasons: [
          "セッションが特定インスタンスに固定されるのはスティッキーセッション設計です。ElastiCacheを使うことで固定を避けられます。",
          "この選択肢は正解です。",
          "セッションをElastiCacheに持つことでRDB書き込みを分散・削減できます。増える方向ではありません。",
          "ALBはロードバランサであり、ElastiCacheを直接制御する機能はありません。"
        ],
        explanation: "分散キャッシュにセッションを置くと、インスタンスが入れ替わってもセッションを継続できます。"
      },
      {
        prompt: "ECSサービスのDesired Countを複数AZに分散する主目的はどれですか？",
        options: [
          "AZ障害時も別AZのタスクで処理を継続するため",
          "IAM権限を最大化するため",
          "ElastiCacheを削除するため",
          "ALBログを無効化するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "IAM権限管理はECSタスクロール設計の話で、マルチAZ配置の目的ではありません。",
          "ElastiCacheの削除はコスト削減議論であり、高可用性設計の方向性と逆です。",
          "ALBログは監査・デバッグに有用で、AZ分散とは別の設計判断です。"
        ],
        explanation: "複数AZにタスクを分散することで、1AZ障害時も残りのAZでサービスを継続できます。"
      },
      {
        prompt: "ElastiCacheのレプリケーショングループを有効にする理由はどれですか？",
        options: [
          "書き込みスループット強化のみが目的",
          "プライマリ障害時にリードレプリカへ自動フェイルオーバーし可用性を確保する",
          "ECSタスクのCPU制限を緩和する",
          "RDSのバックアップを停止する"
        ],
        answer: 1,
        wrongReasons: [
          "書き込みはプライマリが担当します。レプリカは可用性向上と読み取り分散が主目的です。",
          "この選択肢は正解です。",
          "CPU制限はECSタスク定義の設定であり、ElastiCache設定とは無関係です。",
          "バックアップ停止は可用性設計と逆方向です。レプリケーション有効化の目的ではありません。"
        ],
        explanation: "レプリケーショングループにより、Redisプライマリの障害時にもキャッシュ層が継続して機能します。"
      }
    ]
  },
  {
    id: "hybrid-network",
    title: "構成図E: ハイブリッドネットワーク",
    description:
      "オンプレミスとAWS VPCをSite-to-Site VPN / Direct Connect で接続するハイブリッド構成です。Transit Gatewayで複数VPCを集約します。",
    diagram: {
      viewBox: "0 0 1360 440",
      zones: [
        { label: "On-Premises DC",     x:  10, y:  30, w:  280, h: 380, tone: "#fff7db" },
        { label: "AWS Cloud",          x: 310, y:  30, w: 1030, h: 380, tone: "#eef8ff" },
        { label: "Transit Gateway Hub",x: 590, y:  70, w:  280, h: 300, tone: "#f0f4ff" },
        { label: "VPC A (Web/App)",    x: 900, y:  70, w:  410, h: 145, tone: "#f2fcf9" },
        { label: "VPC B (Shared Svc)", x: 900, y: 245, w:  410, h: 145, tone: "#fff6e8" }
      ],
      nodes: [
        { id: "dc",       label: "Corporate DC",    x:  25, y: 175, color: "#fef3c7" },
        { id: "cgw",      label: "Customer GW",     x: 330, y: 105, color: "#e0f2fe" },
        { id: "dx",       label: "Direct Connect",  x: 330, y: 270, color: "#dbeafe" },
        { id: "tgw",      label: "Transit GW",      x: 620, y: 190, color: "#dcfce7" },
        { id: "alb",      label: "ALB (VPC A)",     x: 920, y:  95, color: "#f3e8ff" },
        { id: "shared",   label: "Shared DB/DNS",   x: 920, y: 270, color: "#fee2e2" }
      ],
      edges: [
        ["dc",    "cgw"],
        ["dc",    "dx"],
        ["cgw",   "tgw"],
        ["dx",    "tgw"],
        ["tgw",   "alb"],
        ["tgw",   "shared"]
      ]
    },
    questions: [
      {
        prompt: "Direct ConnectをSite-to-Site VPNより優先する主な理由はどれですか？",
        options: [
          "設定がVPNより常に簡単だから",
          "専用回線で帯域保証・低レイテンシ・安定性が高い通信が必要なため",
          "インターネット不要の通信に対して無料で使えるから",
          "オンプレのOSパッチを自動適用できるから"
        ],
        answer: 1,
        wrongReasons: [
          "Direct Connectは回線調達や物理接続が必要で、VPNより設定コストが高いです。簡易性ではなく品質が選定理由です。",
          "この選択肢は正解です。",
          "Direct Connectは回線・ポート費用が発生します。無料ではありません。",
          "OSパッチはSSMなど運用ツールの範疇です。接続方式の選定理由にはなりません。"
        ],
        explanation: "高帯域・低遅延・安定した通信品質が必要な業務システムではDirect Connectが適しています。"
      },
      {
        prompt: "Transit Gatewayを使う主な利点はどれですか？",
        options: [
          "VPC間をフルメッシュのVPC Peeringで接続するより管理が単純化される",
          "DBのバックアップを自動取得する",
          "ECSタスク数を制御する",
          "CloudFrontのTTLを設定する"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "DBバックアップはRDS/Auroraの設定やAWS Backupで管理します。",
          "ECSスケーリングはサービス設定とオートスケーリングポリシーで制御します。",
          "TTL設定はCloudFrontディストリビューション設定の話です。"
        ],
        explanation: "Transit GatewayはハブとしてVPC間接続を集約し、多数のVPCが増えても管理が線形に増えません。"
      },
      {
        prompt: "Site-to-Site VPNを冗長構成にするために必要な設計はどれですか？",
        options: [
          "単一トンネルで十分",
          "2本のIPsecトンネルを確立しアクティブ/スタンバイで利用する",
          "Direct ConnectをVPNに変換する",
          "RDSに接続させる"
        ],
        answer: 1,
        wrongReasons: [
          "単一トンネルは障害時の切り替え手段がなく、可用性が下がります。",
          "この選択肢は正解です。",
          "Direct ConnectとVPNは別の接続方式です。変換する機能はありません。",
          "RDSへの接続とVPN冗長設計は別の設計層です。"
        ],
        explanation: "VPNは標準で2トンネルを提供し、片系障害でも通信継続できる設計になっています。"
      },
      {
        prompt: "オンプレのDNSとAWS Route 53 Resolverを連携する目的はどれですか？",
        options: [
          "ALBのIPを固定する",
          "オンプレのホスト名をVPC内から解決できるようにする",
          "ElastiCacheのキャッシュを同期する",
          "ECSイメージを配布する"
        ],
        answer: 1,
        wrongReasons: [
          "ALBのIP固定はIP型ALBやEIPで検討しますが、DNS連携の主目的ではありません。",
          "この選択肢は正解です。",
          "キャッシュ同期はデータレプリケーション設計の話で、DNS解決とは別です。",
          "ECRやイメージ配布はコンテナ基盤の話でDNSの役割ではありません。"
        ],
        explanation: "Resolver連携により、ハイブリッド環境でもシームレスなDNS解決が実現できます。"
      },
      {
        prompt: "このハイブリッド構成でセキュリティを高める重要な観点はどれですか？",
        options: [
          "すべてのポートを全VPCで0.0.0.0/0許可",
          "セキュリティグループとNACLで最小必要ポートのみ許可",
          "IAMを削除して認証を簡略化",
          "暗号化を無効化して処理速度を上げる"
        ],
        answer: 1,
        wrongReasons: [
          "全ポート全許可は攻撃面を最大化します。最小公開の原則に反します。",
          "この選択肢は正解です。",
          "IAM削除は認証・認可基盤の喪失を意味し、深刻なセキュリティリスクになります。",
          "暗号化無効化はデータ漏洩リスクを高めます。特にハイブリッド接続では暗号化が必須です。"
        ],
        explanation: "ハイブリッド接続では通信経路と各サービスのアクセス制御を重ねて設計することが重要です。"
      }
    ]
  },
  {
    id: "analytics",
    title: "構成図F: データ分析基盤",
    description:
      "S3にデータを集約し、Glueでカタログ化・ETL、Athenaでクエリ、QuickSightでBIダッシュボードを提供するサーバーレス分析基盤です。",
    diagram: {
      viewBox: "0 0 1320 440",
      zones: [
        { label: "Data Sources",       x:  10, y:  30, w:  240, h: 380, tone: "#fff7db" },
        { label: "AWS Analytics Platform", x: 270, y:  30, w: 1030, h: 380, tone: "#eef8ff" },
        { label: "Ingestion",          x: 300, y:  65, w:  230, h: 300, tone: "#f6fffd" },
        { label: "Storage & Catalog",  x: 560, y:  65, w:  260, h: 300, tone: "#fff6e8" },
        { label: "Query & Visualize",  x: 850, y:  65, w:  420, h: 300, tone: "#f3f0ff" }
      ],
      nodes: [
        { id: "src",      label: "DB / App Logs",  x:  25, y: 170, color: "#fef3c7" },
        { id: "kinesis",  label: "Kinesis Firehose", x: 310, y: 105, color: "#dbeafe" },
        { id: "lambda",   label: "Lambda (transform)", x: 310, y: 260, color: "#dcfce7" },
        { id: "s3",       label: "S3 Data Lake",   x: 580, y: 105, color: "#e0f2fe" },
        { id: "glue",     label: "Glue Catalog/ETL", x: 580, y: 260, color: "#fde68a" },
        { id: "athena",   label: "Athena",          x: 870, y: 105, color: "#f3e8ff" },
        { id: "qs",       label: "QuickSight",      x: 1060, y: 250, color: "#fee2e2" }
      ],
      edges: [
        ["src",     "kinesis"],
        ["src",     "lambda"],
        ["kinesis", "s3"],
        ["lambda",  "s3"],
        ["s3",      "glue"],
        ["s3",      "athena"],
        ["glue",    "athena"],
        ["athena",  "qs"]
      ]
    },
    questions: [
      {
        prompt: "S3をデータレイクのストレージとして選ぶ主な理由はどれですか？",
        options: [
          "リレーショナルJOINを直接実行できるため",
          "スケーラブルで低コストな非構造化データを含む大量データの保管ができるため",
          "リアルタイムトランザクション処理が得意なため",
          "EC2にしか接続できないため"
        ],
        answer: 1,
        wrongReasons: [
          "JOINはAthenaなどのクエリエンジン側で行います。S3はオブジェクトストレージです。",
          "この選択肢は正解です。",
          "トランザクション処理はRDB向けです。S3はバッチ・分析向けの保管が得意です。",
          "S3はAPIを通じて多様なサービスと連携できます。特定コンピュートに限定されません。"
        ],
        explanation: "S3はペタバイト規模まで自動スケールし、多様なデータ形式を低コストで保存できます。"
      },
      {
        prompt: "Kinesis Data Firehoseを使う主な目的はどれですか？",
        options: [
          "ストリームデータをS3等へリアルタイム近傍で継続的に配信するため",
          "EC2インスタンスを自動起動するため",
          "RDSのバックアップを取得するため",
          "VPCルーティングを変更するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "インスタンス管理はEC2 AutoScalingの機能です。",
          "バックアップはRDS設定かAWS Backupで管理します。",
          "ルーティングはVPC/Transit Gateway設定の話です。"
        ],
        explanation: "Firehoseにより、ストリーミングデータをサーバーレスでS3/Redshiftなどへ継続配信できます。"
      },
      {
        prompt: "Glueデータカタログを使う主目的はどれですか？",
        options: [
          "S3に置いたデータのスキーマ情報を管理しAthenaから参照できるようにする",
          "EC2のOSを管理する",
          "CloudFrontのキャッシュを設定する",
          "IAMユーザーを一括作成する"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "OS管理はEC2/SSMの領域です。",
          "キャッシュ設定はCloudFrontディストリビューション設定です。",
          "IAM管理はIAMサービスの機能です。"
        ],
        explanation: "データカタログはメタデータ管理の中核で、クエリエンジンがデータを理解するために必要です。"
      },
      {
        prompt: "Athenaでクエリコストを削減するために効果的な方法はどれですか？",
        options: [
          "S3に全データをCSVで非圧縮で保管する",
          "Parquetなど列指向圧縮フォーマットを使いパーティショニングする",
          "すべてのクエリを毎回フルスキャンする",
          "Athenaを複数リージョンに増やす"
        ],
        answer: 1,
        wrongReasons: [
          "非圧縮CSVはスキャン量が大きくなりコストが上がります。",
          "この選択肢は正解です。",
          "フルスキャンはコスト最大化に向かいます。パーティションやフィルタで絞り込むのが基本です。",
          "リージョン増加はコスト増になります。フォーマット最適化の方が直接効果的です。"
        ],
        explanation: "Athenaはスキャン量課金のため、列指向フォーマット+パーティション設計がコスト管理の要です。"
      },
      {
        prompt: "QuickSightを使う主な理由はどれですか？",
        options: [
          "Athenaのクエリ結果をBIダッシュボードで可視化し業務意思決定を支援するため",
          "EC2のSSH接続を管理するため",
          "S3のバケットポリシーを自動生成するため",
          "Lambda関数のデプロイを行うため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "SSHやEC2管理はSSMやEC2コンソールの話です。",
          "バケットポリシーはS3設定やIAC管理です。",
          "Lambdaデプロイは開発ツールやCI/CDパイプラインの責務です。"
        ],
        explanation: "QuickSightはマネージドBIサービスで、分析結果を視覚化して関係者に共有しやすくします。"
      }
    ]
  },
  {
    id: "waf-lambda",
    title: "構成図G: WAF + ALB + Lambda + DynamoDB",
    description:
      "WAFでセキュリティを強化し、ALBがトラフィックを分散。Lambda関数（サーバーレス）がリクエスト処理し、DynamoDBにデータを保存します。",
    diagram: {
      viewBox: "0 0 1360 440",
      zones: [
        { label: "Internet",         x:  10, y:  30, w:  200, h: 380, tone: "#fff7db" },
        { label: "AWS Cloud / VPC",  x: 230, y:  30, w: 1110, h: 380, tone: "#eef8ff" },
        { label: "AZ-a",             x: 260, y:  65, w:  470, h: 155, tone: "#edf6ff" },
        { label: "AZ-c",             x: 260, y: 240, w:  470, h: 150, tone: "#f0fff8" },
        { label: "Database",         x: 760, y:  65, w:  560, h: 325, tone: "#fff4f3" }
      ],
      nodes: [
        { id: "user",     label: "User",             x:  20, y: 170, color: "#fef3c7" },
        { id: "waf",      label: "WAF",              x: 280, y:  90, color: "#fed7aa" },
        { id: "alb",      label: "ALB",              x: 280, y: 265, color: "#dbeafe" },
        { id: "lambdaA",  label: "Lambda (AZ-a)",    x: 480, y:  90, color: "#dcfce7" },
        { id: "lambdaC",  label: "Lambda (AZ-c)",    x: 480, y: 265, color: "#dcfce7" },
        { id: "dynamo",   label: "DynamoDB",         x: 900, y: 175, color: "#fed7aa" }
      ],
      edges: [
        ["user",    "waf"],
        ["waf",     "alb"],
        ["alb",     "lambdaA"],
        ["alb",     "lambdaC"],
        ["lambdaA", "dynamo"],
        ["lambdaC", "dynamo"]
      ]
    },
    questions: [
      {
        prompt: "WAFをALBより手前に置く主な目的はどれですか？",
        options: [
          "DynamoDBの書き込み速度を上げるため",
          "SQLインジェクション・XSS等の一般的な脅威をALB到達前にフィルタリングするため",
          "Lambda関数の実行時間を短縮するため",
          "EC2インスタンスの数を制限するため"
        ],
        answer: 1,
        wrongReasons: [
          "WAFはセキュリティレイヤーで、DBパフォーマンスに直接影響しません。",
          "この選択肢は正解です。",
          "WAFはLambda実行時間に影響しません。不正リクエスト到達防止が目的です。",
          "WAFはリソース数管理の機能ではありません。"
        ],
        explanation: "WAFはL7ファイアウォールとして、攻撃的なリクエストをアプリケーション層に到達させない防御を提供します。"
      },
      {
        prompt: "Lambda関数をマルチAZに分散配置する理由はどれですか？",
        options: [
          "Lambda関数のコード更新を高速化する",
          "1AZ障害時もLambdaが実行継続でき可用性が向上する",
          "DynamoDBのレプリケーション設定が簡単になる",
          "IAM権限を多重化するため"
        ],
        answer: 1,
        wrongReasons: [
          "コード更新速度は関数のデプロイメント設定に依存します。",
          "この選択肢は正解です。",
          "DynamoDBレプリケーションはグローバルテーブル等の設定が必要です。AZ分散で自動化されません。",
          "IAM権限はロール設計の話です。AZ分散とは無関係です。"
        ],
        explanation: "ALBが複数AZのLambda関数にリクエストを分散することで、1AZ失障時も処理が継続できます。"
      },
      {
        prompt: "DynamoDBをRDSではなく選ぶメリットはどれですか？",
        options: [
          "複雑なJOINクエリが高速に実行される",
          "スキーマ変更が厳密に定義される",
          "自動スケーリングと低遅延キー/値アクセスが得意",
          "トランザクション処理が完全にサポートされない"
        ],
        answer: 2,
        wrongReasons: [
          "JOINはリレーショナルDB向けです。DynamoDBはスキーマレス・キー/値特化です。",
          "スキーマ厳密性はRDB側の特徴です。DynamoDBはスキーマレスです。",
          "この選択肢は正解です。",
          "DynamoDBもトランザクションをサポートしています。逆です。"
        ],
        explanation: "DynamoDBは自動スケーリング・サーバーレス・低レイテンシが強みで、リアルタイムアプリに適しています。"
      },
      {
        prompt: "ALBがヘルスチェック対象にするLambda関数のエンドポイント何が重要ですか？",
        options: [
          "常に200応答を返せる軽量なエンドポイント",
          "DynamoDBのクエリ実行を必須にする",
          "IAM認証を必須にする",
          "任意のポート番号で応答する"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "ヘルスチェックはDynamoDBアクセス必須ではありません。関数が起動していることだけが必要です。",
          "ヘルスチェックエンドポイントは通常認証不要です。認証があると確認失敗のリスクがあります。",
          "ALBが監視するポートはALBターゲットグループで固定します。任意ではありません。"
        ],
        explanation: "ヘルスチェックエンドポイントは高速・軽量・信頼性が高い応答を返すことが重要です。"
      },
      {
        prompt: "Lambda関数でDynamoDBアクセス時に使用するIAMロールの権限として必要なのはどれですか？",
        options: [
          "DynamoDBへの全操作（削除含む）無制限アクセス",
          "最小必要な操作のみ（GetItem, PutItem等）に限定",
          "IAM権限不要（AWSが自動許可）",
          "EC2へのSSH権限"
        ],
        answer: 1,
        wrongReasons: [
          "全操作許可は過度な権限付与で、セキュリティリスクが高いです。",
          "この選択肢は正解です。",
          "IAM権限設定は必須です。自動許可されません。",
          "SSH権限はサーバーレス環境では不要です。"
        ],
        explanation: "最小権限の原則に基づき、Lambda実行に必要なDynamoDB操作のみを許可すべきです。"
      }
    ]
  },
  {
    id: "cloudfront-nlb",
    title: "構成図H: CloudFront + NLB + EC2 + Aurora",
    description:
      "CloudFrontでグローバルキャッシュ配信、NLB（ネットワーク負荷分散）が高スループット処理を担当。EC2（AZ-a/c）がアプリ実行、AuroraはマルチAZ高可用性DBです。",
    diagram: {
      viewBox: "0 0 1360 440",
      zones: [
        { label: "Internet / CDN",   x:  10, y:  30, w:  200, h: 380, tone: "#fff7db" },
        { label: "AWS Cloud / VPC",  x: 230, y:  30, w: 1110, h: 380, tone: "#eef8ff" },
        { label: "AZ-a",             x: 260, y:  65, w:  470, h: 155, tone: "#edf6ff" },
        { label: "AZ-c",             x: 260, y: 240, w:  470, h: 150, tone: "#f0fff8" },
        { label: "Database HA",      x: 760, y:  65, w:  560, h: 325, tone: "#fff4f3" }
      ],
      nodes: [
        { id: "user",     label: "User",             x:  20, y: 170, color: "#fef3c7" },
        { id: "cf",       label: "CloudFront",       x: 280, y:  90, color: "#bfdbfe" },
        { id: "nlb",      label: "NLB",              x: 280, y: 265, color: "#dbeafe" },
        { id: "ec2A",     label: "EC2 (AZ-a)",       x: 480, y:  90, color: "#e0e7ff" },
        { id: "ec2C",     label: "EC2 (AZ-c)",       x: 480, y: 265, color: "#e0e7ff" },
        { id: "aurorp",   label: "Aurora Primary",   x: 900, y: 120, color: "#fecaca" },
        { id: "aurorr",   label: "Aurora Replica",   x: 900, y: 230, color: "#fecaca" }
      ],
      edges: [
        ["user",   "cf"],
        ["cf",     "nlb"],
        ["nlb",    "ec2A"],
        ["nlb",    "ec2C"],
        ["ec2A",   "aurorp"],
        ["ec2C",   "aurorp"],
        ["aurorp", "aurorr"]
      ]
    },
    questions: [
      {
        prompt: "CloudFrontをNLBより前に置く主な目的はどれですか？",
        options: [
          "NLBの処理スループットを制限するため",
          "エッジロケーションでコンテンツをキャッシュしエンドユーザーへの遅延を低減するため",
          "EC2インスタンスを必ず削除するため",
          "Aurora複製の設定を自動化するため"
        ],
        answer: 1,
        wrongReasons: [
          "CloudFrontはNLBスループットを制限しません。むしろオリジン負荷を軽減します。",
          "この選択肢は正解です。",
          "CloudFrontはEC2削除とは関係ありません。",
          "Aurora複製はRDS設定で、CloudFront層では制御しません。"
        ],
        explanation: "CloudFrontのエッジキャッシュにより、グローバルユーザーの遅延が大幅に低減され、オリジン負荷も下がります。"
      },
      {
        prompt: "NLBをALBではなく選ぶ理由として最も適切なのはどれですか？",
        options: [
          "HTTPリクエストの詳細ルーティングが最優先",
          "超高スループット・低レイテンシが重要で、L4層処理が適切",
          "DynamoDBとの直接連携が必要",
          "IAM認証が必須"
        ],
        answer: 1,
        wrongReasons: [
          "HTTPルーティングはALB（L7）の得意分野です。",
          "この選択肢は正解です。",
          "DynamoDBはアプリケーション層で管理します。LB選定とは無関係です。",
          "IAMはLBレイヤーではなく、リソースアクセス制御の話です。"
        ],
        explanation: "NLBはL4負荷分散で、ミリ秒単位のレイテンシと数百万rpsのスループットが必要な場合に選びます。"
      },
      {
        prompt: "Aurora（RDS）をマルチAZ構成にする主な目的はどれですか？",
        options: [
          "リード専用レプリカのみで可用性は向上しない",
          "プライマリ障害時に自動フェイルオーバーし、DBサービスの継続性を確保するため",
          "ライトスループットを無限に増やすため",
          "オンプレミスとの同期を自動化するため"
        ],
        answer: 1,
        wrongReasons: [
          "マルチAZはレプリケーション＋自動フェイルオーバーで高可用性実現します。",
          "この選択肢は正解です。",
          "ライトスループットはプライマリ単体が行います。マルチAZでは増えません。",
          "オンプレ同期はDatabase Migration Service等で個別対応が必要です。"
        ],
        explanation: "Auroraマルチ AZにより、RTO/RPOを大幅に短縮し、DB層での高可用性が実現できます。"
      },
      {
        prompt: "EC2インスタンスのステートレス設計が重要な理由はどれですか？",
        options: [
          "セッション情報をEC2ローカル保持するとNLBの振分時に矛盾が生じやすい",
          "ストレージコストが無限に増える",
          "Auroraの複製が不可能になる",
          "CloudFrontのキャッシュが効かなくなる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "ストレージコストはインスタンスタイプやEBS構成で決まります。",
          "ステートレス性とAurora複製は独立しています。",
          "CloudFrontキャッシュはセッション情報の場所と無関係です。"
        ],
        explanation: "ステートレス設計でNLB振分後も一貫性が保たれ、スケーリングと障害耐性が向上します。"
      },
      {
        prompt: "Auroraで複数のリードレプリカを構成する利点はどれですか？",
        options: [
          "ライト性能が指数関数的に向上する",
          "分析クエリ等の読み取り負荷を複数レプリカに分散し、プライマリ負荷を軽減する",
          "バックアップが不要になる",
          "EC2インスタンス数を削減できる"
        ],
        answer: 1,
        wrongReasons: [
          "ライト（INSERT/UPDATE）はプライマリが担当します。レプリカで増えません。",
          "この選択肢は正解です。",
          "バックアップ設定は独立した機能です。リードレプリカで不要になりません。",
          "EC2とDB層は独立したリソースです。レプリカ数で EC2が削減されません。"
        ],
        explanation: "リードレプリカに読み取り負荷を分散することで、ライト性能への影響を最小化できます。"
      }
    ]
  },
  {
    id: "api-gateway-lambda",
    title: "構成図I: CloudFront + API Gateway + Lambda + RDS",
    description:
      "CloudFrontで静的コンテンツをキャッシュ。API GatewayがREST APIを提供し、Lambdaがビジネスロジック実行。RDSで永続データを管理します。",
    diagram: {
      viewBox: "0 0 1320 440",
      zones: [
        { label: "Internet",         x:  10, y:  30, w:  200, h: 380, tone: "#fff7db" },
        { label: "AWS Cloud",        x: 230, y:  30, w: 1070, h: 380, tone: "#eef8ff" },
        { label: "API & Integration",x: 260, y:  65, w:  370, h: 300, tone: "#f2fcf9" },
        { label: "Compute",          x: 650, y:  65, w:  300, h: 300, tone: "#fef3c7" },
        { label: "Data",             x: 980, y:  65, w:  290, h: 300, tone: "#fee2e2" }
      ],
      nodes: [
        { id: "user",     label: "User",             x:  20, y: 170, color: "#fef3c7" },
        { id: "cf",       label: "CloudFront",       x: 280, y:  90, color: "#bfdbfe" },
        { id: "apigw",    label: "API Gateway",      x: 280, y: 265, color: "#dbeafe" },
        { id: "lambda",   label: "Lambda",           x: 680, y: 175, color: "#dcfce7" },
        { id: "rds",      label: "RDS (Multi-AZ)",   x: 1010, y: 175, color: "#fecaca" }
      ],
      edges: [
        ["user",   "cf"],
        ["user",   "apigw"],
        ["cf",     "lambda"],
        ["apigw",  "lambda"],
        ["lambda", "rds"]
      ]
    },
    questions: [
      {
        prompt: "API Gatewayがあることのメリットはどれですか？",
        options: [
          "バックエンドLambda を直接インターネットに露出させる必要がなくなる",
          "RDSの容量が自動的に増える",
          "CloudFrontのTTLが自動最適化される",
          "EC2を必ず起動する"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "DB容量はインスタンスタイプ変更で管理します。API Gatewayでは自動増加しません。",
          "TTLはAPI Gateway設定とは別です。",
          "このAPIモデルではEC2は不要です。サーバーレス設計です。"
        ],
        explanation: "API Gatewayはバックエンドの抽象化レイヤーとなり、Lambdaを直接呼び出さずに管理できます。"
      },
      {
        prompt: "API Gatewayで認可・レート制限を実装する主な目的はどれですか？",
        options: [
          "CloudFrontのキャッシュを削除する",
          "不正なクライアントのアクセス制限と、バックエンド過負荷を防ぐため",
          "Lambda関数を自動削除する",
          "RDSのレプリケーション設定を変更する"
        ],
        answer: 1,
        wrongReasons: [
          "キャッシュ管理はCloudFront側の機能です。",
          "この選択肢は正解です。",
          "アクセス制限理由でLambda削除は起きません。",
          "リプリケーション設定は独立した機能です。"
        ],
        explanation: "API Gatewayのレート制限により、DDoS対策とバックエンド保護を効果的に実現できます。"
      },
      {
        prompt: "CloudFrontでキャッシュしても、API Gatewayが必要な理由はどれですか？",
        options: [
          "APIレスポンスは個人情報含有で、キャッシュ不可",
          "静的コンテンツはCloudFront、動的APIはAPI Gateway経由で処理を分離",
          "CloudFrontだけで全機能が実現される",
          "RDSへのアクセス制御が不要になる"
        ],
        answer: 1,
        wrongReasons: [
          "APIのキャッシュ可否はコンテンツ性質に依存します。ここでは分離設計の話です。",
          "この選択肢は正解です。",
          "CloudFrontは配信層です。APIゲートウェイはAPIアクセス制御層です。両者は役割が異なります。",
          "RDSアクセス制御は必須です。API層で変わりません。"
        ],
        explanation: "コンテンツの特性に応じて配信層とAPI層を分離することで、最適なパフォーマンスと管理性が実現できます。"
      },
      {
        prompt: "Lambda関数がRDSに接続する際のベストプラクティスはどれですか？",
        options: [
          "接続文字列をコード内にハードコード",
          "AWS Secrets ManagerでDB認証情報を安全に保存し、Lambda実行時に取得",
          "RDSのパスワードを空にして認証不要にする",
          "Lambda各関数で個別にRDS接続を管理"
        ],
        answer: 1,
        wrongReasons: [
          "コードハードコードは情報漏洩リスクが極めて高いです。",
          "この選択肢は正解です。",
          "パスワード空化はセキュリティ喪失です。",
          "接続管理は RDS プロキシを使い集約するのが効率的です。"
        ],
        explanation: "Secrets Managerにより、認証情報を暗号化・監査ログ付きで安全に管理できます。"
      },
      {
        prompt: "Lambda関数のコンテキスト再利用（コネクションプーリング）が重要な理由はどれですか？",
        options: [
          "Lambda実行ごとにDB接続を新規作成するとオーバーヘッドが大きい",
          "CloudFrontのキャッシュ効率が上がる",
          "API Gatewayのレート制限が無効になる",
          "RDSの自動フェイルオーバーが遅くなる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "キャッシュ効率はCloudFront設定に依存します。",
          "レート制限とコネクションプーリングは無関係です。",
          "フェイルオーバーはRDS設定で、接続プーリングとは別です。"
        ],
        explanation: "Lambda実行コンテキストを再利用すると、接続確立コストを削減しレスポンス時間が改善できます。"
      }
    ]
  },
  {
    id: "route53-acm",
    title: "構成図J: Route 53 + ACM + ALB",
    description:
      "Route 53でDNS管理を行い、ACMで証明書を自動発行。ALBでHTTPS終端し、HTTP→HTTPSリダイレクト含む標準的なDNS/TLS設計です。",
    diagram: {
      viewBox: "0 0 1260 420",
      zones: [
        { label: "Internet",            x:  10, y:  30, w:  190, h: 360, tone: "#fff7db" },
        { label: "AWS Cloud",           x: 220, y:  30, w: 1020, h: 360, tone: "#eef8ff" },
        { label: "DNS & Certificate",   x: 250, y:  65, w:  370, h: 300, tone: "#f6fffd" },
        { label: "VPC (App Layer)",     x: 650, y:  65, w:  560, h: 300, tone: "#f0fff8" }
      ],
      nodes: [
        { id: "users",  label: "Users",          x:  25, y: 165, color: "#fef3c7" },
        { id: "r53",    label: "Route 53",        x: 270, y: 105, color: "#dbeafe" },
        { id: "acm",    label: "ACM",             x: 270, y: 260, color: "#dcfce7" },
        { id: "alb",    label: "ALB (HTTPS)",     x: 680, y: 105, color: "#e0f2fe" },
        { id: "ec2a",   label: "EC2 (AZ-a)",      x: 900, y:  90, color: "#f3e8ff" },
        { id: "ec2c",   label: "EC2 (AZ-c)",      x: 900, y: 240, color: "#f3e8ff" }
      ],
      edges: [
        ["users", "r53"],
        ["r53",   "alb"],
        ["acm",   "alb"],
        ["alb",   "ec2a"],
        ["alb",   "ec2c"]
      ]
    },
    questions: [
      {
        prompt: "Route 53のAliasレコードをALBに向ける主な利点はどれですか？",
        options: [
          "ALBのIPが変わってもDNS解決が自動的に追従する",
          "EC2のOSパッチを自動化できる",
          "ACMの証明書発行が不要になる",
          "VPCのCIDRを自動設計できる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "OSパッチはSystems Manager等で管理します。AliasレコードはDNS解決の効率化が目的です。",
          "ACM証明書は独立した機能です。Aliasレコードで不要になるわけではありません。",
          "VPC設計はネットワーク設計フェーズの作業です。DNS設定とは別です。"
        ],
        explanation: "AliasレコードはAWS固有機能で、ALBのIPが変更されてもDNS側を修正せず自動追従します。"
      },
      {
        prompt: "ACM（AWS Certificate Manager）でSSL/TLS証明書を管理するメリットはどれですか？",
        options: [
          "証明書の自動更新でオペレーションミスや失効リスクを低減できる",
          "EC2のインスタンスタイプを自動最適化できる",
          "RDSのバックアップを自動化できる",
          "VPCのルーティングを自動設定できる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "インスタンスタイプ最適化はコンピュートの設定であり、証明書管理とは無関係です。",
          "RDSバックアップはRDS設定で管理します。",
          "ルーティングはVPC/ルートテーブル設定の話です。"
        ],
        explanation: "ACMは証明書ライフサイクルを自動管理し、更新忘れによるサービス停止リスクを大幅に下げます。"
      },
      {
        prompt: "ALBでHTTPからHTTPSへリダイレクトするリスナールールを設定する目的はどれですか？",
        options: [
          "HTTP接続を強制的にHTTPSへ誘導し通信を暗号化するため",
          "EC2のCPU使用率を下げるため",
          "RDSの接続数を増やすため",
          "CloudFrontを不要にするため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "CPU使用率はアプリの処理量に依存します。リダイレクトルールの目的ではありません。",
          "DB接続数管理はアプリ設計やRDS Proxyの話です。",
          "CloudFrontとALBは異なる目的を持ちます。リダイレクト設定で不要化されません。"
        ],
        explanation: "HTTPリスナーでHTTPS強制リダイレクトを設定すると、暗号化されていない通信をなくせます。"
      },
      {
        prompt: "Route 53のヘルスチェック機能を使う主な目的はどれですか？",
        options: [
          "エンドポイントが正常でない場合に別のリソースへフェイルオーバーするため",
          "ACM証明書を自動更新するため",
          "EC2のOSパッチを適用するため",
          "ALBのログを取得するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "証明書更新はACMの自動更新機能が担います。",
          "OSパッチはSSMの機能です。",
          "ALBのログはALB設定側で有効化します。"
        ],
        explanation: "Route 53ヘルスチェックとフェイルオーバールーティングを組み合わせることで、障害時にDNSレベルで切り替えが可能です。"
      },
      {
        prompt: "HTTPS終端をEC2ではなくALBで行うメリットはどれですか？",
        options: [
          "証明書管理・TLS処理をALBに集約しEC2の負荷を下げられる",
          "EC2インスタンス数を自動で増やせる",
          "DynamoDBへの接続が暗号化される",
          "Route 53のゾーン数を削減できる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "インスタンス数スケーリングはAuto Scalingの機能です。",
          "DynamoDB接続暗号化はTLSエンドポイント設定で管理します。ALBのTLS終端とは別です。",
          "ゾーン数はDNS設計の話でTLS終端と無関係です。"
        ],
        explanation: "ALBで一括HTTPS終端することで証明書管理が一元化され、EC2のCPU消費も削減できます。"
      }
    ]
  },
  {
    id: "eks-ecr",
    title: "構成図K: EKS + ECR + Fargate",
    description:
      "Amazon EKS（Kubernetes）でコンテナを管理し、ECRでイメージを保管。Fargate on EKSでノード管理を不要にしたコンテナオーケストレーション構成です。",
    diagram: {
      viewBox: "0 0 1300 440",
      zones: [
        { label: "Developer",           x:  10, y:  30, w:  200, h: 380, tone: "#fff7db" },
        { label: "AWS Cloud",           x: 230, y:  30, w: 1050, h: 380, tone: "#eef8ff" },
        { label: "Container Registry",  x: 260, y:  65, w:  280, h: 300, tone: "#f6fffd" },
        { label: "EKS Cluster (VPC)",   x: 570, y:  65, w:  680, h: 300, tone: "#f0fff8" }
      ],
      nodes: [
        { id: "dev",     label: "Developer",          x:  20, y: 165, color: "#fef3c7" },
        { id: "ecr",     label: "ECR",                x: 280, y: 165, color: "#dbeafe" },
        { id: "eks",     label: "EKS Control Plane",  x: 600, y:  95, color: "#dcfce7" },
        { id: "fargate", label: "Fargate Nodes",      x: 600, y: 250, color: "#e0f2fe" },
        { id: "alb",     label: "ALB Ingress",        x: 870, y:  95, color: "#f3e8ff" },
        { id: "pods",    label: "Pods",               x: 870, y: 250, color: "#fde68a" }
      ],
      edges: [
        ["dev",     "ecr"],
        ["ecr",     "fargate"],
        ["eks",     "fargate"],
        ["fargate", "pods"],
        ["alb",     "pods"]
      ]
    },
    questions: [
      {
        prompt: "EKS on Fargateを使う主なメリットはどれですか？",
        options: [
          "EC2ノードのOSパッチやスケーリング管理が不要になる",
          "Kubernetesクラスターを手動で構築できる",
          "ECRのストレージ容量が無制限になる",
          "ALBが自動的に削除される"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "EKSはマネージドKubernetesであり、手動構築の手間を省くことが目的です。",
          "ストレージ容量はECR側の設定で、Fargate利用とは無関係です。",
          "ALBはIngressコントローラーとして必要です。削除されません。"
        ],
        explanation: "Fargate on EKSによりデータプレーンのOS管理が不要になり、運用負荷を大幅に削減できます。"
      },
      {
        prompt: "ECR（Elastic Container Registry）を使う理由として最も適切なのはどれですか？",
        options: [
          "プライベートなコンテナイメージをAWS内で安全に管理・配信するため",
          "EC2インスタンスのバックアップを保存するため",
          "RDSのクエリキャッシュを管理するため",
          "Route 53のDNSレコードを管理するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "EC2バックアップはEBSスナップショットやAWS Backupで管理します。",
          "クエリキャッシュはElastiCacheやDB設定で管理します。",
          "DNSはRoute 53の機能です。ECRはコンテナイメージ専用です。"
        ],
        explanation: "ECRはIAMと統合されたプライベートレジストリで、イメージの脆弱性スキャンも提供します。"
      },
      {
        prompt: "KubernetesのNamespaceを使う主な目的はどれですか？",
        options: [
          "クラスター内でリソースを論理的に分離し、チームや環境ごとに管理するため",
          "EC2インスタンスのCPUを予約するため",
          "ECRのイメージをバージョン管理するため",
          "ALBのリスナールールを設定するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "CPU予約はKubernetesのResourceQuotaやLimitRangeで行います。Namespaceはリソース分離の単位です。",
          "イメージバージョン管理はECRのタグ機能です。",
          "ALBルールはIngress設定で管理します。"
        ],
        explanation: "Namespaceにより1クラスターを複数チームや環境（dev/prod）で共用しつつ分離して運用できます。"
      },
      {
        prompt: "EKSのPodにIAM権限を付与する際のベストプラクティスはどれですか？",
        options: [
          "クラスター全体に広い権限を持つIAMロールを付与する",
          "IRSA（IAM Roles for Service Accounts）でPod単位に最小権限を付与する",
          "アクセスキーをPod内の環境変数にハードコードする",
          "全てのAWSサービスへのフルアクセスを許可する"
        ],
        answer: 1,
        wrongReasons: [
          "クラスター全体への広い権限付与は最小権限原則に反し、セキュリティリスクが高まります。",
          "この選択肢は正解です。",
          "環境変数へのアクセスキー埋め込みは情報漏洩リスクが極めて高いです。",
          "フルアクセスは過剰な権限付与です。最小権限で設計すべきです。"
        ],
        explanation: "IRSAによりKubernetes Service AccountとIAMロールを紐付け、Pod単位で最小権限アクセスを実現できます。"
      },
      {
        prompt: "EKSクラスターのノードグループを複数AZに分散する理由はどれですか？",
        options: [
          "1AZ障害時も他AZのノードでワークロードが継続するため",
          "ECRへのプッシュ速度を上げるため",
          "ALBのリスナールール数を増やすため",
          "KubernetesのAPI Serverを削除するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "ECRプッシュ速度はネットワーク帯域やイメージサイズに依存します。AZ分散とは無関係です。",
          "ALBリスナールールはIngress設定で管理します。",
          "API ServerはEKSコントロールプレーンが管理します。ユーザーが削除するものではありません。"
        ],
        explanation: "複数AZへのノード分散により、AZ障害時もスケジューリングが継続しサービス影響を最小化できます。"
      }
    ]
  },
  {
    id: "cicd-pipeline",
    title: "構成図L: CI/CDパイプライン",
    description:
      "CodeCommit/GitHubにプッシュするとCodePipelineが起動。CodeBuildでビルド・テスト、CodeDeployでECS/EC2へデプロイする継続的デリバリー構成です。",
    diagram: {
      viewBox: "0 0 1320 420",
      zones: [
        { label: "Source",      x:  10, y:  30, w:  220, h: 360, tone: "#fff7db" },
        { label: "AWS CI/CD",   x: 250, y:  30, w: 1050, h: 360, tone: "#eef8ff" },
        { label: "Build",       x: 280, y:  65, w:  280, h: 300, tone: "#f6fffd" },
        { label: "Deploy",      x: 590, y:  65, w:  280, h: 300, tone: "#f0fff8" },
        { label: "Target",      x: 900, y:  65, w:  370, h: 300, tone: "#fff4f3" }
      ],
      nodes: [
        { id: "repo",     label: "CodeCommit/GitHub", x:  20, y: 165, color: "#fef3c7" },
        { id: "pipeline", label: "CodePipeline",      x: 300, y:  95, color: "#dbeafe" },
        { id: "build",    label: "CodeBuild",         x: 300, y: 245, color: "#dcfce7" },
        { id: "deploy",   label: "CodeDeploy",        x: 620, y: 165, color: "#fde68a" },
        { id: "ecr",      label: "ECR",               x: 930, y:  95, color: "#e0f2fe" },
        { id: "ecs",      label: "ECS / EC2",         x: 930, y: 250, color: "#f3e8ff" }
      ],
      edges: [
        ["repo",     "pipeline"],
        ["pipeline", "build"],
        ["build",    "ecr"],
        ["pipeline", "deploy"],
        ["deploy",   "ecs"],
        ["ecr",      "ecs"]
      ]
    },
    questions: [
      {
        prompt: "CodePipelineを使う主な目的はどれですか？",
        options: [
          "ソースの変更を検知し、ビルド・テスト・デプロイを自動化するため",
          "EC2のOSパッチを適用するため",
          "RDSのバックアップを取得するため",
          "Route 53のDNSレコードを管理するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "OSパッチはSystems Managerの機能です。",
          "RDSバックアップはRDS設定またはAWS Backupで管理します。",
          "DNSはRoute 53で管理します。CodePipelineの責務外です。"
        ],
        explanation: "CodePipelineによりデプロイ工程を自動化し、人手のミスを減らしリリース速度を向上できます。"
      },
      {
        prompt: "CodeBuildで単体テストを必須ステップにする理由はどれですか？",
        options: [
          "テスト失敗を早期に検出し、バグのある成果物がデプロイされるのを防ぐため",
          "EC2のCPU使用率を下げるため",
          "DynamoDBのテーブルを自動作成するため",
          "ALBのリスナールールを更新するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "CPU使用率はアプリ・インフラ設計の問題です。テストと無関係です。",
          "DynamoDBテーブルはIaCやアプリ起動時に作成します。",
          "ALBルールはIngress/ALB設定で管理します。"
        ],
        explanation: "パイプライン内テストにより品質ゲートを設け、不具合を本番到達前に阻止できます。"
      },
      {
        prompt: "Blue/Greenデプロイを採用する主なメリットはどれですか？",
        options: [
          "新バージョンへの切り替え時にダウンタイムなく、問題発生時に即ロールバックできる",
          "EC2インスタンス数を必ず半減できる",
          "データベースの移行が不要になる",
          "WAFのルールを自動更新できる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "Blue/Greenは並行稼働によりインスタンス数が一時的に増えることがあります。",
          "DBマイグレーションはアプリ変更に合わせて別途管理が必要です。",
          "WAFルール管理はCI/CDとは独立した運用です。"
        ],
        explanation: "Blue/Greenデプロイはトラフィック切り替えと高速ロールバックにより、デプロイリスクを大幅に下げます。"
      },
      {
        prompt: "CI/CDパイプラインでシークレット（APIキー等）を安全に扱う方法はどれですか？",
        options: [
          "ソースコードリポジトリに直接コミットする",
          "AWS Secrets ManagerやParameter Storeから実行時に取得する",
          "CodeBuildの環境変数に平文で設定する",
          "Slackで開発チームに共有する"
        ],
        answer: 1,
        wrongReasons: [
          "リポジトリへのコミットは漏洩リスクが極めて高く、絶対に避けるべきです。",
          "この選択肢は正解です。",
          "平文環境変数はログに残る可能性があり、Secrets Manager利用が推奨です。",
          "シークレットのチャット共有は管理不能な状態を生みます。"
        ],
        explanation: "Secrets Managerから実行時に取得することで、シークレットをコードから完全に分離できます。"
      },
      {
        prompt: "Infrastructure as Code（IaC）をCI/CDパイプラインに組み込む利点はどれですか？",
        options: [
          "インフラ変更を手動作業なくコードレビュー・テスト・デプロイできる",
          "EC2インスタンスが自動的に削除される",
          "RDSのバックアップが不要になる",
          "ALBが自動的にスケールする"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "IaCによるインフラ管理はリソースの自動削除ではなく、変更管理・再現性の向上が目的です。",
          "バックアップはIaC管理とは独立した要件です。",
          "ALBスケーリングはALBサービスの機能で、IaC組み込みとは別です。"
        ],
        explanation: "IaCをパイプラインに組み込むことで、インフラ変更も承認フロー・テストを経て自動適用できます。"
      }
    ]
  },
  {
    id: "step-functions",
    title: "構成図M: Step Functions + Lambda",
    description:
      "Step Functionsでワークフローを定義し、各ステップをLambdaが実行。成功・失敗・条件分岐を視覚的に管理できるサーバーレスオーケストレーション構成です。",
    diagram: {
      viewBox: "0 0 1280 420",
      zones: [
        { label: "Trigger",          x:  10, y:  30, w:  200, h: 360, tone: "#fff7db" },
        { label: "AWS Serverless",   x: 230, y:  30, w: 1030, h: 360, tone: "#eef8ff" },
        { label: "Orchestration",    x: 260, y:  65, w:  300, h: 300, tone: "#f6fffd" },
        { label: "Processing",       x: 590, y:  65, w:  650, h: 300, tone: "#f0fff8" }
      ],
      nodes: [
        { id: "trigger",   label: "EventBridge/API GW",  x:  20, y: 165, color: "#fef3c7" },
        { id: "sfn",       label: "Step Functions",      x: 280, y: 165, color: "#dbeafe" },
        { id: "lambda1",   label: "Lambda (Step 1)",     x: 620, y:  90, color: "#dcfce7" },
        { id: "lambda2",   label: "Lambda (Step 2)",     x: 620, y: 200, color: "#dcfce7" },
        { id: "lambda3",   label: "Lambda (Step 3)",     x: 620, y: 305, color: "#dcfce7" },
        { id: "s3",        label: "S3 / DynamoDB",       x: 900, y: 190, color: "#fee2e2" }
      ],
      edges: [
        ["trigger",  "sfn"],
        ["sfn",      "lambda1"],
        ["sfn",      "lambda2"],
        ["sfn",      "lambda3"],
        ["lambda1",  "s3"],
        ["lambda2",  "s3"],
        ["lambda3",  "s3"]
      ]
    },
    questions: [
      {
        prompt: "Step Functionsを使ってワークフローを定義する主な利点はどれですか？",
        options: [
          "複数Lambdaの実行順序・条件分岐・エラー処理を可視化して管理できる",
          "EC2のオートスケーリングを自動化できる",
          "RDSのスキーマを自動生成できる",
          "ALBのヘルスチェックを設定できる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "オートスケーリングはEC2 Auto Scalingの機能です。Step Functionsの責務外です。",
          "スキーマ生成はDB設計の話です。",
          "ヘルスチェックはALB側の設定です。"
        ],
        explanation: "Step Functionsによりワークフロー全体を状態マシンとして管理でき、障害時の対応も明確になります。"
      },
      {
        prompt: "Step FunctionsのWait状態を使う主な目的はどれですか？",
        options: [
          "外部処理の完了を待つ間、コストを抑えてポーリングを排除するため",
          "Lambdaの実行時間を無制限にするため",
          "DynamoDBのキャパシティを予約するため",
          "S3バケットを自動作成するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "Lambda実行時間はLambda設定で制御します。Wait状態はLambdaの制限とは別です。",
          "キャパシティ設定はDynamoDB側の設定です。",
          "S3バケット作成はIaCやSDKで行います。"
        ],
        explanation: "Wait状態を使うことで非同期処理の完了を効率よく待機でき、Lambdaをアイドルで占有しなくて済みます。"
      },
      {
        prompt: "Step FunctionsでCatch/Retryを設定する目的はどれですか？",
        options: [
          "一時的なエラーを自動リトライし、恒久的な失敗は代替パスへ誘導するため",
          "DynamoDBの読み書き性能を上げるため",
          "Lambda関数のコールドスタートをなくすため",
          "CloudFrontのキャッシュを削除するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "DB性能はキャパシティ設定やElastiCacheで改善します。",
          "コールドスタートはProvisioned Concurrencyで対策します。",
          "キャッシュ制御はCloudFront側の操作です。"
        ],
        explanation: "CatchとRetryにより、障害時の回復戦略をワークフロー定義に組み込め、アプリコードを簡潔に保てます。"
      },
      {
        prompt: "Step Functions Expressワークフローを選ぶ場合の適切なユースケースはどれですか？",
        options: [
          "高頻度・短時間のトランザクション処理に向いている",
          "長時間の人間承認フローに最適",
          "EC2の起動停止スケジューリングに使う",
          "RDSのフェイルオーバーを制御する"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "長時間・承認フローはStandard Workflowが適しています。",
          "EC2スケジューリングはEventBridgeやSystems Managerで対応します。",
          "RDSフェイルオーバーはRDSサービス側の機能です。"
        ],
        explanation: "Expressワークフローは高スループット・短時間処理向けで、1秒以下の大量イベント処理に適しています。"
      },
      {
        prompt: "Step Functionsによるオーケストレーションと、Lambda同士を直接呼び出す設計の違いはどれですか？",
        options: [
          "Step Functionsは状態管理・可視化・エラー処理を集約でき、複雑な連携でも保守しやすい",
          "Lambda直呼び出しの方が常にコストが安い",
          "Step FunctionsはEC2専用サービスである",
          "Lambda直呼び出しの方がエラー追跡が容易"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "コスト比較はユースケース次第です。Step Functionsは追加コストがありますが、運用コスト削減で補えます。",
          "Step FunctionsはEC2専用ではなく、あらゆるサーバーレスリソースと連携できます。",
          "Lambda間の直呼び出しは連鎖障害のトレースが難しく、可観測性が下がりやすいです。"
        ],
        explanation: "Step Functionsにより実行履歴・エラーログが一元管理され、複雑なワークフローでも問題箇所を特定しやすくなります。"
      }
    ]
  },
  {
    id: "cloudwatch-monitoring",
    title: "構成図N: CloudWatch + SNS + Lambda",
    description:
      "CloudWatchメトリクス・アラームで異常を検知し、SNSで通知。Lambdaで自動修復アクション（スケーリング・再起動等）を実行する監視・自動化構成です。",
    diagram: {
      viewBox: "0 0 1300 420",
      zones: [
        { label: "Monitored Resources",  x:  10, y:  30, w:  230, h: 360, tone: "#fff7db" },
        { label: "AWS Observability",    x: 260, y:  30, w: 1020, h: 360, tone: "#eef8ff" },
        { label: "Detect",               x: 290, y:  65, w:  280, h: 300, tone: "#f6fffd" },
        { label: "Notify & Act",         x: 600, y:  65, w:  650, h: 300, tone: "#f0fff8" }
      ],
      nodes: [
        { id: "ec2",    label: "EC2 / ECS / RDS",  x:  20, y: 165, color: "#fef3c7" },
        { id: "cw",     label: "CloudWatch",        x: 310, y: 105, color: "#dbeafe" },
        { id: "alarm",  label: "CW Alarm",          x: 310, y: 250, color: "#fde68a" },
        { id: "sns",    label: "SNS",               x: 630, y: 105, color: "#dcfce7" },
        { id: "lambda", label: "Lambda (Auto-fix)", x: 630, y: 255, color: "#e0f2fe" },
        { id: "ops",    label: "Ops Team (Email)",  x: 930, y: 165, color: "#fee2e2" }
      ],
      edges: [
        ["ec2",   "cw"],
        ["cw",    "alarm"],
        ["alarm", "sns"],
        ["sns",   "ops"],
        ["sns",   "lambda"]
      ]
    },
    questions: [
      {
        prompt: "CloudWatchアラームのしきい値を設定する主な目的はどれですか？",
        options: [
          "異常状態を自動的に検知して通知・自動アクションをトリガーするため",
          "EC2のOSをアップグレードするため",
          "RDSのバックアップ頻度を増やすため",
          "ALBのリスナールールを変更するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "OSアップグレードはSystems Manager等で行います。",
          "バックアップ頻度はRDS/AWS Backup設定で管理します。",
          "ALBルールはALBの設定で変更します。"
        ],
        explanation: "アラームで閾値超過を自動検知することで、問題の早期発見とインシデント対応時間の短縮が図れます。"
      },
      {
        prompt: "SNSを通知ハブとして使う主なメリットはどれですか？",
        options: [
          "1つのアラームからメール・Lambda・SQSなど複数の宛先へ同時に通知できる",
          "EC2インスタンスのCPUを下げられる",
          "DynamoDBのキャパシティを自動調整できる",
          "CloudFrontのキャッシュを削除できる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "CPU制御はAuto Scalingやインスタンスタイプ変更で対応します。",
          "DynamoDBキャパシティ自動調整はDynamoDB Auto Scalingの機能です。",
          "キャッシュ削除はCloudFront InvalidationのAPI操作です。"
        ],
        explanation: "SNSのファンアウト機能により、1回の通知で複数のサブスクライバー（Lambda、メール、SQS等）に同時配信できます。"
      },
      {
        prompt: "CloudWatch Logsにアプリケーションログを集約する主な目的はどれですか？",
        options: [
          "エラーや異常ログを一元管理し、インシデント調査や傾向分析に活用するため",
          "EC2の料金を自動削減するため",
          "RDSのストレージを増やすため",
          "ALBの証明書を更新するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "コスト削減はコスト管理サービスで対応します。ログ集約の目的ではありません。",
          "ストレージ拡張はRDS設定で行います。",
          "証明書更新はACMで管理します。"
        ],
        explanation: "ログを一元集約することで、問題発生時に分散したサービスのログを横断的に検索・分析できます。"
      },
      {
        prompt: "Lambda自動修復アクション（Auto Remediation）を設計する際に重要な観点はどれですか？",
        options: [
          "修復アクションが冪等であること、ループを防ぐための条件制御を入れること",
          "修復Lambda関数に管理者権限を全付与すること",
          "アラームが発火するたびに必ずEC2を再起動すること",
          "SNSを使わずLambdaを直接CloudWatchに接続すること"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "管理者権限の全付与は過剰な権限で、最小権限原則に反します。",
          "無条件EC2再起動は誤検知での不要な中断を招きます。条件分岐が必要です。",
          "SNS経由の構成はアーキテクチャの柔軟性を高めます。直接接続はベストプラクティスではありません。"
        ],
        explanation: "冪等性と条件制御を設計することで、自動修復が誤動作してサービスを悪化させるリスクを防げます。"
      },
      {
        prompt: "CloudWatch Dashboardを作成する主な目的はどれですか？",
        options: [
          "複数サービスのメトリクスを一画面で可視化しシステム全体の健全性を把握するため",
          "EC2のSSHアクセスを管理するため",
          "RDSのクエリを最適化するため",
          "ALBのリスナールールを一括変更するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "SSHアクセス管理はIAM・セキュリティグループ・Session Managerで対応します。",
          "クエリ最適化はDB側のPerformance Insightsやslowクエリログで行います。",
          "ALBルール変更はALBの設定画面やIaCで実施します。"
        ],
        explanation: "Dashboardにより運用チームがKPIをリアルタイム監視でき、異常の早期検知と意思決定の迅速化に貢献します。"
      }
    ]
  },
  {
    id: "mobile-backend",
    title: "構成図O: モバイルバックエンド (Amplify + AppSync + DynamoDB)",
    description:
      "AWS AmplifyでフロントをホストしCognito認証、AppSync（GraphQL）でAPIを提供。DynamoDBにデータ保存し、S3で静的コンテンツを管理するモバイル/Webバックエンド構成です。",
    diagram: {
      viewBox: "0 0 1300 420",
      zones: [
        { label: "Client App",       x:  10, y:  30, w:  210, h: 360, tone: "#fff7db" },
        { label: "AWS Cloud",        x: 240, y:  30, w: 1040, h: 360, tone: "#eef8ff" },
        { label: "Auth & Hosting",   x: 270, y:  65, w:  290, h: 300, tone: "#f6fffd" },
        { label: "API & Data",       x: 590, y:  65, w:  660, h: 300, tone: "#f0fff8" }
      ],
      nodes: [
        { id: "app",     label: "Mobile/Web App",    x:  20, y: 165, color: "#fef3c7" },
        { id: "amplify", label: "Amplify Hosting",   x: 290, y:  95, color: "#dbeafe" },
        { id: "cognito", label: "Cognito",           x: 290, y: 250, color: "#fde68a" },
        { id: "appsync", label: "AppSync (GraphQL)", x: 620, y: 105, color: "#dcfce7" },
        { id: "dynamo",  label: "DynamoDB",          x: 900, y: 105, color: "#fee2e2" },
        { id: "s3",      label: "S3 (Media)",        x: 900, y: 255, color: "#e0f2fe" }
      ],
      edges: [
        ["app",     "amplify"],
        ["app",     "cognito"],
        ["cognito", "appsync"],
        ["appsync", "dynamo"],
        ["appsync", "s3"],
        ["app",     "s3"]
      ]
    },
    questions: [
      {
        prompt: "AppSync（GraphQL）をREST APIではなく採用する主な理由はどれですか？",
        options: [
          "必要なフィールドだけを1リクエストで取得でき、オーバーフェッチを防げるため",
          "DynamoDBのテーブル設計が不要になるため",
          "Cognitoの認証を省略できるため",
          "S3への直接アクセスが可能になるため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "テーブル設計はアクセスパターンに基づき必要です。AppSyncで不要になるわけではありません。",
          "AppSyncはCognitoと連携して認証を行います。省略ではなく統合が特徴です。",
          "S3への直接アクセスはIAMや署名付きURLで制御します。AppSyncとは別の話です。"
        ],
        explanation: "GraphQLはクライアントが必要なデータ構造を指定できるため、REST比でネットワーク効率が改善します。"
      },
      {
        prompt: "AWS Amplifyを使うメリットとして最も適切なのはどれですか？",
        options: [
          "フロントエンドのビルド・ホスティング・バックエンド連携を統合的に素早く構築できる",
          "EC2のOS管理を自動化できる",
          "RDSのバックアップ間隔を短縮できる",
          "Transit Gatewayの設定を簡略化できる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "OS管理はSystems Managerが担います。Amplifyはフロントエンド・バックエンド統合開発に特化しています。",
          "バックアップ間隔はRDS/AWS Backup設定で管理します。",
          "ネットワーク設計はVPC/Transit Gateway設定の話です。"
        ],
        explanation: "AmplifyはCI/CD・ホスティング・認証・API・ストレージをまとめて提供し、モバイル/Webアプリ開発を加速します。"
      },
      {
        prompt: "AppSyncのリアルタイムサブスクリプション機能を使う主な目的はどれですか？",
        options: [
          "データ変更をクライアントへリアルタイムプッシュし、ポーリングをなくすため",
          "DynamoDBのキャパシティを自動調整するため",
          "S3のオブジェクトを自動削除するため",
          "Cognitoのユーザープールを管理するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "DynamoDBキャパシティ調整はAuto Scaling設定で管理します。",
          "S3オブジェクト管理はライフサイクルポリシーで行います。",
          "ユーザープール管理はCognitoコンソールやAPIで行います。"
        ],
        explanation: "WebSocket接続を使ったサブスクリプションにより、チャット・通知・リアルタイムダッシュボード等を効率よく実装できます。"
      },
      {
        prompt: "DynamoDBのグローバルセカンダリインデックス（GSI）を追加する目的はどれですか？",
        options: [
          "プライマリキー以外の属性でクエリできるようにしアクセスパターンを増やすため",
          "テーブルのストレージ容量を増やすため",
          "AppSyncのGraphQLスキーマを自動生成するため",
          "Cognitoのトークン有効期限を延ばすため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "ストレージはGSI追加で若干増えますが、それが目的ではありません。",
          "GraphQLスキーマはAppSync側で定義します。GSIと独立しています。",
          "トークン有効期限はCognito設定で管理します。"
        ],
        explanation: "GSIを活用することで、DynamoDBの1テーブルで複数のアクセスパターンに対応できます。"
      },
      {
        prompt: "Cognitoと連携してAppSyncのAPIアクセスを制御する主な方法はどれですか？",
        options: [
          "CognitoのIDトークンをAppSyncに渡し、ユーザーやグループに応じた認可を行う",
          "全ユーザーに無制限アクセスを許可する",
          "DynamoDBのアイテムを誰でも読み書きできるようにする",
          "S3バケットを完全公開にする"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "無制限アクセスはセキュリティ上のリスクです。認証・認可設計は必須です。",
          "DynamoDBの認可はIAMとAppSyncの認可ルールで制御します。公開設定は避けるべきです。",
          "メディア以外のデータを公開バケットに保存するのはデータ漏洩リスクになります。"
        ],
        explanation: "CognitoとAppSyncを統合することで、ユーザー認証状態・所属グループに基づいたきめ細かいAPI認可が実現できます。"
      }
    ]
  }
];

const scenarioButtons = document.getElementById("scenarioButtons");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioDescription = document.getElementById("scenarioDescription");
const diagramCanvas = document.getElementById("diagramCanvas");
const questionCounter = document.getElementById("questionCounter");
const questionText = document.getElementById("questionText");
const optionsWrap = document.getElementById("options");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const feedback = document.getElementById("feedback");
const scoreText = document.getElementById("scoreText");
const resetBtn = document.getElementById("resetBtn");

// Per-scenario state: keyed by scenario index
const scenarioStates = {};

function getScenarioState(index) {
  if (!scenarioStates[index]) {
    scenarioStates[index] = {
      questionIndex: 0,
      selected: null,
      score: 0,
      answered: new Set(),
      feedbackHtml: "",
      feedbackClass: "feedback"
    };
  }
  return scenarioStates[index];
}

const state = {
  scenarioIndex: 0,
  get current() { return getScenarioState(this.scenarioIndex); }
};

function renderScenarioButtons() {
  scenarioButtons.innerHTML = "";
  scenarios.forEach((scenario, index) => {
    const s = getScenarioState(index);
    const done = s.answered.size;
    const total = scenario.questions.length;
    const button = document.createElement("button");
    button.className = "scenario-btn";
    if (index === state.scenarioIndex) button.classList.add("active");
    button.innerHTML = `<strong>${scenario.title}</strong><br><small>${done}/${total}問解答済</small>`;
    button.addEventListener("click", () => {
      state.scenarioIndex = index;
      renderAll();
    });
    scenarioButtons.appendChild(button);
  });
}

function resetScenarioState() {
  scenarioStates[state.scenarioIndex] = {
    questionIndex: 0,
    selected: null,
    score: 0,
    answered: new Set(),
    feedbackHtml: "",
    feedbackClass: "feedback"
  };
}

function getNodeIcon(label) {
  const l = label.toLowerCase();

  if (l.includes("user") || l.includes("client") || l.includes("developer") || l.includes("app")) return "👤";
  if (l.includes("cloudfront")) return "🌐";
  if (l.includes("nlb")) return "⚖️";
  if (l.includes("alb")) return "↔️";
  if (l.includes("waf")) return "🛡️";
  if (l.includes("ec2") || l.includes("ecs")) return "🖥️";
  if (l.includes("eks") || l.includes("kubernetes") || l.includes("pod") || l.includes("fargate")) return "🐳";
  if (l.includes("ecr")) return "📦";
  if (l.includes("lambda")) return "λ";
  if (l.includes("step functions") || l.includes("sfn")) return "🔀";
  if (l.includes("rds") || l.includes("aurora") || l.includes("dynamodb")) return "🗄️";
  if (l.includes("cognito")) return "🔐";
  if (l.includes("s3")) return "🪣";
  if (l.includes("sqs")) return "📬";
  if (l.includes("sns")) return "🔔";
  if (l.includes("eventbridge") || l.includes("alarm")) return "⏰";
  if (l.includes("cloudwatch")) return "📊";
  if (l.includes("route 53") || l.includes("r53") || l.includes("dns")) return "🌍";
  if (l.includes("acm") || l.includes("certificate")) return "🔒";
  if (l.includes("pipeline") || l.includes("codepipeline")) return "🚀";
  if (l.includes("codebuild") || l.includes("build")) return "🔨";
  if (l.includes("codedeploy") || l.includes("deploy")) return "📤";
  if (l.includes("amplify")) return "📱";
  if (l.includes("appsync") || l.includes("graphql")) return "⚡";
  if (l.includes("kinesis") || l.includes("firehose")) return "🌊";
  if (l.includes("glue")) return "🔧";
  if (l.includes("athena")) return "🔍";
  if (l.includes("quicksight")) return "📈";
  if (l.includes("transit") || l.includes("gateway") || l.includes("tgw")) return "🔗";

  return "☁️";
}

function drawDiagram(scenario) {
  const { nodes, edges, zones = [], viewBox = "0 0 900 290" } = scenario.diagram;
  const map = new Map(nodes.map((n) => [n.id, n]));

  // Auto-fit viewBox so nodes and zones are never clipped by the canvas.
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  };

  zones.forEach((z) => {
    bounds.minX = Math.min(bounds.minX, z.x);
    bounds.minY = Math.min(bounds.minY, z.y);
    bounds.maxX = Math.max(bounds.maxX, z.x + z.w);
    bounds.maxY = Math.max(bounds.maxY, z.y + z.h);
  });

  nodes.forEach((n) => {
    bounds.minX = Math.min(bounds.minX, n.x);
    bounds.minY = Math.min(bounds.minY, n.y);
    bounds.maxX = Math.max(bounds.maxX, n.x + 144);
    bounds.maxY = Math.max(bounds.maxY, n.y + 60);
  });

  const [baseX, baseY, baseW, baseH] = viewBox.split(" ").map(Number);
  const hasFiniteBounds = Number.isFinite(bounds.minX) && Number.isFinite(bounds.minY);
  const padding = 20;

  const vbX = hasFiniteBounds ? Math.min(baseX, bounds.minX - padding) : baseX;
  const vbY = hasFiniteBounds ? Math.min(baseY, bounds.minY - padding) : baseY;
  const vbRight = hasFiniteBounds
    ? Math.max(baseX + baseW, bounds.maxX + padding)
    : baseX + baseW;
  const vbBottom = hasFiniteBounds
    ? Math.max(baseY + baseH, bounds.maxY + padding)
    : baseY + baseH;
  const resolvedViewBox = `${Math.max(0, vbX)} ${Math.max(0, vbY)} ${Math.ceil(
    vbRight - Math.max(0, vbX)
  )} ${Math.ceil(vbBottom - Math.max(0, vbY))}`;

  const zoneSvg = zones
    .map(
      (z) => `
      <g>
        <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="14" ry="14" fill="${z.tone}" stroke="#7c8ea1" stroke-width="1.2" stroke-dasharray="4 3"></rect>
        <text x="${z.x + 12}" y="${z.y + 20}" font-size="12" font-weight="700" fill="#334155" font-family="'M PLUS 1p', 'Yu Gothic', sans-serif">${z.label}</text>
      </g>
    `
    )
    .join("");

  const edgeSvg = edges
    .map(([from, to]) => {
      const f = map.get(from);
      const t = map.get(to);
      return `<line x1="${f.x + 144}" y1="${f.y + 30}" x2="${t.x}" y2="${t.y + 30}" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />`;
    })
    .join("");

  const nodeSvg = nodes
    .map(
      (n) => `
      <g>
        <rect x="${n.x}" y="${n.y}" rx="10" ry="10" width="144" height="60" fill="${n.color}" stroke="#334155" stroke-width="1.5"></rect>
        <rect x="${n.x}" y="${n.y}" rx="10" ry="10" width="144" height="18" fill="#334155" fill-opacity="0.08"></rect>
        <text x="${n.x + 10}" y="${n.y + 13}" font-size="11" fill="#334155" font-family="'M PLUS 1p', 'Yu Gothic', sans-serif">${getNodeIcon(n.label)}</text>
        <text x="${n.x + 72}" y="${n.y + 39}" text-anchor="middle" font-size="13" fill="#0f172a" font-family="'M PLUS 1p', 'Yu Gothic', sans-serif">${n.label}</text>
      </g>
    `
    )
    .join("");

  diagramCanvas.innerHTML = `
    <svg viewBox="${resolvedViewBox}" role="img" aria-label="${scenario.title}の構成図">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
          <polygon points="0 0, 10 4, 0 8" fill="#475569" />
        </marker>
      </defs>
      ${zoneSvg}
      ${edgeSvg}
      ${nodeSvg}
    </svg>
  `;
}

function buildWrongOptionReasons(question) {
  if (Array.isArray(question.wrongReasons) && question.wrongReasons.length === question.options.length) {
    return question.wrongReasons;
  }

  return question.options.map((opt, index) => {
    if (index === question.answer) {
      return "この選択肢は正解です。";
    }

    return `この選択肢は要件の中心である「${question.options[question.answer]}」を満たせないため不正解です。`;
  });
}

function renderQuestion() {
  const scenario = scenarios[state.scenarioIndex];
  const cs = state.current;
  const q = scenario.questions[cs.questionIndex];

  questionCounter.textContent = `${cs.questionIndex + 1} / ${scenario.questions.length}`;
  questionText.textContent = q.prompt;
  optionsWrap.innerHTML = "";

  q.options.forEach((opt, i) => {
    const label = document.createElement("label");
    label.className = "option-item";
    label.innerHTML = `
      <input type="radio" name="option" value="${i}" ${cs.selected === i ? "checked" : ""} />
      <span>${opt}</span>
    `;
    const radio = label.querySelector("input");
    radio.addEventListener("change", () => {
      cs.selected = Number(radio.value);
    });
    optionsWrap.appendChild(label);
  });

  const key = `${state.scenarioIndex}-${cs.questionIndex}`;
  const answered = cs.answered.has(key);
  submitBtn.disabled = answered;
  nextBtn.disabled = !answered;
}

function updateScore() {
  const scenario = scenarios[state.scenarioIndex];
  const cs = state.current;
  scoreText.textContent = `正解数: ${cs.score} / ${scenario.questions.length}`;
}

function renderScenarioInfo() {
  const scenario = scenarios[state.scenarioIndex];
  scenarioTitle.textContent = scenario.title;
  scenarioDescription.textContent = scenario.description;
  drawDiagram(scenario);
}

function renderAll() {
  renderScenarioButtons();
  renderScenarioInfo();
  renderQuestion();
  updateScore();
  const cs = state.current;
  if (cs.feedbackHtml) {
    feedback.className = cs.feedbackClass;
    feedback.innerHTML = cs.feedbackHtml;
  } else {
    feedback.className = "feedback";
    feedback.textContent = "選択肢を選んで「解答する」を押してください。";
  }
}

submitBtn.addEventListener("click", () => {
  const scenario = scenarios[state.scenarioIndex];
  const cs = state.current;
  const q = scenario.questions[cs.questionIndex];
  const wrongReasons = buildWrongOptionReasons(q);

  if (cs.selected === null) {
    feedback.className = "feedback ng";
    feedback.textContent = "先に選択肢を1つ選んでください。";
    return;
  }

  const key = `${state.scenarioIndex}-${cs.questionIndex}`;
  if (cs.answered.has(key)) return;

  const isCorrect = cs.selected === q.answer;
  if (isCorrect) {
    cs.score += 1;
    cs.feedbackClass = "feedback ok";
    cs.feedbackHtml = `<strong>正解です。</strong><br>${q.explanation}<br><br><strong>不正解選択肢の理由</strong><ul>${q.options
      .map((opt, i) => i === q.answer ? "" : `<li>${opt}: ${wrongReasons[i]}</li>`)
      .join("")}</ul>`;
  } else {
    cs.feedbackClass = "feedback ng";
    cs.feedbackHtml = `<strong>不正解です。</strong><br>あなたの選択: ${q.options[cs.selected]}<br>なぜ不正解か: ${wrongReasons[cs.selected]}<br><br>正解: ${q.options[q.answer]}<br>${q.explanation}<br><br><strong>他の不正解選択肢の理由</strong><ul>${q.options
      .map((opt, i) => (i === q.answer || i === cs.selected) ? "" : `<li>${opt}: ${wrongReasons[i]}</li>`)
      .join("")}</ul>`;
  }
  feedback.className = cs.feedbackClass;
  feedback.innerHTML = cs.feedbackHtml;

  cs.answered.add(key);
  submitBtn.disabled = true;
  nextBtn.disabled = false;
  updateScore();
  renderScenarioButtons();
});

nextBtn.addEventListener("click", () => {
  const scenario = scenarios[state.scenarioIndex];
  const cs = state.current;
  if (cs.questionIndex < scenario.questions.length - 1) {
    cs.questionIndex += 1;
    cs.selected = null;
    cs.feedbackHtml = "次の問題です。";
    cs.feedbackClass = "feedback";
    renderQuestion();
    feedback.className = "feedback";
    feedback.textContent = "次の問題です。";
    return;
  }

  cs.feedbackClass = "feedback ok";
  cs.feedbackHtml = `<strong>${scenario.title}を完了しました。</strong><br>スコアは ${cs.score} / ${scenario.questions.length} です。別の構成図にも挑戦してみてください。`;
  feedback.className = cs.feedbackClass;
  feedback.innerHTML = cs.feedbackHtml;
  nextBtn.disabled = true;
});

resetBtn.addEventListener("click", () => {
  resetScenarioState();
  renderAll();
});

renderAll();

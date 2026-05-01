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
      },
      {
        prompt: "プライベートサブネットのEC2から外部アップデート取得を行う際の一般的な設計はどれですか？",
        options: [
          "EC2へパブリックIPを付与して直接インターネット接続する",
          "NAT Gateway経由でアウトバウンドのみ許可する",
          "ALB経由でOSパッケージを配布する",
          "RDS Proxy経由でインターネット接続する"
        ],
        answer: 1,
        wrongReasons: [
          "プライベートサブネット設計の意図は直接公開を避けることです。パブリックIP付与は攻撃面を広げるため、原則として避ける構成です。",
          "この選択肢は正解です。",
          "ALBはHTTP/HTTPSの受信分散を担当し、OSパッケージ配布の中継機構ではありません。",
          "RDS ProxyはDB接続効率化のサービスで、インターネット到達性を提供する用途ではありません。"
        ],
        explanation:
          "NAT Gatewayを使うと、外向き通信のみ許可しつつインスタンスを直接公開せずに運用できます。"
      },
      {
        prompt: "ALBとEC2間のセキュリティグループ設計として望ましいのはどれですか？",
        options: [
          "EC2のインバウンドを0.0.0.0/0で80許可",
          "EC2のインバウンドはALBのセキュリティグループからのみ許可",
          "ALBのインバウンドを全拒否してEC2だけ公開",
          "EC2のアウトバウンドを全拒否すればインバウンド設定は不要"
        ],
        answer: 1,
        wrongReasons: [
          "0.0.0.0/0許可はアプリサーバーを広く公開してしまい、ALBを前段に置く意味を弱めます。到達元をALBに限定するのがより安全です。",
          "この選択肢は正解です。",
          "ALBを全拒否すると外部トラフィックを受けられず、設計意図に反します。公開窓口はALB、アプリは内部限定が基本です。",
          "アウトバウンド制御は重要ですが、インバウンド制御を置き換えるものではありません。入口制御は別途必要です。"
        ],
        explanation:
          "ALB経由のみでEC2へ到達できるようにすると、アクセス経路を明確化し攻撃面を縮小できます。"
      },
      {
        prompt: "RDSリードレプリカを追加する主な判断材料として適切なのはどれですか？",
        options: [
          "書き込み障害時の自動フェイルオーバーだけを強化したい",
          "読み取り負荷が高く、クエリを分散したい",
          "DBをインターネットへ公開したい",
          "ALBのヘルスチェックを高速化したい"
        ],
        answer: 1,
        wrongReasons: [
          "自動フェイルオーバー重視ならまずMulti-AZが主軸です。リードレプリカは主に読み取りスケール用途です。",
          "この選択肢は正解です。",
          "レプリカ追加は公開範囲の話ではありません。DB公開はセキュリティ上の重大リスクを伴うため別問題として扱います。",
          "ALBヘルスチェックはアプリ層監視であり、DBレプリカ導入の主目的ではありません。"
        ],
        explanation:
          "読み取り系を分離して負荷分散したい場合、リードレプリカは有効な選択肢です。"
      },
      {
        prompt: "Multi-AZとMulti-Regionを比較したとき、Multi-Regionを検討する典型要件はどれですか？",
        options: [
          "単一リージョン内のAZ障害だけに備えたい",
          "リージョン障害や地理冗長の要求がある",
          "DBパラメータ変更を減らしたい",
          "開発環境のコストを最小化したい"
        ],
        answer: 1,
        wrongReasons: [
          "AZ障害対策だけならMulti-AZで要件を満たすことが多く、Multi-Regionは過剰設計になり得ます。",
          "この選択肢は正解です。",
          "パラメータ変更回数は運用方針の話で、リージョン冗長化の直接的な判断基準ではありません。",
          "Multi-Regionは一般にコストと運用複雑性が上がるため、コスト最小化だけを目的に選ぶのは不適切です。"
        ],
        explanation:
          "リージョン単位障害に備えるには、Multi-Region設計とデータレプリケーション戦略の検討が必要です。"
      },
      {
        prompt: "公開サブネットとプライベートサブネットを分ける主なメリットはどれですか？",
        options: [
          "すべての通信をインターネット経由に統一できる",
          "役割ごとに露出範囲を分離し、セキュリティ境界を明確化できる",
          "RDSのバックアップ時間を必ず短縮できる",
          "CloudFrontの証明書管理が不要になる"
        ],
        answer: 1,
        wrongReasons: [
          "全通信をインターネット経由にすると内部通信の安全性が下がります。必要最小限の公開が原則です。",
          "この選択肢は正解です。",
          "サブネット分離は主にセキュリティと運用分離の話で、バックアップ時間短縮を直接保証するものではありません。",
          "証明書管理はACM等の運用テーマで、サブネット分離によって不要になるわけではありません。"
        ],
        explanation:
          "公開層と内部層を分離すると、最小公開の原則に沿って防御しやすくなります。"
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
      },
      {
        prompt: "API Gatewayでスロットリングを設定する主目的はどれですか？",
        options: [
          "Cognitoのユーザー数を増やすため",
          "過負荷や突発アクセスからバックエンドを保護するため",
          "S3オブジェクトを自動暗号化するため",
          "Lambdaのメモリサイズを自動調整するため"
        ],
        answer: 1,
        wrongReasons: [
          "ユーザー数増加は認証導線やプロダクト施策の問題で、スロットリングの目的ではありません。",
          "この選択肢は正解です。",
          "S3暗号化はS3/KMS設定で管理します。API Gatewayスロットリングの責務外です。",
          "メモリサイズ調整はLambda設定または運用判断で行い、スロットリング機能では制御しません。"
        ],
        explanation:
          "適切なレート制御は、依存先の保護と安定運用に直結します。"
      },
      {
        prompt: "Cognito User Poolを使う理由として適切なのはどれですか？",
        options: [
          "アプリユーザーの認証基盤をマネージドで持てる",
          "VPCのルートテーブルを自動生成できる",
          "DynamoDBのGSIを自動作成できる",
          "Lambdaの実行ログをCloudWatchへ出さないようにできる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "ルートテーブルはVPCネットワーク設計の要素で、Cognitoの機能範囲ではありません。",
          "GSI設計はデータアクセス要件に基づくDB設計であり、認証基盤とは独立した判断です。",
          "Lambdaログ制御は実行ロールやログ設定の話で、Cognito導入で無効化されるものではありません。"
        ],
        explanation:
          "User Poolはサインアップ/サインイン、トークン発行などを提供し、認証実装の負荷を下げます。"
      },
      {
        prompt: "DynamoDBのパーティションキー設計で重要な観点はどれですか？",
        options: [
          "すべて同じキー値にして検索を単純化する",
          "アクセスが偏らないキー分布を考える",
          "SQL JOINしやすいように正規化する",
          "必ず全文検索を前提にする"
        ],
        answer: 1,
        wrongReasons: [
          "同一キー集中はホットパーティションを招き、スループット低下の原因になります。",
          "この選択肢は正解です。",
          "DynamoDBはJOIN中心のRDB設計とは前提が異なります。アクセスパターンから逆算するのが基本です。",
          "全文検索は要件次第で別サービス連携を検討しますが、必須前提ではありません。"
        ],
        explanation:
          "キー分散を意識すると、スケール時の性能劣化を避けやすくなります。"
      },
      {
        prompt: "フロント配信をS3 + CloudFrontで構成するメリットとして適切なのはどれですか？",
        options: [
          "動的API認証を完全に不要化できる",
          "静的配信を低コストかつ高速に提供しやすい",
          "RDSのフェイルオーバー速度を上げられる",
          "Lambdaのタイムアウト制限を解除できる"
        ],
        answer: 1,
        wrongReasons: [
          "静的配信最適化とAPI認証は別の課題です。APIには別途認証・認可設計が必要です。",
          "この選択肢は正解です。",
          "RDS可用性はDB構成の問題で、静的配信基盤の選択で改善するものではありません。",
          "Lambda制限はサービス仕様であり、配信方式を変えても解除されません。"
        ],
        explanation:
          "静的ファイルはS3 + CloudFrontの相性がよく、運用と性能のバランスを取りやすいです。"
      },
      {
        prompt: "この構成でIAM最小権限を徹底する目的として最も適切なのはどれですか？",
        options: [
          "開発速度を必ず低下させるため",
          "漏えい時の影響範囲を小さくし、誤操作リスクも減らすため",
          "CloudFrontキャッシュヒット率を向上させるため",
          "API GatewayのURLを短くするため"
        ],
        answer: 1,
        wrongReasons: [
          "最小権限は速度低下が目的ではなく、セキュリティと統制のための設計原則です。",
          "この選択肢は正解です。",
          "キャッシュヒット率は配信・キャッシュ戦略の課題で、IAM権限設計の直接効果ではありません。",
          "URL長は可読性の問題で、権限設計とは無関係です。"
        ],
        explanation:
          "最小権限により事故時の被害を限定し、監査対応もしやすくなります。"
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
      },
      {
        prompt: "非同期ワーカーで冪等性を重視する理由として適切なのはどれですか？",
        options: [
          "同じメッセージが再処理されても結果の重複を防ぐため",
          "CPU使用率を常に0%にするため",
          "VPCを作らずに運用するため",
          "CloudFrontのキャッシュを無効化するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "冪等性は計算資源削減だけが目的ではなく、再試行時のデータ整合性維持が主目的です。",
          "冪等性設計とVPC有無は別の設計軸です。",
          "キャッシュ制御は配信戦略であり、ワーカー再試行時の安全性とは直接関係しません。"
        ],
        explanation:
          "少なくとも一度配送される前提のキュー処理では、冪等性がデータ品質維持の鍵になります。"
      },
      {
        prompt: "ワーカーのオートスケーリング指標として有効なものはどれですか？",
        options: [
          "キュー滞留件数や最古メッセージ遅延",
          "ALB名の文字数",
          "VPCサブネット名の個数",
          "Route 53ホストゾーン数のみ"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "命名情報は運用品質に寄与しても、処理負荷を直接表すスケール指標にはなりません。",
          "サブネット数はネットワーク構成情報で、リアルタイム処理量の指標ではありません。",
          "DNSゾーン数だけではキュー処理逼迫を判断できません。"
        ],
        explanation:
          "負荷連動でワーカー台数を調整するには、キュー遅延や深さを直接見るのが効果的です。"
      },
      {
        prompt: "順序保証が厳密に必要な業務イベントで優先検討すべきものはどれですか？",
        options: [
          "SQS Standard + 冪等性のみで十分",
          "SQS FIFOとグルーピング戦略の検討",
          "ALBのルール追加のみ",
          "CloudFrontのTTL短縮のみ"
        ],
        answer: 1,
        wrongReasons: [
          "Standardキューは高スループット向きですが順序保証が厳密ではありません。順序要件が強い場合はFIFOを検討します。",
          "この選択肢は正解です。",
          "ALBルールはHTTP振り分けの設定で、メッセージキューの順序保証には関与しません。",
          "TTL調整はキャッシュ制御であり、イベント順序保証の課題を解決しません。"
        ],
        explanation:
          "順序性が業務要件なら、キュー種別選択とコンシューマ設計をセットで決める必要があります。"
      },
      {
        prompt: "SQSロングポーリングを使う主な狙いはどれですか？",
        options: [
          "空受信を減らして無駄な呼び出しを抑える",
          "DB暗号化を自動有効化する",
          "API Gatewayを削除する",
          "EventBridgeルール数を固定する"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "暗号化設定はDBやKMS側の設定で管理し、ロングポーリング機能では制御しません。",
          "ロングポーリングはキュー受信効率化であり、API公開方式を置き換えるものではありません。",
          "ルール数固定は運用方針の問題で、キュー受信方式とは別です。"
        ],
        explanation:
          "ロングポーリングで空振りAPIコールを減らし、コストと効率の改善が期待できます。"
      },
      {
        prompt: "Visibility Timeout設計で意識すべきポイントはどれですか？",
        options: [
          "処理時間より短くして再配信を増やす",
          "ワーカーの実処理時間を踏まえて適切に設定する",
          "必ず0秒にしてリアルタイム化する",
          "ALBタイムアウトと同値で固定する"
        ],
        answer: 1,
        wrongReasons: [
          "短すぎると処理中メッセージが再配信され、重複処理リスクが高まります。",
          "この選択肢は正解です。",
          "0秒では受信直後に再可視化されやすく、安定処理が困難になります。",
          "ALBとSQSでは役割と処理時間特性が違うため、同値固定は妥当とは限りません。"
        ],
        explanation:
          "Visibility Timeoutは再配信のタイミングを左右するため、処理特性に合わせた調整が重要です。"
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
      },
      {
        prompt: "ECSタスクにIAMタスクロールを付与する目的はどれですか？",
        options: [
          "ホストEC2のルート権限をタスクに付与する",
          "必要なAWSリソースへの最小権限アクセスをタスク単位で制御する",
          "ElastiCacheのパスワードを不要にする",
          "ALBの料金を下げる"
        ],
        answer: 1,
        wrongReasons: [
          "タスクロールはEC2ルート権限とは別の仕組みです。最小権限でタスクごとに分離するのが目的です。",
          "この選択肢は正解です。",
          "認証設定はSecrets Managerや環境変数で管理します。IAMタスクロールで直接制御するものではありません。",
          "料金最適化はリソース設計やスケール設定で取り組む課題です。"
        ],
        explanation: "タスクロールにより最小権限をコンテナ単位で割り当て、クレデンシャル管理を安全にできます。"
      },
      {
        prompt: "ALBのヘルスチェックを設定する重要な理由はどれですか？",
        options: [
          "不健全なタスクへのトラフィックを自動的に外すため",
          "ElastiCacheのキャッシュを削除するため",
          "RDSのスナップショットを取得するため",
          "ECSイメージをECRへ自動プッシュするため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "キャッシュ管理はアプリ設計またはRedis設定の問題で、ALBの役割ではありません。",
          "スナップショット取得はRDS設定か運用スクリプトで行います。",
          "ECRへのプッシュはCI/CDパイプラインの責務です。"
        ],
        explanation: "ヘルスチェックにより、起動失敗や異常なタスクへのリクエスト送信を自動的に止められます。"
      },
      {
        prompt: "ECSのサービスオートスケーリングで最初に検討する指標はどれですか？",
        options: [
          "ElastiCacheのメモリ残量のみ",
          "CPUやメモリ使用率、あるいはALBリクエスト数",
          "RDSのストレージ残量のみ",
          "IAMポリシー数のみ"
        ],
        answer: 1,
        wrongReasons: [
          "ElastiCacheは参考値にはなりますが、ECSスケーリングの主要指標にはなりにくいです。",
          "この選択肢は正解です。",
          "DBストレージは容量管理の指標で、アプリ処理負荷のスケール判断には使いにくいです。",
          "IAMポリシー数はセキュリティ管理の話で、負荷指標ではありません。"
        ],
        explanation: "CPU/メモリ使用率やリクエスト数を直接見て、適切なタイミングでタスク増減を行うのが基本です。"
      },
      {
        prompt: "このECS+キャッシュ構成でコスト最適化を検討する際の代表的アプローチはどれですか？",
        options: [
          "常に最大タスク数で固定する",
          "Spot FargateやReserved Instanceを使い処理特性に合わせて使い分ける",
          "ElastiCacheを廃止してRDSへのアクセスを全部戻す",
          "ALBを削除してEC2に直接アクセスさせる"
        ],
        answer: 1,
        wrongReasons: [
          "最大固定はコスト最大化に向かい、最適化とは逆方向です。",
          "この選択肢は正解です。",
          "キャッシュ廃止はDBアクセス増によるコストとレイテンシ悪化を招くリスクがあります。",
          "ALB削除は単一障害点を作り可用性が下がります。コスト最適化の手段として適切ではありません。"
        ],
        explanation: "バッチや開発環境にSpot、本番や安定系にOnDemand/Reservedを組み合わせるのが有効です。"
      },
      {
        prompt: "ECSタスク定義でCPU/メモリを明示的に設定する意義はどれですか？",
        options: [
          "タスクの資源消費を制限し予期しない過負荷を防ぐため",
          "ElastiCacheのノード数を自動決定するため",
          "RDSのCPUを制御するため",
          "IAMポリシーのサイズを制限するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "ElastiCacheのノード設計はキャッシュ利用量やスループット要件で決めます。タスク定義とは独立した設計です。",
          "RDSのリソース設定はインスタンスタイプや設定パラメータで管理します。",
          "IAMポリシーは別の設計軸です。タスク資源設定とは無関係です。"
        ],
        explanation: "明示設定によりリソース上限が決まり、1タスクの暴走が他タスクに影響するのを防げます。"
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
      },
      {
        prompt: "VPC間の通信でTransit Gatewayのルートテーブルを分けるメリットはどれですか？",
        options: [
          "すべてのVPCが任意に通信できなくなるので不便になる",
          "VPCごとに許可する通信先を制御しセグメンテーションを実現できる",
          "Direct Connectの料金が下がる",
          "ALBのHTTPS設定が不要になる"
        ],
        answer: 1,
        wrongReasons: [
          "ルートテーブル分離は通信制御の強化であり、利便性の低下ではなくセキュリティ向上が目的です。",
          "この選択肢は正解です。",
          "ルートテーブル設計はコスト削減直結の設定ではありません。",
          "HTTPSはALBやACMで設定するもので、ルートテーブルの話ではありません。"
        ],
        explanation: "ルートテーブル分離により、不要なVPC間通信を遮断しセキュリティ境界を維持できます。"
      },
      {
        prompt: "Direct Connect障害時のバックアップとしてSite-to-Site VPNを使う構成の利点はどれですか？",
        options: [
          "常にVPNの方が高速なため切り替えが不要",
          "DX障害時もVPN経由で通信継続でき単一障害点を排除できる",
          "VPNを使うとDXの費用がゼロになる",
          "オンプレ機器のリプレースが不要になる"
        ],
        answer: 1,
        wrongReasons: [
          "VPNはインターネット経由のため、DXより帯域・レイテンシが劣ることが多いです。",
          "この選択肢は正解です。",
          "費用は個別に発生し、組み合わせることで片方が無料になるものではありません。",
          "機器リプレースはインフラライフサイクル管理の話で、冗長構成設計とは独立しています。"
        ],
        explanation: "DX+VPN冗長構成により、物理回線障害時もインターネットVPN経由でフォールバックできます。"
      },
      {
        prompt: "AWS Network Firewall をTransit GatewayとVPCの間に挟む主な目的はどれですか？",
        options: [
          "ファイアウォールルールで不正トラフィックの検査・遮断を一元管理するため",
          "RDSへの接続を暗号化するため",
          "ElastiCacheのデータを削除するため",
          "ECSのコンテナイメージを検索するため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "DB暗号化はKMSやTLS設定で管理します。Network Firewallは通信検査が主目的です。",
          "ElastiCacheのデータ管理はアプリ設計の責務です。",
          "コンテナイメージ管理はECRが担います。"
        ],
        explanation: "Network Firewallにより、L7レベルでの検査・IPS機能を使った一元的なトラフィック制御が可能です。"
      },
      {
        prompt: "ハイブリッド構成でCloudTrailを有効にする主目的はどれですか？",
        options: [
          "AWSへのAPIコール履歴を記録し監査・インシデント対応に活用するため",
          "VPNのIPsecキーを自動更新するため",
          "Transit Gatewayを無効にするため",
          "Direct Connectの帯域を増やすため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "VPN鍵管理はVPN設定側の話です。CloudTrailはAPI監査ログのサービスです。",
          "Gateway設定はネットワーク設計の問題で、CloudTrailの役割ではありません。",
          "帯域増加はDXポート変更やLAG追加で対応します。"
        ],
        explanation: "CloudTrailでAWS操作をすべてログに残すことで、セキュリティ調査やコンプライアンス対応を支援します。"
      },
      {
        prompt: "オンプレのアプリがAWS S3へアクセスする際、セキュアな方法として適切なのはどれですか？",
        options: [
          "バケットを完全公開にしてアクセスキーなしで接続",
          "DX/VPN経由でVPC Endpointを使いプライベートに接続する",
          "S3のURLを全員に共有する",
          "EC2パブリックIPをホワイトリストに登録する"
        ],
        answer: 1,
        wrongReasons: [
          "完全公開バケットは意図しない情報漏洩リスクが非常に高く、原則禁止すべきです。",
          "この選択肢は正解です。",
          "URL共有では認証制御ができず、誰でもアクセス可能になる恐れがあります。",
          "IP制限だけでは認証の代替になりません。IP詐称や変動リスクもあります。"
        ],
        explanation: "VPC EndpointとPrivateLink経由で接続するとインターネットを経由せず安全にS3アクセスできます。"
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
      },
      {
        prompt: "このパイプラインでデータ品質を担保するための観点として適切なのはどれですか？",
        options: [
          "S3に入ったデータをすべて無検証で分析に使う",
          "GlueジョブやLambdaでバリデーションを行い異常データを早期検出する",
          "QuickSightのみで全データ品質チェックを完結させる",
          "Athenaを無効化する"
        ],
        answer: 1,
        wrongReasons: [
          "無検証データで分析すると誤った意思決定につながります。品質管理は設計必須です。",
          "この選択肢は正解です。",
          "QuickSightは可視化ツールです。品質チェック機能として使うのは責務外です。",
          "Athenaはクエリ基盤として必要です。無効化は分析不能を意味します。"
        ],
        explanation: "パイプライン上流でデータ品質を確認することで、後段の分析精度と信頼性が上がります。"
      },
      {
        prompt: "S3のデータをライフサイクルポリシーで管理する目的はどれですか？",
        options: [
          "古いデータを自動的に低コストストレージ層へ移動または削除しコストを最適化する",
          "Athenaのクエリ速度を必ず2倍にする",
          "GlueのETL処理を止める",
          "QuickSightのダッシュボードを削除する"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "クエリ速度はフォーマットやパーティション設計に依存します。ライフサイクル設定が直接2倍化するわけではありません。",
          "ライフサイクルはS3オブジェクト管理の機能で、GlueのETL動作を止めるものではありません。",
          "ダッシュボード管理はQuickSight側の操作です。"
        ],
        explanation: "ライフサイクルポリシーでGlacierへの移動や削除を自動化すると長期保管コストを削減できます。"
      },
      {
        prompt: "Lambda変換ステップをKinesisとS3の間に置く理由はどれですか？",
        options: [
          "データを受け取った直後に正規化・フィルタリングし品質を上げるため",
          "RDSへの直接書き込みを増やすため",
          "VPCを削除するため",
          "CloudFrontを不要にするため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "分析基盤ではS3に蓄積してクエリで分析するのが基本です。RDS直接書き込みを増やすのは別設計です。",
          "VPC設計は独立した要件であり、Lambda変換の目的ではありません。",
          "CloudFront不要化は配信要件の話で、データ変換とは無関係です。"
        ],
        explanation: "S3格納前に変換することでダウンストリームのETLやクエリコストを削減しやすくなります。"
      },
      {
        prompt: "このデータ分析基盤でIAMバケットポリシーを厳密に設定する理由はどれですか？",
        options: [
          "分析データへのアクセスを必要な人・サービスに限定しデータ漏洩リスクを下げるため",
          "Athenaのクエリ実行速度を上げるため",
          "QuickSightのグラフ種類を増やすため",
          "Glueジョブのメモリを増やすため"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "クエリ速度はデータ形式とパーティションで決まり、バケットポリシーは速度に直接影響しません。",
          "グラフ種類はQuickSightの機能仕様です。",
          "GlueのリソースはGlueジョブ設定で管理します。"
        ],
        explanation: "S3バケットポリシーとIAMを組み合わせることで、分析基盤全体のアクセス境界を明確にできます。"
      },
      {
        prompt: "大量ログをリアルタイムに近い形で分析したい場合、このパイプラインのどのサービスを中心に検討しますか？",
        options: [
          "QuickSightだけでストリーミング処理する",
          "Kinesis Data StreamsやFirehoseをソース取り込みに使いAthenaで準リアルタイム分析する",
          "RDSにすべて書き込んでJOINする",
          "S3を使わずEC2にログを貯める"
        ],
        answer: 1,
        wrongReasons: [
          "QuickSightは可視化ツールであり、ストリーミング取り込み・処理は担いません。",
          "この選択肢は正解です。",
          "大量ログのリアルタイム処理にRDS直接書き込みは書き込み性能のボトルネックになりやすいです。",
          "EC2単体にログを貯めると可用性・スケール性ともに課題が生じます。"
        ],
        explanation: "Kinesisでストリーミング取り込み、S3蓄積、Athenaでクエリという構成が費用対効果の高い選択です。"
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
      },
      {
        prompt: "WAFで特定のIPアドレス範囲からのアクセスをブロックする場合、どこに設定しますか？",
        options: [
          "DynamoDBのアイテムレベルセキュリティ",
          "WAFのIP評判リスト/カスタムルール",
          "Lambdaのコード内",
          "RDSのセキュリティグループ"
        ],
        answer: 1,
        wrongReasons: [
          "DynamoDBはアクセス後のデータ保護層です。IPフィルタリングはアクセス到達前が効果的です。",
          "この選択肢は正解です。",
          "アプリケーションコード内フィルタリングはレイテンシが高い設計です。",
          "セキュリティグループはVPC内通信制御です。インターネットからのIPブロックにはWAFが適切です。"
        ],
        explanation: "WAFのIPレピュテーションリストやルール定義でL7レベルのIP制御が実現できます。"
      },
      {
        prompt: "Lambda コールドスタート対策の有効な手段はどれですか？",
        options: [
          "ALBのリクエストタイムアウトを極端に長くする",
          "プロビジョンされた同時実行数を確保する",
          "WAFのルール数を増やす",
          "DynamoDBのプロビジョニング容量を最大にする"
        ],
        answer: 1,
        wrongReasons: [
          "タイムアウト延長はユーザー体験を悪化させます。根本対策ではありません。",
          "この選択肢は正解です。",
          "WAFルール数はコールドスタートに影響しません。",
          "DynamoDBの設定はLambda起動時間に直接影響しません。"
        ],
        explanation: "プロビジョンされた同時実行数を設定すると、Lambdaが常にウォーム状態を保ちコールドスタートを減らせます。"
      },
      {
        prompt: "ALBの複数ターゲットグループを使い分ける利点はどれですか？",
        options: [
          "すべてのリクエストを同じLambda関数に送る",
          "パス/ホスト/ヘッダで異なるバックエンド処理へルーティング制御する",
          "DynamoDBテーブル数を削減する",
          "WAFの設定を自動更新する"
        ],
        answer: 1,
        wrongReasons: [
          "単一ターゲット化は柔軟性が低く、スケーラビリティが下がります。",
          "この選択肢は正解です。",
          "ターゲットグループ設定はDynamoDBテーブル数に影響しません。",
          "ターゲットグループ設定とWAF自動更新は無関係です。"
        ],
        explanation: "複数ターゲットグループで、API仕様や処理負荷に応じたルーティングを実現できます。"
      },
      {
        prompt: "DynamoDBオンデマンド課金とプロビジョニング課金のどちらを選ぶべきですか？",
        options: [
          "常にプロビジョニング固定が安い",
          "トラフィックパターンが予測不可でスパイク性なら、オンデマンドが適切",
          "WAFのルール設定で自動決定される",
          "Lambdaの実行回数で自動決定される"
        ],
        answer: 1,
        wrongReasons: [
          "予測不能な変動トラフィックではプロビジョニング固定がオーバープロビジョニング状態になり高コストです。",
          "この選択肢は正解です。",
          "WAFはトラフィック管理とは独立した機能です。",
          "DynamoDBの課金モデル決定はアーキテクチャ設計です。Lambda回数では自動決定されません。"
        ],
        explanation: "トラフィクパターンの予測可能性に応じ、適切な課金方式を選定することがコスト最適化の要です。"
      },
      {
        prompt: "このセキュリティ強化構成で追加で検討すべきセキュリティレイヤーはどれですか？",
        options: [
          "VPCエンドポイントでDynamoDBへのプライベートアクセスを実現",
          "WAFのみで十分で他は不要",
          "すべてのデータを暗号化した後、保存する",
          "ALBを複数リージョンに配置する"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "WAFは境界防御ですが、インターネット経由DynamoDB通信を最小化することで、さらなる防御が実現できます。",
          "データ暗号化はセキュリティの一部ですが、WAF+VPCエンドポイント組み合わせがより根本的です。",
          "リージョン複製は災害復旧の観点で、セキュリティ強化とは別の設計です。"
        ],
        explanation: "VPCエンドポイントでDynamoDBアクセスをAWS内部ネットワーク限定にすると、インターネット露出を防げます。"
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
      },
      {
        prompt: "CloudFront キャッシュの有効期限（TTL）をどう設定すべきですか？",
        options: [
          "すべてのオブジェクトを無期限キャッシュ",
          "コンテンツの更新頻度に合わせ適切なTTLを設定（静的は長く、動的は短く）",
          "NLB側の設定で自動決定される",
          "AWS が自動最適化する"
        ],
        answer: 1,
        wrongReasons: [
          "無期限キャッシュは古いコンテンツが長期供給され、ユーザー体験が劣化します。",
          "この選択肢は正解です。",
          "TTLはCloudFront側の設定です。NLBでは制御されません。",
          "TTLはビジネス要件に基づき、明示的に設定する必要があります。自動化されません。"
        ],
        explanation: "キャッシュ戦略を適切に設定すると、オリジン負荷削減とキャッシュヒット率のバランスが取れます。"
      },
      {
        prompt: "EC2からAuroraへのアクセスをセキュアに確保する方法はどれですか？",
        options: [
          "RDSセキュリティグループでEC2からのアクセスのみ許可",
          "Auroraのパスワードをコード内に埋め込む",
          "すべてのポート（0-65535）を全ホストで許可",
          "EC2にRootユーザーでSSH接続してから接続"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "パスワードコード埋め込みは情報漏洩リスクが非常に高いです。Secrets Managerを使うべきです。",
          "全ポート全許可は過度な権限付与で、セキュリティリスクです。",
          "RootでのSSH接続はセキュリティベストプラクティス違反です。"
        ],
        explanation: "セキュリティグループで最小必要ポート・ソースを限定することが、ネットワークセキュリティの基本です。"
      },
      {
        prompt: "CloudFront + NLB構成でアクティブ/アクティブなデータセンター冗長を実現する場合の課題はどれですか？",
        options: [
          "リージョン間のDBデータ同期レイテンシとコスト",
          "CloudFront キャッシュ無効化が一瞬で完了する",
          "NLBが自動的にリージョン間を切り替える",
          "EC2インスタンス起動が不要になる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "キャッシュ無効化にはリクエスト数に応じて遅延が生じます。無視はできません。",
          "NLBは単一リージョン内の機能です。リージョン間切り替えはRoute 53等で実装します。",
          "EC2起動は必須です。削減されません。"
        ],
        explanation: "マルチリージョン構成はDBデータ一貫性とネットワーク遅延がトレードオフになります。"
      },
      {
        prompt: "Auroraのバックアップ戦略として適切なのはどれですか？",
        options: [
          "手動バックアップのみで十分",
          "自動バックアップ + ポイントインタイム復旧期間を適切に設定",
          "バックアップは不要（レプリカがあるため）",
          "毎日1回、ピーク時間にバックアップを取得"
        ],
        answer: 1,
        wrongReasons: [
          "手動バックアップのみではRTO/RPO要件を満たしにくいです。自動化が必要です。",
          "この選択肢は正解です。",
          "レプリカは冗長性ですが、論理的エラー・削除からの保護ではありません。バックアップは別途必須です。",
          "ピーク時のバックアップは本番負荷に影響します。オフピークが適切です。"
        ],
        explanation: "自動バックアップ + PITR設定により、予期しないデータ損失から柔軟に復旧できます。"
      },
      {
        prompt: "このNLB+Aurora構成で、災害時のフェイルオーバーRTOをさらに短縮する方法はどれですか？",
        options: [
          "EC2数を増やすだけで十分",
          "別リージョンにスタンバイAuroraクラスタを準備し、Route 53で自動切り替え",
          "CloudFront TTLを0にする",
          "パスワード定期変更を頻繁にする"
        ],
        answer: 1,
        wrongReasons: [
          "EC2スケーリングはアプリ層の冗長性であり、DB層のRTO改善とは別です。",
          "この選択肢は正解です。",
          "TTL=0 はキャッシュ効率を著しく低下させ、RTOとは無関係です。",
          "パスワード管理とフェイルオーバーRTOは無関係です。"
        ],
        explanation: "クロスリージョンレプリケーション + Route 53フェイルオーバーにより、RTO分単位の実現が可能です。"
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
      },
      {
        prompt: "API Gatewayで複数ステージ（dev, prod等）を分ける利点はどれですか？",
        options: [
          "すべてのステージを本番同一環境で管理",
          "開発環境で安全にテストし、本番リリース前に検証できる",
          "ステージ数が増えるとコストが無限に増える",
          "Lambda関数が自動削除される"
        ],
        answer: 1,
        wrongReasons: [
          "ステージ分離は安全な運用の基本です。同一環境は危険です。",
          "この選択肢は正解です。",
          "ステージ数に応じたコストはありますが、無限ではなく管理可能です。",
          "ステージ管理でLambda削除は起きません。"
        ],
        explanation: "ステージ分離により、本番影響を避けながら安全に開発・テストできます。"
      },
      {
        prompt: "RDS Multi-AZフェイルオーバーの自動化を信頼できるようにするために必要なのはどれですか？",
        options: [
          "API Gatewayのタイムアウト設定を無限にする",
          "Lambda内でコネクション失敗時の再試行ロジックを実装",
          "CloudFrontのキャッシュ期限を長くする",
          "ユーザーに手動フェイルオーバーを指示する"
        ],
        answer: 1,
        wrongReasons: [
          "タイムアウト無限化は別の問題を引き起こします。リトライが重要です。",
          "この選択肢は正解です。",
          "フェイルオーバーとキャッシュ期限は無関係です。",
          "手動フェイルオーバーはサービス中断につながり、自動化が必須です。"
        ],
        explanation: "自動フェイルオーバー中の接続一時的な喪失に対し、Lambdaの再試行ロジックが復旧時間を短縮します。"
      },
      {
        prompt: "API GatewayのWAF統合により得られるセキュリティ効果はどれですか？",
        options: [
          "SQLインジェクション・XSS等の攻撃をAPI到達前に検出・ブロック",
          "RDSのパスワード強度が自動的に上がる",
          "CloudFrontの配信速度が向上する",
          "Lambda メモリが自動最適化される"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "パスワード強度はユーザー設定やIAMポリシーで管理します。WAF統合とは無関係です。",
          "配信速度はキャッシュ戦略に依存します。",
          "メモリはLambda関数定義で指定します。"
        ],
        explanation: "API GatewayへのWAF統合により、L7攻撃をアプリケーション層の前で遮断できます。"
      },
      {
        prompt: "このAPI中心構成でのロギング・監視戦略として適切なのはどれですか？",
        options: [
          "CloudWatch Logsで全APIリクエスト・Lambda実行ログを集約",
          "ログを無視してコスト削減",
          "RDS監査ログのみ保存すれば十分",
          "ユーザーに手動で報告させる"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "ログは問題診断の必須情報です。無視は後々大きなコストになります。",
          "API層のログが最も診断価値が高いです。RDSのみでは不十分です。",
          "手動報告は非効率でスケールしません。自動監視が必須です。"
        ],
        explanation: "CloudWatch Logsで統一的に集約することで、問題発生時の迅速な診断が可能になります。"
      },
      {
        prompt: "このサーバーレス API 構成で本番リリース前に実施すべきテスト項目はどれですか？",
        options: [
          "負荷テスト・セキュリティテスト・フェイルオーバーテストを実施",
          "テストなしでリリースする",
          "CloudFrontキャッシュのみテストすればよい",
          "RDSバックアップ復旧テストは不要"
        ],
        answer: 0,
        wrongReasons: [
          "この選択肢は正解です。",
          "テスト不足は本番障害につながります。十分な検証が必須です。",
          "API・Lambda・RDSを含めた統合テストが重要です。キャッシュのみでは不足です。",
          "バックアップ復旧テストは定期的に実施すべき重要な項目です。"
        ],
        explanation: "本番稼働前の包括的テストにより、予期しない問題の多くを事前に検出・対策できます。"
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

  if (l.includes("user") || l.includes("client")) return "👤";
  if (l.includes("cloudfront")) return "🌐";
  if (l.includes("alb")) return "↔️";
  if (l.includes("ec2") || l.includes("ecs")) return "🖥️";
  if (l.includes("lambda")) return "λ";
  if (l.includes("rds") || l.includes("aurora") || l.includes("dynamodb")) return "🗄️";
  if (l.includes("cognito")) return "🔐";
  if (l.includes("s3")) return "🪣";
  if (l.includes("sqs")) return "📬";
  if (l.includes("eventbridge")) return "⏰";

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

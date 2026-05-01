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

const state = {
  scenarioIndex: 0,
  questionIndex: 0,
  selected: null,
  score: 0,
  answered: new Set()
};

function renderScenarioButtons() {
  scenarioButtons.innerHTML = "";
  scenarios.forEach((scenario, index) => {
    const button = document.createElement("button");
    button.className = "scenario-btn";
    if (index === state.scenarioIndex) {
      button.classList.add("active");
    }
    button.innerHTML = `<strong>${scenario.title}</strong><br><small>${scenario.questions.length}問</small>`;
    button.addEventListener("click", () => {
      state.scenarioIndex = index;
      resetScenarioState();
      renderAll();
    });
    scenarioButtons.appendChild(button);
  });
}

function resetScenarioState() {
  state.questionIndex = 0;
  state.selected = null;
  state.score = 0;
  state.answered = new Set();
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
  const q = scenario.questions[state.questionIndex];

  questionCounter.textContent = `${state.questionIndex + 1} / ${scenario.questions.length}`;
  questionText.textContent = q.prompt;
  optionsWrap.innerHTML = "";

  q.options.forEach((opt, i) => {
    const label = document.createElement("label");
    label.className = "option-item";
    label.innerHTML = `
      <input type="radio" name="option" value="${i}" ${state.selected === i ? "checked" : ""} />
      <span>${opt}</span>
    `;
    const radio = label.querySelector("input");
    radio.addEventListener("change", () => {
      state.selected = Number(radio.value);
    });
    optionsWrap.appendChild(label);
  });

  const key = `${state.scenarioIndex}-${state.questionIndex}`;
  const answered = state.answered.has(key);
  submitBtn.disabled = answered;
  nextBtn.disabled = !answered;
}

function updateScore() {
  const scenario = scenarios[state.scenarioIndex];
  scoreText.textContent = `正解数: ${state.score} / ${scenario.questions.length}`;
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
  feedback.className = "feedback";
  feedback.textContent = "選択肢を選んで「解答する」を押してください。";
}

submitBtn.addEventListener("click", () => {
  const scenario = scenarios[state.scenarioIndex];
  const q = scenario.questions[state.questionIndex];
  const wrongReasons = buildWrongOptionReasons(q);

  if (state.selected === null) {
    feedback.className = "feedback ng";
    feedback.textContent = "先に選択肢を1つ選んでください。";
    return;
  }

  const key = `${state.scenarioIndex}-${state.questionIndex}`;
  if (state.answered.has(key)) {
    return;
  }

  const isCorrect = state.selected === q.answer;
  if (isCorrect) {
    state.score += 1;
    feedback.className = "feedback ok";
    feedback.innerHTML = `<strong>正解です。</strong><br>${q.explanation}<br><br><strong>不正解選択肢の理由</strong><ul>${q.options
      .map((opt, i) => {
        if (i === q.answer) {
          return "";
        }
        return `<li>${opt}: ${wrongReasons[i]}</li>`;
      })
      .join("")}</ul>`;
  } else {
    feedback.className = "feedback ng";
    feedback.innerHTML = `<strong>不正解です。</strong><br>あなたの選択: ${q.options[state.selected]}<br>なぜ不正解か: ${wrongReasons[state.selected]}<br><br>正解: ${q.options[q.answer]}<br>${q.explanation}<br><br><strong>他の不正解選択肢の理由</strong><ul>${q.options
      .map((opt, i) => {
        if (i === q.answer || i === state.selected) {
          return "";
        }
        return `<li>${opt}: ${wrongReasons[i]}</li>`;
      })
      .join("")}</ul>`;
  }

  state.answered.add(key);
  submitBtn.disabled = true;
  nextBtn.disabled = false;
  updateScore();
});

nextBtn.addEventListener("click", () => {
  const scenario = scenarios[state.scenarioIndex];
  if (state.questionIndex < scenario.questions.length - 1) {
    state.questionIndex += 1;
    state.selected = null;
    renderQuestion();
    feedback.className = "feedback";
    feedback.textContent = "次の問題です。";
    return;
  }

  feedback.className = "feedback ok";
  feedback.innerHTML = `<strong>${scenario.title}を完了しました。</strong><br>スコアは ${state.score} / ${scenario.questions.length} です。別の構成図にも挑戦してみてください。`;
  nextBtn.disabled = true;
});

resetBtn.addEventListener("click", () => {
  resetScenarioState();
  renderAll();
});

renderAll();

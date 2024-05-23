/**
 * このコメントブロックは、主にCopilotに対する指示を記述するためのものである。
 *
 * - このファイル及び関連するファイル群は、ポケモンカードゲーム(Pokémon Trading Card Game)のルールを実装するためのライブラリである。
 * - ライブラリ名もしくはプロジェクト名は、"pokemon-tcg-core"である。
 * - このファイルは、npm packageのエントリーポイントである。
 * - UIに関する実装は行わない。
 * - TypeScriptの型のプロパティ名を列挙する際は、キャメルケースを使い、アルファベット降順に並べる。
 * - TypeScriptの型でstringのUnion型を列挙する際は、アルファベット降順に並べる。
 * - ソースコードのコメント内では、Copilotは絶対に提案を行わないこと。
 */

// ポケカの仕様全般に関するメモ
//
// - ポケカの公式ルールブック
//   - 日本語
//     - 基本: https://www.pokemon-card.com/rules/howtoplay/
//     - 上級ルール: https://www.pokemon-card.com/assets/document/advanced_manual.pdf
//   - 英語
//     - 基本: https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/tef_rulebook_en.pdf
//     - その他？: https://www.pokemon.com/us/play-pokemon/about/tournaments-rules-and-resources
// - 疑問メモ
//   - 「このポケモンにも10ダメージ。」は固定値か？
//   - "ジュナイパーex" って ex 付きが名前なの？

// スターターデッキの調査
//
// ### グッズカード
//
// - ネストボール: 自分の山札からたねポケモンを1枚選び、ベンチに出す。そして山札を切る。
// - スーパーボール: 自分の山札を上から7枚見て、その中からポケモンを1枚選び、相手に見せて、手札に加える。残りのカードは山札にもどして切る。
// - ハイパーボール: このカードは、自分の手札を2枚トラッシュしなければ使えない。自分の山札からポケモンを1枚選び、相手に見せて、手札に加える。そして山札を切る。
// - ふしぎなアメ: 自分の手札から2進化ポケモンを1枚選び、そのポケモンへと進化する自分の場のたねポケモンにのせ、1進化をとばして進化させる。（最初の自分の番や、出したばかりのポケモンには使えない。）
// - ポケモンいれかえ: 自分のバトルポケモンをベンチポケモンと入れ替える。
// - ポケモンキャッチャー: コインを1回投げオモテなら、相手のベンチポケモンを1匹選び、バトルポケモンと入れ替える。
// - ポケギア3.0: 自分の山札を上から7枚見て、その中からサポートを1枚選び、相手に見せて、手札に加える。残りのカードは山札にもどして切る。
// - クラッシュハンマー: コインを1回投げオモテなら、相手の場のポケモンについているエネルギーを1個選び、トラッシュする。
// - エレキジェネレーター: 自分の山札を上から5枚見て、その中から「基本エネルギー」を2枚まで選び、ベンチのポケモンに好きなようにつける。残りのカードは山札にもどして切る。
// - エネルギー回収: 自分のトラッシュから基本エネルギーを2枚まで選び、相手に見せて、手札に加える。
// - きずぐすり: 自分のポケモン1匹のHPを「30」回復する。
// - エネルギーつけかえ: 自分の場のポケモンについている基本エネルギーを1個選び、自分の別のポケモンにつけ替える。
//
// ### サポートカード
//
// - サワロ: 自分のポケモンを2匹まで選び、HPをそれぞれ「50」回復する。
// - ジニア: 自分の山札から進化ポケモンを2枚まで選び、相手に見せて、手札に加える。そして山札を切る。
// - ジャッジマン: おたがいのプレイヤーは、それぞれ手札をすべて山札にもどして切る。その後、それぞれ山札を4枚引く。
// - たんぱんこぞう: 自分の手札をすべて山札にもどして切る。その後、山札を5枚引く。
// - ネモ: 自分の山札を3枚引く。
// - 博士の研究（オーリム博士）: 自分の手札をすべてトラッシュし、山札を7枚引く。
// - 博士の研究（フトゥー博士）: 自分の手札をすべてトラッシュし、山札を7枚引く。
// - ボスの指令（ゲーチス）: 相手のベンチポケモンを1匹選び、バトルポケモンと入れ替える。
// - キハダ: 自分の手札を1枚選び、山札の下にもどす。その後、自分の手札が5枚になるように、山札を引く。（自分の手札がこのカード1枚だけなら、このカードは使えない。）
// - スター団のしたっぱ: 相手のバトルポケモンについているエネルギーを1個選び、相手の山札の上にもどす。
// - ペパー: 自分の山札から「グッズ」と「ポケモンのどうぐ」を1枚ずつ選び、相手に見せて、手札に加える。そして山札を切る。
//
// ### ポケモンの特殊なワザ・特性
//
// - ヘラクロス
//   - ワザ: スマッシュホーン: このワザのダメージは抵抗力を計算しない。
// - サボネア
//   - 特性: はんげきばり: このポケモンが、バトル場で相手のポケモンからワザのダメージを受けたとき、ワザを使ったポケモンにダメカンを3個のせる。
// - タマゲタケ
//   - ワザ: もようでつる: 自分の山札から(草)タイプのたねポケモンを1枚選び、ベンチに出す。そして山札を切る。
// - ジュナイパーex
//   - 特性: じゅうおうむじん: 自分の番に1回使える。ベンチにいるこのポケモンを、バトルポケモンと入れ替える。または、バトル場にいるこのポケモンを、ベンチポケモンと入れ替える。
// - ミニーブ
//   - ワザ: すいとる: このポケモンのHPを「10」回復する。
// - オリーヴァ
//   - ワザ: いやしのかじつ: 自分のベンチポケモン1匹のHPを、すべて回復する。
// - パルデア ケンタロス
//   - ワザ: いかりのつの: このポケモンにのっているダメカンの数×10ダメージ追加。
// - コータス
//   - ワザ: しゅうちゅうほうか: このポケモンについているエネルギーの数ぶんコインを投げ、オモテの数×80ダメージ。
// - ビクティニex
//   - ワザ: ビクトリーフレイム: 次の自分の番、このポケモンはワザが使えない。
// - ヒトモシ
//   - ワザ: ひをふく: コインを1回投げオモテなら、10ダメージ追加。
// - ランプラー
//   - ワザ: さそうひのたま: 相手のベンチポケモンを1匹選び、バトルポケモンと入れ替える。その後、新しく出てきたポケモンに30ダメージ。
// - メラルバ
//   - ワザ: とっしん: このポケモンにも10ダメージ。
// - グレンアルマ(英: Armarouge)
//   - 特性: しゃくねつのよろい: このポケモンが、バトル場で相手のポケモンからワザのダメージを受けたとき、ワザを使ったポケモンをやけどにする。
//     - 英: Scorching Armor: If this Pokémon is in the Active Spot and is damaged by an attack from your opponent’s Pokémon (even if this Pokémon is Knocked Out), the Attacking Pokémon is now Burned.
//     - これは Effect には入らない、 Reaction みたいな別概念が必要
// - ウミトリオ(英: Wugtrio)
//   - ワザ: からめてしぼる: 次の相手の番、このワザを受けたポケモンは、にげられない。
//     - 英: Entwining Entrapment: During your opponent’s next turn, the Defending Pokémon can’t retreat.
// - ハルクジラ
//   - ワザ: スイーピングタックル: このポケモンにのっているダメカンの数×20ダメージぶん、このワザのダメージは小さくなる。

// ### ロジック上問題になりそうな箇所のメモ
//
// > 自動的にはたらく特性の効果をプレイヤーの意思でなくすことはできません。
//
// > ベンチポケモンが5匹いてベンチに空きがなくても、【にげる】はできます。
//
// > 【たね】ポケモンを手札からベンチに出すときは、1匹ずつ出します。同時に複数を出すことはできません。
//
// > また基本エネルギーは、【同じ名前のカードはデッキに4枚まで】というデッキの作りかたのルールに関係なくデッキに何枚でも入れることができます。
//
// > おたがいのプレイヤーのバトルポケモンが同時に【きぜつ】した場合、次の番を行うプレイヤーから、バトルポケモンを出します。
//
// > 勝ち負けの条件を満たしたプレイヤーが同時に2人いるときの判定
// その下に表がある
//
// > どうしても勝敗を決めたい場合は、「サドン・デス」を行います。「サドン・デス」は、対戦が引き分けで終わらないようにするための延長戦です。
//
// > ポケモンチェックでは特殊状態だけではなく、ポケモンが持つ特性やトレーナーズの効果を確認することもあります。
//
// > おたがいの手札に【たね】ポケモンのカードがある場合、その中から1枚選び、ウラにしてバトル場に出します。
//
// > 山札からカードを選ぶことを指示された場合、山札のカードのオモテを確認しながら指定された枚数のカードを選びます。
// > 確認中のカードのオモテは、相手プレイヤーに見せません。
// > 複数枚のカードを選ぶ場合は、指定された数より少ない枚数でも構いません。
// > また1枚も選ばないこともでき、その場合はカードを選ぶ行為を終わります。
// > ただし好きなカードを選ぶように指示された場合は、必ず指定された枚数を選ばなければいけません。

/**
 * カードの振る舞い別の種類
 *
 * - 各カードの種類内の副種類を展開した上での種類なので、公式の用語と一致しない
 *   - 公式の「カードの種類」（英: Card Type）は、「ポケモンカード」「トレーナーズカード」「エネルギーカード」の3種類のみ
 * - ここの一覧は、海外版DB( https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/ )のAdvanced SearchのCard Typeの項目が参考になる
 * - TypeとSubTypeのような概念に分けても表現可能かは不明、そもそも公式がツリー状の概念になっているか不明だし、TypeScript上でTagged Union Typesが使いにくくなるなどがあるかもしれない
 */
type CardKindEnergy = "energy";
type CardKindItem = "item";
type CardKindPokemonBasic = "pokemonBasic";
type CardKindPokemonStage1 = "pokemonStage1";
type CardKindPokemonStage2 = "pokemonStage2";
type CardKindPokemonTool = "pokemonTool";
type CardKindStadium = "stadium";
type CardKindSupporter = "supporter";
type CardKind =
  | CardKindEnergy
  | CardKindItem
  | CardKindPokemonBasic
  | CardKindPokemonStage1
  | CardKindPokemonStage2
  | CardKindPokemonTool
  | CardKindStadium
  | CardKindSupporter;

type HpChange =
  | 0
  | 10
  | 20
  | 30
  | 40
  | 50
  | 60
  | 70
  | 80
  | 90
  | 100
  | 110
  | 120
  | 130
  | 140
  | 150
  | 160
  | 170
  | 180
  | 190
  | 200
  | 210
  | 220
  | 230
  | 240
  | 250
  | 260
  | 270
  | 280
  | 290
  | 300
  | 310
  | 320
  | 330
  | 340
  | 350
  | 360
  | 370
  | 380
  | 390
  | 400
  | 410
  | 420
  | 430
  | 440
  | 450
  | 460
  | 470
  | 480
  | 490
  | 500;

/**
 * 拡張パックの一覧
 *
 * - 非常にたくさんある
 *   - 公式の拡張パック一覧: https://www.pokemon-card.com/products/index.html?productType=expansion
 *   - DB化しようとした方の記事: https://note.com/ictxptcg/n/n76b73c289f96
 */
const expansions = {
  SVD: {},
  SVJP: {},
} as const;

type ExpansionCode = keyof typeof expansions;

/**
 * コレクションナンバー(英: Collector Card Number)
 *
 * - 基本的には"001/002"の様な形式だが、数値以外の文字が入ることもある。把握し切れないので、とりあえず文字列型としている。
 */
type CollectorCardNumber = string;

type RegulationMark = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

type RarityMark =
  | "AR"
  | "C"
  | "HR"
  | "K"
  | "R"
  | "RR"
  | "RRR"
  | "SAR"
  | "SR"
  | "U"
  | "UR";

type EnergyKind =
  | "colorless"
  | "darkness"
  | "dragon"
  | "fairy"
  | "fighting"
  | "fire"
  | "grass"
  | "lightning"
  | "metal"
  | "psychic"
  | "water";

type CardId = `${ExpansionCode}-${CollectorCardNumber}`;

/**
 * 自分か相手かの場の種類
 *
 * - 英語の公式では、"you"と"his or her"が使われている
 */
type PlayerSide = "opponent" | "player";

type PokemonZone = "activeSpot" | "bench";

type PokemonTargetting =
  | {
      kind: "activeSpot";
    }
  | {
      kind: "bench";
      /** 全てを対象にする場合は、5を指定する */
      numberOfTargets: 1 | 2 | 3 | 4 | 5;
    }
  /**
   * 自身のみを対象にする
   *
   * - 自身がバトルポケモンならバトルポケモンを対象にし、自身がベンチならベンチの中で自身のみを対象にする
   */
  | {
      kind: "self";
    };

type PokemonTargettingOnlyOne = "activeSpot" | "bench" | "self";

/**
 * 場の中のカード位置の種類
 *
 * - 用語は、英語公式ルールブックの Zones of the Pokémon TCG のセクションに準拠している
 */
type CardZone = "deck" | "discardPile" | "prizeCards" | PokemonZone;

type CardLocation = "hand" | CardZone;

/**
 * カード種類の絞り込み
 *
 * - 複数選択された場合は、最も制約が強いものが適用される。基本的には、複数の条件を同時に設定することはない。
 * - どれも存在しない時は任意のカードを選択できる
 */
type CardFilter = {
  cardAliasGroupIds?: string[];
  cardIds?: CardId[];
  cardKinds?: CardKind[];
  /**
   * エネルギーの種類
   *
   * - cardKindsが"energy","pokemon","stage1","stage2"の時のみ合わせて有効
   */
  energyKinds?: EnergyKind[];
};

/**
 * 与ダメージの種類
 *
 * - sides のデフォルト値は ["opponent"]
 * - targettings のデフォルト値は [{ pokemonTargettingKind: "activeSpot" }]
 */
type DamageDealing =
  /** "normal"のショートハンド */
  | HpChange
  | {
      kind: "fixed";
      amount: HpChange;
      sides?: PlayerSide[];
      targettings?: PokemonTargetting[];
    }
  | {
      kind: "normal";
      amount: HpChange;
      /** 抵抗力を無視するか */
      ignoreResistance?: boolean;
      sides?: PlayerSide[];
      targettings?: PokemonTargetting[];
    }
  /**
   * ダメカン毎のダメージ
   *
   * - 例: いかりのつの(英: Raging Horns)
   *   - このポケモンにのっているダメカンの数×10ダメージ追加。
   *   - This attack does 10 more damage for each damage counter on this Pokémon.
   */
  | {
      kind: "perDamageCounter";
      amount: HpChange;
      /** 負の値、つまりダメージを減算する効果か。デフォルトは false 。 */
      isNegative?: boolean;
      sides?: PlayerSide[];
      targettings?: PokemonTargetting[];
    }
  /**
   * ポケモンコイン成功毎のダメージ
   */
  | {
      kind: "perCoinFlip";
      amount: HpChange;
      /**
       * 成功が連投の条件か
       */
      continueIfSuccess?: boolean;
      numberOfTimes: number;
      sides?: PlayerSide[];
      targettings?: PokemonTargetting[];
    }
  /**
   * エネルギー毎のダメージ
   *
   * - 例: しゅうちゅうほうか(英: Concentrated Fire)
   *   - このポケモンについているエネルギーの数ぶんコインを投げ、オモテの数×80ダメージ。
   *   - Flip a coin for each (Fire) Energy attached to this Pokémon. This attack does 80 damage for each heads.
   */
  | {
      kind: "perEnergy";
      /** デフォルトは false */
      conditionCoinFlip?: boolean;
      side?: PlayerSide;
      targettings?: PokemonTargetting[];
    };

/**
 * エネルギーカード(英: Energy Card)
 *
 * - スターターキットでは、8種類の基本エネルギーしかない
 * - 他も実装しようとすると、複雑な挙動をするものがいくつかある
 */
type EnergyCard = {
  cardKind: CardKindEnergy;
  energyKind: EnergyKind;
};

/**
 * ポケモンの特殊状態(英: Special Conditions)
 *
 * - なお、「ポケモンチェック」は、英語で Pokemon Checkup
 */
type SpecialCondition =
  | "asleep"
  | "burned"
  | "confused"
  | "paralyzed"
  | "poisoned";

type PokemonZonesConditionParams = {
  pokemonZones: PokemonZone[];
};

type RangedNumberConditionParams =
  | {
      max: number;
    }
  | {
      min: number;
    }
  | {
      max: number;
      min: number;
    };

type SideConditionParams = {
  playerSide: PlayerSide;
};

/**
 * 条件
 *
 * - 各種カードのテキストに含まれる条件群を抽象化・構造化したもの
 * - ゲームプレイ中のユーザー入力によって明らかになる値は、引数として定義しないこと
 */
type Condition =
  | {
      kind: "benchedPokemonCount";
      params: RangedNumberConditionParams;
    }
  | {
      kind: "cardCount";
      params: {
        /** 指定しない場合は、全ての種類を意味する */
        cardKinds?: CardKind[];
        cardLocation: "deck" | "discardPile" | "hand";
      } & RangedNumberConditionParams;
    }
  | {
      kind: "coinFlip";
      params: {};
    }
  | {
      kind: "damageToAnyPokemon";
      params: RangedNumberConditionParams;
    }
  | {
      kind: "energyCount";
      params: {
        energyKinds: EnergyKind[];
      } & SideConditionParams &
        PokemonZonesConditionParams &
        RangedNumberConditionParams;
    }
  /**
   * 通常の進化ができるポケモン数
   *
   * - 手札を含めて進化できるかを判定する
   * - ふしぎなアメなど、通常の進化とは異なる進化方法はここでは扱わない
   */
  | {
      kind: "evolveablePokemonCount";
      params:
        | {
            /**
             * 進化元ポケモンの種類
             *
             * - 指定しない場合は、全ての種類を意味する
             */
            cardKind?: CardKindPokemonBasic | CardKindPokemonStage1;
          }
        | PokemonZonesConditionParams
        | RangedNumberConditionParams;
    }
  /**
   * ふしぎなアメを使えるポケモン数
   *
   * - 2進化カードが手札に存在するかも含めて判定する
   */
  | {
      kind: "rareCandyUsablePokemonCount";
      params: PokemonZonesConditionParams | RangedNumberConditionParams;
    };

/**
 * 効果
 *
 * - 各種カードのテキストに含まれる効果群を抽象化・構造化したもの
 * - ゲームプレイ中のユーザー入力によって明らかになる値は、引数として定義しないこと
 */
type Effect =
  /**
   * 次番にワザが使えない状態を付与する
   *
   * - 例: ビクティニex(英: Victini ex)のビクトリーフレイム(英: Victory Frame)
   *   - 次の自分の番、このポケモンはワザが使えない。
   *   - 英: During your next turn, this Pokémon can’t attack.
   */
  | {
      kind: "attachCanNotAttack";
      params: {
        sides: PlayerSide[];
        targettings: ("activeSpot" | "self")[];
      };
    }
  /**
   * 次番に「にげる」ができない状態を付与する
   *
   * - 例: ウミトリオ(英: Wugtrio)のからめてしぼる(英: Entwining Entrapment)
   *   - 次の相手の番、このワザを受けたポケモンは、にげられない。
   *   - 英: Entwining Entrapment: During your opponent’s next turn, the Defending Pokémon can’t retreat.
   */
  | {
      kind: "attachCanNotRetreat";
      params: {
        sides: PlayerSide[];
        targettings: ("activeSpot" | "self")[];
      };
    }
  | {
      kind: "attachSpecialConditions";
      params: {
        sides: PlayerSide[];
        specialConditions: SpecialCondition[];
        targettings: PokemonTargetting[];
      };
    }
  | {
      kind: "dealDamage";
      params: {
        damageDealings: DamageDealing[];
      };
    }
  | {
      kind: "drawCards";
      params: {
        numberOfCards: number;
      };
    }
  | {
      kind: "healPokemon";
      params: {
        amount: HpChange | "full";
        targettings: PokemonTargetting[];
      };
    }
  | {
      kind: "moveCards";
      params: {
        cardKinds?: CardKind[];
        moveFrom: "hand" | "discardPile";
        moveTo: "bench" | "deck" | "discardPile";
        /**
         * 何枚のカードを対象にするか
         *
         * - 指定しない場合は、全てのカードを対象にする
         */
        numberOfCards?: number;
        side: PlayerSide;
        /**
         * 山札に戻す場合の挙動
         *
         * - デフォルトは、山札の一番上に戻す
         */
        toTheBottomOfDeck?: boolean;
      };
    }
  | {
      kind: "moveCardsOnPokemons";
      params: {
        cardKinds?: ("energy" | "pokemonTool")[];
        moveFrom: PokemonZone[];
        moveTo: ("deck" | "discardPile" | "hand" | PokemonZone)[];
        /**
         * 合計で何枚のカードを対象にするか
         *
         * - 合計枚数以内なら、複数のポケモンを対象にできる
         */
        numberOfCards: number;
      };
    }
  | {
      kind: "searchCardsFromDeck";
      params: {
        cardFilter?: CardFilter;
        distributeTo: "activeSpot" | "hand" | "bench";
        numberOfCards: number;
        /**
         * めくれるカードの枚数
         *
         * - 指定しない場合は、全てのカードをめくることができる
         */
        numberOfCardsToFlip?: number;
      };
    }
  | {
      kind: "searchCardsFromDiscardPile";
      params: {
        cardFilter?: CardFilter;
        distributeTo: "activeSpot" | "hand" | "bench";
        numberOfCards: number;
      };
    }
  | {
      kind: "shuffleDeck";
      params: {};
    }
  /**
   * 2進化できるたねポケモンの1進化をとばして2進化させる
   *
   * - 現状は、ふしぎなアメの効果と全く同じ
   */
  | {
      kind: "substituteStage1PokemonWhenEvolvingToStage2";
      params: {};
    }
  | {
      kind: "switchPokemon";
      params: {
        /**
         * 任意に実行可否を決定できるか
         *
         * - デフォルトは false
         * - 例えば、「のぞむなら」(英: You may switch this Pokémon ~)のテキストがある効果はこの設定が必要
         */
        isOptional?: boolean;
        side: PlayerSide;
        targettings: PokemonTargettingOnlyOne[];
      };
    };

/**
 * 効果発動
 */
type EffectActivation = {
  /**
   * 効果を発動するための条件
   *
   * - 例えば、ポケモンコインを投げてオモテが出たか
   */
  conditions?: Condition[];
  effects: Effect[];
};

/**
 * グッズカード(英: Item Card)
 */
type ItemCard = {
  cardKind: CardKindItem;
  /**
   * カードを使用するために選択できるのかの条件
   *
   * - 例えば、手札から2枚トラッシュする場合に、手札が2枚存在するか
   * - 使用した結果、条件を満たさないなどで明らかに効果が発動できない状況では、カードを使用できない
   *   - 関連する公式ルールは、上級プレイヤー用ルールガイド内の「状況の変化が何も起きないことがわかっている場合」と書いてある複数の箇所、例えば、特性の項目の場合の記述は以下の通り
   *     > 条件に従うことができない場合は、その特性を宣言できません。また2.まで行った結果で状況の変化が何も起きないことがわかっている場合も、その特性は宣言できません。
   *   - なお、「デッキの枚数から逆算して、山札に特定の種類のカードが含まれていないことがわかる」は、「状況の変化が何も起きないことがわかっている場合」には該当しない
   *     - 有識者から確認した
   */
  conditions: Condition[];
  /**
   * 効果発動リスト
   *
   * - ある効果発動の条件を満たさなかった場合は、そこで効果発動全体が終了する
   */
  effectActivations: EffectActivation[];
};

type Card = {
  /**
   * 拡張やコレクションナンバーは異なるが、内容は同じカードをまとめるための概念のID
   */
  cardAliasGroupId?: string;
  collectorCardNumber: CollectorCardNumber;
  expansionCode: ExpansionCode;
  rarityMark: RarityMark;
  regulationMark: RegulationMark;
} & (EnergyCard | ItemCard);

type Game = {};

type GamePlay = {
  game: Game;
};

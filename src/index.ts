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
//   - 同じカードでも異なるカードになっているものは何が違うのか。
//     - 例えば、「ふしぎなアメ」の 014/021 と 013/019

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
// ### ポケモンの特殊な特技・特性
// - :

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

type PokemonTargetting =
  | {
      pokemonTargettingKind: "activeSpot";
    }
  | {
      pokemonTargettingKind: "bench";
      benchIndex: number;
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

type PokemonZoneConditionParams = {
  zone: "all" | "bench" | "activeSpot";
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
/**
 * 自分か相手かの場の種類
 *
 * - 英語の公式では、"you"と"his or her"が使われている
 */
type SideConditionParams = {
  side: "both" | "opponent" | "player";
};

/**
 * 条件
 *
 * - 各種カードのテキストに含まれる条件群を抽象化・構造化したもの
 * - ゲームプレイ中のユーザー入力によって明らかになる値は、引数として定義しないこと
 */
type Condition =
  | {
      conditionKind: "benchedPokemonCount";
      params: RangedNumberConditionParams;
    }
  | {
      conditionKind: "cardCount";
      params: {
        /** 指定しない場合は、全ての種類を意味する */
        cardKinds?: CardKind[];
        cardZone: "deck" | "discardPile" | "hand";
      } & RangedNumberConditionParams;
    }
  | {
      conditionKind: "coinFlip";
      params: {};
    }
  | {
      conditionKind: "damageToAnyPokemon";
      params: RangedNumberConditionParams;
    }
  | {
      conditionKind: "energyCount";
      params: {
        energyKinds: EnergyKind[];
      } & SideConditionParams &
        PokemonZoneConditionParams &
        RangedNumberConditionParams;
    }
  /**
   * 通常の進化ができるポケモン数
   *
   * - 手札を含めて進化できるかを判定する
   * - ふしぎなアメなど、通常の進化とは異なる進化方法はここでは扱わない
   */
  | {
      conditionKind: "evolveablePokemonCount";
      params:
        | {
            /**
             * 進化元ポケモンの種類
             *
             * - 指定しない場合は、全ての種類を意味する
             */
            cardKind?: CardKindPokemonBasic | CardKindPokemonStage1;
          }
        | PokemonZoneConditionParams
        | RangedNumberConditionParams;
    }
  /**
   * ふしぎなアメを使えるポケモン数
   *
   * - 手札を含めて使えるかを判定する
   */
  | {
      conditionKind: "rareCandyUsablePokemonCount";
      params: PokemonZoneConditionParams | RangedNumberConditionParams;
    };

type DistributeToEffectParams = {
  distributeTo: "bench" | "hand";
};

/**
 * 効果
 *
 * - 各種カードのテキストに含まれる効果群を抽象化・構造化したもの
 * - ゲームプレイ中のユーザー入力によって明らかになる値は、引数として定義しないこと
 */
type Effect =
  | {
      effectKind: "discardCards";
      params: {
        cardKinds: CardKind[];
        numberOfCards: number;
      };
    }
  | {
      effectKind: "drawCards";
      params: {
        cardZone: "deck" | "discardPile";
        numberOfCards: number;
      } & DistributeToEffectParams;
    }
  | {
      effectKind: "selectCardsFromDeck";
      params: {
        cardKinds: CardKind[];
        numberOfCards: number;
        /**
         * めくれるカードの枚数
         *
         * - 指定しない場合は、全てのカードをめくることができる
         */
        numberOfCardsToFlip?: number;
      } & DistributeToEffectParams;
    }
  | {
      effectKind: "shuffleDeck";
      params: {};
    }
  /**
   * 2進化できるたねポケモンの1進化をとばして2進化させる
   *
   * - 現状は、ふしぎなアメの効果と全く同じ
   */
  | {
      effectKind: "substituteStage1PokemonWhenEvolvingToStage2";
      params: {};
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
  collectorCardNumber: CollectorCardNumber;
  expansionCode: ExpansionCode;
  rarityMark: RarityMark;
  regulationMark: RegulationMark;
} & (EnergyCard | ItemCard);

type Game = {};

type GamePlay = {
  game: Game;
};

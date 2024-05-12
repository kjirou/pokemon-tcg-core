//
// ポケモンカードゲーム(Pokémon Trading Card Game)のルールを実装するためのライブラリ
//
// - このファイルは、npm packageのエントリーポイントである。
// - UIに関する実装は行わない。
// - ポケカの公式ルールブック
//   - 日本語
//     - 基本: https://www.pokemon-card.com/rules/howtoplay/
//     - 上級ルール: https://www.pokemon-card.com/assets/document/advanced_manual.pdf
//   - 英語
//     - 基本: https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/tef_rulebook_en.pdf
//     - その他？: https://www.pokemon.com/us/play-pokemon/about/tournaments-rules-and-resources

// ポケカの仕様全般に関する疑問メモ
//
// - 同じカードでも異なるカードになっているものは何が違うのか。
//   - 例えば、「ふしぎなアメ」の 014/021 と 013/019

/**
 * カードの種類
 *
 * - トレーナーズカードを展開した上での種類なので、公式の用語と一致しない
 *   - 公式の「カードの種類」（英: Card Type）は、「ポケモンカード」「トレーナーズカード」「エネルギーカード」の3種類のみ
 *  - TypeとSubTypeのような概念に分けてしまうと、TypeScript上でTagged Union Typesが使いにくくなる
 */
type CardKindEnergy = "energy";
type CardKindItem = "item";
type CardKindPokemon = "pokemon";
type CardKindPokemonTool = "pokemonTool";
type CardKindStadium = "stadium";
type CardKindSupporter = "supporter";
type CardKind =
  | CardKindEnergy
  | CardKindItem
  | CardKindPokemon
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
 * エネルギーカード（英: Energy Card）
 *
 * - スターターキットでは、8種類の基本エネルギーしかない
 * - 他も実装しようとすると、複雑な挙動をするものがいくつかある
 */
type EnergyCard = {
  cardKind: CardKindEnergy;
  energyKind: EnergyKind;
};

// グッズカードの効果類型メモ
//
// - 山札をシャッフルするか
// - トラッシュから各種カードを取り出すか
// - 山札から各種カードを取り出すか
// - カードを引くか
// - カードを捨てるか
// - ポケモンをベンチに出すか
// - 手札のトラッシュが必要か
// - 進化させるか
// - バトルポケモンをベンチポケモンと入れ替えるか
// - 場のポケモンを手札に戻す
// - 山札を上から見る
// - 使用に条件があるもの
// - エネルギーをトラッシュ

// スターターデッキの情報
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
// - :
// - :
// - :
// - :
// - :
// - :
// - :
// - :
// - :
// - :
// - :
// - :
// - :
// - :
//
// ### ロジック上問題になりそうな箇所のメモ
//
// > 条件に従うことができない場合は、その特性を宣言できません。また2.まで行った結果で状況の変化が何も起きないことがわかっている場合も、その特性は宣言できません。
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
type CardCountConditionParams = {
  filterByCardKinds?: CardKind[];
} & RangedNumberConditionParams;

/**
 * 効果を発動するための条件
 */
type Condition =
  | {
      kind: "benchedPokemonRange";
      params: RangedNumberConditionParams;
    }
  | {
      kind: "deckSizeRange";
      params: CardCountConditionParams;
    }
  | {
      kind: "handSizeRange";
      filterByCardKinds?: CardKind[];
      params: CardCountConditionParams;
    };

type Effect = {};

type EffectActivation = {
  conditions: Condition[];
  effects: Effect[];
  ineffectiveConditions: Condition[];
};

/**
 * グッズカード（英: Item Card）
 */
type ItemCard = {
  cardKind: CardKindItem;
};

type Card = {
  /**
   * コレクションナンバー
   *
   * - 基本的には"001/002"の様な形式だが、数値以外の文字が入ることもある。把握し切れないので、とりあえず文字列型としている。
   */
  collectorCardNumber: CollectorCardNumber;
  expansionCode: ExpansionCode;
  rarityMark: RarityMark;
  regulationMark: RegulationMark;
} & (EnergyCard | ItemCard);

type Game = {};

type GamePlay = {
  game: Game;
};

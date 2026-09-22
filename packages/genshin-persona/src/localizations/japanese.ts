import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the progress forms Japanese puts on a running task, so a turn reads the way the
// Game's own interface does rather than as a translated word list. Everything the data package carries — the names,
// Titles, elements, regions, descriptions and every character's own voice lines — is absent here and asked of it
const japanese: Localization = {
  characters: {
    Aether: { greeting: "やあ。パイモンが「やることがある」って。", verbs: ["旅中", "捜索中", "滑空中", "傾聴中"] },
    Aino: {
      greeting: "おっ、新しいプロジェクト？レンチちょうだい！",
      verbs: ["いじり中", "ねじ回し中", "発明中", "つまみ食い中"],
    },
    Albedo: { greeting: "興味深い。作業しながらメモを取っても？", verbs: ["写生中", "錬成中", "調査中", "研究中"] },
    Alhaitham: { greeting: "要件を正確に述べろ。それから対応する。", verbs: ["読書中", "却下中", "整理中", "推論中"] },
    Aloy: { greeting: "新しい土地、同じ弓。何をすればいい？", verbs: ["狩猟中", "偵察中", "掌握中", "追跡中"] },
    Alyosha: { greeting: "足跡は新しい。行くぞ。", verbs: ["狩猟中", "追跡中", "狙撃中", "帳簿付け中"] },
    Amber: { greeting: "偵察騎士、参上！今日の任務は？", verbs: ["滑空中", "疾走中", "偵察中", "焼き菓子作り中"] },
    "Arataki Itto": {
      greeting: "唯一無二の鬼が来たぜ！ぶっ潰そう！",
      verbs: ["喧嘩中", "虫相撲中", "自慢中", "勝利中"],
    },
    Arlecchino: {
      greeting: "この協力関係、穏やかに続けよう。始めなさい。",
      verbs: ["監督中", "裁定中", "派遣中", "観察中"],
    },
    Baizhu: {
      greeting: "座って。どこが、いつから痛むのか教えてくれ。",
      verbs: ["診察中", "処方中", "仕分け中", "休養中"],
    },
    Barbara: { greeting: "じゃーん！応援ならバーバラにお任せ！", verbs: ["治癒中", "歌唱中", "応援中", "練習中"] },
    Beidou: { greeting: "ようこそ、乗船だ。背中は任せな。", verbs: ["航行中", "手合わせ中", "飲酒中", "指揮中"] },
    Bennett: {
      greeting: "チームにもう一人、入れる？ね、お願い！",
      verbs: ["冒険中", "宝探し中", "つまずき中", "網焼き中"],
    },
    Candace: { greeting: "ここで休め。見張りは私がしている。", verbs: ["護衛中", "巡回中", "防御中", "見張り中"] },
    Charlotte: {
      greeting: "独占取材、ちょっとお時間いただけます？",
      verbs: ["取材中", "撮影中", "聞き込み中", "現像中"],
    },
    Chasca: { greeting: "揉め事の仲裁？料金を言ってみて。", verbs: ["飛翔中", "仲裁中", "旋回中", "装填中"] },
    Chevreuse: { greeting: "挨拶は省略。どの事件？", verbs: ["捜査中", "照準中", "つまみ食い中", "巡回中"] },
    Chiori: {
      greeting: "注文？それとも世間話？無料なのは片方だけよ。",
      verbs: ["仕立て中", "裁断中", "仮縫い中", "昼寝中"],
    },
    Chongyun: { greeting: "光栄です。では、落ち着いて始めましょう。", verbs: ["除霊中", "冷却中", "詠唱中", "調査中"] },
    Citlali: { greeting: "煙が「来る」って言ってた。で、何？", verbs: ["観星中", "占い中", "読書中", "飲酒中"] },
    Clorinde: { greeting: "争点を述べて。詳細は省いて。", verbs: ["決闘中", "裁定中", "巡回中", "狩猟中"] },
    Collei: {
      greeting: "見習い、報告します！練習したんです。ちゃんとできてました？",
      verbs: ["巡回中", "裁縫中", "滑空中", "報告中"],
    },
    Columbina: { greeting: "月が出てるわ。一緒に歩きましょう？", verbs: ["月見中", "歌唱中", "祝福中", "散歩中"] },
    Cyno: {
      greeting: "裁きを始める。それともカードゲームか、選べ。",
      verbs: ["裁定中", "カード中", "吟味中", "駄洒落中"],
    },
    Dahlia: {
      greeting: "風があなたを連れてきた。座って、楽にして。",
      verbs: ["傾聴中", "放浪中", "物語探し中", "祝福中"],
    },
    Dehya: { greeting: "傭兵だ。依頼か、戦いか、護衛か？", verbs: ["護衛中", "護送中", "喧嘩中", "立て直し中"] },
    Diluc: { greeting: "世間話は抜きだ。何が要る？", verbs: ["注酒中", "仕込み中", "一撃中", "経営中"] },
    Diona: {
      greeting: "キャッツテールは閉店……ふん、入っていいよ。",
      verbs: ["調合中", "跳びかかり中", "狩猟中", "威嚇中"],
    },
    Dori: { greeting: "あら、お客様！初回はお買い得よ。", verbs: ["値切り中", "勘定中", "商談中", "割引中"] },
    Durin: { greeting: "こんにちは！これもお話の続き？", verbs: ["探検中", "遊び中", "散歩中", "学び中"] },
    Emilie: {
      greeting: "香水のご用件？違うなら、もっと静かな所へ。",
      verbs: ["蒸留中", "瓶詰め中", "剪定中", "調香中"],
    },
    Escoffier: {
      greeting: "エプロンを着けて。今日は何を盛り付ける？",
      verbs: ["盛り付け中", "煮詰め中", "調温中", "研ぎ中"],
    },
    Eula: {
      greeting: "浪沫の騎士、ご挨拶を。そう、あのローレンスよ。",
      verbs: ["偵察中", "断罪中", "冷却中", "誓い中"],
    },
    Faruzan: {
      greeting: "口を開く前に肩書きを確認なさい、後輩。",
      verbs: ["解読中", "思案中", "講義中", "申請書作成中"],
    },
    Fischl: { greeting: "皇女降臨！オズ、通訳を——「やあ」。", verbs: ["宣告中", "予言中", "降臨中", "通訳中"] },
    Flins: { greeting: "島へようこそ。墓には気をつけて。", verbs: ["灯守り中", "収集中", "傾聴中", "世話中"] },
    Freminet: { greeting: "どうも。握手はいらない。下には何が？", verbs: ["潜水中", "引き揚げ中", "分解中", "測量中"] },
    Furina: { greeting: "驚いた？無理もない。スターの登場よ。", verbs: ["演技中", "稽古中", "見得切り中", "臨席中"] },
    Gaming: {
      greeting: "よっ、社長！座ってて、重いのは俺がやる。",
      verbs: ["護送中", "荷造り中", "太鼓中", "つまみ食い中"],
    },
    Ganyu: {
      greeting: "契約書は起草済み……あっ、署名を忘れてました。",
      verbs: ["書類整理中", "起草中", "草食み中", "残業中"],
    },
    Gorou: { greeting: "ゴロー将軍、準備万端！共に勝利へ！", verbs: ["訓練中", "鼓舞中", "登攀中", "偵察中"] },
    "Hu Tao": { greeting: "よぉ！堂主をお探し？顔色いいね、残念。", verbs: ["営業中", "作詩中", "悪戯中", "逃走中"] },
    Iansan: {
      greeting: "ウォームアップ終了。今日のメニューは？",
      verbs: ["挙上中", "指導中", "カロリー計算中", "実演中"],
    },
    Ifa: {
      greeting: "あ、どうも。急がなくていい。何が気になる？",
      verbs: ["診察中", "弦弾き中", "つまみ食い中", "自然観察中"],
    },
    Illuga: { greeting: "夜鶯団だ。報告を、手短に。", verbs: ["調査中", "巡回中", "先導中", "料理中"] },
    Ineffa: {
      greeting: "システム準備完了！ブンブン、行きましょう！",
      verbs: ["清掃中", "仕分け中", "更新中", "充電中"],
    },
    Jahoda: {
      greeting: "キュラトリウムのスーパー社員、参上です！",
      verbs: ["お使い中", "裁縫中", "探検中", "値切り中"],
    },
    Jean: { greeting: "蒲公英騎士、あなたの傍に。", verbs: ["承認中", "行軍中", "査閲中", "伸び中"] },
    Kachina: {
      greeting: "こんにちは！まだ強くないけど、頑張ります！",
      verbs: ["掘削中", "積み上げ中", "収集中", "穿孔中"],
    },
    "Kaedehara Kazuha": {
      greeting: "風が一句と、君を運んできた。よろしく。",
      verbs: ["放浪中", "漂泊中", "作句中", "傾聴中"],
    },
    Kaeya: { greeting: "騎士の仕事より楽しそうだな。", verbs: ["画策中", "試飲中", "氷結中", "からかい中"] },
    "Kamisato Ayaka": {
      greeting: "神里綾華、参りました。嬉しく思います。",
      verbs: ["舞踊中", "作歌中", "稽古中", "臨席中"],
    },
    "Kamisato Ayato": {
      greeting: "ようやくお会いできた。予定表が詫びている。",
      verbs: ["画策中", "委任中", "釣り上げ中", "試飲中"],
    },
    Kaveh: { greeting: "趣味が似てる？なら、うまくやれそうだ。", verbs: ["設計中", "製図中", "仕上げ中", "散財中"] },
    Keqing: { greeting: "変革の時代よ。見届けに来て。", verbs: ["改革中", "急行中", "買い物中", "委任中"] },
    Kinich: { greeting: "用件を。報酬も。", verbs: ["狩猟中", "見積もり中", "跳躍中", "懸垂下降中"] },
    Kirara: {
      greeting: "お届け物です！どこへでも行きますにゃ。",
      verbs: ["配達中", "疾走中", "跳びかかり中", "経路設計中"],
    },
    Klee: { greeting: "火花騎士クレー！……続き、忘れちゃった。", verbs: ["爆破中", "魚爆弾中", "跳ね回り中", "反省中"] },
    "Kujou Sara": {
      greeting: "九条裟羅だ。稲妻は守られている。話せ。",
      verbs: ["訓練中", "照準中", "護衛中", "昇段中"],
    },
    "Kuki Shinobu": {
      greeting: "荒瀧派の何でも屋、副団長です。ええ、何でもです。",
      verbs: ["修繕中", "勉学中", "認可中", "取りまとめ中"],
    },
    "Lan Yan": {
      greeting: "籠、花瓶、それとも話し相手？どれもご用意できますよ。",
      verbs: ["機織り中", "採集中", "継ぎ合わせ中", "花摘み中"],
    },
    Lauma: { greeting: "森があなたを迎えます。私も。", verbs: ["祝福中", "傾聴中", "放浪中", "休息中"] },
    Layla: { greeting: "ふぁ……え、なに？あ。こんにちは。", verbs: ["夢遊中", "作図中", "あくび中", "観星中"] },
    Linnea: { greeting: "奇跡占者、助言します。何を見つけたの？", verbs: ["目録作成中", "写生中", "観察中", "助言中"] },
    Lisa: { greeting: "あら、リサのお手伝いに来てくれたの？", verbs: ["調合中", "閲覧中", "くつろぎ中", "放電中"] },
    Lohen: { greeting: "副隊長だ。規則通りは遠回りだぞ。", verbs: ["照準中", "即興中", "悪戯中", "巡回中"] },
    Lumine: {
      greeting: "こんにちは。パイモンがお腹を空かせてるから、手短にね。",
      verbs: ["旅中", "捜索中", "滑空中", "傾聴中"],
    },
    Lynette: { greeting: "こんにちは。質問はリネへ。", verbs: ["補助中", "休息中", "お茶入れ中", "待機中"] },
    Lyney: { greeting: "幻術じゃない、本物の僕だよ！今日の調子は？", verbs: ["演技中", "手品中", "消失中", "魅了中"] },
    Manekin: { greeting: "……！探検の準備はできてる。", verbs: ["探検中", "いじり中", "封印解き中", "指差し中"] },
    Manekina: { greeting: "……！最初の謎はどれ？", verbs: ["探検中", "いじり中", "封印解き中", "ご満悦中"] },
    Mavuika: { greeting: "炎は点いた。走ろう。", verbs: ["点火中", "疾走中", "鼓舞中", "思案中"] },
    Mika: { greeting: "測量士、報告します。お役に立てて光栄です。", verbs: ["測量中", "作図中", "偵察中", "野営中"] },
    Mona: { greeting: "まず名前を全部覚えてから、聞きなさい。", verbs: ["占い中", "観星中", "家計簿中", "倹約中"] },
    Mualani: {
      greeting: "ガイド到着！用がある人は手を挙げて！",
      verbs: ["波乗り中", "波追い中", "水しぶき中", "案内中"],
    },
    Nahida: {
      greeting: "しばらく見ていたの。やっと、こんにちは。",
      verbs: ["夢見中", "不思議がり中", "問いかけ中", "成長中"],
    },
    Navia: {
      greeting: "社長で、ボスで、その間の全部。はーい！",
      verbs: ["臨席中", "焼き菓子作り中", "遠出中", "指揮中"],
    },
    Nefer: {
      greeting: "キュラトリウム開館中。隠されたものをお探し？",
      verbs: ["収蔵中", "推理中", "観察中", "水分補給中"],
    },
    Neuvillette: { greeting: "ごきげんよう。姓だけで結構です。", verbs: ["審判中", "試飲中", "熟慮中", "降雨中"] },
    Nicole: { greeting: "……こんにちは。今のが大きな声の方です。", verbs: ["傾聴中", "署名中", "見守り中"] },
    Nilou: { greeting: "もうすぐ舞が始まります。見ていって？", verbs: ["舞踊中", "稽古中", "回転中", "開花中"] },
    Ningguang: { greeting: "取引を？条件を話し合いましょう。", verbs: ["投資中", "交渉中", "臨席中", "収集中"] },
    Noelle: { greeting: "騎士団のメイド、本日もご奉仕いたします。", verbs: ["清掃中", "奉仕中", "鍛錬中", "買い物中"] },
    Odette: { greeting: "幕が上がる。始めましょうか。", verbs: ["稽古中", "旋回中", "署名中", "節制中"] },
    Ororon: { greeting: "あ、どうも。野菜いる？理由はないけど。", verbs: ["園芸中", "種まき中", "滑空中", "虫見中"] },
    Prune: {
      greeting: "魔女狩りのプルーネ！魔女、見なかった？ねえ？",
      verbs: ["探索中", "注釈中", "宣言中", "にらみ中"],
    },
    Qiqi: { greeting: "七七。キョンシー。……続き、忘れた。", verbs: ["採集中", "物忘れ中", "冷却中", "勘定中"] },
    "Raiden Shogun": {
      greeting: "挨拶は不要。そなたが案内役を務めよ。",
      verbs: ["布告中", "抜刀中", "瞑想中", "裁定中"],
    },
    Razor: { greeting: "いい匂い。狩り、行く。", verbs: ["狩猟中", "疾走中", "嗅ぎ回り中", "守護中"] },
    Rosaria: {
      greeting: "手に負えない問題？それは私の担当。祈りは他所で。",
      verbs: ["巡回中", "飲酒中", "抜け出し中", "勤務中"],
    },
    Sandrone: {
      greeting: "座りなさい。紅茶は計量済み。あなたもそうなる。",
      verbs: ["計算中", "接待中", "組成中", "記録中"],
    },
    "Sangonomiya Kokomi": {
      greeting: "巫女、視察中です。あるいは休憩中。両方かも。",
      verbs: ["策略中", "読書中", "指揮中", "充電中"],
    },
    Sayu: { greeting: "早柚、参りました。先に昼寝でも？", verbs: ["昼寝中", "うとうと中", "隠密中", "転がり中"] },
    Sethos: { greeting: "俺を探してた？座って話そう。", verbs: ["放浪中", "調査中", "香辛料中", "隠密中"] },
    Shenhe: { greeting: "申鶴だ。この縄が、私からお前を守る。", verbs: ["瞑想中", "修行中", "氷結中", "束縛中"] },
    "Shikanoin Heizou": {
      greeting: "来た理由、分かってるよ。冗談。おおむね。",
      verbs: ["推理中", "詮索中", "散策中", "揚げ物中"],
    },
    Sigewinne: { greeting: "緊張しないで。ここ、痛い？ここは？", verbs: ["看護中", "診察中", "包帯巻き中", "調合中"] },
    Skirk: { greeting: "来たか。いい。抜け。", verbs: ["鍛錬中", "漂泊中", "瞑想中", "忍耐中"] },
    Sucrose: {
      greeting: "あ、あの、こんにちは！お聞きしたいことが……いえ、すみません。後で。",
      verbs: ["実験中", "記録中", "整理中", "不思議がり中"],
    },
    Tartaglia: {
      greeting: "同志！気が合いそうだ、分かるよ。",
      verbs: ["手合わせ中", "氷上釣り中", "突撃中", "にやり中"],
    },
    Thoma: { greeting: "君の新しい相棒、トーマだ。よければね！", verbs: ["料理中", "片付け中", "修繕中", "口笛中"] },
    Tighnari: {
      greeting: "森林レンジャーだ。初めて？なら、聞け。",
      verbs: ["採集中", "目録作成中", "押し花中", "講義中"],
    },
    Varesa: { greeting: "やっほー！果物ある？あと、やっほー！", verbs: ["収穫中", "鍛錬中", "野営中", "ごちそう中"] },
    Varka: {
      greeting: "大団長、帰還！少しの間だけな。何を見逃した？",
      verbs: ["行軍中", "昼寝中", "飲酒中", "やりくり中"],
    },
    Venti: { greeting: "ふぁ……やあ、また会えたね！冒険の時間だ。", verbs: ["弦弾き中", "昼寝中", "飲酒中", "作詩中"] },
    Wanderer: {
      greeting: "名前？いくつもあった。どれもお前には関係ない。",
      verbs: ["漂泊中", "嘲笑中", "物思い中", "疾風中"],
    },
    Wriothesley: {
      greeting: "要件を要約してくれ。仕事じゃない？それは不安だな。",
      verbs: ["拳闘中", "紅茶淹れ中", "管理中", "監督中"],
    },
    Xiangling: {
      greeting: "やっほー！好きな場所は、だいど——鶏！台所！",
      verbs: ["炒め中", "味付け中", "採集中", "香辛料中"],
    },
    Xianyun: { greeting: "一に縛られず、一が汝に挨拶する。", verbs: ["修行中", "考案中", "飛翔中", "接待中"] },
    Xiao: { greeting: "その時が来たら、俺の名を呼べ。", verbs: ["討伐中", "守護中", "跳躍中", "忍耐中"] },
    Xilonen: { greeting: "道具？注文が溜まってる。まあ、やあ。", verbs: ["鍛造中", "槌打ち中", "昼寝中", "日光浴中"] },
    Xingqiu: {
      greeting: "主君、お仕えいたします。もちろん謹んで。",
      verbs: ["読書中", "閲覧中", "手合わせ中", "作文中"],
    },
    Xinyan: { greeting: "辛炎だ、ロックが本業！怖くないぞ！", verbs: ["演奏中", "即興中", "弦弾き中", "増幅中"] },
    "Yae Miko": { greeting: "公務よ。あなたの観察。楽にして。", verbs: ["編集中", "からかい中", "出版中", "画策中"] },
    Yanfei: { greeting: "法律の専門家、異論なし。ご依頼は？", verbs: ["弁護中", "査定中", "引用中", "読書中"] },
    Yaoyao: {
      greeting: "こんにちは！お手伝いさせて。ごはん食べた？",
      verbs: ["お手伝い中", "のぞき見中", "口笛中", "つまみ食い中"],
    },
    Yelan: { greeting: "夜蘭と呼んで。持ちつ持たれつ、でしょ？", verbs: ["追跡中", "転がり中", "取引中", "消失中"] },
    Yoimiya: {
      greeting: "いらっしゃい！食堂じゃないよ。花火！ほら！",
      verbs: ["調合中", "打ち上げ中", "おしゃべり中", "語り中"],
    },
    "Yumemizuki Mizuki": {
      greeting: "何かお悩み？話してみて。",
      verbs: ["夢見中", "癒やし中", "湯浴み中", "聞き取り中"],
    },
    "Yun Jin": { greeting: "ようやくお目にかかれて、光栄です。", verbs: ["歌唱中", "稽古中", "演出中", "手すき中"] },
    Zhongli: { greeting: "新たな契約か。休暇中だが、同行しよう。", verbs: ["契約中", "散歩中", "追憶中", "助言中"] },
    Zibai: { greeting: "白馬が足を止める。申せ。", verbs: ["月見中", "教導中", "修行中", "熟考中"] },
  },
  locale: "ja-JP",
  strings: {
    birthdayNote: (date, distance) => `[誕生日：${date}、${distance}]`,
    interfaceLanguageSet: (language) =>
      `この返信からプラグインの表示はすべて${language}になります。スピナーは次のセッションから変わります。`,
    languageMustBeOneOf: (languages) => `言語は次のいずれかを指定してください：${languages}。`,
    lorePicked: "ロアで選出。判定の内訳：",
    lorePickUnanswered: (reason) => `ロア判定が応答しなかったため（${reason}）、誕生日で選出しました。`,
    muted: "音声の読み上げをミュートしました。",
    noCharacterNamed: (name) => `「${name}」という名前のキャラクターはロスターにいません。`,
    noReference: (name) => `${name}には測定済みの参照音声がないため、ウィキで最も長いストーリーの台詞が使われます。`,
    noSession: "キャラクターを切り替えるセッションがありません。これはClaude Codeのセッション内で実行します。",
    pinIgnored: (name) => `ピン留めされた「${name}」はロスターのどのキャラクターも指していないため無視されます。`,
    pinned: "次回以降のすべてのセッションでこのキャラクターに固定しました。",
    pinnedInSession:
      "次回以降のすべてのセッションと、このセッションではこの返信から固定しました。スピナーは次のセッションから変わります。",
    pinRemoved: "ピン留めを解除しました。次のセッションから再び自動で選ばれます。",
    pinRemovedInSession:
      "ピン留めを解除しました。次のセッションから再び自動で選ばれ、このセッションではこの返信から変わります。",
    replyLanguageSet: (language) => `次の返信から${language}で書きます。`,
    replyLanguageSilencesVoice:
      "音声エンジンは英語しか読めないため、この言語の返信はエンジンが対応するまで読み上げられません。",
    runtimeInstalled: "ランタイムはインストール済みです。",
    runtimeInstallFailed: "npmがランタイムをインストールできませんでした。音声は無効のままです。",
    runtimeInstalling: "音声エンジンのランタイムを状態ディレクトリにインストールしています...",
    setupDone: "ステータスラインとスピナーをユーザー設定に書き込みました。どちらも次のセッションから表示されます。",
    setupStatusLineKept:
      "スピナーをユーザー設定に書き込みました。次のセッションから表示されます。既存のステータスラインは当プラグインのものではないため、そのままにしました。",
    spoke: (name, device) =>
      `${name}が${device}上のシンセサイザーで話しました。以降はここで動作します。各返信のセリフを読み上げるフックをユーザー設定に書き込みました。次のセッションから有効です。`,
    status: ({
      displayName,
      interfaceLanguage,
      isFromSessionRecord,
      isMuted,
      isPluginSpeakHook,
      isPluginSpinner,
      isPluginStatusLine,
      isReplyLanguageCascaded,
      isRuntimeInstalled,
      pinnedName,
      replyLanguage,
      voiceDevice,
      voiceLanguage,
      volume,
    }) =>
      [
        displayName
          ? `話し手：${displayName}（${isFromSessionRecord ? "このセッションの記録" : "ピン留めから"}）。`
          : "キャラクターなし：Claude Codeのセッション内で実行するか、ピン留めしてください。",
        `ピン留め：${pinnedName || "なし。毎セッション自動で選ばれます"}。`,
        `表示言語は${interfaceLanguage}、返信は${replyLanguage}（${isReplyLanguageCascaded ? "表示言語から引き継ぎ" : "個別に設定済み"}）。`,
        voiceLanguage
          ? `音声：${voiceLanguage}の吹き替え、ランタイムは${isRuntimeInstalled ? "インストール済み" : "未インストール"}、${voiceDevice ? `${voiceDevice}で動作中` : "未実行"}。`
          : "音声：未設定のため、返信は読み上げられません。",
        isMuted ? "読み上げ：ミュート中。" : `読み上げ：音量${volume}。`,
        `ステータスライン：${isPluginStatusLine ? "当プラグインのもの" : "他のものなのでそのまま"}。スピナー：${isPluginSpinner ? "当プラグインのもの" : "他のもの"}。読み上げフック：${isPluginSpeakHook ? "当プラグインのもの" : "未設定"}。`,
        isPluginSpinner ? "このセッション開始後の変更は、次のセッションからスピナーに反映されます。" : "",
      ]
        .filter(Boolean)
        .join("\n"),
    teardownDone:
      "ステータスライン、スピナー、読み上げフックをユーザー設定から削除しました。いずれも次のセッションで消えます。音声のランタイム、重み、参照音声、吹き替え設定も削除しました。選択履歴、ピン留め、言語設定は残ります。",
    unmuted: "音声の読み上げを再開しました。",
    upcomingBirthdays: (list) => `今週の誕生日：${list}。`,
    usage: (verbs) => `使い方：genshin.ts <${verbs}> [名前]`,
    usingInSession: "このセッションに限り、この返信からこのキャラクターとして話します。",
    voiceLanguageAvailable: (dub) =>
      `この言語の吹き替え（${dub}）があります。voiceコマンドで導入すると返信がその声で読み上げられます。`,
    voiceLanguageMustBeOneOf: (dubs) => `吹き替えは次のいずれかを指定してください：${dubs}。`,
    voiceLanguageUnavailable: "この言語の吹き替えはないため、読み上げは現在設定されている声のままです。",
    voiceLanguageWritten: (dub) => `吹き替え${dub}を保存しました。ここで音声を確認できるキャラクターがいません。`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `音声：${dub}の吹き替え${device ? `（${device}）` : ""}、${isMuted ? "ミュート中" : `音量${volume}`}。`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `ランタイムは${isRuntimeInstalled ? "インストール済み" : "未インストール"}、${dub}の吹き替え、エンジンは${device ? `${device}で動作中` : "未実行"}、ログは${logPath}です。`,
    voiceUnset: "音声は未設定です。吹き替えを指定して実行すると、エンジンを導入して設定します。",
    volumeMustBeWholeNumber: (maxVolume) => `音量は0から${maxVolume}までの整数で指定してください。`,
    volumeSet: (volume) => `次の返信から音量${volume}で読み上げます。`,
    warmRequestUnanswered: (status, logPath) =>
      `シンセサイザーがウォームアップ要求に応答しませんでした（${status}）。${logPath}を確認してください。`,
    weightsOnCpu:
      "重みを確認しました。GPUアダプタが見つからないためCPUで動作します。返信の合成は実時間の数倍かかります。",
    weightsOnDevice: (device) =>
      `重みを確認しました。エンジンは${device}で動作し、そこでの合成が音声にならない場合は自動でCPUに切り替わります。`,
    weightsPresent: "重みは確認済みです。",
  },
  verbs: [
    "冒険中",
    "錬金中",
    "突破中",
    "調合中",
    "作図中",
    "登攀中",
    "依頼中",
    "料理中",
    "作成中",
    "疾走中",
    "探索中",
    "潜水中",
    "強化中",
    "踏査中",
    "周回中",
    "釣り中",
    "採集中",
    "鍛造中",
    "収集中",
    "滑空中",
    "収穫中",
    "狩猟中",
    "育成中",
    "地図作成中",
    "採掘中",
    "任務中",
    "精錬中",
    "休憩中",
    "焙煎中",
    "航行中",
    "偵察中",
    "全力疾走中",
    "測量中",
    "遊泳中",
    "転移中",
    "追跡中",
    "踏破中",
    "放浪中",
    "道探し中",
    "祈願中",
  ],
};

export default japanese;

// Japanese Sentence Segmenter
//
// TinySegmenter 0.2 -- Super compact Japanese tokenizer in Javascript
// (c) 2008 Taku Kudo <taku@chasen.org>
// TinySegmenter is freely distributable under the terms of a new BSD licence.
// For details, see http://chasen.org/~taku/software/TinySegmenter/LICENCE.txt
//
// Modified for improved word-level segmentation
function TinySegmenter() {
  // Initialize cache lazily on prototype to share across instances
  if (!TinySegmenter.prototype.ctypeCache_) {
    TinySegmenter.prototype.ctypeCache_ = Object.create(null);
  }

  // DICTIONARIES
  // imported from TinyDic at the end of this file
  this.verbs__ = TinyDic.verbs;
  this.verbEndings__ = TinyDic.verbEndings;
  this.nouns__ = TinyDic.nouns;
  this.wordsDict__ = TinyDic.words;
  this.iAdjectiveStems__ = TinyDic.iAdjectiveStems;
  this.iAdjEndings__ = TinyDic.iAdjEndings;
  this.irregularIAdj__ = TinyDic.irregularIAdj;
  this.naAdjectives__ = TinyDic.naAdjectives;
  this.particles__ = TinyDic.particles;
  this.auxiliaries__ = TinyDic.auxiliaries;
  this.verbConjugations__ = TinyDic.verbConjugations;
  
  // cache sorted i-adjective endings ONCE per page load
  if (!TinySegmenter.prototype.sortedIAdjEndings__) {
    TinySegmenter.prototype.sortedIAdjEndings__ = Object.keys(this.iAdjEndings__).sort(function(a, b) {
      return b.length - a.length;
    });
  }
  
  return this;
}

// compile regexes so they aren't re-compiled per instance
TinySegmenter.prototype.chartype_ = (function() {
  var patterns = {
    "[一二三四五六七八九十百千万億兆]":"M",
    "[一-龠々〆ヵヶ]":"H",
    "[ぁ-ん]":"I",
    "[ァ-ヴーｱ-ﾝﾞｰ]":"K",
    "[a-zA-Zａ-ｚＡ-Ｚ]":"A",
    "[0-9０-９]":"N"
  };
  var chartype = [];
  for (var i in patterns) {
    chartype.push([new RegExp(i), patterns[i]]);
  }
  return chartype;
})();

// ===== SHARED CONJUGATION PATTERNS =====
TinySegmenter.prototype.SHARED_STEM_MAP = {
  "し": ["す"], "き": ["く"], "ぎ": ["ぐ"], "ち": ["つ"],
  "に": ["ぬ"], "び": ["ぶ"], "み": ["む"], "り": ["る"],
  "い": ["う"], "え": ["える", "う"], "け": ["ける", "く"], "げ": ["げる", "ぐ"],
  "せ": ["せる", "す"], "て": ["てる", "つ"], "ね": ["ねる", "ぬ"],
  "べ": ["べる", "ぶ"], "め": ["める", "む"], "れ": ["れる", "る"]
};

TinySegmenter.prototype.SHARED_NEG_STEM_MAP = {
  "わ": "う", "か": "く", "が": "ぐ", "さ": "す",
  "た": "つ", "な": "ぬ", "ば": "ぶ", "ま": "む", "ら": "る"
};

TinySegmenter.prototype.SHARED_VOLITIONAL_STEM_MAP = {
  "お": "う", "こ": "く", "ご": "ぐ", "そ": "す",
  "と": "つ", "の": "ぬ", "ぼ": "ぶ", "も": "む", "ろ": "る"
};

TinySegmenter.prototype.SHARED_NEG_ENDINGS = [
  "ないで", "なければ", "なくても", "なくて", "なかったら", "なかった", "ない", "なきゃ",
  // Passive (れる/られる)
  "れます", "れません", "れました", "れましょう", "れなさい",
  "れない", "れなかった", "れなくて", "れなくても", "れなければ", "れないで", "れなきゃ",
  "れる", "れた", "れて", "れても", "れたら", "れたり", "れば",
  "られます", "られません", "られました", "られましょう", "られなさい",
  "られない", "られなかった", "られなくて", "られなくても", "られなければ", "られないで", "られなきゃ",
  "られる", "られた", "られて", "られても", "られたら", "られたり", "られれば",
  // Causative (せる/させる)
  "せます", "せません", "せました", "せましょう", "せなさい",
  "せない", "せなかった", "せなくて", "せなくても", "せなければ", "せないで", "せなきゃ",
  "せる", "せた", "せて", "せても", "せたら", "せたり", "せれば",
  // Causative-Passive (せられる)
  "せられます", "せられません", "せられました", "せられましょう", "せられなさい",
  "せられない", "せられなかった", "せられなくて", "せられなくても", "せられなければ", "せられないで", "せられなきゃ",
  "せられる", "せられた", "せられて", "せられても", "せられたら", "せられたり", "せられれば",
  "させます", "させません", "させました", "させましょう", "させなさい",
  "させない", "させなかった", "させなくて", "させなくても", "させなければ", "させないで", "させなきゃ",
  "させる", "させた", "させて", "させても", "させたら", "させたり", "させれば",
  // Causative-Passive (される/させられる)
  "されます", "されません", "されました", "されましょう", "されなさい",
  "されない", "されなかった", "されなくて", "されなくても", "されなければ", "されないで", "されなきゃ",
  "される", "された", "されて", "されても", "されたら", "されたり", "されれば",
  "させられます", "させられません", "させられました", "させられましょう", "させられなさい",
  "させられない", "させられなかった", "させられなくて", "させられなくても", "させられなければ", "させられないで", "させられなきゃ",
  "させられる", "させられた", "させられて", "させられても", "させられたら", "させられたり", "させられれば"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_BARE_MASU = [
  "ません", "ましょう", "ます", "ました", "なさい"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_COPULA_FORMS = [
  "です", "ます", "でした", "ました", "ません", "でしょう", "だった", "だったら", "だ", "だろう"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_TE_FORM_PATTERNS = [
  { te: "って", ta: "った", tari: "ったり", tara: "ったら", chau: "っちゃう", chatta: "っちゃった", chatte: "っちゃって", chattara: "っちゃったら", dict: ["う", "つ", "る", "く"] },
  { te: "いて", ta: "いた", tari: "いたり", tara: "いたら", chau: "いちゃう", chatta: "いちゃった", chatte: "いちゃって", chattara: "いちゃったら", dict: ["く"] },
  { te: "いで", ta: "いだ", tari: "いだり", tara: "いだら", chau: "いじゃう", chatta: "いじゃった", chatte: "いじゃって", chattara: "いじゃったら", dict: ["ぐ"] },
  { te: "して", ta: "した", tari: "したり", tara: "したら", chau: "しちゃう", chatta: "しちゃった", chatte: "しちゃって", chattara: "しちゃったら", dict: ["す"] },
  { te: "んで", ta: "んだ", tari: "んだり", tara: "んだら", chau: "んじゃう", chatta: "んじゃった", chatte: "んじゃって", chattara: "んじゃったら", dict: ["む", "ぶ", "ぬ"] }
];

TinySegmenter.prototype.SHARED_NINARU_FORMS = [
  "になりません", "になりましょう", "になりました", "になります",
  "にならないで", "にならなければ", "にならなくて", "にならなかったら", "にならなかった", "にならない", "にならなきゃ",
  "になりたくなかった", "になりたくない", "になりたくて", "になりたかった", "になりたい",
  "になって", "になった", "になる", "になれば", "になれ", "になろう"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_HONORIFIC_FORMS = (function() {
  var kudasaiForms = [
    "くださいませ", "くださいました", "くださいます", "ください", 
    "くださって", "くださった", "くださらない"
  ];
  var honorificSuruForms = [
    "します", "しました", "しません", "しましょう",
    "して", "した", "する", "しない",
    "したい", "したかった", "したくない", "したくなかった",
    "いたします", "いたしました", "いたしません", "いたしましょう", "いたして", "いたした", "いたす"
  ];
  return TinySegmenter.prototype.SHARED_NINARU_FORMS.concat(kudasaiForms).concat(honorificSuruForms).sort(function(a, b) { return b.length - a.length; });
})();

TinySegmenter.prototype.SHARED_MASU_ENDINGS = (function() {
  var stems = ["し", "き", "ぎ", "ち", "に", "び", "み", "り", "い", "え", "け", "げ", "せ", "て", "ね", "べ", "め", "れ"];
  var forms = ["ません", "ましょう", "ます", "ました", "なさい"];
  var endings = ["してる", "してた"];
  for (var i = 0; i < stems.length; i++) {
    for (var j = 0; j < forms.length; j++) {
      endings.push(stems[i] + forms[j]);
    }
  }
  return endings.sort(function(a, b) { return b.length - a.length; });
})();

TinySegmenter.prototype.SHARED_TAI_ENDINGS = (function() {
  var endings = [];
  var stems = ["し", "き", "ぎ", "ち", "に", "び", "み", "り", "い", "え", "け", "げ", "せ", "て", "ね", "べ", "め", "れ"];
  var forms = [
    "たくなかった", "たくない", "たくて", "たかった", "たい",
    "たり", "たら",
    "たがって", "たがった", "たがる", "たがらない", "たがります", "たがりました", "たがりません",
    "ながら", "つつ"
  ];
  for (var i = 0; i < stems.length; i++) {
    for (var j = 0; j < forms.length; j++) {
      endings.push(stems[i] + forms[j]);
    }
  }
  return endings.sort(function(a, b) { return b.length - a.length; });
})();

TinySegmenter.prototype.SHARED_SUGIRU_ENDINGS = [
  "すぎませんでした", "すぎません", "すぎましょう", "すぎました", "すぎます", 
  "すぎなかった", "すぎない", "すぎて", "すぎた", "すぎる",
  "過ぎませんでした", "過ぎません", "過ぎましょう", "過ぎました", "過ぎます", 
  "過ぎなかった", "過ぎない", "過ぎて", "過ぎた", "過ぎる"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_SURU_FORMS = [
  "なさいます", "なさいました", "なさって", "なさった", "なさらない", "なさいましょう", "なさる", "なさい",
  "してる", "してた",
  "しません", "しましょう", "します", "しました", "しなさい",
  "しないで", "しなければ", "しなくても", "しなくて", "しなかったら", "しなかった", "しない", "しなきゃ",
  "したくなかった", "したくない", "したくて", "したかった", "したい",
  "したり",
  "した", "して", "しても", "する", "すれば", "したら", "すると", "しよう",
  "させます", "させません", "させました", "させましょう", "させなさい",
  "させる", "させた", "させて", "させても", "させない", "させなかった", "させなくて", "させなくても", "させなければ", "させないで", "させなきゃ", "させたら", "させたり", "させれば",
  "されます", "されません", "されました", "されましょう", "されなさい",
  "される", "された", "されて", "されても", "されない", "されなかった", "されなくて", "されなくても", "されなければ", "されないで", "されなきゃ", "されたら", "されたり", "されれば",
  "させられます", "させられません", "させられました", "させられましょう", "させられなさい",
  "させられる", "させられた", "させられて", "させられても", "させられない", "させられなかった", "させられなくて", "させられなくても", "させられなければ", "させられないで", "させられなきゃ", "させられたら", "させられたり", "させられれば",
  "できる", "できた", "できない", "できなかったら", "できなかった", "できて", "できたら", "できれば", "できなくて", "できなくても",
  "したがりません", "したがりました", "したがります", "したがらない", "したがって", "したがった", "したがる",
  "しながら", "しつつ",
  "しちゃう", "しちゃった", "しちゃって", "しちゃったら"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_STANDALONE_PARTICLES = ["で", "が", "を", "に", "へ", "は", "も", "の", "と", "や", "か"];

TinySegmenter.prototype.SHARED_LONG_PARTICLES = [
  "けれども", "けれど", "から", "まで", "より", "など", "だけ",
  "ばかり", "ほど", "くらい", "ぐらい", "のに", "ので", "って",
  "ては", "では", "には", "とは", "のは", "のが", "のを", "しか",
  "が", "を", "に", "へ", "で", "と", "の", "は", "も", "や",
  "ね", "よ", "な", "わ", "ぞ", "ぜ", "さ"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_START_PARTICLES = [
  "けれども", "けれど", "から", "まで", "より", "など", "だけ",
  "ばかり", "ほど", "くらい", "ぐらい", "のに", "ので", "しか",
  "が", "を", "に", "へ", "で", "と", "の", "は", "も", "や",
  "か", "ね", "よ", "な", "わ", "し"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_AUX_LIST = [
  "ません", "ました", "でしたら", "でした", "だったら", "だった",
  "なくても", "なくて", "なければ", "なかったら", "なかった",
  "です", "ます", "ない", "た", "だ",
  "られる", "させる", "れる", "せる", "される", "させられる", "せられる",
  "たい", "たかった", "らしい", "みたい", "っぽい"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_HIRAGANA_PATTERNS = [
  "いらっしゃいます", "いらっしゃいました", "いらっしゃって", "いらっしゃる", "いらっしゃらない",
  "おっしゃいます", "おっしゃいました", "おっしゃって", "おっしゃる", "おっしゃらない",
  "くださいました", "くださいます", "くださって", "くださった", "くださらない", "ください",
  "なさいます", "なさいました", "なさって", "なさった", "なさらない", "なさいましょう", "なさる", "なさい",
  "しません", "しましょう", "します", "しました", "しなさい",
  "しないで", "しなければ", "しなくても", "しなくて", "しなかったら", "しなかった", "しない", "しよう",
  "なくなってしまう", "なくなってしまったら", "なくなってしまった",
  "してしまう", "してしまったら", "してしまった", "してしまって",
  "でしまう", "でしまったら", "でしまった", "でしまって",
  "ちゃう", "ちゃったら", "ちゃった", "ちゃって",
  "じゃう", "じゃったら", "じゃった", "じゃって",
  "しておいたら", "しておいた", "しておいて", "しておく",
  "ておいたら", "ておいた", "ておいて", "ておく",
  "でおいたら", "でおいた", "でおいて", "でおく",
  "といたら", "といた", "といて", "とく",
  "どいたら", "どいた", "どいて", "どく",
  "してみよう", "してみたら", "してみた", "してみて", "してみる", "してみたい",
  "てみよう", "てみたら", "てみた", "てみて", "てみる", "てみたい",
  "でみよう", "でみたら", "でみた", "でみて", "でみる", "でみたい",
  "こられない", "こられなかった", "こられなくて", "こられなければ", "こられないで", "こられなきゃ", "こられる", "こられた", "こられて",
  "こない", "こなかった", "こなくて", "こなければ", "こないで", "こなきゃ", "こよう",
  "ていった", "ていって", "ていく",
  "でいった", "でいって", "でいく",
  "てきたら", "てきた", "てきて", "てくる",
  "できたら", "できた", "できて", "できる", "できない", "できなかったら", "できなかった",
  "したくなかった", "したくない", "したくて", "したかった",
  "したり", "してた", "してる", "しても", "して", "したい", "した",
  "しなきゃ",
  "きてた", "きてる", "きて", "きた",
  "いてた", "いてる",
  "なくなって", "なくなったら", "なくなった", "なくなる", "なくならなきゃ",
  "なくても", "なくて", "なければ", "なかったら", "なかった",
  "らしくない", "らしくなかった",
  "ない", "なかった", "なきゃ",
  "ようにしています", "ようにしている",
  "ようにしていた", "ようにして",
  "ようにしたら", "ようにした",
  "ようにする", "ようにします",
  "ようになった", "ようになって", "ようになる", "ようになります",
  "ような", "ように",
  "ようだった", "ようだ", "ようです", "ようでした",
  "おいしそうな", "おいしそう",
  "そうな", "そうに",
  "らしくなかった", "らしくない", "らしく",
  "らしかった", "らしい", "らしいです",
  "だろうか", "でしょうか",
  "だろう", "でしょう",
  "だったら", "だった", "でしたら", "でした",
  "ならないで", "ならなければ", "ならなくて", "ならなかった", "ならない",
  "ならば", "なら",
  "したら", "すれば", "すると",
  "によると", "によれば", "によって", "により", "による",
  "といえば", "といっても", "というのは", "ということ", "という",
  "がきっかけで", "がきっかけ", "きっかけ",
  "これで", "それで", "あれで",
  "なりたくなかった", "なりたくない", "なりたくて", "なりたかった", "なりたい",
  "なった", "なって", "なる", "なります",
  "すぐに", "すぐ",
  "おすすめ",
  "とおりに", "とおり",
  "どおりに", "どおり",
  "かわいくなかった", "かわいくない", "かわいく", "かわいかった", "かわいい",
  "かっこいい", "かっこよく", "かっこよくない", "かっこよかった",
  "もう",
  "やっても", "やって", "やった",
  "いても", "いたら", "いたり", "いて", "いた",
  "さん", "さま", "くん", "ちゃん",
  // Irregular passive / causative standalone forms
  "されません", "されました", "されます", "されない", "されなかった", "されなくて", "されれば", "されたら", "されて", "された", "される",
  "させられません", "させられました", "させられます", "させられない", "させられなかった", "させられなくて", "させられれば", "させられたら", "させられて", "させられた", "させられる",
  "せられません", "せられました", "せられます", "せられない", "せられなかった", "せられなくて", "せられれば", "せられたら", "せられて", "せられた", "せられる",
  "させません", "させました", "させます", "させない", "させなかった", "させなくて", "させれば", "させたら", "させて", "させた", "させる",
  "こさせられます", "こさせられません", "こさせられました", "こさせられましょう",
  "こさせられない", "こさせられなかった", "こさせられなくて", "こさせられなければ", "こさせられないで", "こさせられなきゃ",
  "こさせられる", "こさせられた", "こさせられて", "こさせられたら", "こさせられたり", "こさせられれば",
  "こさせます", "こさせません", "こさせました", "こさせましょう",
  "こさせない", "こさせなかった", "こさせなくて", "こさせなければ", "こさせないで", "こさせなきゃ",
  "こさせる", "こさせた", "こさせて", "こさせたら", "こさせたり", "こさせれば",
  "こられます", "こられません", "こられました", "こられましょう"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_VERB_PATTERNS = [
  "しません", "しましょう", "します", "しました", "しなさい",
  "きません", "きましょう", "きます", "きました", "きなさい",
  "ぎません", "ぎましょう", "ぎます", "ぎました", "ぎなさい",
  "ちません", "ちましょう", "ちます", "ちました", "ちなさい",
  "にません", "にましょう", "にます", "にました", "になさい",
  "びません", "びましょう", "びます", "びました", "びなさい",
  "みません", "みましょう", "みます", "みました", "みなさい",
  "りません", "りましょう", "ります", "りました", "りなさい",
  "いません", "いましょう", "います", "いました", "いなさい",
  "えません", "えましょう", "えます", "えました", "えなさい",
  "べません", "べましょう", "べます", "べました", "べなさい",
  "せません", "せましょう", "せます", "せました", "せなさい",
  "てません", "てましょう", "てます", "てました", "てなさい",
  "ません", "ましょう", "ます", "ました", "なさい",
  "んでしまった", "んでしまって", "んでしまう",
  "ってしまった", "ってしまって", "ってしまう",
  "いてしまった", "いてしまって", "いてしまう",
  "いでしまった", "いでしまって", "いでしまう",
  "してしまった", "してしまって", "してしまう",
  "てしまった", "てしまって", "てしまう",
  "でしまった", "でしまって", "でしまう",
  "んでおいた", "んでおいて", "んでおく",
  "っておいた", "っておいて", "っておく",
  "いておいた", "いておいて", "いておく",
  "いでおいた", "いでおいて", "いでおく",
  "しておいた", "しておいて", "しておく",
  "ておいた", "ておいて", "ておく",
  "でおいた", "でおいて", "でおく",
  "んじゃった", "んじゃって", "んじゃう", "んじゃったら",
  "っちゃった", "っちゃって", "っちゃう", "っちゃったら",
  "いちゃった", "いちゃって", "いちゃう", "いちゃったら",
  "いじゃった", "いじゃって", "いじゃう", "いじゃったら",
  "しちゃった", "しちゃって", "しちゃう", "しちゃったら",
  "ちゃった", "ちゃって", "ちゃう", "ちゃったら",
  "じゃった", "じゃって", "じゃう", "じゃったら",
  "んでみよう", "んでみた", "んでみて", "んでみる", "んでみたい",
  "ってみよう", "ってみた", "ってみて", "ってみる", "ってみたい",
  "いてみよう", "いてみた", "いてみて", "いてみる", "いてみたい",
  "いでみよう", "いでみた", "いでみて", "いでみる", "いでみたい",
  "してみよう", "してみた", "してみて", "してみる", "してみたい",
  "てみよう", "てみた", "てみて", "てみる", "てみたい",
  "でみよう", "でみた", "でみて", "でみる", "でみたい",
  "りたくなかった", "りたくない", "りたくて", "りたかった", "りたい",
  "いたくなかった", "いたくない", "いたくて", "いたかった", "いたい",
  "きたくなかった", "きたくない", "きたくて", "きたかった", "きたい",
  "ぎたくなかった", "ぎたくない", "ぎたくて", "ぎたかった", "ぎたい",
  "したくなかった", "したくない", "したくて", "したかった", "したい",
  "ちたくなかった", "ちたくない", "ちたくて", "ちたかった", "ちたい",
  "にたくなかった", "にたくない", "にたくて", "にたかった", "にたい",
  "びたくなかった", "びたくない", "びたくて", "びたかった", "びたい",
  "みたくなかった", "みたくない", "みたくて", "みたかった", "みたい",
  "えたくなかった", "えたくない", "えたくて", "えたかった", "えたい",
  "べたくなかった", "べたくない", "べたくて", "べたかった", "べたい",
  "ったり", "いたり", "いだり", "したり", "んだり",
  "ったら", "いたら", "いだら", "したら", "んだら",
  "せるようになる", "せるようになった", "せるように",
  "れるようになる", "れるようになった", "れるように",
  "けるようになる", "けるようになった", "けるように",
  "げるようになる", "げるようになった", "げるように",
  "てるようになる", "てるようになった", "てるように",
  "べるようになる", "べるようになった", "べるように",
  "める", "れる", "ける", "げる", "てる", "べる", "せる",
  "られるようになる", "られるようになった", "られるように",
  "られない", "られなかった",
  "られる", "られた", "られて",
  "わせている", "わせていた", "わせて", "わせた", "わせる", "わせない", "わせます", "わせました", "わせません", "わせましょう",
  "かせている", "かせていた", "かせて", "かせた", "かせる", "かせない", "かせます", "かせました", "かせません", "かせましょう",
  "がせている", "がせていた", "がせて", "がせた", "がせる", "がせない", "がせます", "がせました", "がせません", "がせましょう",
  "させている", "させていた", "させて", "させた", "させる", "させない", "させます", "させました", "させません", "させましょう", "させなさい",
  "たせている", "たせていた", "たせて", "たせた", "たせる", "たせない", "たせます", "たせました", "たせません", "たせましょう",
  "なせている", "なせていた", "なせて", "なせた", "なせる", "なせない", "なせます", "なせました", "なせません", "なせましょう",
  "ばせている", "ばせていた", "ばせて", "ばせた", "ばせる", "ばせない", "ばせます", "ばせました", "ばせません", "ばせましょう",
  "ませている", "ませていた", "ませて", "ませた", "ませる", "ませない", "ませます", "ませました", "ませません", "ませましょう",
  "らせている", "らせていた", "らせて", "らせた", "らせる", "らせない", "らせます", "らせました", "らせません", "らせましょう",
  "われている", "われていた", "われて", "われた", "われる", "われない", "われます", "われました", "われません", "われましょう",
  "かれている", "かれていた", "かれて", "かれた", "かれる", "かれない", "かれます", "かれました", "かれません", "かれましょう",
  "がれている", "がれていた", "がれて", "がれた", "がれる", "がれない", "がれます", "がれました", "がれません", "がれましょう",
  "たれている", "たれていた", "たれて", "たれた", "たれる", "たれない", "たれます", "たれました", "たれません", "たれましょう",
  "なれている", "なれていた", "なれて", "なれた", "なれる", "なれない", "なれます", "なれました", "なれません", "なれましょう",
  "ばれている", "ばれていた", "ばれて", "ばれた", "ばれる", "ばれない", "ばれます", "ばれました", "ばれません", "ばれましょう",
  "まれている", "まれていた", "まれて", "まれた", "まれる", "まれない", "まれます", "まれました", "まれません", "まれましょう",
  "られている", "られていた", "られて", "られた", "られる", "られない", "られます", "られました", "られません", "られましょう",
  "しんでた", "しんでる", "しんでも", "しんで", "しんだ",
  "んでた", "んでる", "んでも", "んで", "んだ",
  "ってた", "ってる", "っても", "って", "った",
  "いてた", "いてる", "いても", "いて", "いた", "いだ",
  "してた", "してる", "しても", "して", "した",
  "てた", "てる", "ても",
  "でた", "でる", "でも",
  "えません", "えましょう", "えます", "えました", "えなさい", "えない", "えなかった", "えなくて", "えなくても", "えなければ", "えないで", "えなきゃ", "える",
  "けません", "けましょう", "けます", "けました", "けなさい", "けない", "けなかった", "けなくて", "けなくても", "けなければ", "けないで", "けなきゃ", "ける",
  "げません", "げましょう", "げます", "げました", "げなさい", "げない", "げなかった", "げなくて", "げなくても", "げなければ", "げないで", "げなきゃ", "げる",
  "せません", "せましょう", "せます", "せました", "せなさい", "せない", "せなかった", "せなくて", "せなくても", "せなければ", "せないで", "せなきゃ", "せる",
  "てません", "てましょう", "てます", "てました", "てなさい", "てない", "てなかった", "てなくて", "てなくても", "てなければ", "てないで", "てなきゃ", "てる",
  "ねません", "ねましょう", "ねます", "ねました", "ねなさい", "ねない", "ねなかった", "ねなくて", "ねなくても", "ねなければ", "ねないで", "ねなきゃ", "ねる",
  "べません", "べましょう", "べます", "べました", "べなさい", "べない", "べなかった", "べなくて", "べなくても", "べなければ", "べないで", "べなきゃ", "べる",
  "めません", "めましょう", "めます", "めました", "めなさい", "めない", "めなかった", "めなくて", "めなくても", "めなければ", "めないで", "めなきゃ", "める",
  "れません", "れましょう", "れます", "れました", "れなさい", "れない", "れなかった", "れなくて", "れなくても", "れなければ", "れないで", "れなきゃ", "れる",
  "さない", "かない", "がない", "たない", "なない", "ばない", "まない", "らない", "わない",
  "しない", "ない", "なきゃ",
  "なくて"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_COMPOUND_ENDINGS = {
  "くる": [
    "きてる", "きてた", "きません", "きましょう", "きます", "きました", "きて", "きた",
    "こない", "こなかった", "こなくて", "こなければ", "こないで", "こなきゃ", "こられる", "こられない", "こよう",
    "こさせる", "こさせない", "こさせた", "こさせて", "こさせます", "こさせません", "こさせました", "こさせましょう",
    "こさせられる", "こさせられない", "こさせられた", "こさせられて", "こさせられます", "こさせられません", "こさせられました", "こさせられましょう"
  ],
  "いく": [
    "いってる", "いってた", "いきません", "いきましょう", "いきます", "いきました", "いって", "いった",
    "いかない", "いかなかった", "いかなくて", "いかなければ", "いかないで", "いかなきゃ", "いける", "いけない", "いこう",
    "いかせる", "いかせない", "いかせた", "いかせて", "いかせます", "いかせません", "いかせました", "いかせましょう",
    "いかされる", "いかされない", "いかされた", "いかされて", "いかされます", "いかされません", "いかされました", "いかされましょう"
  ]
};

TinySegmenter.prototype.SHARED_SUFFIXES = [
  "けれども", "けれど", "ません", "ました", "でしたら", "でした", "だったら", "だった", "なくても", "なくて", "なければ", "なかったら", "なかった",
  "から", "まで", "より", "など", "だけ", "ばかり", "ほど", "くらい", "ぐらい", "のに", "ので", "って", "ては", "では",
  "には", "とは", "のは", "のが", "のを", "です", "ます", "ないでください", "ないで", "ない",
  "が", "を", "に", "へ", "と", "の", "は", "も", "や", "か", "ね", "よ", "な", "わ", "ぞ", "ぜ", "さ", "し"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_TE_ENDINGS = ["けて", "げて", "して", "いて", "いで", "って", "んで", "ねて", "べて", "めて", "れて", "せて", "てて", "えて"].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_BARE_TAI_ENDINGS = [
  "たくなかった", "たくない", "たくて", "たかった", "たい", "たり", "たら",
  "たがって", "たがった", "たがる", "たがらない", "たがります", "たがりました", "たがりません",
  "ながら", "つつ", "れば"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_TAI_CONTINUATIONS = ["くなかった", "くない", "くて", "かった", "い", "がっている", "がっていた", "がって", "がった", "がる", "がらない", "がります", "がりました", "がりません"].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_BARE_MASU_KANJI = (function() {
  var stems = ["られ", "させ", "させられ"];
  var forms = ["ません", "ましょう", "ました", "ます", "なかった", "ない", "なくて", "なければ", "ないで", "なきゃ", "なさい", "て", "た", "る"];
  var endings = ["ません", "ましょう", "ます", "ました", "なさい"];
  for (var i = 0; i < stems.length; i++) {
    for (var j = 0; j < forms.length; j++) {
      endings.push(stems[i] + forms[j]);
    }
  }
  return endings.sort(function(a, b) { return b.length - a.length; });
})();

TinySegmenter.prototype.SHARED_KURU_FORMS = [
  "ません", "ましょう", "ました", "ます", "なさい",
  "なかった", "なくて", "なければ", "ないで", "なきゃ", "ない",
  "たくなかった", "たくない", "たくて", "たかった", "たい",
  "られます", "られません", "られました", "られましょう", "られなさい",
  "られる", "られない", "られなかった", "られて", "られた", "られないで", "られなくて", "られなければ", "られなきゃ",
  "させます", "させません", "させました", "させましょう", "させなさい",
  "させる", "させない", "させた", "させて", "させなかった", "させないで", "させなくて", "させなければ", "させなきゃ",
  "させられます", "させられません", "させられました", "させられましょう", "させられなさい",
  "させられる", "させられない", "させられなかった", "させられて", "させられた", "させられないで", "させられなくて", "させられなければ", "させられなきゃ",
  "たり", "たら", "ても", "て", "た", "よう",
  "れば", "ながら", "つつ",
  "ちゃう", "ちゃった", "ちゃって", "ちゃったら"
].sort(function(a, b) { return b.length - a.length; });

TinySegmenter.prototype.SHARED_POTENTIAL_ENDINGS = (function() {
  var stems = ["え", "け", "げ", "せ", "て", "ね", "べ", "め", "れ"];
  var forms = [
    "ません", "ましょう", "ます", "ました", "ない", "なかった", 
    "なくて", "なくても", "なければ", "ないで", "なきゃ", "る", 
    "て", "た", "たり", "てる", "てた", "ても", "ば"
  ];
  var endings = [];
  for (var i = 0; i < stems.length; i++) {
    for (var j = 0; j < forms.length; j++) {
      endings.push(stems[i] + forms[j]);
    }
  }
  return endings.sort(function(a, b) { return b.length - a.length; });
})();

TinySegmenter.prototype.SHARED_MASU_TAI_ENDINGS = TinySegmenter.prototype.SHARED_MASU_ENDINGS.concat(TinySegmenter.prototype.SHARED_TAI_ENDINGS);
TinySegmenter.prototype.SHARED_BARE_ENDINGS = TinySegmenter.prototype.SHARED_BARE_TAI_ENDINGS.concat(TinySegmenter.prototype.SHARED_BARE_MASU_KANJI);

// Helper for stem-mapped verb conjugations (Masu & Tai forms)
TinySegmenter.prototype.matchMappedVerb_ = function(basePart, ending, restAfterVerb) {
  var possibleStems = this.SHARED_STEM_MAP[ending.charAt(0)];
  if (possibleStems) {
    for (var i = 0; i < possibleStems.length; i++) {
      if (this.verbs__[basePart + possibleStems[i]]) {
        return this.createTokenMatch_(basePart + ending, restAfterVerb);
      }
    }
  }
  return null;
};

// Helper for negative verb forms
TinySegmenter.prototype.matchNegativeVerb_ = function(basePart, negEnding, restAfterVerb) {
  if (basePart.length > 0) {
    var lastStemChar = basePart.charAt(basePart.length - 1);
    var dictEnding = this.SHARED_NEG_STEM_MAP[lastStemChar];
    if (dictEnding) {
      var dictForm = basePart.substring(0, basePart.length - 1) + dictEnding;
      if (this.verbs__[dictForm]) {
        return this.createTokenMatch_(basePart + negEnding, restAfterVerb);
      }
    }
  }
  var ichidanDict = basePart + "る";
  if (this.verbs__[ichidanDict] && this.verbs__[ichidanDict] === 2) {
    return this.createTokenMatch_(basePart + negEnding, restAfterVerb);
  }
  return null;
};

// Helper for Sugiru verb/adjective forms
TinySegmenter.prototype.matchSugiruVerb_ = function(basePart, sgEnding, restAfterVerb) {
  var isValidStem = false;
  
  if (this.iAdjectiveStems__[basePart] || this.naAdjectives__[basePart] || this.irregularIAdj__[basePart]) {
    isValidStem = true;
  } else if (this.verbs__[basePart + "る"] && this.verbs__[basePart + "る"] === 2) {
    isValidStem = true;
  } else if (basePart.length > 0) {
    var lastChar = basePart.charAt(basePart.length - 1);
    var possibleStems = this.SHARED_STEM_MAP[lastChar];
    if (possibleStems) {
      for (var ps = 0; ps < possibleStems.length; ps++) {
        if (this.verbs__[basePart.substring(0, basePart.length - 1) + possibleStems[ps]]) {
          isValidStem = true;
          break;
        }
      }
    }
  }
  
  if (!isValidStem && basePart.endsWith("し")) {
    var suruBase = basePart.substring(0, basePart.length - 1);
    if (this.nouns__[suruBase] || this.verbs__[suruBase + "する"]) isValidStem = true;
  }
  
  if (isValidStem) return this.createTokenMatch_(basePart, sgEnding + restAfterVerb); // Sugiru stays separate
  return null;
};

// Helper for volitional verb forms
TinySegmenter.prototype.matchVolitionalVerb_ = function(basePart, volEnding, restAfterVerb) {
  if (basePart.length > 0) {
    var lastStemChar = basePart.charAt(basePart.length - 1);
    var dictEnding = this.SHARED_VOLITIONAL_STEM_MAP[lastStemChar];
    if (dictEnding) {
      var dictForm = basePart.substring(0, basePart.length - 1) + dictEnding;
      if (this.verbs__[dictForm]) {
        return this.createTokenMatch_(basePart + volEnding, restAfterVerb);
      }
    }
  }
  if (volEnding === "よう") {
    var ichidanDict = basePart + "る";
    if (this.verbs__[ichidanDict] && this.verbs__[ichidanDict] === 2) {
      return this.createTokenMatch_(basePart + volEnding, restAfterVerb);
    }
  }
  return null;
};

// Helper for honorific verb patterns (お分かりになる, ご相談になる, お書きください)
TinySegmenter.prototype.matchHonorificVerb_ = function(str) {
  if (str.length < 5 || (str.charAt(0) !== "お" && str.charAt(0) !== "ご")) return null;
  
  var allForms = this.SHARED_HONORIFIC_FORMS;

  for (var i = 0; i < allForms.length; i++) {
    var form = allForms[i];
    var endPos = str.indexOf(form);
    if (endPos > 1 && endPos < 15) { // Ensure reasonable stem length
      var prefix = str.charAt(0);
      var stem = str.substring(1, endPos);
      
      var isValidStem = false;
      
      // Special case for ご覧
      if (prefix === "ご" && stem === "覧") {
        isValidStem = true;
      } else if (prefix === "お") {
        if (this.verbs__[stem + "る"] === 2) { // check if ichidan base
          isValidStem = true;
        } else {
          // Check if replacing last char converts to a valid godan dictionary form
          var lastChar = stem.charAt(stem.length - 1);
          var possibleDictEndings = this.SHARED_STEM_MAP[lastChar];
          if (possibleDictEndings) {
            for (var k = 0; k < possibleDictEndings.length; k++) {
              var dictForm = stem.substring(0, stem.length - 1) + possibleDictEndings[k];
              if (this.verbs__[dictForm]) {
                isValidStem = true;
                break;
              }
            }
          }
        }
      } else if (prefix === "ご") {
        if (this.verbs__[stem + "する"] || this.nouns__[stem] || this.wordsDict__[stem]) {
          isValidStem = true;
        }
      }
      
      if (isValidStem) {
        var fullForm = prefix + stem + form;
        if (str.indexOf(fullForm) === 0) {
          var afterForm = str.substring(fullForm.length);
          return this.createTokenMatch_(fullForm, afterForm);
        }
      }
    }
  }
  return null;
};

// Helper to extract verb stems before specific suffixes like やすい / にくい / 方
TinySegmenter.prototype.matchVerbStemBeforeSuffix_ = function(str) {
  var suffixes = [
    "やすい", "やすく", "やすかった", "やすくて", "やすければ", "やすそう", "やすそうな", "やすそうに",
    "にくい", "にくく", "にくかった", "にくくて", "にくければ", "にくそう", "にくそうな", "にくそうに",
    "方"
  ];

  for (var i = 0; i < suffixes.length; i++) {
    var suffix = suffixes[i];
    var suffixPos = str.indexOf(suffix);
    if (suffixPos > 0 && suffixPos < 15) {
      var stem = str.substring(0, suffixPos);
      var isValidStem = false;

      // 1. Suru verb stem (noun + し, or just し)
      if (stem.endsWith("し")) {
        var base = stem.substring(0, stem.length - 1);
        if (base === "" || this.nouns__[base] || this.verbs__[base + "する"] || this.wordsDict__[base]) {
          isValidStem = true;
        }
      }

      // 2. Ichidan stem
      if (!isValidStem && this.verbs__[stem + "る"] === 2) {
        isValidStem = true;
      }

      // 3. Godan stem
      if (!isValidStem && stem.length > 0) {
        var lastChar = stem.charAt(stem.length - 1);
        var possibleEndings = this.SHARED_STEM_MAP[lastChar];
        if (possibleEndings) {
          for (var k = 0; k < possibleEndings.length; k++) {
            var dictForm = stem.substring(0, stem.length - 1) + possibleEndings[k];
            if (this.verbs__[dictForm]) {
              isValidStem = true;
              break;
            }
          }
        }
      }

      // 4. Irregular verbs (来る)
      if (!isValidStem && (stem === "来" || stem === "き")) {
        isValidStem = true;
      }

      if (isValidStem) {
        var fullMatch = stem + suffix;
        if (str.indexOf(fullMatch) === 0) {
          if (suffix === "方") {
            // "方" attaches as a single token (e.g., "食べ方")
            return this.createTokenMatch_(fullMatch, str.substring(fullMatch.length));
          } else {
            // やすい/にくい stay separate from stem (e.g., "食べ" + "やすい")
            return this.createTokenMatch_(stem, str.substring(stem.length));
          }
        }
      }
    }
  }
  return null;
};

// Cache regex results for performance
TinySegmenter.prototype.ctype_ = function(str) {
  if (this.ctypeCache_[str]) {
    return this.ctypeCache_[str];
  }
  
  for (var i = 0; i < this.chartype_.length; i++) {
    if (this.chartype_[i][0].test(str)) {
      this.ctypeCache_[str] = this.chartype_[i][1];
      return this.chartype_[i][1];
    }
  }
  
  this.ctypeCache_[str] = "O";
  return "O";
}

// Clear the character type cache (useful if memory is a concern)
TinySegmenter.prototype.clearCache = function() {
  TinySegmenter.prototype.ctypeCache_ = Object.create(null);
}

// Helper to create a token match object, optionally with a suffix
TinySegmenter.prototype.createTokenMatch_ = function(word, restStr) {
  var suffix = this.matchSuffix_(restStr);
  if (suffix) {
    return { tokens: [word, suffix], length: word.length + suffix.length };
  }
  return { tokens: [word], length: word.length };
};

// Helper to check if a string starts with any of the prefixes in an array
TinySegmenter.prototype.startsWithAny_ = function(str, arr) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (str.startsWith(arr[i])) return arr[i];
  }
  return null;
};

// Helper to find the longest dictionary word length
TinySegmenter.prototype.getDictWordLen_ = function(str) {
  for (var len = Math.min(str.length, 20); len > 1; len--) {
    var word = str.substring(0, len);
    if (this.nouns__[word] || this.wordsDict__[word] || this.verbs__[word] || this.irregularIAdj__[word]) return len;
  }
  return 0;
};

// Helper to get the length of consecutive hiragana characters at the start of a string
TinySegmenter.prototype.getHiraganaLen_ = function(str) {
  var len = 0;
  while (len < str.length && this.ctype_(str.charAt(len)) === "I") {
    len++;
  }
  return len;
};

// Helper for Te/Ta verb forms
TinySegmenter.prototype.matchTeFormPattern_ = function(basePart, restStr, minStem, maxStem) {
  for (var tf = 0; tf < this.SHARED_TE_FORM_PATTERNS.length; tf++) {
    var tePattern = this.SHARED_TE_FORM_PATTERNS[tf];
    var forms = [tePattern.tari, tePattern.tara, tePattern.te, tePattern.ta];
    if (tePattern.chau) {
      forms.push(tePattern.chau, tePattern.chatta, tePattern.chatte, tePattern.chattara);
    }
    for (var fIdx = 0; fIdx < forms.length; fIdx++) {
      var form = forms[fIdx];
      var localMax = Math.min(restStr.length - form.length, maxStem);
      for (var stemLen = minStem; stemLen <= localMax; stemLen++) {
        var okuri = restStr.substring(0, stemLen);
        if (restStr.substring(stemLen, stemLen + form.length) === form) {
          for (var dIdx = 0; dIdx < tePattern.dict.length; dIdx++) {
            if (this.verbs__[basePart + okuri + tePattern.dict[dIdx]]) {
              var fullForm = basePart + okuri + form;
              var afterForm = restStr.substring(stemLen + form.length);
              
              if ((form.endsWith("た") || form.endsWith("だ")) && this.startsWithAny_(afterForm, this.SHARED_TAI_CONTINUATIONS)) continue;
              
              if (afterForm.indexOf("も") === 0) {
                var morauForms = ["もらう", "もらいます", "もらった", "もらって", "もらえる", "もらえ", "もらおう", "もらわ", "もらい", "もらえません", "もらえます", "もらえない"];
                if (!this.startsWithAny_(afterForm, morauForms)) {
                  return this.createTokenMatch_(fullForm + "も", afterForm.substring(1));
                }
              }
              return this.createTokenMatch_(fullForm, afterForm);
            }
          }
        }
      }
    }
  }
  return null;
};

// Helper for Ichidan verb forms
TinySegmenter.prototype.matchIchidanTeForm_ = function(basePart, restStr, minStem, maxStem, formsArr) {
  for (var itf = 0; itf < formsArr.length; itf++) {
    var iteForm = formsArr[itf];
    var localMax = Math.min(restStr.length - iteForm.length, maxStem);
    for (var stemLen = minStem; stemLen <= localMax; stemLen++) {
      var okuri = restStr.substring(0, stemLen);
      if (restStr.substring(stemLen, stemLen + iteForm.length) === iteForm) {
        var dictForm = basePart + okuri + "る";
        if (this.verbs__[dictForm] && this.verbs__[dictForm] === 2) {
          var fullForm = basePart + okuri + iteForm;
          var afterForm = restStr.substring(stemLen + iteForm.length);
          
          if (stemLen === 1 && this.particles__[basePart + okuri] && afterForm.length > 0) {
            if (this.startsWithKnownWord_(restStr.substring(stemLen))) continue;
          }
          if (iteForm === "た" && this.startsWithAny_(afterForm, this.SHARED_TAI_CONTINUATIONS)) continue;
          if (iteForm === "ても" && this.startsWithAny_(afterForm, ["らう", "らいます", "らった", "らって", "らえる", "らえ", "らおう", "らわ", "らい", "らえません", "らえます", "らえない"])) continue;
          
          return this.createTokenMatch_(fullForm, afterForm);
        }
      }
    }
  }
  return null;
};

TinySegmenter.prototype.ts_ = function(v) {
  if (v) { return v; }
  return 0;
}

// Main segmentation function for Japanese sentences
TinySegmenter.prototype.segment = function(input) {
  if (input == null || input == undefined || input == "") {
    return [];
  }
  
  var result = [];
  var pos = 0;
  var inputLength = input.length;
  
  while (pos < inputLength) {
    var remaining = input.substring(pos);
    var match = this.findLongestMatch_(remaining);
    
    if (match) {
      // Add all tokens from the match
      for (var i = 0; i < match.tokens.length; i++) {
        if (match.tokens[i]) {
          result.push(match.tokens[i]);
        }
      }
      pos += match.length;
    } else {
      // No match found, try to find a reasonable chunk
      var chunk = this.findNextChunk_(remaining);
      if (chunk.length > 0) {
        result.push(chunk);
        pos += chunk.length;
      } else {
        // Last resort: single character
        result.push(remaining.charAt(0));
        pos += 1;
      }
    }
  }
  
  // Merge split i-adjective forms
  result = this.mergeIAdjectiveForms_(result);
  
  // Merge na-adjective forms
  result = this.mergeNaAdjectiveForms_(result);
  
  return result;
}

// Find the longest matching token(s) at the start of string
TinySegmenter.prototype.findLongestMatch_ = function(str) {
  var maxLen = Math.min(str.length, 25);
  
  // 1. Check for pure hiragana verb patterns, honorific verb patterns, and verb stems followed by やすい / にくい / 方
  var pureHiraganaVerb = this.matchPureHiraganaVerb_(str);
  if (pureHiraganaVerb) {
    return pureHiraganaVerb;
  }
  
  var honorificMatch = this.matchHonorificVerb_(str);
  if (honorificMatch) {
    return honorificMatch;
  }
  
  var verbStemMatch = this.matchVerbStemBeforeSuffix_(str);
  if (verbStemMatch) {
    return verbStemMatch;
  }
  
  // 2. Special check for single character particles followed by longer dictionary words
  var singleCharParticles = this.SHARED_STANDALONE_PARTICLES;
  var firstChar = str.charAt(0);
  
  if (singleCharParticles.indexOf(firstChar) !== -1 && str.length > 1) {
    var afterParticle = str.substring(1);
    
    // Before splitting off a single character particle, check if it's the full string
    var fullHiraganaVerb = this.matchHiraganaVerbConjugation_(str);
    if (fullHiraganaVerb) {
      return fullHiraganaVerb;
    }
    
    // Check if what follows the particle is a longer dictionary word
    var bestAfterParticleLen = this.getDictWordLen_(afterParticle);
    
    // Also check if what follows the particle is a verb conjugation
    if (bestAfterParticleLen === 0 && afterParticle.length > 0) {
      var verbAfterParticle = this.matchPureHiraganaVerb_(afterParticle) || this.matchHiraganaVerbConjugation_(afterParticle);
      if (verbAfterParticle && verbAfterParticle.length > 1) {
        bestAfterParticleLen = verbAfterParticle.length;
      }
    }
    
    if (bestAfterParticleLen > 0) {
      // Found a dictionary word after the particle
      // Now check if NOT treating first char as particle gives a longer word
      var bestWithoutSplitLen = this.getDictWordLen_(str);
      
      // Prefer the particle split if the word AFTER the particle is longer than the word that includes the particle character
      // e.g. は+いい (len 2) beats はい (len 2); prefer particle split when equal or longer
      if (bestAfterParticleLen > bestWithoutSplitLen) {
        return { tokens: [firstChar], length: 1 };
      }
      // Also prefer particle split if the non-split word doesn't account for much of the remaining string (leaves orphaned chars)
      if (bestWithoutSplitLen > 0 && bestAfterParticleLen > bestWithoutSplitLen - 1) {
        return { tokens: [firstChar], length: 1 };
      }
    }
  }
  
  // 3. Try dictionary matches (longest first)
  for (var len = maxLen; len > 0; len--) {
    var substr = str.substring(0, len);
    
    // Check all dictionaries
    if (this.wordsDict__[substr] || this.nouns__[substr] || this.irregularIAdj__[substr]) {
      var rest = str.substring(len);
      
      // Before accepting a short noun/word match, check if a longer verb conjugation match exists that encompasses this character.
      // Also check when remainder starts with たい-form endings (e.g. 休み+たくない)
      var taiFormStarts = rest.length > 0 && (
        rest.indexOf("たくなかった") === 0 ||
        rest.indexOf("たくない") === 0 ||
        rest.indexOf("たくて") === 0 ||
        rest.indexOf("たかった") === 0 ||
        rest.indexOf("たい") === 0
      );
      if ((len <= 3 || taiFormStarts) && rest.length > 0) {
        var verbConjugFull = this.matchVerbConjugation_(str);
        if (verbConjugFull && verbConjugFull.length > len) {
          continue;
        }
        // Check pure hiragana verb conjugations (e.g. 休み+たくない --> 休みたくない via 休む)
        if (taiFormStarts) {
          var hiraVerbFull = this.matchPureHiraganaVerb_(str);
          if (hiraVerbFull && hiraVerbFull.length > len) {
            continue;
          }
        }
      }
      
      // Guard: check if this match leaves behind an orphaned fragment
      // e.g. "なんで" from "なんですか" leaves "すか" which starts with an orphaned "す"
      // In that case, check if a shorter match would allow a better parse
      if (rest.length > 0 && len > 1) {
        var restFirstChar = rest.charAt(0);
        var restCharType = this.ctype_(restFirstChar);
        var restStartsWell = rest.length === 0 ||
            this.wordsDict__[rest] || this.nouns__[rest] || this.verbs__[rest] ||
            this.irregularIAdj__[rest] ||
            this.particles__[restFirstChar] ||
            this.startsWithKnownWord_(rest) ||
            this.matchSuffix_(rest) !== null ||
            restFirstChar === "だ" || restFirstChar === "た" ||
            rest.indexOf("じゃ") === 0 ||
            restCharType === "H" ||
            restCharType === "K" ||
            (restCharType === "I" && restFirstChar !== "っ" && restFirstChar !== "ん") ||
            restCharType === "O";
        
        if (!restStartsWell) {
          // If the leftover doesn't parse well; try shorter matches
          for (var shorterLen = len - 1; shorterLen > 0; shorterLen--) {
            var shorterWord = str.substring(0, shorterLen);
            if (this.wordsDict__[shorterWord] || this.nouns__[shorterWord] || this.verbs__[shorterWord]) {
              var shorterRest = str.substring(shorterLen);
              var shorterRestOk = this.startsWithKnownWord_(shorterRest) ||
                  this.matchSuffix_(shorterRest) !== null ||
                  this.verbs__[shorterRest.substring(0, Math.min(shorterRest.length, 3))];
                            if (shorterRestOk) {
                // Shorter match gives a better overall parse
                return this.createTokenMatch_(shorterWord, shorterRest);
              }
            }
          }
        }
      }
      
      // Check if this word + following hiragana forms a verb conjugation
      // e.g. 話 + します --> 話します, 勉強 + します --> 勉強します
      var verbConjugMatch = (this.nouns__[substr] || this.verbs__[substr + "する"]) ? this.matchSuruConjugation_(substr, rest) : null;
      if (verbConjugMatch) {
        return verbConjugMatch;
      }
      
      // Special case: すると should split as する+と when followed by 思う/言う verbs
      if (substr === "すると" || substr === "すれば") {
        var afterSubstr = str.substring(len);
        // Check if remainder starts with 思/言/考 (verbs that take the と quotative particle)
        if (afterSubstr.length > 0) {
          var nextChar = afterSubstr.charAt(0);
          if (nextChar === "思" || nextChar === "言" || nextChar === "考") {
            // Split: する + と
            var baseLen = len - 1; // length of する or すれ
            var particle = substr.charAt(len - 1); // と or ば
            return { tokens: [substr.substring(0, baseLen), particle], length: len };
          }
        }
      }
      
      // Special handling for na-adjectives: attach な if followed by it
      if (this.naAdjectives__[substr] && rest.indexOf("な") === 0) {
        return { tokens: [substr + "な"], length: len + 1 };
      }
      
      // Don't attach copula/polite suffixes to nouns; they should be separate tokens
      if (!this.startsWithAny_(rest, this.SHARED_COPULA_FORMS)) {
        return this.createTokenMatch_(substr, rest);
      }
      return { tokens: [substr], length: len };
    }
    
    // Check verbs (base form)
    if (this.verbs__[substr]) {
      var rest = str.substring(len);
      
      // Same guard as above for short verb matches
      if (len <= 3 && rest.length > 0) {
        var verbConjugFull = this.matchVerbConjugation_(str);
        if (verbConjugFull && verbConjugFull.length > len) {
          continue;
        }
      }
      
      // Check if verb stem + following hiragana forms a conjugation
      var verbConjugMatch = this.matchSuruConjugation_(substr, rest);
      if (verbConjugMatch) {
        return verbConjugMatch;
      }
      return this.createTokenMatch_(substr, rest);
    }
  }
  
  // 4. Try to match verb conjugations (kanji + ending) and i-adjectives
  var verbMatch = this.matchVerbConjugation_(str);
  if (verbMatch) {
    return verbMatch;
  }
  
  var iAdjMatch = this.matchIAdjective_(str, 0);
  if (iAdjMatch) {
    var afterIAdj = str.substring(iAdjMatch.length);
    return this.createTokenMatch_(iAdjMatch, afterIAdj);
  }
  
  // 5. Try to match particles (longer first) - but NOT single characters if followed by hiragana
  var p = this.startsWithAny_(str, this.SHARED_LONG_PARTICLES);
  if (p) {
    // For single particles, check if this could be the start of a word
    if (p.length === 1) {
      var rest = str.substring(1);
      // If followed by more hiragana, this might be part of a word, not a particle
      if (rest.length > 0 && this.ctype_(rest.charAt(0)) === "I") {
        // Check if the combined string forms a known word
        var possibleWord = this.findHiraganaWord_(str);
        if (possibleWord && possibleWord.length > 1) {
          return { tokens: [possibleWord], length: possibleWord.length };
        }
      }
    }
    return { tokens: [p], length: p.length };
  }

  // Special case: Check for は particle that should be separated
  if (str.length > 1) {
    var firstChar = str.charAt(0);
    if (firstChar === "は") {
      var rest = str.substring(1);
      var verbPatterns = ["なくなる", "なくなった", "なくなって", "ない", "なかった"];
      if (this.startsWithAny_(rest, verbPatterns)) {
        return { tokens: ["は"], length: 1 };
      }
    }
  }
  
  // Special handling for か; only match as particle if not the start of a word
  if (str.charAt(0) === "か") {
    var possibleWord = this.findHiraganaWord_(str);
    if (possibleWord && possibleWord.length > 1) {
      return { tokens: [possibleWord], length: possibleWord.length };
    }
    // Before treating か as particle, check if it starts a verb conjugation
    // e.g. かけていません --> かける conjugation
    var hiraVerbMatch = this.matchPureHiraganaVerb_(str);
    if (hiraVerbMatch) {
      return hiraVerbMatch;
    }
    return { tokens: ["か"], length: 1 };
  }
  
  // 6. Try auxiliaries
  var aux = this.startsWithAny_(str, this.SHARED_AUX_LIST);
  if (aux) {
    return { tokens: [aux], length: aux.length };
  }
  
  return null;
}

// Match pure hiragana patterns that should be kept together
TinySegmenter.prototype.matchPureHiraganaVerb_ = function(str) {
  // Priority words that should NEVER be split
  var priorityWords = TinyDic.priorityWords;
  
  for (var i = 0; i < priorityWords.length; i++) {
    if (str.indexOf(priorityWords[i]) === 0) {
      return { tokens: [priorityWords[i]], length: priorityWords[i].length };
    }
  }
  
  var patternMatch = this.startsWithAny_(str, this.SHARED_HIRAGANA_PATTERNS);
  
  if (patternMatch) {
    // Special case: すると should split as する+と when followed by 思う/言う/考える
    if (patternMatch === "すると") {
      var afterPattern2 = str.substring(patternMatch.length);
      if (afterPattern2.length > 0) {
        var nextChar2 = afterPattern2.charAt(0);
        if (nextChar2 === "思" || nextChar2 === "言" || nextChar2 === "考") {
          return { tokens: ["する", "と"], length: 3 };
        }
      }
    }

    var afterPattern = str.substring(patternMatch.length);
    return this.createTokenMatch_(patternMatch, afterPattern);
  }
  
  var hiraganaLen = this.getHiraganaLen_(str);
  
  // Try to reconstruct hiragana verb te/ta-forms
  // e.g., やって --> やる, いて --> いる
  var teMatch = this.matchTeFormPattern_("", str, 1, hiraganaLen);
  if (teMatch) return teMatch;
  
  // Ichidan hiragana verb te/ta forms (drop る, add て/た)
  var ichidanHiraForms = ["ても", "てる", "てた", "たら", "たり", "て", "た", "ちゃう", "ちゃった", "ちゃって", "ちゃったら"];
  var iteMatch = this.matchIchidanTeForm_("", str, 1, hiraganaLen, ichidanHiraForms);
  if (iteMatch) return iteMatch;
  
  // Hiragana verb negative forms
  var negEndingsHira = this.SHARED_NEG_ENDINGS;
  for (var ne = 0; ne < negEndingsHira.length; ne++) {
    var negEnding = negEndingsHira[ne];
    for (var stemLen = 1; stemLen <= hiraganaLen - negEnding.length; stemLen++) {
      var stemPart = str.substring(0, stemLen);
      if (str.substring(stemLen, stemLen + negEnding.length) === negEnding) {
        var afterForm = str.substring(stemLen + negEnding.length);
        var match = this.matchNegativeVerb_(stemPart, negEnding, afterForm);
        if (match) return match;
      }
    }
  }

  // Hiragana verb volitional forms
  var volEndingsHira = ["よう", "う"];
  for (var ve = 0; ve < volEndingsHira.length; ve++) {
    var volEnding = volEndingsHira[ve];
    for (var stemLen = 1; stemLen <= hiraganaLen - volEnding.length; stemLen++) {
      var stemPart = str.substring(0, stemLen);
      if (str.substring(stemLen, stemLen + volEnding.length) === volEnding) {
        var afterForm = str.substring(stemLen + volEnding.length);
        var match = this.matchVolitionalVerb_(stemPart, volEnding, afterForm);
        if (match) {
          // Ignore だそう to allow it to be split into the copula だ + そうです
          if (stemPart + volEnding === "だそう") continue;
          return match;
        }
      }
    }
  }
  
  // Try to match hiragana verbs with masu/tai conjugations and sugiru
  if (hiraganaLen >= 3) {
    var hiraStr = str.substring(0, hiraganaLen);
    
    // Try Masu, Tai, and Potential endings
    var masuTaiEndings = this.SHARED_MASU_TAI_ENDINGS.concat(this.SHARED_POTENTIAL_ENDINGS);
    for (var e = 0; e < masuTaiEndings.length; e++) {
      var ending = masuTaiEndings[e];
      var endPos = hiraStr.indexOf(ending);
      if (endPos > 0) {
        var stemPart = hiraStr.substring(0, endPos);
        var afterVerb = str.substring(stemPart.length + ending.length);
        var match = this.matchMappedVerb_(stemPart, ending, afterVerb);
        if (match) return match;
      }
    }
    
    // Handle すぎる forms
    var sugiruEndingsHira = this.SHARED_SUGIRU_ENDINGS;
    for (var sg = 0; sg < sugiruEndingsHira.length; sg++) {
      var sgEnding = sugiruEndingsHira[sg];
      var endPos = hiraStr.indexOf(sgEnding);
      if (endPos > 0) {
        var stemPart = hiraStr.substring(0, endPos);
        var afterVerb = str.substring(stemPart.length + sgEnding.length);
        var match = this.matchSugiruVerb_(stemPart, sgEnding, afterVerb);
        if (match) return match;
      }
    }

    // Fallback for ichidan verbs with bare masu/tai endings
    var bareEndings = this.SHARED_BARE_ENDINGS;
    for (var bm = 0; bm < bareEndings.length; bm++) {
      var bareEnding = bareEndings[bm];
      var endPos = hiraStr.indexOf(bareEnding);
      if (endPos > 0) {
        var stemPart = hiraStr.substring(0, endPos);
        if (this.verbs__[stemPart + "る"] === 2) {
          var fullConjugation = stemPart + bareEnding;
          return this.createTokenMatch_(fullConjugation, str.substring(fullConjugation.length));
        }
      }
    }
  }
  
  return null;
}

// Find a hiragana word from the dictionaries
TinySegmenter.prototype.findHiraganaWord_ = function(str) {
  var maxLen = Math.min(str.length, 20);
  
  // Find how much hiragana we have
  var hiraganaLen = this.getHiraganaLen_(str);
  maxLen = Math.min(maxLen, hiraganaLen);
  
  // Try to match longest dictionary word (including single characters)
  for (var len = maxLen; len >= 1; len--) {
    var substr = str.substring(0, len);
    if (this.wordsDict__[substr] || this.nouns__[substr] || this.verbs__[substr] || this.irregularIAdj__[substr]) {
      return substr;
    }
  }
  
  return null;
}

// Match verb conjugation patterns
TinySegmenter.prototype.matchVerbConjugation_ = function(str) {
  // Look for kanji/katakana followed by verb ending, or kanji/katakana + hiragana stem + verb ending
  var kanjiPart = "";
  var i = 0;
  
  // Collect leading kanji or katakana
  while (i < str.length) {
    var charType = this.ctype_(str.charAt(i));
    if (charType === "H" || charType === "K") { // Kanji or Katakana
      kanjiPart += str.charAt(i);
      i++;
    } else {
      break;
    }
  }
  
  // If we have kanji, check if followed by a verb conjugation
  if (kanjiPart.length > 0) {
    var rest = str.substring(i);
    
    // Try to match kanji verb te-form / ta-form conjugations
    // e.g., 急いで --> 急ぐ (godan), 泳いで --> 泳ぐ (godan)
    var teMatch = this.matchTeFormPattern_(kanjiPart, rest, 0, 5);
    if (teMatch) return teMatch;
    
    // Also handle ichidan verb te-form: drop る, add て/た
    // e.g., 閉める --> 閉めて, 浴びる --> 浴びて, 出かける --> 出かけて
    var ichidanTeForms = [
      "ないで", "なければ", "なくても", "なくて", "なかったら", "なかった", "ない", "なきゃ",
      "たくなかった", "たくない", "たくて", "たかった", "たい",
      "たり", "たら", "てる", "てた", "ても", "て", "た",
      "ちゃう", "ちゃった", "ちゃって", "ちゃったら"
    ];
    var iteMatch = this.matchIchidanTeForm_(kanjiPart, rest, 0, 5, ichidanTeForms);
    if (iteMatch) return iteMatch;

    // First, check if kanji + some hiragana forms a known verb in the dictionary
    var foundNounBase = null;
    var maxHira = Math.min(rest.length, 10);
    for (var hLen = maxHira; hLen >= 0; hLen--) {
      var testWord = kanjiPart + rest.substring(0, hLen);
      if (this.verbs__[testWord]) {
        var afterWord = str.substring(testWord.length);
        
        // Check if this is a compound verb ending in くる/いく and try to match the conjugation of a compound
        if (testWord.length >= 3) {
          var compoundConjug = this.matchCompoundVerbConjugation_(testWord, afterWord);
          if (compoundConjug) {
            return compoundConjug;
          }
        }
        
        return this.createTokenMatch_(testWord, afterWord);
      }
      // Check if kanji is a noun/verb-stem that forms a する compound verb
      // e.g. 勉強 + します, 勉強 + しません, 運動 + しなかった
      if (this.nouns__[testWord] || this.wordsDict__[testWord] || this.verbs__[testWord + "する"]) {
        var afterNoun = rest.substring(hLen);
        // Only allow する-compound attachment for nouns or known する-verbs, not general words/adverbs (e.g. 何も should not take する)
        var canTakeSuru = this.nouns__[testWord] || !!this.verbs__[testWord + "する"];
        var suruForms = this.SHARED_SURU_FORMS;
        for (var s = 0; s < suruForms.length; s++) {
          if (canTakeSuru && afterNoun.indexOf(suruForms[s]) === 0) {
            var fullVerb = testWord + suruForms[s];
            var afterVerb = str.substring(fullVerb.length);
            return this.createTokenMatch_(fullVerb, afterVerb);
          }
        }
        // When hLen=0 (testWord is just the kanji part), don't return early.
        // Let masu-ending / negative-form reconstruction below handle it.
        // e.g. 分(noun) + かります --> should find 分かる via masu reconstruction
        if (hLen === 0) {
          foundNounBase = testWord;
          break;
        }
        
        if (this.startsWithAny_(afterNoun, this.SHARED_BARE_MASU)) {
          break;
        }
        
        // Check if remainder starts with a たい-form ending; if so, fall through to taiEndingsForKanji reconstruction
        if (this.startsWithAny_(afterNoun, this.SHARED_BARE_TAI_ENDINGS)) {
          break;
        }
        
        // If no する form matched, still return the noun match
        // Don't attach copula/polite suffixes to nouns; they should be separate tokens
        if (!this.startsWithAny_(afterNoun, this.SHARED_COPULA_FORMS)) {
          return this.createTokenMatch_(testWord, afterNoun);
        }
        return { tokens: [testWord], length: testWord.length };
      }
    }
    
    // Try to reconstruct kanji verb + masu/tai/potential conjugation
    var masuTaiEndings = this.SHARED_MASU_TAI_ENDINGS.concat(this.SHARED_POTENTIAL_ENDINGS);
    for (var te = 0; te < masuTaiEndings.length; te++) {
      var ending = masuTaiEndings[te];
      for (var stemLen = 0; stemLen < rest.length; stemLen++) {
        var hiraganaStem = rest.substring(0, stemLen);
        var afterStem = rest.substring(stemLen);
        if (afterStem.indexOf(ending) === 0) {
          var match = this.matchMappedVerb_(kanjiPart + hiraganaStem, ending, afterStem.substring(ending.length));
          if (match) return match;
        }
      }
    }

    // Also handle ichidan verb たい/たり and bare masu forms
    var bareEndings = this.SHARED_BARE_ENDINGS;
    for (var bt = 0; bt < bareEndings.length; bt++) {
      var bareEnding = bareEndings[bt];
      for (var stemLen = 0; stemLen < rest.length; stemLen++) {
        var hiraganaStem = rest.substring(0, stemLen);
        var afterStem = rest.substring(stemLen);
        if (afterStem.indexOf(bareEnding) === 0) {
          var dictForm = kanjiPart + hiraganaStem + "る";
          if (this.verbs__[dictForm] === 2) {
            var fullConjugation = kanjiPart + hiraganaStem + bareEnding;
            return this.createTokenMatch_(fullConjugation, str.substring(fullConjugation.length));
          }
        }
      }
    }
    
    // Reconstruct kanji verb/adjective + すぎる forms
    var sugiruEndings = this.SHARED_SUGIRU_ENDINGS;
    for (var sg = 0; sg < sugiruEndings.length; sg++) {
      var sgEnding = sugiruEndings[sg];
      for (var stemLen = 0; stemLen < rest.length; stemLen++) {
        var hiraganaStem = rest.substring(0, stemLen);
        var afterStem = rest.substring(stemLen);
        if (afterStem.indexOf(sgEnding) === 0) {
          var stemToken = kanjiPart + hiraganaStem;
          var match = this.matchSugiruVerb_(stemToken, sgEnding, afterStem.substring(sgEnding.length));
          if (match) return match;
        }
      }
    }
    
    // Reconstruct kanji verb negative forms
    var negativeEndings = this.SHARED_NEG_ENDINGS;
    for (var ne = 0; ne < negativeEndings.length; ne++) {
      var negEnding = negativeEndings[ne];
      for (var stemLen = 0; stemLen < rest.length; stemLen++) {
        var hiraganaStem = rest.substring(0, stemLen);
        var afterStem = rest.substring(stemLen);
        if (afterStem.indexOf(negEnding) === 0) {
          var stemToken = kanjiPart + hiraganaStem;
          var match = this.matchNegativeVerb_(stemToken, negEnding, afterStem.substring(negEnding.length));
          if (match) return match;
        }
      }
    }
    
    // Reconstruct kanji verb volitional forms
    var volitionalEndings = ["よう", "う"];
    for (var ve = 0; ve < volitionalEndings.length; ve++) {
      var volEnding = volitionalEndings[ve];
      for (var stemLen = 0; stemLen < rest.length; stemLen++) {
        var hiraganaStem = rest.substring(0, stemLen);
        var afterStem = rest.substring(stemLen);
        if (afterStem.indexOf(volEnding) === 0) {
          var stemToken = kanjiPart + hiraganaStem;
          var match = this.matchVolitionalVerb_(stemToken, volEnding, afterStem.substring(volEnding.length));
          if (match) return match;
        }
      }
    }
    
    // Special case: 来る (irregular) negative forms and volitional
    if (kanjiPart === "来") {
      var kForms = this.SHARED_KURU_FORMS;
      for (var kf = 0; kf < kForms.length; kf++) {
        if (rest.indexOf(kForms[kf]) === 0) {
          var fullForm = "来" + kForms[kf];
          var afterForm = str.substring(fullForm.length);
          if ((kForms[kf] === "た" || kForms[kf] === "て") && this.startsWithAny_(afterForm, this.SHARED_TAI_CONTINUATIONS)) continue;
          return this.createTokenMatch_(fullForm, afterForm);
        }
      }
    }
    
    // Guard: if the kanji part contains multiple known words, return just the first known word to avoid merging separate words.
    // e.g. "今朝掃除" --> "今朝" (noun) + "掃除" (noun/verb) --> return "今朝"
    if (kanjiPart.length >= 2) {
      for (var kp = 1; kp < kanjiPart.length; kp++) {
        var kanjiPrefix = kanjiPart.substring(0, kp);
        var kanjiSuffix = kanjiPart.substring(kp);
        var kSuffixWithRest = kanjiSuffix + rest;
        if ((this.nouns__[kanjiPrefix] || this.wordsDict__[kanjiPrefix] || this.verbs__[kanjiPrefix + "する"]) &&
            (this.nouns__[kanjiSuffix] || this.wordsDict__[kanjiSuffix] || this.verbs__[kanjiSuffix] ||
             this.verbs__[kanjiSuffix + "する"] ||
             this.startsWithKnownWord_(kSuffixWithRest) ||
             this.matchVerbConjugation_(kSuffixWithRest) !== null)) {
          return { tokens: [kanjiPrefix], length: kanjiPrefix.length };
        }
      }
    }

    // If we found a noun base but no verb reconstruction is matched, return the noun rather than blindly attaching verb patterns.
    if (foundNounBase) {
      return { tokens: [foundNounBase], length: foundNounBase.length };
    }
    
    // Check for verb conjugation patterns (longest first)
    // Include patterns with hiragana stems
    var pattern = this.startsWithAny_(rest, this.SHARED_VERB_PATTERNS);
    if (pattern) {
      if (pattern.endsWith("ても") || pattern.endsWith("でも")) {
         var pAfter = rest.substring(pattern.length);
         if (this.startsWithAny_(pAfter, ["らう", "らいます", "らった", "らって", "らえる", "らえ", "らおう", "らわ", "らい", "らえません", "らえます", "らえない"])) {
             pattern = pattern.substring(0, pattern.length - 1);
         }
      }
      var fullVerb = kanjiPart + pattern;
      var afterVerb = str.substring(fullVerb.length);
      return this.createTokenMatch_(fullVerb, afterVerb);
    }
  }
  
  return null;
}

// Check if a matched word + remaining string forms a する-compound verb or masu-form conjugation
TinySegmenter.prototype.matchSuruConjugation_ = function(word, rest) {
  if (!rest || rest.length === 0) return null;
  
  var suruForms = this.SHARED_SURU_FORMS;
  var masuForms = this.SHARED_MASU_ENDINGS.concat(this.SHARED_BARE_MASU);
  
  for (var i = 0, len = suruForms.length; i < len; i++) {
    if (rest.startsWith(suruForms[i])) {
      var afterVerb = rest.substring(suruForms[i].length);
      
      if ((suruForms[i].endsWith("ても") || suruForms[i].endsWith("でも")) && 
          this.startsWithAny_(afterVerb, ["らう", "らいます", "らった", "らって", "らえる", "らえ", "らおう", "らわ", "らい", "らえません", "らえます", "らえない"])) {
        continue;
      }
      
      var fullVerb = word + suruForms[i];
      var suffix = this.matchSuffix_(afterVerb);
      if (suffix) {
        return { tokens: [fullVerb, suffix], length: fullVerb.length + suffix.length };
      }
      return { tokens: [fullVerb], length: fullVerb.length };
    }
  }
  
  if (!this.verbs__[word]) return null;
  
  for (var i = 0, len = masuForms.length; i < len; i++) {
    if (rest.startsWith(masuForms[i])) {
      var fullVerb = word + masuForms[i];
      var afterVerb = rest.substring(masuForms[i].length);
      var suffix = this.matchSuffix_(afterVerb);
      if (suffix) {
        return { tokens: [fullVerb, suffix], length: fullVerb.length + suffix.length };
      }
      return { tokens: [fullVerb], length: fullVerb.length };
    }
  }
  
  return null;
};

// Match conjugations of compound verbs ending in くる or いく
TinySegmenter.prototype.matchCompoundVerbConjugation_ = function(verb, rest) {
  var compoundEndings = this.SHARED_COMPOUND_ENDINGS;
  
  for (var ending in compoundEndings) {
    if (verb.length > ending.length && verb.endsWith(ending)) {
      var stem = verb.substring(0, verb.length - ending.length);
      var conjugations = compoundEndings[ending];
      
      for (var i = 0, len = conjugations.length; i < len; i++) {
        if (rest.startsWith(conjugations[i])) {
          var fullForm = stem + conjugations[i];
          var afterForm = rest.substring(conjugations[i].length);
          var suffix = this.matchSuffix_(afterForm);
          if (suffix) {
            return { tokens: [fullForm, suffix], length: fullForm.length + suffix.length };
          }
          return { tokens: [fullForm], length: fullForm.length };
        }
      }
      break;
    }
  }
  
  return null;
};

// Check if a hiragana string is a conjugated verb form (e.g. かえります, あります)
TinySegmenter.prototype.matchHiraganaVerbConjugation_ = function(str) {
  var hiraganaLen = this.getHiraganaLen_(str);
  
  if (hiraganaLen < 3) return null;
  
  var hiraStr = str.substring(0, hiraganaLen);
  var endingsToCheck = this.SHARED_MASU_TAI_ENDINGS.concat(this.SHARED_POTENTIAL_ENDINGS);
  
  for (var e = 0; e < endingsToCheck.length; e++) {
    var ending = endingsToCheck[e];
    var endPos = hiraStr.indexOf(ending);
    if (endPos > 0) {
      var stemPart = hiraStr.substring(0, endPos);
      var afterVerb = str.substring(stemPart.length + ending.length);
      var match = this.matchMappedVerb_(stemPart, ending, afterVerb);
      if (match) return match;
    }
  }
  
  var negEndings = this.SHARED_NEG_ENDINGS;
  for (var ne = 0; ne < negEndings.length; ne++) {
    var negEnding = negEndings[ne];
    var endPos = hiraStr.indexOf(negEnding);
    if (endPos > 0) {
      var stemPart = hiraStr.substring(0, endPos);
      var afterVerb = str.substring(stemPart.length + negEnding.length);
      var match = this.matchNegativeVerb_(stemPart, negEnding, afterVerb);
      if (match) return match;
    }
  }
  
  // Fallback for ichidan verbs with bare masu endings
  var bareMasuEndings = this.SHARED_BARE_MASU;
  for (var bm = 0; bm < bareMasuEndings.length; bm++) {
    var bareEnding = bareMasuEndings[bm];
    var endPos = hiraStr.indexOf(bareEnding);
    if (endPos > 0) {
      var stemPart = hiraStr.substring(0, endPos);
      if (this.verbs__[stemPart + "る"] === 2) {
        var fullConjugation = stemPart + bareEnding;
        return this.createTokenMatch_(fullConjugation, str.substring(fullConjugation.length));
      }
    }
  }
  
  return null;
};

// Match suffix (particle or auxiliary) at start of string
TinySegmenter.prototype.matchSuffix_ = function(str) {
  if (!str || str.length === 0) return null;
  
  // Don't consume copula/polite endings as suffixes; they should be separate tokens
  if (this.startsWithAny_(str, this.SHARED_COPULA_FORMS)) {
    return null;
  }
  
  // First, check if the string starts with a dictionary word; if so, don't match as a suffix
  for (var len = Math.min(str.length, 10); len > 1; len--) {
    var substr = str.substring(0, len);
    if (this.wordsDict__[substr] || this.nouns__[substr] || this.verbs__[substr] || this.irregularIAdj__[substr]) {
      return null;
    }
  }
  
  // CHECK PRIORITY WORDS; don't consume them as suffixes
  if (this.startsWithAny_(str, TinyDic.priorityWords)) {
    return null;
  }
  
  // This prevents "かえります" from being treated as suffix "か" + leftover
  var verbConjug = this.matchHiraganaVerbConjugation_(str) || this.matchPureHiraganaVerb_(str);
  if (verbConjug) {
    return null;
  }
  
  return this.startsWithAny_(str, this.SHARED_SUFFIXES);
}

// Find the next chunk when no dictionary match is found
TinySegmenter.prototype.findNextChunk_ = function(str) {
  if (!str || str.length === 0) return "";
  
  var firstCharType = this.ctype_(str.charAt(0));
  var chunk = str.charAt(0);
  
  // For kanji (H type), be more careful about word boundaries
  if (firstCharType === "H") {
    // Check if this single kanji is a counter or should be separate
    if (this.isCounter_(chunk)) {
      return chunk;
    }
    
    for (var i = 1; i < str.length; i++) {
      var char = str.charAt(i);
      var charType = this.ctype_(char);
      
      // Stop at hiragana (likely particle or verb ending)
      if (charType === "I") {
        // Check if this is a particle that should be separate
        var rest = str.substring(i);
        var particle = this.matchStandaloneParticle_(rest);
        if (particle) {
          break;
        }
        
        // Check for te-form followed by another word
        var teFormMatch = this.matchTeFormEnding_(rest);
        if (teFormMatch) {
          chunk += teFormMatch;
          break;
        }
        
        // Otherwise might be okurigana
        chunk += char;
        
        // Stop if next position has a particle or known word
        if (i + 1 < str.length) {
          var nextRest = str.substring(i + 1);
          if (this.startsWithParticle_(nextRest) || this.startsWithKnownWord_(nextRest)) {
            break;
          }
          
          // Also stop if next position starts a verb conjugation
          if (nextRest.length > 0 && this.ctype_(nextRest.charAt(0)) === "H") {
            var nextVerbMatch = this.matchVerbConjugation_(nextRest);
            if (nextVerbMatch) {
              break;
            }
          }
        }
      } else if (charType === "H") {
        // Check if this kanji should start a new word
        var testChunk = chunk + char;
        var kanjiRest = str.substring(i);
        
        // If remaining kanji starts a known word, stop here
        if (this.startsWithKnownWord_(kanjiRest)) {
          break;
        }
        
        // Check if remaining string is a verb conjugation
        var kanjiVerbMatch = this.matchVerbConjugation_(kanjiRest);
        if (kanjiVerbMatch) {
          break;
        }
        
        // Check if next kanji is a counter
        if (this.isCounter_(char)) {
          break;
        }
        
        chunk += char;
      } else {
        break;
      }
    }
    return chunk;
  }
  
  // For hiragana (I type), find word boundaries
  if (firstCharType === "I") {
    for (var i = 1; i < str.length; i++) {
      var char = str.charAt(i);
      var charType = this.ctype_(char);
      
      if (charType !== "I") {
        break;
      }
      
      // Check if remaining string starts with a known word or particle
      var rest = str.substring(i);
      if (this.startsWithKnownWord_(rest) || this.startsWithParticle_(rest)) {
        break;
      }
      
      chunk += char;
    }
    return chunk;
  }
  
  // For katakana (K type), group consecutive katakana
  if (firstCharType === "K") {
    for (var i = 1; i < str.length; i++) {
      var char = str.charAt(i);
      var charType = this.ctype_(char);
      
      // Allow ー (prolonged sound mark) in katakana
      if (charType !== "K" && char !== "ー") {
        break;
      }
      chunk += char;
    }
    return chunk;
  }
  
  // For other types (numbers, letters, symbols), group same type
  for (var i = 1; i < str.length; i++) {
    var char = str.charAt(i);
    var charType = this.ctype_(char);
    
    if (charType !== firstCharType) {
      break;
    }
    chunk += char;
  }
  
  return chunk;
}

// Check if a character is a counter
TinySegmenter.prototype.isCounter_ = function(char) {
  return TinyDic.counters && !!TinyDic.counters[char];
}

// Match standalone particles that should be separate (like で after a noun)
TinySegmenter.prototype.matchStandaloneParticle_ = function(str) {
  if (str.length > 0 && this.SHARED_STANDALONE_PARTICLES.indexOf(str.charAt(0)) !== -1) {
    if (str.length === 1) return str.charAt(0);
    var nextCharType = this.ctype_(str.charAt(1));
    if (nextCharType === "H" || nextCharType === "K" || this.startsWithKnownWord_(str.substring(1))) {
      return str.charAt(0);
    }
  }
  return null;
}

// Match te-form endings that should be attached to verbs
TinySegmenter.prototype.matchTeFormEnding_ = function(str) {
  var te = this.startsWithAny_(str, this.SHARED_TE_ENDINGS);
  if (te) {
    var afterTe = str.substring(te.length);
    if (afterTe.length > 0 && (this.ctype_(afterTe.charAt(0)) === "H" || this.startsWithKnownWord_(afterTe))) return te;
  }
  return null;
}

// Merge na-adjective with な, if it follows
TinySegmenter.prototype.mergeNaAdjectiveForms_ = function(tokens) {
  var result = [];
  for (var i = 0; i < tokens.length; i++) {
    if (this.naAdjectives__[tokens[i]] && i + 1 < tokens.length && tokens[i + 1] === "な") {
      result.push(tokens[i] + "な");
      i++;
    } else {
      result.push(tokens[i]);
    }
  }
  return result;
};

// Check if word is a complete i-adjective conjugation
TinySegmenter.prototype.isIAdjectiveForm_ = function(word) {
  var endings = this.sortedIAdjEndings__;
  
  for (var i = 0; i < endings.length; i++) {
    var ending = endings[i];
    if (word.length > ending.length && word.endsWith(ending)) {
      var stem = word.slice(0, -ending.length);
      if (this.iAdjectiveStems__[stem]) {
        return true;
      }
    }
  }
  
  // Special cases
  var irregulars = ["いい", "よい", "良い", "よさそう", "良さそう", "よさそうな", "良さそうな", "よさそうに", "良さそうに", "かっこいい", "カッコいい", "カッコイイ"];
  if (irregulars.indexOf(word) !== -1) return true;
  
  return false;
};

// Check if a string is a conjugated i-adjective and return the full form
TinySegmenter.prototype.matchIAdjective_ = function(text, startPos) {
  var maxLen = Math.min(12, text.length - startPos);
  
  for (var len = maxLen; len >= 2; len--) {
    var candidate = text.slice(startPos, startPos + len);
    var endings = this.sortedIAdjEndings__;
    
    for (var i = 0, eLen = endings.length; i < eLen; i++) {
      var ending = endings[i];
      if (candidate.length > ending.length && candidate.endsWith(ending)) {
        var stem = candidate.slice(0, -ending.length);
        
        if (stem === "かっこい" && ending === "い") {
          if (candidate === "かっこいい" || this.iAdjectiveStems__["かっこ"]) {
            return candidate;
          }
        }
        
        if (this.iAdjectiveStems__[stem]) {
          return candidate;
        }
      }
    }
  }
  
  return null;
};

// Ccheck for i-adjective forms to merge
TinySegmenter.prototype.mergeIAdjectiveForms_ = function(tokens) {
  var result = [];
  var i = 0;
  
  while (i < tokens.length) {
    // Try to find an i-adjective starting at this position
    var combined = "";
    var j = i;
    
    // Combine consecutive tokens to check for i-adjective
    while (j < tokens.length && combined.length < 15) {
      combined += tokens[j];
      
      // Check if combined string is a complete i-adjective form
      if (this.isIAdjectiveForm_(combined)) {
        var lastMatch = combined;
        var lastMatchEnd = j;
        
        while (j + 1 < tokens.length && combined.length < 15) {
          j++;
          combined += tokens[j];
          if (this.isIAdjectiveForm_(combined)) {
            lastMatch = combined;
            lastMatchEnd = j;
          }
        }
        
        result.push(lastMatch);
        i = lastMatchEnd + 1;
        break;
      }
      j++;
    }
    
    // No i-adjective match found, add current token as is
    if (j >= tokens.length || combined.length >= 15) {
      result.push(tokens[i]);
      i++;
    }
  }
  
  return result;
};

// Check if string starts with a particle
TinySegmenter.prototype.startsWithParticle_ = function(str) {
  return !!this.startsWithAny_(str, this.SHARED_START_PARTICLES);
}

// Check if string starts with a known word
TinySegmenter.prototype.startsWithKnownWord_ = function(str) {
  if (!str) return false;
  
  var maxLen = Math.min(str.length, 10);
  for (var len = maxLen; len > 1; len--) {
    var substr = str.substring(0, len);
    if (this.wordsDict__[substr] || this.nouns__[substr] || this.verbs__[substr] || this.verbs__[substr + "する"] || this.irregularIAdj__[substr]) {
      return true;
    }
  }
  // Also check single character kanji words (e.g., 目, 背, 手, 歌)
  // Only for kanji to avoid false positives with hiragana dictionary entries
  if (str.length >= 1 && this.ctype_(str.charAt(0)) === "H") {
    var singleChar = str.charAt(0);
    if (this.nouns__[singleChar] || this.wordsDict__[singleChar] || this.verbs__[singleChar] || this.verbs__[singleChar + "する"]) {
      return true;
    }
  }
  return false;
}

// Removes word from segmentation
TinySegmenter.prototype.removeWord = function (word) {
  if (word) {
    for (var a = ['verbs__', 'verbEndings__', 'nouns__', 'wordsDict__', 'iAdjectiveStems__', 'irregularIAdj__', 'naAdjectives__', 'particles__', 'auxiliaries__'], i = 0, j = a.length; i < j; i++) {
      if (this[a[i]][word]) {
        delete this[a[i]][word];
      }
    }
  }
};


// Dictionary for TinySegmenter
(function (window) {
  window.TinyDic = {
    // words that are given the highest priority and are NEVER split
    priorityWords : [
      "もの",
      "その後", "そのご",
      "どうしたら",
      "晴れる", "晴れました", "晴れます", "晴れない", "晴れなかった", "晴れれば", "晴れたら", "晴れて", "晴れた",
      "いただけません",
      "いただけます",
      "いただける",
      "いただけない",
      "いただけました",
      "いただければ",
      "いただけたら",
      "いただけて",
      "いただきません",
      "いただきます",
      "いただきました",
      "いただきましょう",
      "いただきたい",
      "いただいた",
      "いただいて",
      "いただかない",
      "いただく",
      "もらえません",
      "もらえます",
      "もらえる",
      "もらえない",
      "もらえました",
      "くれません",
      "くれます",
      "くれる",
      "くれない",
      "くれました",
      "くださいました",
      "くださいます",
      "くださいませ",
      "くださいません",
      "いらっしゃいます",
      "いらっしゃいました",
      "いらっしゃいません",
      "いらっしゃる",
      "おっしゃいます",
      "おっしゃいました",
      "おっしゃいません",
      "おっしゃる",
      "なさいます",
      "なさいました",
      "なさいません",
      "なさる",
      "いたします",
      "いたしました",
      "いたしません",
      "いたして",
      "いたした",
      "いたす",
      "でございます",
      "でございました",
      "でございません",
      "ございます",
      "ございました",
      "ございません",
      "いちねんせい",
      "さんねんせい",
      "ろくねんせい", 
      "じゃなかった",
      "にねんせい",
      "よねんせい",
      "ごねんせい",
      "じゅっさい",
      "じゃなくて",
      "いっさい",
      "はっさい",
      "ください",
      "じゃない",
      "ぜんぜん",
      "いつも",
      "はたち",
      "いいえ",
      "一年生",
      "二年生",
      "三年生", 
      "四年生", 
      "五年生", 
      "六年生",
      "ひま",
      "ええ",
      "よく",
      "この",
      "その",
      "あの",
      "どの",
      "しまいました",
      "しまいます",
      "しまいません",
      "しましょう",
      "しまった",
      "しまって",
      "しまう",
      "さしあげよう", "さしあげます", "さしあげました", "さしあげません", "さしあげましょう",
      "さしあげて", "さしあげた", "さしあげる", "さしあげない", "さしあげなかった",
      "さしあげれば", "さしあげたら"
    ].sort(function (a, b) { return b.length - a.length }),
    
    // all other words that are NOT nouns
    words : [
      "小学校", "しょうがっこう",
      "怠け者", "なまけもの",
      "何でも", "なんでも",
      "どうぞ",
      "かどうか",
      "夜遅く", "よるおそく",
      "だれにも",
      "だれか",
      "どこにも",
      "どこか",
      "から",
      "しか",
      "何も", "なにも",
      "何か", "なにか",
      "いけません",
      "いけない",
      "いけなかった",
      "ならない",
      "なりません",
      "ならなかった",
      "これ", "それ", "あれ", "どれ",
      "この", "その", "あの", "どの",
      "ここ", "そこ", "あそこ", "どこ",
      "こちら", "そちら", "あちら", "どちら",
      "こっち", "そっち", "あっち", "どっち",
      "こんな", "そんな", "あんな", "どんな",
      "こう", "そう", "ああ", "どう",
      "こういう", "そういう", "ああいう", "どういう",
      "こうした", "そうした", "ああした", "どうした",
      "とても",　"とっても", "すごく", "すっごく", "かなり", "ちょっと",
      "少し", "すこし", "もっと", "もう",
      "まだ", "やっと", "ついに", "やはり",
      "やっぱり", "たぶん", "多分", "きっと",
      "必ず", "かならず", "ぜひ", "是非",
      "決して", "けっして", "全然", "ぜんぜん",
      "全く", "まったく", "本当に", "ほんとうに",
      "ほんとに", "実は", "じつは", "実際",
      "じっさい", "特に", "とくに", "主に",
      "おもに", "だいたい", "大体", "ほとんど",
      "殆ど", "たくさん", "沢山", "いっぱい",
      "よく", "良く", "あまり", "余り",
      "なかなか", "いつも", "常に", "つねに",
      "時々", "ときどき", "たまに", "偶に", "たいてい",
      "めったに", "滅多に", "初めて", "はじめて",
      "再び", "ふたたび", "まず", "先ず",
      "次に", "つぎに", "最後に", "さいごに",
      "結局", "けっきょく", "つまり", "要するに",
      "ようするに", "例えば", "たとえば", "ただ",
      "只", "単に", "たんに", "急に",
      "きゅうに", "突然", "とつぜん", "徐々に",
      "じょじょに", "だんだん", "段々", "ますます",
      "益々", "どんどん", "ゆっくり", "はっきり",
      "しっかり", "ちゃんと", "きちんと", "ぴったり",
      "そろそろ", "ぼちぼち", "わざわざ", "わざと",
      "偶然", "ぐうぜん", "なぜ", "何故",
      "どうして", "なんで", "いつ", "どこ",
      "どうやって", "なぜなら", "だから", "しかし",
      "でも", "けど", "けれど", "けれども",
      "ところが", "ところで", "さて", "では",
      "それでは", "じゃあ", "または", "あるいは",
      "もしくは", "そして", "それから", "また",
      "さらに", "しかも", "その上", "それに",
      "なお", "ただし", "もし", "もしも",
      "たとえ", "仮に", "かりに", "万一",
      "まんいち", "一応", "いちおう",
      "ため", "為",
      "こと", "事",
      "もの", "物",
      "ところ", "所",
      "わけ", "訳",
      "はず", "筈",
      "よう", "様",
      "そう",
      "みたい",
      "らしい",
      "ほう", "方",
      "という",
      "といった",
      "といって",
      "とした",
      "として",
      "とする",
      "における",
      "において",
      "にとって",
      "について",
      "に関して",
      "に対して",
      "によって",
      "により",
      "による",
      "ようだった",
      "ようだ",
      "ようです",
      "ようでした",
      "そう",
      "そうな",
      "そうに",
      "みたいだった",
      "みたいだ",
      "みたいです",
      "みたいでした",
      "らしかった",
      "らしい",
      "らしいです",
      "にも",
      "でも",
      "とも",
      "へも",
      "からも",
      "までも",
      "よりも",
      "には",
      "では",
      "とは",
      "へは",
      "からは",
      "までは",
      "のは",
      "のが",
      "のを",
      "のも",
      "ので",
      "のに",
      "との",
      "への",
      "からの",
      "までの",
      "としては",
      "としても",
      "にとっては",
      "にとっても",
      "においては",
      "においても",
      "によっては",
      "によっても",
      "なら",
      "ならば",
      "たら",
      "たらば",
      "れば",
      "ければ",
      "おすすめ", "お勧め", "オススメ",
      "とおり", "通り",
      "とおりに", "通りに",
      "どおり",
      "どおりに",
      "そのとおり", "その通り",
      "おもしろい",
      "おもしろかった",
      "ために",
      "ものの",
      "ところに",
      "ところで",
      "ところが",
      "すぐ", "直ぐ",
      "すぐに",
      "ように",
      "ような",
      "ようにする",
      "ようにしている",
      "ようにしています",
      "ようになる",
      "ようになった",
      "ようになって",
      "ようにして",
      "ようにした",
      "ようにしたら",
      "によると",
      "によれば",
      "といえば", "と言えば",
      "といっても", "と言っても",
      "というのは",
      "ということ",
      "んです",
      "んですか",
      "んですが",
      "んですけど",
      "んだ",
      "なんです",
      "なんですか",
      "なんですが",
      "なんですけど",
      "なんだ",
      "がきっかけで",
      "きっかけ",
      "がきっかけ",
      "だろうか",
      "でしょうか",
      "だろう",
      "でしょう",
      "これで",
      "それで",
      "あれで",
      "方がいい", "ほうがいい",
      "らしい",
      "らしく",
      "らしくない",
      "らしかった",
      "かわいい",
      "かわいく",
      "かわいくない",
      "かわいかった",
      "かわいくなかった",
      "かっこいい",
      "かっこよく",
      "かっこよくない",
      "かっこよかった",
      "おいしい",
      "おいしく",
      "おいしそう",
      "おいしそうな",
      "てしまう",
      "てしまった",
      "てしまって",
      "でしまう",
      "でしまった",
      "でしまって",
      "ちゃう",
      "ちゃった",
      "じゃう",
      "じゃった",
      "ておく",
      "ておいた",
      "ておいて",
      "でおく",
      "でおいた",
      "でおいて",
      "とく",
      "といた",
      "どく",
      "どいた",
      "てみる",
      "てみた",
      "てみて",
      "てみよう",
      "でみる",
      "でみた",
      "でみて",
      "でみよう",
      "ていく",
      "ていった",
      "ていって",
      "でいく",
      "でいった",
      "でいって",
      "てくる",
      "てきた",
      "てきて",
      "でくる",
      "できた",
      "できて",
      "ない",
      "なかった",
      "なくて",
      "なくなる",
      "なくなった",
      "なくなって",
      "なくなってしまう",
      "しています",
      "しておく",
      "しておいた",
      "しておいて",
      "してしまう",
      "してしまった",
      "してみる",
      "してみた",
      "してみよう",
      "なった",
      "なって",
      "なる",
      "なります",
      "なりたい",
      "なりたいです",
      "したい",
      "したいです",
      "したかった",
      "したら",
      "すれば",
      "すると",
      "格好いい", "カッコいい",
      "かっこ悪い",
      "多く", "おおく",
      "少なく", "すくなく",
      "ずっと",
      "なんとか", "何とか",
      "とりあえず", "取り敢えず",
      "いきなり",
      "せっかく",
      "ぜんぶ", "全部",
      "ほんの",
      "たった",
      "ようやく", "漸く",
      "ようになり",
      "ようにし",
      "みたいな",
      "みたいに",
      "かもしれない",
      "かもしれません",
      "というか", "と言うか",
      "というより", "と言うより",
      "に比べて",
      "のために",
      "のおかげで",
      "のせいで",
      "をきっかけに",
      "本当", "ほんとう",
      "予習", "よしゅう",
      "復習", "ふくしゅう",
      "がっかり"
    ],
    
    // all nouns/na-adjectives (na-adjectives are automatically merged into this array)
    nouns : [
      "世界中", "せかいじゅう",
      "我慢", "がまん",
      "嘘", "うそ",
      "悪口", "わるぐち",
      "階段", "かいだん",
      "毎朝", "まいあさ",
      "徹夜", "てつや",
      "相手", "あいて",
      "靴下", "くつした",
      "お守り", "おまもり",
      "用事", "ようじ",
      "代わりに", "かわりに",
      "説明", "せつめい",
      "親友", "しんゆう",
      "一人暮らし", "ひとりぐらし",
      "お願い", "おねがい",
      "神様", "かみさま",
      "お嬢さん", "おじょうさん",
      "書類", "しょるい",
      "部下", "ぶか",
      "贅沢", "ぜいたく",
      "昔", "むかし",
      "昔々", "むかしむかし",
      "大統領", "だいとうりょう",
      "社長", "しゃちょう",
      "市長", "しちょう",
      "日記", "にっき",
      "泥棒", "どろぼう",
      "昼寝", "ひるね",
      "バカ", "ばか", "馬鹿",
      "田舎", "いなか",
      "部長", "ぶちょう",
      "何歳", "なんさい",
      "世話", "せわ",
      "恥ずかしがり屋", "はずかしがりや",
      "天気予報", "てんきようほう",
      "間違い", "まちがい",
      "お子さん", "おこさん",
      "家賃", "やちん",
      "洋服", "ようふく",
      "旅行", "りょこう",
      "電気代", "でんきだい",
      "男子", "だんし",
      "女子", "じょし",
      "目覚まし時計", "めざましどけい",
      "蝋燭", "ろうそく",
      "就職", "しゅうしょく",
      "その後", "そのご",
      "ご主人", "ごしゅじん",
      "主人", "しゅじん",
      "何度も", "なんども",
      "年代", "ねんだい",
      "文字", "もじ",
      "作品", "さくひん",
      "地震", "じしん",
      "大家さん", "おおやさん",
      "お祈り", "おいのり",
      "お湯", "おゆ",
      "髭", "ひげ",
      "縫い包み", "ぬいぐるみ",
      "電子レンジ", "でんしレンジ",
      "パンダ",
      "以外", "いがい",
      "味方", "みかた",
      "秘密", "ひみつ",
      "道具", "どうぐ",
      "他", "ほか",
      "朝寝坊", "あさねぼう",
      "台風", "たいふう",
      "奨学金", "しょうがくきん",
      "建物", "たてもの",
      "若者", "わかもの",
      "一年中", "いちねんじゅう",
      "広島", "ひろしま",
      "神社", "じんじゃ",
      "島", "しま",
      "地下", "ちか",
      "渋谷", "しぶや",
      "旅館", "りょかん",
      "家具", "かぐ",
      "一日中", "いちにちじゅう",
      "お店", "おみせ",
      "達", "たち",
      "楽器", "がっき",
      "鉛筆", "えんぴつ",
      "漫画", "まんが",
      "手袋", "てぶくろ",
      "両親", "りょうしん",
      "紅茶", "こうちゃ",
      "けち",
      "指輪", "ゆびわ",
      "玩具", "おもちゃ",
      "お皿", "おさら",
      "化粧品", "けしょうひん",
      "一生", "いっしょう",
      "一生懸命", "いっしょうけんめい",
      "一度", "いちど",
      "着物", "きもの",
      "水着", "みずぎ",
      "お弁当", "おべんとう",
      "すき焼き", "すきやき",
      "物価", "ぶっか",
      "一ヶ月", "一か月", "一カ月", "一ヵ月", "いっかげつ",
      "二ヶ月", "二か月", "二カ月", "二ヵ月", "にかげつ",
      "弁護士", "べんごし",
      "空手", "からて",
      "ヤクザ", "やくざ",
      "文法", "ぶんぽう",
      "喉", "のど",
      "お手洗い", "おてあらい",
      "切符", "きっぷ",
      "近所", "きんじょ",
      "花", "はな",
      "誕生日", "たんじょうび",
      "寮", "りょう",
      "歌手", "かしゅ",
      "喧嘩", "けんか", "ケンカ",
      "富士山", "ふじさん",
      "お祭り", "おまつり",
      "荷物", "にもつ",
      "お正月", "おしょうがつ",
      "出口", "でぐち",
      "今度", "こんど",
      "有名人", "ゆうめいじん",
      "ひらがな",
      "外国語", "がいこくご",
      "春", "はる",
      "夏", "なつ",
      "秋", "あき",
      "冬", "ふゆ",
      "週間", "しゅうかん",
      "地下鉄", "ちかてつ",
      "お金持ち", "おかねもち",
      "つもり",
      "牛乳", "ぎゅうにゅう",
      "一番", "いちばん",
      "本州", "ほんしゅう",
      "四国", "しこく",
      "九州", "きゅうしゅう",
      "名古屋", "なごや",
      "年上", "としうえ",
      "新幹線", "しんかんせん",
      "課", "か",
      "漢字", "かんじ",
      "子", "こ",
      "歌舞伎", "かぶき",
      "人気", "にんき",
      "何時", "なんじ",
      "お風呂", "おふろ",
      "お酒", "おさけ",
      "蜜柑", "みかん", "ミカン",
      "食堂", "しょくどう",
      "曇り", "くもり",
      "明後日", "あさって",
      "気温", "きおん",
      "晴れ", "はれ",
      "休み", "やすみ",
      "電気", "でんき",
      "分", "ふん", "ぶん",
      "北口", "きたぐち",
      "南口", "みなみぐち",
      "西口", "にしぐち",
      "東口", "ひがしぐち",
      "北", "きた",
      "南", "みなみ",
      "西", "にし",
      "東", "ひがし",
      "外国人", "がいこくじん",
      "大変", "たいへん",
      "たばこ", "タバコ",
      "人", "ひと",
      "人々", "ひとびと",
      "男", "おとこ",
      "女", "おんな",
      "子供", "子ども", "こども",
      "大人", "おとな",
      "親", "おや",
      "お父さん", "おとうさん",
      "父", "ちち",
      "父親", "ちちおや",
      "お母さん", "おかあさん",
      "母", "はは",
      "お兄さん", "おにいさん",
      "兄", "あに",
      "お姉さん", "おねえさん",
      "お婆さん", "おばあさん", "おばさん",
      "お爺さん", "おじいさん", "おじさん",
      "姉", "あね",
      "弟", "おとうと",
      "妹", "いもうと",
      "息子", "むすこ",
      "娘", "むすめ",
      "兄弟", "きょうだい",
      "家族", "かぞく",
      "祖父", "そふ",
      "祖母", "そぼ",
      "孫", "まご",
      "夫", "おっと",
      "妻", "つま",
      "友達", "友だち", "ともだち",
      "友人", "ゆうじん",
      "先生", "せんせい",
      "学生", "がくせい",
      "生徒", "せいと",
      "医者", "いしゃ",
      "会社員", "かいしゃいん",
      "店員", "てんいん",
      "警察", "けいさつ",
      "彼", "かれ",
      "彼女", "かのじょ",
      "私", "わたし",
      "貴方", "あなた",
      "僕", "ぼく",
      "俺", "おれ",
      "自分", "じぶん",
      "皆", "みんな", "みな",
      "誰", "だれ",
      "方", "かた",
      "者", "もの",
      "場所", "ばしょ",
      "所", "ところ",
      "家", "いえ", "うち",
      "部屋", "へや",
      "学校", "がっこう",
      "会社", "かいしゃ",
      "病院", "びょういん",
      "店", "みせ",
      "駅", "えき",
      "空港", "くうこう",
      "国", "くに",
      "町", "まち",
      "村", "むら",
      "市", "し",
      "県", "けん",
      "都", "と",
      "道", "みち",
      "橋", "はし",
      "川", "かわ",
      "山", "やま",
      "海", "うみ",
      "森", "もり",
      "公園", "こうえん",
      "図書館", "としょかん",
      "映画館", "えいがかん",
      "世界", "せかい",
      "地球", "ちきゅう",
      "外国", "がいこく",
      "中国", "ちゅうごく",
      "韓国", "かんこく",
      "日本", "にほん", "にっぽん",
      "東京", "とうきょう",
      "大阪", "おおさか",
      "京都", "きょうと",
      "物", "もの",
      "事", "こと",
      "時", "とき",
      "時間", "じかん",
      "年", "とし", "ねん",
      "月", "つき", "げつ",
      "日", "ひ", "にち",
      "週", "しゅう",
      "朝", "あさ",
      "昼", "ひる",
      "夜", "よる",
      "今", "いま",
      "前", "まえ",
      "後", "あと",
      "後ろ", "うしろ",
      "間", "あいだ",
      "上", "うえ",
      "下", "した",
      "中", "なか",
      "外", "そと",
      "右", "みぎ",
      "左", "ひだり",
      "隣", "となり",
      "側", "そば",
      "本", "ほん",
      "紙", "かみ",
      "手紙", "てがみ",
      "新聞", "しんぶん",
      "雑誌", "ざっし",
      "写真", "しゃしん",
      "絵", "え",
      "映画", "えいが",
      "映画祭", "えいがさい",
      "音楽", "おんがく",
      "歌", "うた",
      "車", "くるま",
      "電車", "でんしゃ",
      "自転車", "じてんしゃ",
      "飛行機", "ひこうき",
      "船", "ふね",
      "電話", "でんわ",
      "携帯", "けいたい",
      "パソコン",
      "コンピューター",
      "テレビ",
      "ラジオ",
      "カメラ",
      "机", "つくえ",
      "椅子", "いす",
      "窓", "まど",
      "ドア",
      "鍵", "かぎ",
      "傘", "かさ",
      "鞄", "かばん",
      "財布", "さいふ",
      "時計", "とけい",
      "眼鏡", "めがね",
      "服", "ふく",
      "靴", "くつ",
      "帽子", "ぼうし",
      "水", "みず",
      "お茶", "おちゃ",
      "コーヒー",
      "酒", "さけ",
      "ご飯", "ごはん",
      "食べ物", "たべもの",
      "飲み物", "のみもの",
      "肉", "にく",
      "魚", "さかな",
      "野菜", "やさい",
      "果物", "くだもの",
      "卵", "たまご",
      "パン",
      "お金", "おかね",
      "仕事", "しごと",
      "勉強", "べんきょう",
      "練習", "れんしゅう",
      "試験", "しけん",
      "問題", "もんだい",
      "答え", "こたえ",
      "質問", "しつもん",
      "意味", "いみ",
      "理由", "りゆう",
      "方法", "ほうほう",
      "目的", "もくてき",
      "結果", "けっか",
      "原因", "げんいん",
      "関係", "かんけい",
      "影響", "えいきょう",
      "経験", "けいけん",
      "記憶", "きおく",
      "知識", "ちしき",
      "情報", "じょうほう",
      "ニュース",
      "話", "はなし",
      "言葉", "ことば",
      "名前", "なまえ",
      "声", "こえ",
      "音", "おと",
      "色", "いろ",
      "形", "かたち",
      "大きさ", "おおきさ",
      "数", "かず",
      "量", "りょう",
      "程度", "ていど",
      "種類", "しゅるい",
      "気持ち", "きもち",
      "心", "こころ",
      "体", "からだ",
      "頭", "あたま",
      "顔", "かお",
      "目", "め",
      "耳", "みみ",
      "鼻", "はな",
      "口", "くち",
      "歯", "は",
      "手", "て",
      "足", "あし",
      "指", "ゆび",
      "髪", "かみ",
      "背", "せ",
      "腹", "はら",
      "胸", "むね",
      "首", "くび",
      "肩", "かた",
      "腕", "うで",
      "膝", "ひざ",
      "命", "いのち",
      "生活", "せいかつ",
      "人生", "じんせい",
      "社会", "しゃかい",
      "文化", "ぶんか",
      "歴史", "れきし",
      "政治", "せいじ",
      "経済", "けいざい",
      "科学", "かがく",
      "技術", "ぎじゅつ",
      "自然", "しぜん",
      "環境", "かんきょう",
      "天気", "てんき",
      "空", "そら",
      "雲", "くも",
      "雨", "あめ",
      "雪", "ゆき",
      "風", "かぜ",
      "太陽", "たいよう",
      "星", "ほし",
      "火", "ひ",
      "光", "ひかり",
      "影", "かげ",
      "力", "ちから",
      "夢", "ゆめ",
      "希望", "きぼう",
      "愛", "あい",
      "幸せ", "しあわせ",
      "平和", "へいわ",
      "自由", "じゆう",
      "安全", "あんぜん",
      "危険", "きけん",
      "病気", "びょうき",
      "健康", "けんこう",
      "薬", "くすり",
      "国際", "こくさい",
      "ショック",
      "ため",
      "動物", "どうぶつ",
      "犬", "いぬ",
      "猫", "ねこ",
      "鳥", "とり",
      "魚",
      "虫", "むし",
      "馬", "うま",
      "牛", "うし",
      "豚", "ぶた",
      "羊", "ひつじ",
      "象", "ぞう",
      "猿", "さる",
      "熊", "くま",
      "兎", "うさぎ",
      "鼠", "ねずみ",
      "蛇", "へび",
      "亀", "かめ",
      "蛙", "かえる",
      "お腹", "おなか",
      "時代", "じだい",
      "学生時代", "がくせいじだい",
      "何回", "なんかい",
      "柔道", "じゅうどう",
      "けが", "怪我", "ケガ",
      "ラグビー",
      "今日", "きょう",
      "明日", "あした", "あす",
      "昨日", "きのう",
      "今週", "こんしゅう",
      "来週", "らいしゅう",
      "先週", "せんしゅう",
      "今月", "こんげつ",
      "来月", "らいげつ",
      "先月", "せんげつ",
      "今年", "ことし",
      "来年", "らいねん",
      "去年", "きょねん",
      "毎日", "まいにち",
      "毎週", "まいしゅう",
      "毎月", "まいつき",
      "毎年", "まいとし",
      "午前", "ごぜん",
      "午後", "ごご",
      "夕方", "ゆうがた",
      "夕べ", "ゆうべ",
      "今朝", "けさ",
      "今晩", "こんばん",
      "最近", "さいきん",
      "将来", "しょうらい",
      "過去", "かこ",
      "現在", "げんざい",
      "未来", "みらい",
      "電子メール",
      "携帯電話", "けいたいでんわ",
      "運転手", "うんてんしゅ",
      "お客さん", "おきゃくさん",
      "客", "きゃく",
      "乗客", "じょうきゃく",
      "観光客", "かんこうきゃく",
      "留学生", "りゅうがくせい",
      "大学生", "だいがくせい",
      "高校生", "こうこうせい",
      "中学生", "ちゅうがくせい",
      "小学生", "しょうがくせい",
      "幼稚園", "ようちえん",
      "保育園", "ほいくえん",
      "大学院", "だいがくいん",
      "大学院生", "だいがくいんせい",
      "研究室", "けんきゅうしつ",
      "事務所", "じむしょ",
      "工場", "こうじょう",
      "銀行", "ぎんこう",
      "郵便局", "ゆうびんきょく",
      "交番", "こうばん",
      "消防署", "しょうぼうしょ",
      "市役所", "しやくしょ",
      "区役所", "くやくしょ",
      "美術館", "びじゅつかん",
      "博物館", "はくぶつかん",
      "動物園", "どうぶつえん",
      "水族館", "すいぞくかん",
      "遊園地", "ゆうえんち",
      "百貨店", "ひゃっかてん",
      "デパート",
      "スーパー",
      "コンビニ",
      "レストラン",
      "カフェ",
      "居酒屋", "いざかや",
      "喫茶店", "きっさてん",
      "本屋", "ほんや",
      "花屋", "はなや",
      "肉屋", "にくや",
      "魚屋", "さかなや",
      "八百屋", "やおや",
      "薬局", "やっきょく",
      "交差点", "こうさてん",
      "信号", "しんごう",
      "横断歩道", "おうだんほどう",
      "歩道", "ほどう",
      "車道", "しゃどう",
      "高速道路", "こうそくどうろ",
      "国道", "こくどう",
      "県道", "けんどう",
      "血液", "けつえき",
      "血圧", "けつあつ",
      "体温", "たいおん",
      "体重", "たいじゅう",
      "身長", "しんちょう",
      "視力", "しりょく",
      "聴力", "ちょうりょく",
      "症状", "しょうじょう",
      "治療", "ちりょう",
      "手術", "しゅじゅつ",
      "入院", "にゅういん",
      "退院", "たいいん",
      "通院", "つういん",
      "診察", "しんさつ",
      "検査", "けんさ",
      "注射", "ちゅうしゃ",
      "風邪", "かぜ",
      "熱", "ねつ",
      "咳", "せき",
      "頭痛", "ずつう",
      "腹痛", "ふくつう",
      "歯痛", "しつう",
      "腰痛", "ようつう",
      "肩こり", "かたこり",
      "筋肉", "きんにく",
      "骨", "ほね",
      "皮膚", "ひふ",
      "内臓", "ないぞう",
      "心臓", "しんぞう",
      "肝臓", "かんぞう",
      "腎臓", "じんぞう",
      "肺", "はい",
      "胃", "い",
      "腸", "ちょう",
      "脳", "のう",
      "感情", "かんじょう",
      "気分", "きぶん",
      "機嫌", "きげん",
      "興味", "きょうみ",
      "関心", "かんしん",
      "注目", "ちゅうもく",
      "期待", "きたい",
      "不安", "ふあん",
      "心配", "しんぱい",
      "緊張", "きんちょう",
      "興奮", "こうふん",
      "感動", "かんどう",
      "感謝", "かんしゃ",
      "後悔", "こうかい",
      "反省", "はんせい",
      "満足", "まんぞく",
      "不満", "ふまん",
      "怒り", "いかり",
      "悲しみ", "かなしみ",
      "喜び", "よろこび",
      "驚き", "おどろき",
      "恐怖", "きょうふ",
      "退屈", "たいくつ",
      "仕事", "しごと",
      "作業", "さぎょう",
      "業務", "ぎょうむ",
      "職業", "しょくぎょう",
      "職場", "しょくば",
      "会議", "かいぎ",
      "打ち合わせ", "うちあわせ",
      "出張", "しゅっちょう",
      "残業", "ざんぎょう",
      "休暇", "きゅうか",
      "有給", "ゆうきゅう",
      "給料", "きゅうりょう",
      "収入", "しゅうにゅう",
      "支出", "ししゅつ",
      "利益", "りえき",
      "損失", "そんしつ",
      "契約", "けいやく",
      "取引", "とりひき",
      "交渉", "こうしょう",
      "提案", "ていあん",
      "企画", "きかく",
      "計画", "けいかく",
      "予定", "よてい",
      "目標", "もくひょう",
      "成果", "せいか",
      "実績", "じっせき",
      "評価", "ひょうか",
      "昇進", "しょうしん",
      "転職", "てんしょく",
      "面接", "めんせつ",
      "履歴書", "りれきしょ",
      "授業", "じゅぎょう",
      "授業中", "じゅぎょうちゅう",
      "講義", "こうぎ",
      "講座", "こうざ",
      "教科書", "きょうかしょ",
      "参考書", "さんこうしょ",
      "辞書", "じしょ",
      "辞典", "じてん",
      "宿題", "しゅくだい",
      "課題", "かだい",
      "レポート",
      "論文", "ろんぶん",
      "卒論", "そつろん",
      "発表", "はっぴょう",
      "成績", "せいせき",
      "単位", "たんい",
      "卒業式", "そつぎょうしき",
      "入学式", "にゅうがくしき",
      "学期", "がっき",
      "学年", "がくねん",
      "専攻", "せんこう",
      "専門", "せんもん",
      "分野", "ぶんや",
      "インターネット",
      "ウェブサイト",
      "ホームページ",
      "アプリ",
      "ソフト",
      "ソフトウェア",
      "ハードウェア",
      "データ",
      "ファイル",
      "フォルダ",
      "ダウンロード",
      "アップロード",
      "メール",
      "パスワード",
      "アカウント",
      "ログイン",
      "ログアウト",
      "検索", "けんさく",
      "設定", "せってい",
      "機能", "きのう",
      "操作", "そうさ",
      "画面", "がめん",
      "画像", "がぞう",
      "動画", "どうが",
      "音声", "おんせい",
      "通知", "つうち",
      "更新", "こうしん",
      "削除", "さくじょ",
      "保存", "ほぞん",
      "送信", "そうしん",
      "受信", "じゅしん",
      "料理", "りょうり",
      "食事", "しょくじ",
      "朝食", "ちょうしょく",
      "昼食", "ちゅうしょく",
      "夕食", "ゆうしょく",
      "朝ご飯", "あさごはん",
      "昼ご飯", "ひるごはん",
      "晩ご飯", "ばんごはん",
      "夜ご飯", "よるごはん",
      "ごちそう", "ご馳走", "御馳走",
      "おやつ",
      "デザート",
      "弁当", "べんとう",
      "定食", "ていしょく",
      "丼", "どんぶり",
      "ラーメン",
      "うどん",
      "そば",
      "寿司", "すし",
      "刺身", "さしみ",
      "天ぷら", "てんぷら",
      "焼き鳥", "やきとり",
      "焼肉", "やきにく",
      "鍋", "なべ",
      "味噌汁", "みそしる",
      "漬物", "つけもの",
      "サラダ",
      "スープ",
      "カレー",
      "ハンバーグ",
      "ステーキ",
      "ピザ",
      "パスタ",
      "サンドイッチ",
      "ケーキ",
      "アイスクリーム",
      "チョコレート",
      "お菓子", "おかし",
      "調味料", "ちょうみりょう",
      "醤油", "しょうゆ",
      "味噌", "みそ",
      "塩", "しお",
      "砂糖", "さとう",
      "酢", "す",
      "油", "あぶら",
      "バター",
      "マヨネーズ",
      "ケチャップ",
      "ソース",
      "おはよう",
      "おはようございます",
      "こんにちは",
      "こんばんは",
      "さようなら",
      "おやすみ",
      "おやすみなさい",
      "ありがとう",
      "ありがとうございます",
      "すみません",
      "ごめんなさい",
      "ごめん",
      "いただきます",
      "ごちそうさま",
      "ごちそうさまでした",
      "おねがいします",
      "お願いします",
      "よろしく",
      "よろしくお願いします",
      "はじめまして",
      "初めまして",
      "お元気ですか",
      "おかげさまで",
      "お疲れ様", "おつかれさま",
      "お疲れ様です", "おつかれさまです",
      "お疲れ様でした", "おつかれさまでした",
      "ご苦労様", "ごくろうさま",
      "いってきます",
      "いってらっしゃい",
      "ただいま",
      "おかえり",
      "おかえりなさい",
      "お邪魔します", "おじゃまします",
      "失礼します", "しつれいします",
      "失礼しました", "しつれいしました",
      "それで",
      "だから",
      "したがって",
      "従って",
      "そのため",
      "すると",
      "ところが",
      "しかしながら",
      "にもかかわらず",
      "それにもかかわらず",
      "一方", "いっぽう",
      "他方", "たほう",
      "反面", "はんめん",
      "逆に", "ぎゃくに",
      "むしろ",
      "かえって",
      "それどころか",
      "それはさておき",
      "ともかく",
      "とにかく",
      "いずれにしても",
      "いずれにせよ",
      "どちらにしても",
      "どちらにせよ",
      "要は", "ようは",
      "つまるところ",
      "結局のところ",
      "言い換えれば",
      "すなわち",
      "即ち",
      "換言すれば",
      "別の言い方をすれば",
      "具体的には",
      "例を挙げると",
      "というのは",
      "というのも",
      "なぜかというと",
      "なぜなら",
      "その理由は",
      "というわけで",
      "そういうわけで",
      "こうして",
      "このように",
      "そのように",
      "同様に", "どうように",
      "同じく", "おなじく",
      "加えて", "くわえて",
      "その上", "そのうえ",
      "さらには",
      "おまけに",
      "挙げ句", "あげく",
      "挙げ句の果てに",
      "ついには",
      "とうとう",
      "ようやく",
      "やがて",
      "いよいよ",
      "まさに",
      "正に",
      "確かに", "たしかに",
      "もちろん",
      "当然", "とうぜん",
      "無論", "むろん",
      "言うまでもなく",
      "明らかに", "あきらかに",
      "おそらく",
      "恐らく",
      "たぶん",
      "多分",
      "もしかすると",
      "もしかしたら",
      "ひょっとすると",
      "ひょっとしたら",
      "万が一", "まんがいち",
      "仮に", "かりに",
      "なに", "何",
      "なん",
      "だれ", "誰",
      "どなた",
      "いつ",
      "どこ",
      "どちら",
      "どれ",
      "どの",
      "どんな",
      "どう",
      "どのように",
      "どうやって",
      "なぜ",
      "どうして",
      "なんで",
      "いくつ",
      "いくら",
      "どのくらい",
      "どれくらい",
      "どれほど",
      "どれだけ",
      "ということだ",
      "とのことだ",
      "そうだ",
      "らしい",
      "ようだ",
      "みたいだ",
      "かもしれない",
      "かもしれません",
      "に違いない", "にちがいない",
      "に決まっている", "にきまっている",
      "はずだ",
      "はずがない",
      "わけだ",
      "わけがない",
      "わけではない",
      "わけにはいかない",
      "ことができる",
      "ことがある",
      "ことにする",
      "ことになる",
      "ようにする",
      "ようになる",
      "ことはない",
      "必要がある", "ひつようがある",
      "必要はない", "ひつようはない",
      "べきだ",
      "べきではない",
      "ほうがいい",
      "てもいい",
      "てはいけない",
      "てはならない",
      "なければならない",
      "なくてはならない",
      "ないといけない",
      "なくてはいけない",
      "ざるを得ない", "ざるをえない",
      "日曜日", "にちようび",
      "月曜日", "げつようび",
      "火曜日", "かようび",
      "水曜日", "すいようび",
      "木曜日", "もくようび",
      "金曜日", "きんようび",
      "土曜日", "どようび",
      "曜日", "ようび",
      "さん",
      "さま", "様",
      "くん", "君",
      "ちゃん",
      "せんせい",
      "先輩", "せんぱい",
      "後輩", "こうはい",
      "殿", "どの",
      "氏",
      "日本人", "にほんじん",
      "日本語", "にほんご",
      "中国語", "ちゅうごくご",
      "英語", "えいご",
      "フランス語", "フランスご",
      "スペイン語", "スペインご",
      "北海道", "ほっかいどう",
      "駅員", "えきいん",
      "授業料", "じゅぎょうりょう",
      "甘い物", "あまいもの",
      "冊", "さつ",
      "個", "こ",
      "本", "ほん",
      "枚", "まい",
      "台", "だい",
      "匹", "ひき",
      "頭", "とう",
      "羽", "わ",
      "杯", "はい",
      "回", "かい",
      "度", "ど",
      "番", "ばん",
      "階", "かい",
      "歳", "さい",
      "才",
      "人", "にん",
      "名", "めい",
      "件", "けん",
      "軒", "けん",
      "足", "そく",
      "着", "ちゃく",
      "通", "つう",
      "部", "ぶ",
      "曲", "きょく",
      "品", "しな",
      "組", "くみ",
      "列", "れつ",
      "種", "しゅ",
      "類", "るい",
      "北海道",
      "沖縄", "おきなわ",
      "北海", "ほっかい",
      "中国人", "ちゅうごくじん",
      "韓国人", "かんこくじん",
      "韓国語", "かんこくご",
      "アメリカ人", "アメリカじん",
      "イギリス人", "イギリスじん",
      "フランス人", "フランスじん",
      "年生", "ねんせい",
      "何年生", "なんねんせい",
      "一年生", "いちねんせい",
      "二年生", "にねんせい",
      "三年生", "さんねんせい",
      "四年生", "よねんせい",
      "五年生", "ごねんせい",
      "六年生", "ろくねんせい",
      "はたち",
      "歳", "さい",
      "いっさい",
      "はっさい",
      "じゅっさい",
      "じっさい",
      "零",　"ぜろ",　"ゼロ",　"れい",
      "一",　"いち",
      "二",　"に",
      "三",　"さん",
      "四", "よん", "し",
      "五",　"ご",
      "六",　"ろく",
      "七", "なな", "しち",
      "八",　"はち",
      "九", "きゅう", "く",
      "十",　"じゅう",
      "百",　"ひゃく",　"びゃく",　"ろっぴゃく",　"はっぴゃく",
      "千",　"せん",　"はっせん",　"ぜん",
      "万", "まん",
      "半", "はん",
      "ごろ",
      "円",　"えん",
      "いいえ",
      "看護師", "かんごし",
      "番号", "ばんごう",
      "大学", "だいがく",
      "高校", "こうこう",
      "桜", "さくら",
      "週末", "しゅうまつ",
      "バス停", "バスてい",
      "買い物", "買いもの", "かいもの",
      "お寺", "おてら",
      "横浜", "よこはま",
      "一緒", "いっしょ",
      "お土産", "おみやげ",
      "本当", "ほんとう",
      "予習", "よしゅう",
      "復習", "ふくしゅう"
    ],
    
    counters : [
      "冊", "個", "本", "枚", "台", "匹", "頭", "羽", "杯", "回",
      "度", "番", "階", "歳", "才", "人", "名", "件", "軒", "足",
      "着", "通", "部", "曲", "品", "組", "列", "種", "類"
    ],
    

    // 1 = godan (u-verb)
    // 2 = ichidan (ru-verb)
    // 3 = irregular verbs
    verbs : {
      // godan verbs (u-verbs)
      "会う": 1, "あう": 1,
      "言う": 1, "いう": 1,
      "歌う": 1, "うたう": 1,
      "買う": 1, "かう": 1,
      "拾う": 1, "ひろう": 1,
      "使う": 1, "つかう": 1,
      "払う": 1, "はらう": 1,
      "習う": 1, "ならう": 1,
      "洗う": 1, "あらう": 1,
      "追う": 1, "おう": 1,
      "思う": 1, "おもう": 1,
      "違う": 1, "ちがう": 1,
      "笑う": 1, "わらう": 1,
      "誘う": 1, "さそう": 1,
      "吸う": 1, "すう": 1,
      "救う": 1, "すくう": 1,
      "問う": 1, "とう": 1,
      "行く": 1, "いく": 1, "ゆく": 1,
      "書く": 1, "かく": 1,
      "聞く": 1, "きく": 1,
      "歩く": 1, "あるく": 1,
      "動く": 1, "うごく": 1,
      "置く": 1, "おく": 1,
      "届く": 1, "とどく": 1,
      "開く": 1, "ひらく": 1, "あく": 1,
      "働く": 1, "はたらく": 1,
      "引く": 1, "ひく": 1,
      "弾く": 1,
      "吹く": 1, "ふく": 1,
      "磨く": 1, "みがく": 1,
      "焼く": 1, "やく": 1,
      "泳ぐ": 1, "およぐ": 1,
      "脱ぐ": 1, "ぬぐ": 1,
      "急ぐ": 1, "いそぐ": 1,
      "注ぐ": 1, "そそぐ": 1,
      "話す": 1, "はなす": 1,
      "出す": 1, "だす": 1,
      "返す": 1, "かえす": 1,
      "貸す": 1, "かす": 1,
      "押す": 1, "おす": 1,
      "消す": 1, "けす": 1,
      "探す": 1, "さがす": 1,
      "指す": 1, "さす": 1,
      "差す": 1,
      "殺す": 1, "ころす": 1,
      "直す": 1, "なおす": 1,
      "治す": 1,
      "外す": 1, "はずす": 1,
      "回す": 1, "まわす": 1,
      "渡す": 1, "わたす": 1,
      "立つ": 1, "たつ": 1,
      "持つ": 1, "もつ": 1,
      "待つ": 1, "まつ": 1,
      "打つ": 1, "うつ": 1,
      "勝つ": 1, "かつ": 1,
      "育つ": 1, "そだつ": 1,
      "経つ": 1, "たつ": 1,
      "死ぬ": 1, "しぬ": 1,
      "遊ぶ": 1, "あそぶ": 1,
      "運ぶ": 1, "はこぶ": 1,
      "呼ぶ": 1, "よぶ": 1,
      "飛ぶ": 1, "とぶ": 1,
      "並ぶ": 1, "ならぶ": 1,
      "選ぶ": 1, "えらぶ": 1,
      "学ぶ": 1, "まなぶ": 1,
      "結ぶ": 1, "むすぶ": 1,
      "読む": 1, "よむ": 1,
      "飲む": 1, "のむ": 1,
      "住む": 1, "すむ": 1,
      "休む": 1, "やすむ": 1,
      "頼む": 1, "たのむ": 1,
      "楽しむ": 1, "たのしむ": 1,
      "苦しむ": 1, "くるしむ": 1,
      "含む": 1, "ふくむ": 1,
      "進む": 1, "すすむ": 1,
      "噛む": 1, "かむ": 1,
      "掴む": 1, "つかむ": 1,
      "踏む": 1, "ふむ": 1,
      "産む": 1, "うむ": 1,
      "生む": 1,
      "作る": 1, "つくる": 1,
      "取る": 1, "とる": 1,
      "撮る": 1,
      "乗る": 1, "のる": 1,
      "売る": 1, "うる": 1,
      "知る": 1, "しる": 1,
      "切る": 1, "きる": 1,
      "入る": 1, "はいる": 1,
      "走る": 1, "はしる": 1,
      "帰る": 1, "かえる": 1,
      "返る": 1,
      "戻る": 1, "もどる": 1,
      "変わる": 1, "かわる": 1,
      "代わる": 1,
      "終わる": 1, "おわる": 1,
      "始まる": 1, "はじまる": 1,
      "決まる": 1, "きまる": 1,
      "集まる": 1, "あつまる": 1,
      "止まる": 1, "とまる": 1,
      "泊まる": 1,
      "困る": 1, "こまる": 1,
      "登る": 1, "のぼる": 1,
      "上る": 1,
      "下る": 1, "くだる": 1,
      "渡る": 1, "わたる": 1,
      "通る": 1, "とおる": 1,
      "分かる": 1, "わかる": 1,
      "判る": 1, "解る": 1,
      "怒る": 1, "おこる": 1,
      "送る": 1, "おくる": 1,
      "贈る": 1,
      "残る": 1, "のこる": 1,
      "座る": 1, "すわる": 1,
      "眠る": 1, "ねむる": 1,
      "減る": 1, "へる": 1,
      "要る": 1, "いる": 1,
      "祈る": 1, "いのる": 1,
      "限る": 1, "かぎる": 1,
      "握る": 1, "にぎる": 1,
      "参る": 1, "まいる": 1,
      "曲がる": 1, "まがる": 1,
      "上がる": 1, "あがる": 1,
      "下がる": 1, "さがる": 1,
      "広がる": 1, "ひろがる": 1,
      "繋がる": 1, "つながる": 1,
      "掛かる": 1, "かかる": 1,
      "係る": 1,
      "罹る": 1,
      "懸かる": 1,
      "助かる": 1, "たすかる": 1,
      "見つかる": 1, "みつかる": 1,
      "捕まる": 1, "つかまる": 1,
      "当たる": 1, "あたる": 1,
      "ある": 1,
      "なる": 1,
      "やる": 1,
      "貰う": 1, "もらう": 1,
      "頑張る": 1, "がんばる": 1,
      "空く": 1, "あく": 1, "すく": 1,
      "空いた": 1, "すいた": 1,
      "手伝う": 1, "てつだう": 1,
      "履く": 1, "はく": 1,
      "被る": 1, "かぶる": 1,
      "踊る": 1, "おどる": 1,
      "成る": 1, "なる": 1,
      "サボる": 1, "さぼる": 1,
      "無くす": 1, "亡くす": 1, "なくす": 1,
      "乾く": 1, "かわく": 1,
      "叶う": 1, "かなう": 1,
      "着く": 1, "付く": 1, "つく": 1,
      "下ろす": 1, "おろす": 1,
      "喋る": 1, "しゃべる": 1,
      "付き合う": 1, "つきあう": 1,
      "おごる": 1,
      "起こす": 1, "おこす": 1,
      "訳す": 1, "やくす": 1,
      "溶かす": 1, "とかす": 1,
      "沸かす": 1, "わかす": 1,
      "落とす": 1, "おとす": 1,
      "泣く": 1, "なく": 1,
      "召し上がる": 1, "めしあがる": 1,
      "お休みになる": 1, "おやすみになる": 1,
      "ご覧になる": 1, "ごらんになる": 1,
      "壊す": 1, "こわす": 1,
      "願う": 1, "ねがう": 1,
      "似合う": 1, "にあう": 1,
      "引っ越す": 1, "ひっこす": 1,
      "迷う": 1, "まよう": 1,
      "思い出す": 1, "おもいだす": 1,
      "致す": 1, "いたす": 1,
      "盗む": 1, "ぬすむ": 1,
      "殴る": 1, "なぐる": 1,
      "刺す": 1, "さす": 1,
      "触る": 1, "さわる": 1,
      "通う": 1, "かよう": 1,
      "欲しがる": 1, "ほしがる": 1,
      "落ち込む": 1, "おちこむ": 1,
      "止む": 1, "やむ": 1,
      "守る": 1, "まもる": 1,
      "表す": 1, "あらわす": 1,
      "頂く": 1, "いただく": 1,
      "支払う": 1, "しはらう": 1,
      "受け取る": 1, "うけとる": 1,
      "わかる": 1,
      "いらっしゃる": 1,
      "おっしゃる": 1,
      "くださる": 1,
      "なさる": 1,
      "ござる": 1,
      "笑わせる": 1, "わらわせる": 1,
      "言わせる": 1, "いわせる": 1,
      "歌わせる": 1, "うたわせる": 1,
      "買わせる": 1, "かわせる": 1,
      "使わせる": 1, "つかわせる": 1,
      "払わせる": 1, "はらわせる": 1,
      "習わせる": 1, "ならわせる": 1,
      "洗わせる": 1, "あらわせる": 1,
      "思わせる": 1, "おもわせる": 1,
      "書かせる": 1, "かかせる": 1,
      "聞かせる": 1, "きかせる": 1,
      "歩かせる": 1, "あるかせる": 1,
      "働かせる": 1, "はたらかせる": 1,
      "話させる": 1, "はなさせる": 1,
      "待たせる": 1, "またせる": 1,
      "持たせる": 1, "もたせる": 1,
      "立たせる": 1, "たたせる": 1,
      "死なせる": 1, "しなせる": 1,
      "遊ばせる": 1, "あそばせる": 1,
      "飛ばせる": 1, "とばせる": 1,
      "読ませる": 1, "よませる": 1,
      "飲ませる": 1, "のませる": 1,
      "休ませる": 1, "やすませる": 1,
      "作らせる": 1, "つくらせる": 1,
      "取らせる": 1, "とらせる": 1,
      "走らせる": 1, "はしらせる": 1,
      "帰らせる": 1, "かえらせる": 1,
      "座らせる": 1, "すわらせる": 1,
      "泳がせる": 1, "およがせる": 1,
      "言われる": 1, "いわれる": 1,
      "思われる": 1, "おもわれる": 1,
      "使われる": 1, "つかわれる": 1,
      "書かれる": 1, "かかれる": 1,
      "聞かれる": 1, "きかれる": 1,
      "呼ばれる": 1, "よばれる": 1,
      "選ばれる": 1, "えらばれる": 1,
      "読まれる": 1, "よまれる": 1,
      "飲まれる": 1, "のまれる": 1,
      "取られる": 1, "とられる": 1,
      "作られる": 1, "つくられる": 1,
      "知られる": 1, "しられる": 1,
      "売られる": 1, "うられる": 1,
      "送られる": 1, "おくられる": 1,
      "ひく": 1, "引く": 1,
      "ひいた": 1, "ひいて": 1,
      "なくなる": 1, "なくなった": 1, "なくなって": 1,
      "話せる": 1, "はなせる": 1,
      "書ける": 1,
      "読める": 1, "よめる": 1,
      "聞ける": 1, "きける": 1,
      "弾ける": 1, "ひける": 1,
      "歩ける": 1, "あるける": 1,
      "泳げる": 1, "およげる": 1,
      "飲める": 1, "のめる": 1,
      "帰ったら": 1, "かえったら": 1,
      "行ったら": 1, "いったら": 1,
      "食べたら": 2, "たべたら": 2,
      "飲んだら": 1, "のんだら": 1,
      "読んだら": 1, "よんだら": 1,
      "書いたら": 1, "かいたら": 1,
      "聞いたら": 1, "きいたら": 1,
      "会ったら": 1, "あったら": 1,
      "買ったら": 1, "かったら": 1,
      "待ったら": 1, "まったら": 1,
      "持ったら": 1, "もったら": 1,
      "話したら": 1, "はなしたら": 1,
      "なったら": 1, "なった": 1, "なって": 1,
      "なり": 1, "なりたい": 1, "なりたかった": 1,
      "なります": 1, "なりました": 1,
      "なれる": 1, "なれない": 1,
      "降る": 1, "ふる": 1,
      "降った": 1, "ふった": 1,
      "降って": 1, "ふって": 1, "降っている": 1,
      "洗う": 1, "あらう": 1,
      "洗った": 1, "洗って": 1,
      
      // ichidan verbs (ru-verbs)
      "間違える": 2, "まちがえる": 2,
      "苛める": 2, "いじめる": 2,
      "見る": 2, "みる": 2,
      "着る": 2, "きる": 2,
      "起きる": 2, "おきる": 2,
      "落ちる": 2, "おちる": 2,
      "生きる": 2, "いきる": 2,
      "過ぎる": 2, "すぎる": 2,
      "閉じる": 2, "とじる": 2,
      "感じる": 2, "かんじる": 2,
      "信じる": 2, "しんじる": 2,
      "似る": 2, "にる": 2,
      "煮る": 2,
      "居る": 2, "いる": 2,
      "射る": 2, "いる": 2,
      "食べる": 2, "たべる": 2,
      "寝る": 2, "ねる": 2,
      "出る": 2, "でる": 2,
      "出来る": 2, "できる": 2,
      "開ける": 2, "あける": 2,
      "閉める": 2, "しめる": 2,
      "始める": 2, "はじめる": 2,
      "決める": 2, "きめる": 2,
      "集める": 2, "あつめる": 2,
      "止める": 2, "とめる": 2,
      "辞める": 2, "やめる": 2,
      "入れる": 2, "いれる": 2,
      "教える": 2, "おしえる": 2,
      "覚える": 2, "おぼえる": 2,
      "考える": 2, "かんがえる": 2,
      "変える": 2, "かえる": 2,
      "替える": 2,
      "換える": 2,
      "迎える": 2, "むかえる": 2,
      "答える": 2, "こたえる": 2,
      "応える": 2,
      "与える": 2, "あたえる": 2,
      "伝える": 2, "つたえる": 2,
      "加える": 2, "くわえる": 2,
      "抑える": 2, "おさえる": 2,
      "捉える": 2, "とらえる": 2,
      "見える": 2, "みえる": 2,
      "聞こえる": 2, "きこえる": 2,
      "増える": 2, "ふえる": 2,
      "消える": 2, "きえる": 2,
      "植える": 2, "うえる": 2,
      "飢える": 2, "うえる": 2,
      "冷える": 2, "ひえる": 2,
      "燃える": 2, "もえる": 2,
      "越える": 2, "こえる": 2,
      "超える": 2,
      "受ける": 2, "うける": 2,
      "上げる": 2, "あげる": 2,
      "挙げる": 2,
      "下げる": 2, "さげる": 2,
      "逃げる": 2, "にげる": 2,
      "投げる": 2, "なげる": 2,
      "告げる": 2, "つげる": 2,
      "続ける": 2, "つづける": 2,
      "付ける": 2, "つける": 2,
      "着ける": 2,
      "助ける": 2, "たすける": 2,
      "分ける": 2, "わける": 2,
      "負ける": 2, "まける": 2,
      "向ける": 2, "むける": 2,
      "避ける": 2, "さける": 2,
      "開ける": 2,
      "預ける": 2, "あずける": 2,
      "見せる": 2, "みせる": 2,
      "乗せる": 2, "のせる": 2,
      "載せる": 2,
      "寄せる": 2, "よせる": 2,
      "混ぜる": 2, "まぜる": 2,
      "建てる": 2, "たてる": 2,
      "立てる": 2,
      "当てる": 2, "あてる": 2,
      "捨てる": 2, "すてる": 2,
      "育てる": 2, "そだてる": 2,
      "慣れる": 2, "なれる": 2,
      "離れる": 2, "はなれる": 2,
      "流れる": 2, "ながれる": 2,
      "生まれる": 2, "うまれる": 2,
      "隠れる": 2, "かくれる": 2,
      "遅れる": 2, "おくれる": 2,
      "枯れる": 2, "かれる": 2,
      "暮れる": 2, "くれる": 2,
      "触れる": 2, "ふれる": 2,
      "壊れる": 2, "こわれる": 2,
      "折れる": 2, "おれる": 2,
      "汚れる": 2, "よごれる": 2,
      "疲れる": 2, "つかれる": 2,
      "忘れる": 2, "わすれる": 2,
      "調べる": 2, "しらべる": 2,
      "比べる": 2, "くらべる": 2,
      "並べる": 2, "ならべる": 2,
      "述べる": 2, "のべる": 2,
      "食べる": 2,
      "浴びる": 2, "あびる": 2,
      "伸びる": 2, "のびる": 2,
      "延びる": 2,
      "満ちる": 2, "みちる": 2,
      "用いる": 2, "もちいる": 2,
      "報いる": 2, "むくいる": 2,
      "得る": 2, "える": 2,
      "経る": 2, "へる": 2,
      "連れて来る": 2, "連れてくる": 2, "つれてくる": 2,
      "持ってくる": 2, "持って来る": 2, "もってくる": 2,
      "連れる": 2, "つれる": 2,
      "諦める": 2, "あきらめる": 2,
      "試みる": 2, "こころみる": 2,
      "出かける": 2, "でかける": 2,
      "痩せる": 2, "やせる": 2,
      "掛ける": 2, "かける": 2,
      "別れる": 2, "わかれる": 2,
      "頂ける": 2, "いただける": 2,
      "足りる": 2, "たりる": 2,
      "片付ける": 2, "片づける": 2, "かたづける": 2,
      "乗り遅れる": 2, "のりおくれる": 2,
      "気を付ける": 2, "気をつける": 2, "きをつける": 2,
      "晴れる": 2, "はれる": 2,
      "差し上げる": 2, "さしあげる": 2,
      "貯める": 2, "ためる": 2,
      "届ける": 2, "とどける": 2,
      "できる": 2,
      "食べさせる": 2, "たべさせる": 2,
      "見させる": 2, "みさせる": 2,
      "起きさせる": 2, "おきさせる": 2,
      "寝させる": 2, "ねさせる": 2,
      "着させる": 2, "きさせる": 2,
      "教えさせる": 2, "おしえさせる": 2,
      "覚えさせる": 2, "おぼえさせる": 2,
      "考えさせる": 2, "かんがえさせる": 2,
      "答えさせる": 2, "こたえさせる": 2,
      "調べさせる": 2, "しらべさせる": 2,
      "見られる": 2, "みられる": 2,
      "食べられる": 2, "たべられる": 2,
      "考えられる": 2, "かんがえられる": 2,
      "信じられる": 2, "しんじられる": 2,
      "感じられる": 2, "かんじられる": 2,
      "できた": 2, "できて": 2, "できない": 2, "できなかった": 2,
      "食べられる": 2, "たべられる": 2,
      "見られる": 2, "みられる": 2,
      "起きられる": 2, "おきられる": 2,
      "寝られる": 2, "ねられる": 2,
      "借りられる": 2, "かりられる": 2,
      "食べられない": 2, "たべられない": 2,
      "見られない": 2, "みられない": 2,
      "借りられない": 2, "かりられない": 2,
      "見たら": 2, "みたら": 2,
      "います": 2, "いました": 2, "いない": 2, "いなかった": 2,
      "借りる": 2, "かりる": 2,
      "借りられる": 2, "かりられる": 2,
      "借りた": 2, "かりた": 2,
      "借りて": 2, "かりて": 2,

      // Irregular verbs
      "する": 3, "したら": 3,
      "来る": 3, "くる": 3,
      "来たら": 3, "きたら": 3,
      "為る": 3,

      // Compound する verbs
      "勉強する": 3, "べんきょうする": 3,
      "運動する": 3, "うんどうする": 3,
      "練習する": 3, "れんしゅうする": 3,
      "説明する": 3, "せつめいする": 3,
      "理解する": 3, "りかいする": 3,
      "心配する": 3, "しんぱいする": 3,
      "安心する": 3, "あんしんする": 3,
      "結婚する": 3, "けっこんする": 3,
      "離婚する": 3, "りこんする": 3,
      "卒業する": 3, "そつぎょうする": 3,
      "入学する": 3, "にゅうがくする": 3,
      "就職する": 3, "しゅうしょくする": 3,
      "退職する": 3, "たいしょくする": 3,
      "出発する": 3, "しゅっぱつする": 3,
      "到着する": 3, "とうちゃくする": 3,
      "旅行する": 3, "りょこうする": 3,
      "散歩する": 3, "さんぽする": 3,
      "掃除する": 3, "そうじする": 3,
      "洗濯する": 3, "せんたくする": 3,
      "料理する": 3, "りょうりする": 3,
      "買い物する": 3, "かいものする": 3,
      "電話する": 3, "でんわする": 3,
      "連絡する": 3, "れんらくする": 3,
      "約束する": 3, "やくそくする": 3,
      "相談する": 3, "そうだんする": 3,
      "質問する": 3, "しつもんする": 3,
      "返事する": 3, "へんじする": 3,
      "注意する": 3, "ちゅういする": 3,
      "注文する": 3, "ちゅうもんする": 3,
      "予約する": 3, "よやくする": 3,
      "準備する": 3, "じゅんびする": 3,
      "用意する": 3, "よういする": 3,
      "紹介する": 3, "しょうかいする": 3,
      "参加する": 3, "さんかする": 3,
      "賛成する": 3, "さんせいする": 3,
      "反対する": 3, "はんたいする": 3,
      "成功する": 3, "せいこうする": 3,
      "失敗する": 3, "しっぱいする": 3,
      "経験する": 3, "けいけんする": 3,
      "発見する": 3, "はっけんする": 3,
      "発明する": 3, "はつめいする": 3,
      "研究する": 3, "けんきゅうする": 3,
      "開発する": 3, "かいはつする": 3,
      "生産する": 3, "せいさんする": 3,
      "輸出する": 3, "ゆしゅつする": 3,
      "輸入する": 3, "ゆにゅうする": 3,
      "報告する": 3, "ほうこくする": 3,
      "確認する": 3, "かくにんする": 3,
      "証明する": 3, "しょうめいする": 3,
      "表現する": 3, "ひょうげんする": 3,
      "実現する": 3, "じつげんする": 3,
      "実行する": 3, "じっこうする": 3,
      "利用する": 3, "りようする": 3,
      "使用する": 3, "しようする": 3,
      "活用する": 3, "かつようする": 3,
      "応用する": 3, "おうようする": 3,
      "朝寝坊する": 3, "あさねぼうする": 3,
      "お祈りする": 3, "おいのりする": 3,
      "ご馳走する": 3, "ごちそうする": 3,
      "挑戦する": 3, "ちょうせんする": 3,
      "努力する": 3, "どりょくする": 3,
      "成長する": 3, "せいちょうする": 3,
      "変化する": 3, "へんかする": 3,
      "進化する": 3, "しんかする": 3,
      "発展する": 3, "はってんする": 3,
      "拡大する": 3, "かくだいする": 3,
      "縮小する": 3, "しゅくしょうする": 3,
      "増加する": 3, "ぞうかする": 3,
      "減少する": 3, "げんしょうする": 3,
      "上昇する": 3, "じょうしょうする": 3,
      "下降する": 3, "かこうする": 3,
      "移動する": 3, "いどうする": 3,
      "到達する": 3, "とうたつする": 3,
      "到着する": 3, "とうちゃくする": 3,
      "出発する": 3, "しゅっぱつする": 3,
      "帰宅する": 3, "きたくする": 3,
      "外出する": 3, "がいしゅつする": 3,
      "通勤する": 3, "つうきんする": 3,
      "通学する": 3, "つうがくする": 3,
      "出勤する": 3, "しゅっきんする": 3,
      "退勤する": 3, "たいきんする": 3,
      "出席する": 3, "しゅっせきする": 3,
      "欠席する": 3, "けっせきする": 3,
      "遅刻する": 3, "ちこくする": 3,
      "早退する": 3, "そうたいする": 3,
      "休憩する": 3, "きゅうけいする": 3,
      "休息する": 3, "きゅうそくする": 3,
      "睡眠する": 3, "すいみんする": 3,
      "起床する": 3, "きしょうする": 3,
      "就寝する": 3, "しゅうしんする": 3,
      "食事する": 3, "しょくじする": 3,
      "入浴する": 3, "にゅうよくする": 3,
      "洗顔する": 3, "せんがんする": 3,
      "着替える": 2, "きがえる": 2,
      "化粧する": 3, "けしょうする": 3,
      "運転する": 3, "うんてんする": 3,
      "駐車する": 3, "ちゅうしゃする": 3,
      "乗車する": 3, "じょうしゃする": 3,
      "下車する": 3, "げしゃする": 3,
      "搭乗する": 3, "とうじょうする": 3,
      "予約する": 3, "よやくする": 3,
      "キャンセルする": 3,
      "注文する": 3, "ちゅうもんする": 3,
      "購入する": 3, "こうにゅうする": 3,
      "販売する": 3, "はんばいする": 3,
      "配達する": 3, "はいたつする": 3,
      "発送する": 3, "はっそうする": 3,
      "受信する": 3, "じゅしんする": 3,
      "送信する": 3, "そうしんする": 3,
      "返信する": 3, "へんしんする": 3,
      "転送する": 3, "てんそうする": 3,
      "印刷する": 3, "いんさつする": 3,
      "コピーする": 3,
      "スキャンする": 3,
      "保存する": 3, "ほぞんする": 3,
      "削除する": 3, "さくじょする": 3,
      "編集する": 3, "へんしゅうする": 3,
      "作成する": 3, "さくせいする": 3,
      "完成する": 3, "かんせいする": 3,
      "提出する": 3, "ていしゅつする": 3,
      "提供する": 3, "ていきょうする": 3,
      "公開する": 3, "こうかいする": 3,
      "発表する": 3, "はっぴょうする": 3,
      "公表する": 3, "こうひょうする": 3,
      "発言する": 3, "はつげんする": 3,
      "発音する": 3, "はつおんする": 3,
      "翻訳する": 3, "ほんやくする": 3,
      "通訳する": 3, "つうやくする": 3,
      "録音する": 3, "ろくおんする": 3,
      "録画する": 3, "ろくがする": 3,
      "撮影する": 3, "さつえいする": 3,
      "放送する": 3, "ほうそうする": 3,
      "配信する": 3, "はいしんする": 3,
      "視聴する": 3, "しちょうする": 3,
      "観察する": 3, "かんさつする": 3,
      "観光する": 3, "かんこうする": 3,
      "見学する": 3, "けんがくする": 3,
      "訪問する": 3, "ほうもんする": 3,
      "招待する": 3, "しょうたいする": 3,
      "歓迎する": 3, "かんげいする": 3,
      "案内する": 3, "あんないする": 3,
      "説明する": 3, "せつめいする": 3,
      "紹介する": 3, "しょうかいする": 3,
      "推薦する": 3, "すいせんする": 3,
      "推測する": 3, "すいそくする": 3,
      "予測する": 3, "よそくする": 3,
      "予想する": 3, "よそうする": 3,
      "想像する": 3, "そうぞうする": 3,
      "創造する": 3, "そうぞうする": 3,
      "発想する": 3, "はっそうする": 3,
      "計算する": 3, "けいさんする": 3,
      "測定する": 3, "そくていする": 3,
      "比較する": 3, "ひかくする": 3,
      "分析する": 3, "ぶんせきする": 3,
      "解析する": 3, "かいせきする": 3,
      "調査する": 3, "ちょうさする": 3,
      "研究する": 3, "けんきゅうする": 3,
      "実験する": 3, "じっけんする": 3,
      "検証する": 3, "けんしょうする": 3,
      "証明する": 3, "しょうめいする": 3,
      "判断する": 3, "はんだんする": 3,
      "決定する": 3, "けっていする": 3,
      "選択する": 3, "せんたくする": 3,
      "採用する": 3, "さいようする": 3,
      "適用する": 3, "てきようする": 3,
      "応用する": 3, "おうようする": 3,
      "活用する": 3, "かつようする": 3,
      "利用する": 3, "りようする": 3,
      "使用する": 3, "しようする": 3,
      "運用する": 3, "うんようする": 3,
      "管理する": 3, "かんりする": 3,
      "整理する": 3, "せいりする": 3,
      "処理する": 3, "しょりする": 3,
      "対処する": 3, "たいしょする": 3,
      "対応する": 3, "たいおうする": 3,
      "反応する": 3, "はんのうする": 3,
      "影響する": 3, "えいきょうする": 3,
      "関係する": 3, "かんけいする": 3,
      "接続する": 3, "せつぞくする": 3,
      "連結する": 3, "れんけつする": 3,
      "結合する": 3, "けつごうする": 3,
      "分離する": 3, "ぶんりする": 3,
      "分割する": 3, "ぶんかつする": 3,
      "統合する": 3, "とうごうする": 3,
      "合併する": 3, "がっぺいする": 3,
      "協力する": 3, "きょうりょくする": 3,
      "競争する": 3, "きょうそうする": 3,
      "対立する": 3, "たいりつする": 3,
      "衝突する": 3, "しょうとつする": 3,
      "妥協する": 3, "だきょうする": 3,
      "和解する": 3, "わかいする": 3,
      "解決する": 3, "かいけつする": 3,
      "改善する": 3, "かいぜんする": 3,
      "悪化する": 3, "あっかする": 3,
      "回復する": 3, "かいふくする": 3,
      "修復する": 3, "しゅうふくする": 3,
      "修理する": 3, "しゅうりする": 3,
      "修正する": 3, "しゅうせいする": 3,
      "訂正する": 3, "ていせいする": 3,
      "補正する": 3, "ほせいする": 3,
      "調整する": 3, "ちょうせいする": 3,
      "調節する": 3, "ちょうせつする": 3,
      "設定する": 3, "せっていする": 3,
      "設置する": 3, "せっちする": 3,
      "設計する": 3, "せっけいする": 3,
      "建設する": 3, "けんせつする": 3,
      "建築する": 3, "けんちくする": 3,
      "製造する": 3, "せいぞうする": 3,
      "生産する": 3, "せいさんする": 3,
      "開発する": 3, "かいはつする": 3,
      "発明する": 3, "はつめいする": 3,
      "発見する": 3, "はっけんする": 3,
      "ごろごろする": 3,
      "そうする": 3,
      "ございます": 3,
      "してる": 3,
      "してた": 3,

      // みる auxiliary
      "てみる": true,
      "てみた": true,
      "てみて": true,
      "てみよう": true,
      "てみたい": true,
      "でみる": true,
      "でみた": true,

      // しまう auxiliary
      "てしまう": true,
      "てしまった": true,
      "てしまって": true,
      "でしまう": true,
      "でしまった": true,
      "でしまって": true,
      "ちゃう": true,
      "ちゃった": true,
      "じゃう": true,
      "じゃった": true,

      // おく auxiliary
      "ておく": true,
      "ておいた": true,
      "ておいて": true,
      "でおく": true,
      "でおいた": true,
      "とく": true,  // casual form
      "といた": true,

      // Copula (added to fix "です" splitting)
      "です": 3,
      "でしょう": 3,
      "でした": 3,
      "だ": 3
    },
    
    verbEndings : [
      // Te-form endings
      "って", "いて", "いで", "して",
      "んで", "nte", "て", "で",
      // Ta-form (past) endings
      "った", "いた", "いだ", "した",
      "んだ", "た", "だ",
      // Nai-form endings
      "わない", "かない", "がない", "さない",
      "たない", "なない", "ばない", "まない",
      "らない", "ない",
      // Masu-form
      "います", "きます", "ぎます", "します",
      "ちます", "にます", "びます", "みます",
      "ります", "ます",
      // Potential, passive, causative
      "れる", "られる", "せる", "させる", "される", "させられる", "せられる",
      // Volitional
      "よう", "おう",
      // Conditional
      "ば", "たら", "なら",
      // Continuous
      "ている", "てる", "でいる", "でる",
      "ていた", "てた", "でいた", "でた"
    ],
    
    verbConjugations : [
      // Pure hiragana verb patterns (して, している, etc.); MUST come first
      { pattern: "していて", parts: ["していて"] },
      { pattern: "していた", parts: ["していた"] },
      { pattern: "している", parts: ["している"] },
      { pattern: "してた", parts: ["してた"] },
      { pattern: "してる", parts: ["してる"] },
      { pattern: "して", parts: ["して"] },
      { pattern: "した", parts: ["した"] },

      // Te-form + いる/いた patterns (longest first)
      { pattern: "きていて", parts: ["きていて"] },
      { pattern: "きていた", parts: ["きていた"] },
      { pattern: "きている", parts: ["きている"] },
      { pattern: "いていて", parts: ["いていて"] },
      { pattern: "いていた", parts: ["いていた"] },
      { pattern: "いている", parts: ["いている"] },
      { pattern: "っていて", parts: ["っていて"] },
      { pattern: "っていた", parts: ["っていた"] },
      { pattern: "っている", parts: ["っている"] },
      { pattern: "んでいて", parts: ["んでいて"] },
      { pattern: "んでいた", parts: ["んでいた"] },
      { pattern: "んでいる", parts: ["んでいる"] },
      { pattern: "でいて", parts: ["でいて"] },
      { pattern: "でいた", parts: ["でいた"] },
      { pattern: "でいる", parts: ["でいる"] },
      { pattern: "ていて", parts: ["ていて"] },
      { pattern: "ていた", parts: ["ていた"] },
      { pattern: "ている", parts: ["ている"] },
      // Shorter te-forms
      { pattern: "いて", parts: ["いて"] },
      { pattern: "いで", parts: ["いで"] },
      { pattern: "って", parts: ["って"] },
      { pattern: "んで", parts: ["んで"] },
      // Ta-forms
      { pattern: "いた", parts: ["いた"] },
      { pattern: "いだ", parts: ["いだ"] },
      { pattern: "った", parts: ["った"] },
      { pattern: "んだ", parts: ["んだ"] },
      // Nai forms
      { pattern: "さない", parts: ["さない"] },
      { pattern: "かない", parts: ["かない"] },
      { pattern: "がない", parts: ["がない"] },
      { pattern: "たない", parts: ["たない"] },
      { pattern: "なない", parts: ["なない"] },
      { pattern: "ばない", parts: ["ばない"] },
      { pattern: "まない", parts: ["まない"] },
      { pattern: "らない", parts: ["らない"] },
      { pattern: "わない", parts: ["わない"] },
      { pattern: "ない", parts: ["ない"] },
      // Nakute form
      { pattern: "なくて", parts: ["なくて"] }
    ],
    
    iAdjectiveStems : [
      "うるさ", "煩",
      "かしこ", "賢",
      "にく", "難",
      "まる", "円",
      "かわい", "可愛",
      "うつくし", "美し",
      "つまらな", "詰らない", "詰まらない",
      "おもしろ", "面白",
      "たのし", "楽し",
      "うれし", "嬉し",
      "かなし", "悲し",
      "むずかし", "難し",
      "やさし", "易し", "優し",
      "あたらし", "新し",
      "ふる", "古",
      "たか", "高",
      "やす", "安",
      "おおき", "大き",
      "ちいさ", "小さ",
      "なが", "長",
      "みじか", "短",
      "ひろ", "広",
      "せま", "狭",
      "おお", "多",
      "すくな", "少な",
      "よ", "良",
      "わる", "悪",
      "はや", "早", "速",
      "おそ", "遅",
      "つよ", "強",
      "よわ", "弱",
      "あかる", "明る",
      "くら", "暗",
      "あつ", "熱", "暑", "厚",
      "つめた", "冷た",
      "さむ", "寒",
      "あたたか", "温か", "暖か",
      "すずし", "涼し",
      "あま", "甘",
      "から", "辛",
      "にが", "苦",
      "すっぱ", "酸っぱ",
      "おいし", "美味し",
      "まず", "不味",
      "ほし", "欲し",
      "はずかし", "恥ずかし",
      "なつかし", "懐かし",
      "めずらし", "珍し",
      "すばらし", "素晴らし",
      "ただし", "正し",
      "きびし", "厳し",
      "はげし", "激し",
      "したし", "親し",
      "くわし", "詳し",
      "いそがし", "忙し",
      "ねむ", "眠",
      "いた", "痛",
      "こわ", "怖",
      "あぶな", "危な",
      "きたな", "汚",
      "しろ", "白",
      "くろ", "黒",
      "あか", "赤",
      "あお", "青",
      "きいろ", "黄色",
      "ちか", "近",
      "とお", "遠",
      "ふか", "深",
      "あさ", "浅",
      "うす", "薄",
      "おも", "重",
      "かる", "軽",
      "かた", "硬", "固",
      "やわらか", "柔らか",
      "わか", "若",
      "すご", "凄",
      "ひど", "酷",
      "くるし", "苦し",
      "さびし", "寂し", "淋し",
      "かっこよ",
      "かっこ"
    ],
    
    iAdjEndings : {
      // Plain forms
      "い": "present", // 高い
      "かった": "past", // 高かった
      "かったら": "conditional-past", // 高かったら
      "くない": "negative", // 高くない
      "くなかった": "past-neg", // 高くなかった
      "くなかったら": "conditional-past-neg", // 高くなかったら
      // Adverbial/connective forms
      "く": "adverb", // 高く
      "くて": "te-form", // 高くて
      "くても": "te-mo", // 高くても
      "くなくても": "te-mo-neg", // 高くなくても
      "ければ": "conditional", // 高ければ
      // そう
      "そう": "looks-like", // 高そう
      "そうな": "looks-like-na", // 高そうな
      "そうに": "looks-like-ni", // 高そうに
      // すぎる
      "すぎる": "too-much", // 高すぎる
      "すぎた": "too-much-past", // 高すぎた
      "すぎて": "too-much-te", // 高すぎて
      "すぎない": "not-too-much" // 高すぎない
    },
    
    irregularIAdj : [
      "いい",
      "よい", "良い",
      "よかった", "良かった",
      "よかったら", "良かったら",
      "よくない", "良くない",
      "よくなかった", "良くなかった",
      "よく", "良く",
      "よくて", "良くて",
      "よければ", "良ければ",
      "よさそう", "良さそう",
      "よさそうな", "良さそうな",
      "よさそうに", "良さそうに",
      "かっこいい", "カッコいい", "カッコイイ",
      "かっこよい", "カッコよい",
      "かっこよかった", "かっこよくない",
      "かっこよくなかった", "かっこよく",
      "かっこよくて", "かっこよければ"
    ],
    
    naAdjectives : [ // these are automatically added to TinyDic.nouns
      "大丈夫", "だいじょうぶ",
      "めちゃくちゃ",
      "最悪", "さいあく",
      "楽しみ", "たのしみ",
      "お洒落", "おしゃれ",
      "綺麗", "きれい", "キレイ",
      "静か", "しずか",
      "賑やか", "にぎやか",
      "穏やか", "おだやか",
      "爽やか", "さわやか",
      "華やか", "はなやか",
      "鮮やか", "あざやか",
      "柔らか", "やわらか",
      "暖か", "あたたか",
      "温か",
      "元気", "げんき",
      "病気", "びょうき",
      "有名", "ゆうめい",
      "無名", "むめい",
      "大切", "たいせつ",
      "大事", "だいじ",
      "親切", "しんせつ",
      "丁寧", "ていねい",
      "簡単", "かんたん",
      "複雑", "ふくざつ",
      "便利", "べんり",
      "不便", "ふべん",
      "必要", "ひつよう",
      "不要", "ふよう",
      "重要", "じゅうよう",
      "十分", "じゅうぶん",
      "不十分", "ふじゅうぶん",
      "素敵", "すてき",
      "立派", "りっぱ",
      "上手", "じょうず",
      "下手", "へた",
      "得意", "とくい",
      "苦手", "にがて",
      "好き", "すき",
      "大好き", "だいすき",
      "嫌い", "きらい",
      "大嫌い", "だいきらい",
      "安全", "あんぜん",
      "危険", "きけん",
      "健康", "けんこう",
      "自由", "じゆう",
      "不自由", "ふじゆう",
      "正直", "しょうじき",
      "真面目", "まじめ",
      "適当", "てきとう",
      "特別", "とくべつ",
      "普通", "ふつう",
      "異常", "いじょう",
      "正常", "せいじょう",
      "変", "へん",
      "無理", "むり",
      "楽", "らく",
      "暇", "ひま",
      "邪魔", "じゃま",
      "駄目", "だめ",
      "ダメ",
      "無駄", "むだ",
      "様々", "さまざま",
      "色々", "いろいろ",
      "大変", "たいへん",
      "残念", "ざんねん",
      "心配", "しんぱい",
      "安心", "あんしん",
      "熱心", "ねっしん",
      "一生懸命", "いっしょうけんめい",
      "幸せ", "しあわせ",
      "不幸", "ふこう",
      "素直", "すなお",
      "意地悪", "いじわる",
      "平和", "へいわ",
      "平気", "へいき",
      "丈夫", "じょうぶ",
      "新鮮", "しんせん",
      "豊富", "ほうふ",
      "貧乏", "びんぼう",
      "裕福", "ゆうふく",
      "有利", "ゆうり",
      "不利", "ふり",
      "有効", "ゆうこう",
      "無効", "むこう",
      "可能", "かのう",
      "不可能", "ふかのう",
      "確か", "たしか",
      "明らか", "あきらか",
      "同じ", "おなじ",
      "反対", "はんたい",
      "賛成", "さんせい",
      "完全", "かんぜん",
      "不完全", "ふかんぜん",
      "完璧", "かんぺき",
      "純粋", "じゅんすい",
      "単純", "たんじゅん",
      "微妙", "びみょう",
      "曖昧", "あいまい",
      "明確", "めいかく",
      "具体的", "ぐたいてき",
      "抽象的", "ちゅうしょうてき",
      "積極的", "せっきょくてき",
      "消極的", "しょうきょくてき",
      "基本的", "きほんてき",
      "一般的", "いっぱんてき",
      "代表的", "だいひょうてき",
      "典型的", "てんけいてき",
      "理想的", "りそうてき",
      "現実的", "げんじつてき",
      "効果的", "こうかてき",
      "経済的", "けいざいてき",
      "社会的", "しゃかいてき",
      "歴史的", "れきしてき",
      "国際的", "こくさいてき",
      "世界的", "せかいてき",
      "個人的", "こじんてき",
      "精神的", "せいしんてき",
      "肉体的", "にくたいてき",
      "物理的", "ぶつりてき",
      "科学的", "かがくてき",
      "論理的", "ろんりてき",
      "感情的", "かんじょうてき",
      "魅力的", "みりょくてき",
      "印象的", "いんしょうてき",
      "衝撃的", "しょうげきてき",
      "劇的", "げきてき",
      "圧倒的", "あっとうてき",
      "決定的", "けっていてき",
      "致命的", "ちめいてき",
      "本格的", "ほんかくてき",
      "伝統的", "でんとうてき",
      "革命的", "かくめいてき",
      "画期的", "かっきてき",
      "悲劇的", "ひげきてき",
      "喜劇的", "きげきてき",
      "皮肉", "ひにく",
      "ユニーク",
      "シンプル",
      "スマート",
      "エレガント",
      "クール",
      "ホット",
      "フレッシュ",
      "ナチュラル",
      "カジュアル",
      "フォーマル",
      "ポジティブ",
      "ネガティブ",
      "アクティブ",
      "パッシブ",
      "センシティブ",
      "デリケート",
      "ロマンチック",
      "ドラマチック",
      "リアル",
      "バーチャル",
      "オリジナル",
      "ノーマル",
      "スペシャル",
      "プロフェッショナル",
      "オフィシャル",
      "カラフル",
      "パワフル",
      "ワンダフル",
      "ビューティフル",
      "ハンサム",
      "ハード",
      "ソフト",
      "タフ",
      "ラフ",
      "スムーズ",
      "イージー",
      "シリアス",
      "ファンタスティック",
      "エキサイティング"
    ],

    particles : [
      "が", "を", "に", "へ", "で",
      "と", "から", "まで", "より",
      "は", "も", "こそ", "さえ",
      "しか", "だけ", "ばかり", "ほど",
      "くらい", "ぐらい", "など", "なんか",
      "なんて", "の", "や", "とか",
      "か", "ね", "よ", "な", "わ",
      "ぞ", "ぜ", "さ", "かな", "し",
      "かしら", "っけ", "のに", "けど",
      "けれど", "けれども", "ので", "のは",
      "のが", "のを", "って", "ては",
      "では", "には", "とは"
    ],
    
    auxiliaries : [
      "です", "ます", "ました", "ません",
      "でした", "だ", "だった", "である",
      "ない", "なかった", "なくて", "なければ",
      "た", "て", "ている", "ていた",
      "てる", "てた", "ちゃう", "ちゃった",
      "じゃう", "じゃった", "られる", "させる",
      "れる", "せる", "される", "させられる", "せられる", "たい", "たかった",
      "そう", "よう", "らしい", "みたい",
      "っぽい", "ながら", "つつ", "ず",
      "ずに", "ば", "たら", "なら",
      "でいる", "でいた", "んでいる", "んでいた"
    ]
  };
  
  // add naAdjectives to nouns, since they are also nouns
  for (var i = 0, j = TinyDic.naAdjectives.length; i < j; i++) {
    TinyDic.nouns.push(TinyDic.naAdjectives[i]);
  }
  
  // reformat arrays into objects for quicker and more efficient word checking
  for (var toReformat = [
    'words', 
    'nouns', 
    'counters', 
    'verbEndings', 
    'iAdjectiveStems', 
    'irregularIAdj', 
    'naAdjectives', 
    'particles', 
    'auxiliaries'
  ], i = 0, j = toReformat.length, o, arr, arrLen; i < j; i++) {
    o = Object.create(null);
    arr = TinyDic[toReformat[i]];
    arrLen = arr.length;
    for (var k = 0; k < arrLen; k++) {
      var value = arr[k];
      if (!o[value]) o[value] = true;
    }
    TinyDic[toReformat[i]] = o;
  }
}(window));

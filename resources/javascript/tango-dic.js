// appendix tools
(function (window, document) {
  'use strict';
  
  Kantan.vocabJisho = {
    mode : 'ja', // dictionary mode
    selected : [], // selected definitions

    // node cache for improving performance
    cache : {
      box : {}, // checkbox cache used for mirrors
      group : {}, // group checkbox cache used for selecting groups

      // cache used for searches
      search : {
        ja : []
      }
    },

    // key list used for grouping words
    group : {
      'あ' : 'あ',　'ア' : 'あ',
      'い' : 'い',　'イ' : 'い',
      'う' : 'う',　'ウ' : 'う',
      'え' : 'え',　'エ' : 'え',
      'お' : 'お',　'オ' : 'お',
      'か' : 'か',　'が' : 'か',　'カ' : 'か',　'ガ' : 'か',
      'き' : 'き',　'ぎ' : 'き',　'キ' : 'き',　'ギ' : 'き',
      'く' : 'く',　'ぐ' : 'く',　'ク' : 'く',　'グ' : 'く',
      'け' : 'け',　'げ' : 'け',　'ケ' : 'け',　'ゲ' : 'け',
      'こ' : 'こ',　'ご' : 'こ',　'コ' : 'こ',　'ゴ' : 'こ',
      'さ' : 'さ',　'ざ' : 'さ',　'サ' : 'さ',　'ザ' : 'さ',
      'し' : 'し',　'じ' : 'し',　'シ' : 'し',　'ジ' : 'し',
      'す' : 'す',　'ず' : 'す',　'ス' : 'す',　'ズ' : 'す',
      'せ' : 'せ',　'ぜ' : 'せ',　'セ' : 'せ',　'ゼ' : 'せ',
      'そ' : 'そ',　'ぞ' : 'そ',　'ソ' : 'そ',　'ゾ' : 'そ',
      'た' : 'た',　'だ' : 'た',　'タ' : 'た',　'ダ' : 'た',
      'ち' : 'ち',　'ぢ' : 'ち',　'チ' : 'ち',　'ヂ' : 'ち',
      'つ' : 'つ',　'づ' : 'つ',　'ツ' : 'つ',　'ヅ' : 'つ',
      'て' : 'て',　'で' : 'て',　'テ' : 'て',　'デ' : 'て',
      'と' : 'と',　'ど' : 'と',　'ト' : 'と',　'ド' : 'と',
      'な' : 'な',　'ナ' : 'な',
      'に' : 'に',　'ニ' : 'に',
      'ぬ' : 'ぬ',　'ヌ' : 'ぬ',
      'ね' : 'ね',　'ネ' : 'ね',
      'の' : 'の',　'ノ' : 'の',
      'は' : 'は',　'ば' : 'は',　'ぱ' : 'は',　'ハ' : 'は',　'バ' : 'は',　'パ' : 'は',
      'ひ' : 'ひ',　'び' : 'ひ',　'ぴ' : 'ひ',　'ヒ' : 'ひ',　'ビ' : 'ひ',　'ピ' : 'ひ',
      'ふ' : 'ふ',　'ぶ' : 'ふ',　'ぷ' : 'ふ',　'フ' : 'ふ',　'ブ' : 'ふ',　'プ' : 'ふ',
      'へ' : 'へ',　'べ' : 'へ',　'ぺ' : 'へ',　'ヘ' : 'へ',　'ベ' : 'へ',　'ペ' : 'へ',
      'ほ' : 'ほ',　'ぼ' : 'ほ',　'ぽ' : 'ほ',　'ホ' : 'ほ',　'ボ' : 'ほ',　'ポ' : 'ほ',
      'ま' : 'ま',　'マ' : 'ま',
      'み' : 'み',　'ミ' : 'み',
      'む' : 'む',　'ム' : 'む',
      'め' : 'め',　'メ' : 'め',
      'も' : 'も',　'モ' : 'も',
      'や' : 'や',　'ヤ' : 'や',
      'ゆ' : 'ゆ',　'ユ' : 'ゆ',
      'よ' : 'よ',　'ヨ' : 'よ',
      'ら' : 'ら',　'ラ' : 'ら',
      'り' : 'り',　'リ' : 'り',
      'る' : 'る',　'ル' : 'る',
      'れ' : 'れ',　'レ' : 'れ',
      'ろ' : 'ろ',　'ロ' : 'ろ',
      'わ' : 'わ',　'ワ' : 'わ',
      'を' : 'を',　'ヲ' : 'を'
    },

    // Initial setup of the dictionary by adding checkboxes, filling out the English-Japanese dictionary, and more..
    init : function () {
      var def, i, j, k, groupId, word, cleanWord,
          checked = storageOK && localStorage.KN_SelectedDefinitions ? localStorage.KN_SelectedDefinitions.split(',') : [],
          defList = {},
          frag = {};

      for (k in Kantan.vocab) {
        groupId = Kantan.vocabJisho.group[k.charAt(0)] || Kantan.vocabJisho.group[k.charAt(1)] || Kantan.vocabJisho.group[k.charAt(2)];

        if (groupId) { // only add definitions to the document that are within the group key list
          word = Kantan.vocab[k];
          if (!frag[groupId]) frag[groupId] = document.createDocumentFragment();

          def = document.createElement('LI');
          def.className = 'definition clear';
          def.dataset.def = k; // use key as unique identifier
          cleanWord = Kantan.cleanVocabKey(k);

          // parse definition
          def.innerHTML = 
            '<div class="def-ja ruby-always-visible">'+
              '<input class="def-selector kantan_input_hidden" type="checkbox" onchange="Kantan.vocabJisho.updateCheckboxes(this, \'' + def.dataset.def + '\');"' + (checked.indexOf(def.dataset.def) != -1 ? 'checked' : '') + '>'+
              '<span tabindex="0" class="kantan_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
              (word.kanji ? '<ruby>' + word.kanji : cleanWord)+
              (word.kanji ? '<rt>' + (word.readings || cleanWord) + '</rt></ruby>' : '')+
              Kantan.create.vocabExample(k)+
              Kantan.create.vocabAudio(k)+
            '</div>'+
            '<div class="def-tags">' + Kantan.parse.vocabTags(k) + '</div>'+
            '<div class="def-en">' + word.meaning.replace(/\[(?:polite|casual|humble)\]/gi, '') + '</div>'+
            (typeof word.lesson == 'number' ?
             '<span class="def-label" title="' + (KN_Lang == 'en' ? 'Lesson ' + word.lesson : '第' + word.lesson + '課') + '">L' + word.lesson + '</span>' :
             '<span class="def-label extra-vocab" title="Extra vocab">EX</span>'
            );

          // add definition to dictionary
          frag[groupId].appendChild(def);

          // cache japanese definition
          Kantan.vocabJisho.cache.box[def.dataset.def] = {
            ja : def.querySelector('input')
          };

          // cache japanese definition group
          if (!Kantan.vocabJisho.cache.group[groupId]) {
            Kantan.vocabJisho.cache.group[groupId] = [];
          }
          Kantan.vocabJisho.cache.group[groupId].push(def.querySelector('input'));

          // cache japanese definition for searches
          Kantan.vocabJisho.cache.search.ja.push(def);
        } else {
          console.error('"' + k + '" could not be sorted into a group. Please ensure the first 3 characters match a character within Kantan.vocabJisho.group or update groupId to support more characters.');
        }
      }

      // add definitions to the document
      for (k in frag) {
        document.getElementById('list-' + k).appendChild(frag[k]);
      }

      // add definition count to each group's title
      for (var title = document.querySelectorAll('.dictionary-group .section-title'), i = 0, j = title.length, grp; i < j; i++) {
        grp = Kantan.vocabJisho.cache.group[title[i].id.replace('section-', '')];
        title[i].insertAdjacentHTML('beforeend', '<span class="definition-count">(' + (grp ? grp.length : 0) + ')</span>');

        if (!grp) {
          title[i].parentNode.style.display = 'none';
          document.querySelector('a[href="#' + title[i].id + '"]').className = 'dict-index-disabled';
        }
      }

      // add total definition count to the introduction
      document.getElementById('total-definitions').innerHTML = '<strong>' + Kantan.vocabJisho.cache.search.ja.length + '</strong>';

      // restore preferences
      Kantan.vocabJisho.restoreSettings();

      // add jump arrows
      AddJumpArrowsTo('.dictionary-group .section-title', 'dictionary-top', KN_Lang == 'ja' ? '辞書索引に戻る' : 'Return to the top of the dictionary');

      // update exercise title name
      document.getElementById('main-title').insertAdjacentHTML('beforeend', ' Word Practice');

      // cache nodes for searching
      Kantan.vocabJisho.cache.search.res_ja = document.getElementById('dict-search-results-ja');
      Kantan.vocabJisho.cache.search.hit_ja = document.getElementById('dict-search-hits-ja');

      // finally show the dictionary
      Kantan.vocabJisho.finishedLoading();
    },


    // updates localStorage and checkbox mirrors
    updateCheckboxes : function (caller, id, selectAll) {
      var box = Kantan.vocabJisho.cache.box[id],
          index = Kantan.vocabJisho.selected.indexOf(id),
          k;

      if (caller.checked) {
        for (k in box) {
          if (caller != box[k]) {
            box[k].checked = true;
          }
        }

        // add definition to array
        if (index == -1) {
          Kantan.vocabJisho.selected.push(id);
        }

      } else if (!caller.checked) {
        for (k in box) {
          if (caller != box[k]) {
            box[k].checked = false;
          }
        }

        // remove definition from array
        if (index != -1) {
          Kantan.vocabJisho.selected.splice(index, 1);
        }
      }

      // save selected
      if (!selectAll && storageOK) {
        localStorage.KN_SelectedDefinitions = Kantan.vocabJisho.selected;
      }
    },


    // select/deselect helper
    // state: true||false (checkbox state)
    // target: '#list-{A|B|C|あ|い|う}' (selects the target group; ex: '#list-A')
    // custom: true||false (allows custom target selector if true)
    selectAll : function (state, target) {
      var a = target ? Kantan.vocabJisho.cache.group[target] : Kantan.vocabJisho.cache.box, i, j, k;

      if (!a) {
        return;
      }

      // update all checkboxes
      if (target) { // target selection
        for (i = 0, j = a.length; i < j; i++) {
          if (a[i].checked != state) {
            a[i].checked = state;
            Kantan.vocabJisho.updateCheckboxes(a[i], a[i].parentNode.parentNode.dataset.def, true);
          }
        }

      } else { // select all using the node cache
        for (k in a) {
          if (a[k].ja.checked != state) {
            a[k].ja.checked = state;
            Kantan.vocabJisho.updateCheckboxes(a[k].ja, a[k].ja.parentNode.parentNode.dataset.def, true);
          }
        }
      }

      // save selected
      if (storageOK) {
        localStorage.KN_SelectedDefinitions = Kantan.vocabJisho.selected;
      }
    },


    // toggles word lists
    toggleList : function (caller, all) {
      // toggle all word lists
      if (all) {
        var parent = caller.parentNode.parentNode.parentNode.parentNode,
            buttons = parent.querySelectorAll('.dictionary-group .group-selectors'),
            list = parent.querySelectorAll('.dictionary-group .word-list'),
            toggles = parent.querySelectorAll('.dictionary-group .toggle-word-list'),
            i = 0, j = list.length;

        // show definitions
        if (/Show/.test(caller.innerHTML)) {
          for (; i < j; i++) {
            list[i].className = list[i].className.replace(' hidden', '');
            buttons[i].className = buttons[i].className.replace(' hidden', '');
            toggles[i].innerHTML = toggles[i].innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
          }

          caller.innerHTML = caller.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
        } 

        // hide definitions
        else {
          for (; i < j; i++) {
            if (!/hidden/.test(list[i].className)) list[i].className += ' hidden';
            if (!/hidden/.test(buttons[i].className)) buttons[i].className += ' hidden';
            toggles[i].innerHTML = toggles[i].innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
          }

          caller.innerHTML = caller.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
        }
      }

      // toggle single word lists
      else {
        var parent = caller.parentNode.parentNode,
            buttons = parent.querySelector('.group-selectors'),
            list = parent.querySelector('.word-list');

        // show definitions
        if (/hidden/.test(list.className)) {
          list.className = list.className.replace(' hidden', '');
          buttons.className = buttons.className.replace(' hidden', '');
          caller.innerHTML = caller.innerHTML.replace('Show', 'Hide').replace('表示', '非表示')
        }

        // hide definitions
        else {
          list.className += ' hidden';
          buttons.className += ' hidden';
          caller.innerHTML = caller.innerHTML.replace('Hide', 'Show').replace('非表示', '表示')
        }
      }
    },


    // quick search
    search : function (value, mode, retry) {
      // clear existing timeout
      if (Kantan.vocabJisho.searchTimeout) {
        window.clearTimeout(Kantan.vocabJisho.searchTimeout);
      }

      // wait 300ms before submitting search, just in case the user is still typing
      Kantan.vocabJisho.searchTimeout = window.setTimeout(function() {
        var frag = document.createDocumentFragment(),
            results = Kantan.vocabJisho.cache.search['res_' + mode],
            hitsCounter = Kantan.vocabJisho.cache.search['hit_' + mode],
            def = Kantan.vocabJisho.cache.search[mode],
            defLen = def.length,
            matches = [],
            search = ['kanji', 'readings', 'romaji', 'meaning', 'tag', 'lesson'], // where to search in each vocab object
            j = search.length,
            hits = 0,
            i = 0,
            k, m, word, result, field, matched, rank, key, kanjiKey, cleanKey, clone;

        // uncache clones
        for (k in Kantan.vocabJisho.cache.box) {
          if (Kantan.vocabJisho.cache.box[k]['search_' + mode]) {
            delete Kantan.vocabJisho.cache.box[k]['search_' + mode]
          }
        }
        Kantan.vocabJisho.cache.group['search_' + mode] = [];

        // clear prior searches
        results.innerHTML = '';

        // loop over the dictionary if a value is present
        if (value) {
          value = Kantan.toHalfWidth(sanitizeString(value)).toLowerCase();

          for (; i < defLen; i++) {
            k = def[i].dataset.def;
            word = Kantan.vocab[k];

            if (!word) {
              continue;
            }

            matched = false;
            result = '';
            field = '';

            for (m = 0; m < j && !matched; m++) {
              if (word[search[m]] === undefined) {
                continue;
              }

              result = word[search[m]].toString().toLowerCase(); // normalized to lowercase for matching with value
              field = search[m];

              matched =
                // standard search
                result.indexOf(value) != -1 || k.indexOf(value) != -1 ||
                // full type search (doesn't use abbr; int --> interjection)
                field == 'tag' && Kantan.vocabTagKey[word.tag] && Kantan.vocabTagKey[word.tag].toLowerCase().indexOf(value) != -1 ||
                // lesson search
                field == 'lesson' && (('l' + result).indexOf(value) != -1 || ('lesson ' + result).indexOf(value) != -1);
            }

            // kana only search and textbook filters
            matched = matched ||
              value == 'kana' && word.often_kana ||
              /genki/.test(value) && word.genki ||
              /tobira/.test(value) && (word.tobira_b || word.tobira_i) ||
              /quartet/.test(value) && word.quartet;

            if (matched) {
              cleanKey = Kantan.cleanVocabKey(k);
              key = cleanKey.toLowerCase();
              kanjiKey = (word.kanji || '').toString().toLowerCase();

              // ranking: 0 = exact, 1 = prefix, 2 = meaning prefix, 3 = other
              if (key == value || kanjiKey == value) {
                rank = 0;
              } else if (key.indexOf(value) === 0 || kanjiKey.indexOf(value) === 0) {
                rank = 1;
              } else if (field == 'meaning' && result.indexOf(value) === 0) {
                rank = 2;
              } else {
                rank = 3;
              }

              matches.push({
                rank: rank,
                length: key.length,
                index: matches.length,
                def: def[i]
              });
            }
          }

          // sort by rank, then shorter reading first, then original order
          matches.sort(function (a, b) {
            return a.rank - b.rank || a.length - b.length || a.index - b.index;
          });

          for (i = 0; i < matches.length; i++) {
            clone = matches[i].def.cloneNode(true);
            frag.appendChild(clone); // clone the match for displaying in the results node

            // cache search clone
            Kantan.vocabJisho.cache.box[matches[i].def.dataset.def]['search_' + mode] = clone.firstChild;
            Kantan.vocabJisho.cache.group['search_' + mode].push(clone.firstChild);

            hits++; // increment hits
          }
        }

        // perform a kanji only search if the previous one yeilded no results
        if (!retry && !frag.childNodes.length && value && /[\u3400-\u9faf]/.test(value)) {
          var kanji = value.match(/[\u3400-\u9faf]+/);

          if (kanji && kanji[0]) {
            Kantan.vocabJisho.search(kanji[0], mode, true);
          }
        } 

        // show results
        else {
          // append the matched results or display an error message/hide the search results
          if (frag.childNodes.length) {
            results.parentNode.querySelector('.group-selectors').style.visibility = '';
            results.appendChild(frag);

          } else {
            results.parentNode.querySelector('.group-selectors').style.visibility = 'hidden';
            results.innerHTML = value ? '<li><span class="en">No results found for "' + value + '".</span><span class="ja">「' + value + '」が見つかりませんでした。</span></li>' : '';
          }

          hitsCounter.innerHTML = hits ? '(' + hits + ') ' : '';
        }

        delete Kantan.vocabJisho.searchTimeout;
      }, 300);
    },


    // purges bad definition ids (don't exist anymore or on the current site)
    purgeBadSelectors : function () {
      var j = Kantan.vocabJisho.selected.length;

      // verify selected definitions
      for (var i = 0, badId = []; i < j; i++) {
        if (!document.querySelector('#japanese-english [data-def="' + Kantan.vocabJisho.selected[i] + '"]')) {
          badId.push(Kantan.vocabJisho.selected[i]);
        }
      }

      // purge bad selectors
      if (badId.length) {
        while (badId.length) {
          Kantan.vocabJisho.selected.splice(Kantan.vocabJisho.selected.indexOf(badId[0]), 1);
          badId.splice(0, 1);
        }

        // update storage with correction
        if (storageOK) {
          localStorage.KN_SelectedDefinitions = Kantan.vocabJisho.selected;
        }

        // update with new length
        j = Kantan.vocabJisho.selected.length;
      }
    },


    // launches an exercise based on a selected list of words
    launchExercise : function () {
      var j = Kantan.vocabJisho.selected.length;

      // remove bad selectors before starting
      Kantan.vocabJisho.purgeBadSelectors();

      // initiate an exercise once 5 or more words have been selected
      if (j < 5) {
        KantanModal.open({
          title : '<span class="en">Please select more words.</span><span class="ja">言葉をもっと選択してください。</span>',
          content : '<span class="en">Please select <b>' + (5 - j) + '</b> more word' + (5 - j == 1 ? '' : 's') + ' to begin a practice exercise.</span><span class="ja">言葉を<b>' + (5 - j) + '</b>つ選択してください。</span>'
        });

      } else {
        KantanModal.open({
          title : '<span class="en">Begin Practice?</span><span class="ja">練習を始めますか？</span>',
          content : '<span class="en">Are you ready to practice your selected words?</span><span class="ja">選択した言葉を練習してもよろしいですか？</span>',
          buttonText : 'Yes',
          keepOpen : true,

          callback : function () {
            Kantan.generateQuiz({
              format : 'vocab',
              type : ['multi', 'vocab_fill', 'drag', 'writing'],
              info : [Kantan.lang.vocab_multi, Kantan.lang.vocab_fill, Kantan.lang.std_drag, Kantan.lang.vocab_writing],

              quizlet : Kantan.vocabQuizlet(Kantan.vocabJisho.selected)
            });

            Kantan.vocabJisho.showExercise();
          }
        });
      }
    },


    // opens a modal for managing/viewing the words selected in the dictionary
    manageWords : function () {
      KantanModal.open({
        title : '<span class="en">Manage Selected Words</span><span class="ja">選択した言葉</span>',
        content : '<ol id="selected_words_list" class="dict-search-results"></ol>',

        buttonText : 'Close',
        noFocus : true,

        customSize : {
          top : '5%',
          left : '10%',
          bottom : '5%',
          right : '10%'
        }
      });

      // remove bad selectors before showing current selection
      Kantan.vocabJisho.purgeBadSelectors();

      // display currently selected words
      var list = document.getElementById('selected_words_list'),
          checked = storageOK && localStorage.KN_SelectedDefinitions ? localStorage.KN_SelectedDefinitions.split(',') : [],
          i = 0,
          j = Kantan.vocabJisho.selected.length,
          frag, def, ja, ja_def, word, cleanWord;

      if (j) {
        frag = document.createDocumentFragment();

        // parse selected definitions
        for (; i < j; i++) {
          def = document.createElement('LI');
          def.className = 'definition clear';
          def.dataset.def = Kantan.vocabJisho.selected[i];

          // selected definition data
          word = Kantan.vocab[Kantan.vocabJisho.selected[i]];
          cleanWord = Kantan.cleanVocabKey(Kantan.vocabJisho.selected[i]);

          def.innerHTML = 
            '<input class="def-selector kantan_input_hidden" type="checkbox" onchange="Kantan.vocabJisho.updateCheckboxes(this, \'' + def.dataset.def + '\');"' + (checked.indexOf(def.dataset.def) != -1 ? 'checked' : '') + '>'+
            '<span tabindex="0" class="kantan_pseudo_checkbox" onclick="this.previousSibling.click(); Kantan.vocabJisho.removeSelectedWord(this);" onkeypress="if (event.key == \'Enter\') { this.previousSibling.click(); Kantan.vocabJisho.removeSelectedWord(this); }"></span>'+
            '<span class="def-ja' + (word.kanji && !word.often_kana ? ' def-furi' : '') + '">'+
              (word.kanji && !word.often_kana ? word.kanji : cleanWord)+
              (word.kanji && !word.often_kana ? '<i>' + cleanWord + '</i>' : '')+
            '</span>&nbsp;'+
            '<span class="def-en">' + word.meaning + '</span>'+
            (word.type ? ' <span class="def-vtype">[<i>' + word.type + '</i>]</span>' : '')+
            (typeof word.lesson == 'number' ?
             '<span class="def-label">L' + word.lesson + '</span>' :
             '<span class="def-label extra-vocab" title="Extra vocab">EX</span>'
            );

          frag.appendChild(def);
        }

        list.appendChild(frag);
        list.querySelector('.kantan_pseudo_checkbox').focus();

      } else {
        list.innerHTML = '<span class="en">No words selected.</span><span class="ja">言葉は選択しません。</span>';
      }
    },


    // removes selected dictionary word
    removeSelectedWord : function (caller) {
      // remove word from list
      var list = document.getElementById('selected_words_list'), key = caller.parentNode.dataset.def;
      list.removeChild(caller.parentNode);

      if (!list.childNodes.length) {
        list.innerHTML = '<span class="en">No words selected.</span><span class="ja">言葉が選択しません。</span>';
      }
      
      // update checkboxes
      for (var box = document.querySelectorAll('[data-def="' + key + '"] input'), i = 0, j = box.length; i < j; i++) {
        box[i].checked = false;
      }
    },


    // restores preferences for the dictionary
    restoreSettings : function () {
      if (storageOK && localStorage.KN_SelectedDefinitions) {
        Kantan.vocabJisho.selected = localStorage.KN_SelectedDefinitions.split(',');
      }
    },
    
    // hides the appendix page and shows the exercise
    showExercise : function () {
      document.getElementById('appendix-tool').style.display = 'none';
      document.getElementById('exercise').style.display = '';
    },
    
    
    // shows page after setup
    finishedLoading : function () {
      var loading = document.querySelector('.loading');
      loading.className = loading.className.replace('loading', '');
    }
  };
  
  // clone more exercises and add it to the appendix pages
  document.getElementById('appendix-tool').appendChild(document.querySelector('.more-exercises').cloneNode(true));
}(window, document));

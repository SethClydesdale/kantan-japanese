// # MODIFICATIONS FOR THE HOMEPAGE ONLY #
(function (window, document) {
  'use strict';
  
  
  // # QUICK SEARCH #
  if (document.getElementById('quick-search')) {
    window.QuickSearcher = {
      grammarIndex : /grammar-index/.test(window.location.href),
      search : document.getElementById('quick-search'),
      results : document.getElementById('quick-search-results'),
      hitsCounter : document.getElementById('quick-search-hits'),
      
      // set after definition
      li : null,
      exLen : null,
      
      // search for the specified value
      query : function (value) {
        value = sanitizeString(value);
        
        // clear existing timeout
        if (window.KantanSearchTimeout) {
          window.clearTimeout(KantanSearchTimeout);
        }

        // wait 300ms before submitting search, just in case the user is still typing
        window.KantanSearchTimeout = window.setTimeout(function() {
          var frag = document.createDocumentFragment(),
              hits = 0,
              i = 0,
              clone;

          // clear prior searches
          QuickSearcher.results.innerHTML = '';

          // loop over the exercises if a value is present
          if (value) {
            for (; i < QuickSearcher.exLen; i++) {
              if ((QuickSearcher.li[i].innerHTML.replace(/||<.*?>/g, '').toLowerCase().indexOf(value.toLowerCase()) != -1 || (QuickSearcher.li[i].dataset && QuickSearcher.li[i].dataset.keywords && QuickSearcher.li[i].dataset.keywords.toLowerCase().indexOf(value.toLowerCase()) != -1)) && QuickSearcher.li[i].getElementsByTagName('A')[0] && !/note/.test(QuickSearcher.li[i].id)) {
                // clone the link (if on homepage) or create a new link (if on the grammar index)
                if (QuickSearcher.grammarIndex) {
                  clone = document.createElement('LI');
                  clone.innerHTML = '<a href="#' + QuickSearcher.li[i].id + '">' + QuickSearcher.li[i].innerHTML.replace(/||<a.*?>.*?<\/a>/g, '') + '</a>';
                } else {
                  clone = QuickSearcher.li[i].cloneNode(true); // clone the match for displaying in the results node
                }

                // add lesson number to exercise or grammar point
                clone.dataset.lesson = QuickSearcher.grammarIndex ? 'L' + QuickSearcher.li[i].id.replace(/l(\d+)-p\d+/, '$1') : clone.getElementsByTagName('A')[0].href.replace(/.*?\/(lesson-\d+).*|.*?\/(study-tools).*/, function (Match, $1, $2, $3) {
                  if ($1) {
                    return $1.charAt(0).toUpperCase() + $1.split('-').pop();

                  } else if ($2) {
                    return 'tool';
                  }
                });

                // add tooltip in case the text gets cut off
                clone.title = clone.innerText;

                // add the clone to the fragment if it's valid
                if (!/^file|^http/.test(clone.dataset.lesson)) {
                  frag.appendChild(clone);
                  hits++; // increment hits
                }
              }
            }
          }

          // append the matched exercises or display an error message/hide the search results
          if (frag.childNodes.length) {
            QuickSearcher.results.appendChild(frag);

          } else {
            QuickSearcher.results.innerHTML = value ? '<li style="padding:6px;"><span class="en">No results found for "' + value + '".</span><span class="ja">「' + value + '」が見つかりませんでした。</span></li>' : '';
          }

          // update the hits counter and add a button to copy the search link
          QuickSearcher.hitsCounter.innerHTML = hits ? '(' + hits + ') '+
            '<a '+
              'class="fa" '+
              'style="color:#17A;" '+
              'href="#copy-search-link" '+
              'title="' + (KN_Lang == 'ja' ? 'サーチリンクをコピーする' : 'Copy the search link') + '" '+
              'onclick="QuickSearcher.copyLink(\'' + value + '\'); return false;"'+
            '>&#xf0ea;</a>' : '';

          delete window.KantanSearchTimeout;
        }, 300);
      },
      
      
      // opens a popup for copying the search link
      copyLink : function (value) {
        KantanModal.open({
          title : '<span class="en">Copy Search Link</span><span class="ja">サーチリンクをコピーする</span>',
          content : 
          '<div class="center">'+
            '<p><span class="en">You can copy the direct search link from the box below.</span><span class="ja">下の箱からサーチリンクがコピーできます。</span></p>'+
            '<textarea id="copied-search-link" onfocus="this.select();" style="width:80%;height:100px;">' + (window.location.protocol + '//' + window.location.host + window.location.pathname) + '?search=' + encodeURIComponent(value) + '#quick-search-exercises</textarea><br>'+
            '<button class="button" onclick="CopyText(document.getElementById(\'copied-search-link\').value, this);"><i class="fa">&#xf0c5;</i><span class="en">Copy</span><span class="ja">コピーする</span></button>'+
          '</div>',
          focus : '#copied-search-link'
        });
      }
    };
    
    // set remaining data for search functionality
    QuickSearcher.li = document.querySelectorAll(QuickSearcher.grammarIndex ?  '.workbook-title' : '.lesson-exercises li');
    QuickSearcher.exLen = QuickSearcher.li.length;


    // set the value of the search field via the url (e.g. ?search=kanji)
    if (window.location.search) {
      var query = window.location.search.slice(1).split('&'),
          i = 0,
          j = query.length,
          keyVal;

      for (; i < j; i++) {
        keyVal = query[i].split('=');

        if (/^search$/i.test(keyVal[0])) {
          QuickSearcher.search.value = decodeURIComponent(keyVal[1]);
          break;
        }
      }
    }

    // search for exercises when the user inputs text
    QuickSearcher.search.oninput = function () {
      QuickSearcher.query(this.value);
    };

    // resume previous searches (in the event the user goes back in history) or those initiated by ?search=query
    if (QuickSearcher.search.value) {
      QuickSearcher.query(QuickSearcher.search.value);
    }
  }
  
  
  // # QUICK NAV SUB-SECTIONS #
  // Adds buttons for showing sub-sections in each lesson.
  for (var a = document.querySelectorAll('#quick-nav-list a'), i = 0, j = a.length, lesson_regex = /grammar-index/.test(window.location.pathname) ? /.*?lesson-grammar-(\d+).*/ : /.*?lesson-(\d+|r).*/, l; i < j; i++) {
    if (/lesson-(?:\d+|r)|lesson-grammar-\d+/.test(a[i])) {
      l = a[i].href.replace(lesson_regex, '$1'); // get lesson number
      
      // create button and list
      a[i].insertAdjacentHTML('beforebegin', '<a class="sub-section-button fa" href="#toggle-sub-section" onclick="ToggleSubSection(this, \''+ l +'\'); return false;" title="' + (KN_Lang == 'ja' ? 'サブセクションをトグルする' : 'Toggle sub-sections') + '" data-open="false"></a>');
      a[i].insertAdjacentHTML('afterend', '<ul style="display:none;"></ul>');
      
      // hide bullet style
      a[i].parentNode.className += ' noBullet';
    }
  }
  
  // toggles the display of each sub-section
  window.ToggleSubSection = function (caller, lesson) {
    var list = caller.parentNode.lastChild;
    
    // gets the sub-section title for the lesson
    if (!list.innerHTML) {
      // gets all sub section titles and parses them into a list
      for (var sec = document.querySelectorAll('#exercises-' + lesson + ' h4'), i = 0, j = sec.length, str = ''; i < j; i++) {
        str += '<li><a href="#' + sec[i].id + '">' + sec[i].innerHTML.replace(/\s\(.*\)$/, '').replace(/<a.*?>.*?<\/a>/g, '') + '</a></li>';
      }
      
      // add the html to the list
      list.innerHTML = str;
    }
    
    // toggle list display and button icon
    if (/none/.test(list.style.display)) {
      list.style.display = 'block';
      caller.dataset.open = true;
      
    } else {
      list.style.display = 'none';
      caller.dataset.open = false;
    }
  };
  
  
  // # JUMP ARROWS #
  // Add arrows to each lesson title that will take the student back to the quick navigation
  AddJumpArrowsTo('.lesson-title', 'quick-nav', KN_Lang == 'ja' ? 'クイックナビゲーションに戻る' : 'Jump to Quick Navigation');
  
  
  // # EXERCISE RESULTS #
  // Displays exercise results next to each exercise and stats in the profile section
  Kantan.parse.profileStats();
  
  
  // # RANDOM WORD #
  // get random word from jisho.js
  window.KN_RandomWord = function () {
    if (Kantan.vocab) {
      if (!window.KN_WordList) {
        var words = [], k;

        // merge all words into a single array
        for (k in Kantan.vocab) {
          words.push(k);
        }

        window.KN_WordList = words;
      }

      // get random word and japanese word split into kanji and kana
      var container = document.getElementById('random-word-content'),
          word = KN_WordList[Math.floor(Math.random() * KN_WordList.length)],
          cleanWord = Kantan.cleanVocabKey(word),
          wordData = Kantan.vocab[word];

      // add random word to document
      if (container) {
        // prevent same entry from being shown
        if (container.dataset.key == word) {
          return KN_RandomWord();
        }
        
        container.dataset.key = word;
        container.innerHTML = 
          '<div class="word-ja"><ruby>' + (wordData.kanji && !wordData.often_kana ? wordData.kanji : cleanWord) + '<rt>' + (wordData.kanji && !wordData.often_kana ? (wordData.readings || cleanWord) : '　') + '</rt></ruby>' + Kantan.create.vocabExample(word) + Kantan.create.vocabAudio(word) + '</div>'+
          '<hr>'+
          '<div class="word-en"><span class="spoiler' + (storageOK && localStorage.KN_RandomSpoiler == 'false' ? '-off' : '') + '">' + wordData.meaning + '</span></div>';
      }
    }
  };
  window.KN_RandomWord();
  
  
  // # RANDOM KANJI #
  // get random kanji from kanji.js
  window.KN_RandomKanji = function () {
    if (Kantan.kanji) {
      var container = document.getElementById('random-kanji-content'),
          keys = Object.keys(Kantan.kanji),
          key = keys[Math.floor(Math.random() * keys.length)],
          kanji = Kantan.kanji[key];
      
      // add random kanji to document
      if (container) {
        // prevent same entry from being shown
        if (document.querySelector('.random-kanji').innerText == key) {
          return KN_RandomKanji();
        }
        
        container.innerHTML = 
          '<div class="random-kanji">' + key + '</div>'+
          '<hr>'+
          '<div class="random-kanji-meaning"><span class="label"><span class="en">Meaning</span><span class="ja">意味</span>:</span> <span class="spoiler' + (storageOK && localStorage.KN_RandomSpoiler == 'false' ? '-off' : '') + '">' + kanji.meaning + '</span></div>'+
          '<div class="random-kanji-reading">'+
            '<span class="label"><span class="en">Onyomi</span><span class="ja">音読み</span>:</span> ' + (kanji.onyomi ? kanji.onyomi : 'N/A') + '<br>'+
            '<span class="label"><span class="en">Kunyomi</span><span class="ja">訓読み</span>:</span> ' + (kanji.kunyomi ? kanji.kunyomi : 'N/A')+
          '</div>'+
          '<div class="random-kanji-strokes"><span class="label"><span class="en">Strokes</span><span class="ja">画数</span>:</span> ' + kanji.strokes + '<button class="button icon-only round" onclick="Kantan.viewStrokeOrder(\'' + key + '\', \'' + kanji.order + '\')" title="' + (KN_Lang == 'en' ? 'View stroke order' : '書き順を見る') + '"><i class="fa">&#xf002;</i></button></div>';
      }
    }
  };
  window.KN_RandomKanji();
  
}(window, document));
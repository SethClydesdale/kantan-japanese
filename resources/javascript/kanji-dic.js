// appendix tools
(function (window, document) {
  'use strict';
  
  Kantan.kanjiDic = {
    cache : {
      titles : [],
      kanji : [],
      results : document.getElementById('search-results'),
      
      // updates the node caches
      update : function () {
        Kantan.kanjiDic.cache.titles = document.querySelectorAll('#kanji-grid h2');
        Kantan.kanjiDic.cache.kanji = document.querySelectorAll('#kanji-grid .kanji-item');
        Kantan.kanjiDic.cache.searchInfo = document.getElementById('search-info');
      }
    },
    
    // Initial setup of the kanji dictionary
    init : function () {
      var kanji = '', groups = {}, group, count = 0, data, i, k;
      
      // parse kanji data
      for (k in Kantan.kanji) {
        group = typeof Kantan.kanji[k].lesson == 'undefined' ? 'Lesson_EX' + Kantan.kanji[k].grade : 'Lesson_' + Kantan.kanji[k].lesson;
        if (!groups[group]) groups[group] = '';
        
        count++;
        data = ' data-kanji="' + k + '" data-hover="' + Kantan.kanji[k].meaning.split(';')[0] + '"';
        
        // parse properties into data attributes
        for (i in Kantan.kanji[k]) {
          if (!/example_words|order/.test(i)) { // exclusions
            data += ' data-' + i + '="' + Kantan.kanji[k][i] + '"';
          }
        }
        
        groups[group] += '<div class="kanji-item"' + data + ' tabindex="0" onclick="Kantan.kanjiDic.lookUp(\'' + k + '\', this)" onkeypress="event.key == \'Enter\' && Kantan.kanjiDic.lookUp(\'' + k + '\', this)">' + k + '</div>';
      }
      
      // finally add kanji to the grid
      for (var keys = Object.keys(groups).sort(), i = 0, j = keys.length, quickLinks = '<table class="table section-jump" style="margin:1em auto; width:90%;"><tr class="table-head"><td></td></tr><tr><td><ol>', title; i < j; i++) {
        title = /Lesson_EX/.test(keys[i]) ? {
          'Lesson_EX1' : 'Grade 1 Kanji <span class="def-label green">Extra</span>',
          'Lesson_EX2' : 'Grade 2 Kanji <span class="def-label green">Extra</span>',
          'Lesson_EX3' : 'Grade 3 Kanji <span class="def-label green">Extra</span>',
          'Lesson_EX4' : 'Grade 4 Kanji <span class="def-label green">Extra</span>',
          'Lesson_EX5' : 'Grade 5 Kanji <span class="def-label green">Extra</span>',
          'Lesson_EX6' : 'Grade 6 Kanji <span class="def-label green">Extra</span>',
          'Lesson_EX8' : 'High School Level+ Kanji <span class="def-label green">Extra</span>',
        }[keys[i]] : keys[i].replace(/_/g, ' ');
        
        // create kanji section
        kanji += '<h2 id="' + keys[i] + '" class="section-title">' + title + '</h2>' + groups[keys[i]];
        
        // create quick jump link
        quickLinks += '<li><a href="#' + keys[i] + '">' + title.replace(' <span class="def-label green">Extra</span>', '') + '</a></li>';
      }
      document.getElementById('kanji-grid').innerHTML = kanji + '<div id="search-info" style="display:none;">'+
        '<p><b>Sorry! Kan-tan couldn\'t find that kanji. Try searching again using a different term.</b></p>'+
        '<div class="center"><img src="' + getPaths() + 'resources/images/kanny/kanny_guilty.webp" height="300"></div>'+
      '</div>';
      document.getElementById('quick-links').insertAdjacentHTML('beforeend', quickLinks + '</ol></td></tr></table>')
      
      // cache nodes
      Kantan.kanjiDic.cache.update();
      
      // set total definitions
      document.getElementById('total-definitions').innerHTML = '<b>' + count + '</b>';
      
      // clone more exercises and add it to the appendix pages
      document.getElementById('appendix-tool').appendChild(document.querySelector('.more-exercises').cloneNode(true));
      
      // add section anchors for the dictionary sections
      addSectionAnchors();
      
      // remove loading placeholder
      var loading = document.querySelector('.loading');
      loading.className = loading.className.replace('loading', '');
    },
    
    
    // filter kanji based on readings, meanings, etc.
    search : function (query) {
      var kanji = Kantan.kanjiDic.cache.kanji,
          titles = Kantan.kanjiDic.cache.titles,
          totalHits = 0;
      
      // reset hits
      Kantan.kanjiDic.cache.results.innerHTML = '';
      
      // hide search info message
      Kantan.kanjiDic.cache.searchInfo.style.display = 'none';
      
      // loop through kanji and hide entries that do not match the query
      if (query) {
        var opts = /^.*?:.*/.test(query) ? [query.replace(/^(.*?):.*/, '$1').toLowerCase(), query.replace(/^.*?:(.*)/, '$1')] : null,
            textbook = query.toLowerCase() == 'genki' ? 'genki' :
                       query.toLowerCase() == 'tobira' ? 'tobira_i' :
                       query.toLowerCase() == 'quartet' ? 'quartet' : null;
        
        // hide titles
        for (var i = 0, j = titles.length; i < j; i++) {
          titles[i].style.display = 'none';
        }
        
        // filter kanji
        for (var i = 0, j = kanji.length, k, hit; i < j; i++) {
          kanji[i].style.display = ''; // set initial display state
          hit = false; // tells us if there's a hit in the dataset searches
          
          // search operators
          if (opts) {
            if (kanji[i].dataset[opts[0]] == opts[1]) {
              hit = true;
              totalHits++;
            }
          }
          
          else if (textbook) {
            if (kanji[i].dataset[textbook]) {
              hit = true;
              totalHits++;
            }
          }
          
          // standard search
          else {
            for (k in kanji[i].dataset) {
              if (kanji[i].dataset[k].toLowerCase().indexOf(query.toLowerCase()) != -1) {
                hit = true;
                totalHits++;
                break;
              }
            }
          }

          
          // filter out the kanji if no hits
          if (!hit) {
            kanji[i].style.display = 'none';
          }
        }
        
        // show error if now hits
        if (totalHits == 0) {
          Kantan.kanjiDic.cache.searchInfo.style.display = '';
        }
        
        // show total hits in the search title
        else {
          Kantan.kanjiDic.cache.results.innerHTML = '(' + totalHits + ')';
        }
      }
      
      // show all kanji and titles
      else {
        for (var i = 0, j = titles.length; i < j; i++) {
          titles[i].style.display = '';
        }
        
        for (var i = 0, j = kanji.length; i < j; i++) {
          kanji[i].style.display = '';
        }
      }
    },
    
    
    // displays information on the selected kanji in a popup window
    lookUp : function (kanji, focus) {
      var char = kanji;
      kanji = Kantan.kanji[char];
      
      var img = getPaths() + 'resources/images/stroke-order/img/' + kanji.order + '.webp',
          svg = getPaths() + 'resources/images/stroke-order/svg/' + kanji.order + '.svg',
          size = 150;
      
      KantanModal.open({
        title : 'Viewing ' + char,
        content :
          '<div class="quiz-multi-question kanji-dic">'+
            '<div class="kanji-data columns-3-in">'+
              '<div class="kanji-container">'+
                '<div class="animated-order center">'+
                  '<div id="stroke-order-animation" class="kanji-canvas" style="width:' + size + 'px;">'+
                    '<object data="' + svg + '" type="image/svg+xml" height="' + size + '" width="' + size + '"></object>'+
                  '</div>'+
                  '<button class="button" onclick="Kantan.replayStrokeOrder();"><i class="fa">&#xf01e;</i><span class="en">Replay</span><span class="ja">リプレイする</span></button>'+
                '</div>'+
              '</div>'+
              '<div class="kanji-info">'+
                '<div><span class="label">Meaning:</span>' + (kanji.meaning || 'N/A') + '</div>'+
                '<div><span class="label">Onyomi:</span>' + (kanji.onyomi || 'N/A') + '</div>'+
                '<div><span class="label">Kunyomi:</span>' + (kanji.kunyomi || 'N/A') + '</div>'+
                '<div><span class="label">Strokes:</span>' + (kanji.strokes || 'N/A') + '</div>'+
                '<div><span class="label">Tags:</span>'+
                  (typeof kanji.lesson != 'undefined' ? '<span class="def-tag" title="Kantan Japanese lesson the kanji appears." onclick="Kantan.kanjiDic.viewTags();">Lesson ' + kanji.lesson + '</span>' : '')+
                  (typeof kanji.grade != 'undefined' ? '<span class="def-tag dark-green" title="Japanese school grade this kanji is taught at." onclick="Kantan.kanjiDic.viewTags();">Grade ' + kanji.grade + '</span>' : '')+
                  (typeof kanji.jlpt != 'undefined' ? '<span class="def-tag light-blue" title="Estimated JLPT level for this kanji." onclick="Kantan.kanjiDic.viewTags();">N' + kanji.jlpt + '</span>' : '')+
                  (typeof kanji.genki != 'undefined' ? '<span class="def-tag orange" title="Appears in Genki textbooks" onclick="Kantan.kanjiDic.viewTags();">Genki</span>' : '')+
                  (typeof kanji.tobira_i != 'undefined' ? '<span class="def-tag blue" title="Appears in the intermediate Tobira texbook" onclick="Kantan.kanjiDic.viewTags();">Tobira</span>' : '')+
                  (typeof kanji.quartet != 'undefined' ? '<span class="def-tag pink" title="Appears in Quartet textbooks" onclick="Kantan.kanjiDic.viewTags();">Quartet</span>' : '')+
                '</div>'+
              '</div>'+
              '<div class="kanji-examples">' + Kantan.parse.exampleWords(kanji.example_words) + '</div>'+
            '</div>'+
            '<div class="kanji-stroke-order">'+
              '<div class="stroke-order-container"><img src="' + img + '" alt="' + ( KN_Lang == 'ja' ? '書き順' : 'stroke order' ) + '"/></div>'+
            '</div>'+
          '</div>',
        
        closeCallback : function () {
          if (focus) {
            focus.focus();
          }
        },
        
        preserveState : true,
        customSize : {
          top : '5%',
          left : 'auto !important',
          bottom : '5%',
          right : 'auto !important',
          width : '100%',
          maxWidth : '1200px'
        }
      });
    },
    
    
    // shows extended information on all of the vocabulary tags
    viewTags : function () {
      KantanModal.open({
        title : '<span class="en">Kanji Tag Meanings</span><span class="ja">漢字のタグの意味</span>',
        content : '<p>Kanji Tags provide additional information for kanji, such as indicating what lesson a kanji appears in, if it is in a textbook, etc.</p>'+
                  '<table class="table vocab-tag-legend">'+
                  '<tr class="table-head"><td class="center"><span class="en">Tag</span><span class="ja">タグ</span></td><td><span class="en">Meaning</span><span class="ja">意味</span></td></tr>'+
                    '<tr><td class="tag-cell"><span class="def-tag">Lesson 1</span></td><td class="tag-desc-cell">The Lesson on Kantan Japanese that the kanji appears in.</td></tr>'+
                    '<tr><td class="tag-cell"><span class="def-tag dark-green">Grade 1</span></td><td class="tag-desc-cell">The grade that the kanji is taught in Japanese schools.</td></tr>'+
                    '<tr><td class="tag-cell"><span class="def-tag light-blue">N5</span></td><td class="tag-desc-cell">Estimated JLPT Level of a kanji. JLPT level ranges from N5 (easiest) to N1 (hardest).</td></tr>'+
                    '<tr><td class="tag-cell"><span class="def-tag orange">Genki</span></td><td class="tag-desc-cell">Kanji that appears in the Genki textbook series.</td></tr>'+
                    '<tr><td class="tag-cell"><span class="def-tag blue">Tobira</span></td><td class="tag-desc-cell">Kanji that appears in the Tobira Intermediate textbook series.</td></tr>'+
                    '<tr><td class="tag-cell"><span class="def-tag pink">Quartet</span></td><td class="tag-desc-cell">Kanji that appears in the Quartet textbook series.</td></tr>'+
                  '</table><br>',
        
        customSize : {
          top : '5%',
          left : '20%',
          right : '20%',
          bottom : '10%'
        }
      });
    }
  };
}(window, document));

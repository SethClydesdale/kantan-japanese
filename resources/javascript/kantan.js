// # FUNCTIONALITY FOR EXERCISES #
(function (window, document) {
  'use strict';
  
  // primary object for functionality of exercises
  var Kantan = {
    
    // exercise statistics
    stats : {
      problems : 0, // number of problems to solve in the lesson
        solved : 0, // number of problems solved
      mistakes : 0, // number of mistakes made in the lesson
         score : 0, // the student's score
       exclude : 0, // answers to exclude, mostly for text-only segments in multi-choice quizzes
          time : 0 // time elapsed
    },
    
    
    // student preferences
    pref : {
      // hides or displays the quick answer checker in written quizzes
      answerChecker : storageOK && localStorage.KN_AnswerChecker || 'true',
      
      // automatically pauses the exercise timer when switching pages
      autoPauseTimer : storageOK && localStorage.KN_AutoPauseTimer || 'true',
      
      // automatically marks read-only pages as read when you scroll to the bottom of their content
      autoRead : storageOK && localStorage.KN_AutoRead || 'true',
      
      // tells us if the student wants to be reminded to backup their profile data every 10 exercises
      backupReminder : storageOK && localStorage.KN_BackupReminder || 'true',
      
      // tells us if the student prefers easy mode for written exercises
      easyMode : storageOK && localStorage.KN_EasyMode || 'false',
      
      // tells us if the student wants to see example sentences in vocab exercises
      exampleSentences : storageOK && localStorage.KN_ExampleSentences || 'true',
      
      // tells us the student's prefers not to wait long for chat messages
      fastChat : storageOK && localStorage.KN_FastChat || 'false',
      
      // tells us the student's preferred feedback mode for multi-choice quizzes (instant || classic)
      feedbackMode : storageOK && localStorage.KN_FeedbackMode || 'instant',
      
      // tells us the student's preferred font size
      fontSize : storageOK && localStorage.KN_FontSize || 100,
      
      // tells us the student's preferred furigana state (visible or hidden)
      furigana : storageOK && localStorage.KN_Furigana || 'true',
      
      // tells us if the student wants the quick jisho look up button displayed
      jishoLookUp : storageOK && localStorage.KN_JishoLookUp || 'true',
      
      // tells us what random pool of exercises the student prefers
      randomExercise : storageOK && localStorage.KN_RandomExercise || 'all',
      
      // tells us if the student prefers easy mode for written exercises
      romajiInput : storageOK && localStorage.KN_RomajiInput || 'false',
      
      // tells us if the student wants to skip the exercise select screen
      skipTypeSelect : storageOK && localStorage.KN_SkipTypeSelect || 'false',
      
      // tells us if the student has SRS enabled
      SRS : storageOK && localStorage.KN_SRS || 'true',

      // tells us if stroke numbers are visible (for stroke order exercises)
      strokeNumbers : storageOK && localStorage.KN_StrokeNumbers || 'false',
      
      // tells us if the student wants to hide the stroke order for kanji exercises
      strokeOrder : storageOK && localStorage.KN_StrokeOrder || 'true',

      // tells us if text selection mode is enabled (for multi-choice quizzes)
      textSelectMode : 'false',
      
      // tells us if the student wants to hide the tracing guide in stroke order exercises
      tracingGuide : storageOK && localStorage.KN_TracingGuide || 'true',

      // displays or hides a spoiler for vocabulary answers in multiple choice exercises
      vocabSpoiler : storageOK && localStorage.KN_SpoilerMode || 'false',
      
      // tells us if the student wants to see vocabulary tags in vocab exercises
      vocabNotes : storageOK && localStorage.KN_VocabNotes || 'true',
      
      // tells us if the student wants to see vocabulary tags in vocab exercises
      vocabTags : storageOK && localStorage.KN_VocabTags || 'true'
    },

    
    // counter for displaying the data backup reminder
    backupReminderCount : storageOK && localStorage.KN_BackupReminderCount ? +localStorage.KN_BackupReminderCount : 0,
    
    // tells us if we can send notifications
    canNotify : 'Notification' in window,
    
    // checks if touchscreen controls are active
    isTouch : 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
    isTouching : false,
    
    // tells us if timer is paused by popup
    isTimerPausedByPopup: false,
    
    // tells us if a quiz item is marked in a drag and drop quiz
    markedItem : null,
    
    // tells us if being used on a local file system so we can append index.html to URLs
    local : (window.location.protocol == 'file:' || /localhost/.test(window.location.href)) ? 'index.html' : '',
    
    // tells us if debug mode is active so we can append ?debug to exercise URLs
    debug : /debug/.test(window.location.search) ? '?debug' : '',

    
    // frequently used/generic strings
    lang : {
      std_drag : '<span class="en">Drag the English expression to the Japanese expression that has the same meaning.<br>TIP: Click an expression to mark it, then click an empty field to drop the answer there.</span><span class="ja">英語の言葉を同じ意味を持つ日本語の言葉にドラッグしなさい。<br>ヒント：言葉をクリックすると選択になります。空のフィールドをクリックすると選択した言葉をドロップします。</span>',
      std_kana : '<span class="en">Drag the Kana to the matching Romaji.<br>TIP: Click the kana to mark it, then click an empty field to drop the answer there.</span><span class="ja">仮名をローマ字にドラッグしなさい。<br>ヒント：仮名をクリックすると選択になります。空のフィールドをクリックすると選択した言葉をドロップします。</span>',
      std_num : '<span class="en">Drag the Numbers to the matching Kana.<br>TIP: Click a number to mark it, then click an empty field to drop the answer there.</span><span class="ja">数を仮名にドラッグしなさい。<br>ヒント：数をクリックすると選択になります。空のフィールドをクリックすると選択した言葉をドロップします。</span>',
      std_multi : '<span class="en">Solve the problems by choosing the correct answers.</span><span class="ja">正解の答えを選択しなさい。</span>',
      std_questions : '<span class="en">Answer the questions as best as you can.</span><span class="ja">問題に答えなさい。</span>',
      std_written : '<span class="en">Complete the following problems.</span><span class="ja">次の問題に答えなさい。</span>',
      std_culture : '<span class="en">Answer the questions about Japanese culture as best as you can.</span><span class="ja">日本の文化について問題に答えなさい。</span>',
      std_stroke_order : '<span class="en">Practice drawing each kanji by following the stroke order.</span><span class="ja">それぞれの漢字の書き順を練習しなさい。</span>',
      std_drawing : '<span class="en">Practice drawing the following kanji multiple times.</span><span class="ja">それぞれの漢字を何度も書きなさい。</span>',
      
      help_typing : '<span class="en">If you don\'t know how to type in Japanese on your computer, please visit our help page by <a href="../../../help/writing/{LOCAL}" target="_blank">clicking here</a>.</span><span class="ja">パソコンで日本語を入力する方法がわからない場合は、<a href="../../../help/writing/{LOCAL}" target="_blank">ヘルプページ</a>をご覧ください。</span>',
      
      // additional vocab info
      vocab_multi : '<span class="en">Choose the correct definition for each Japanese expression.</span><span class="ja">それぞれの言葉の正解の定義を選択しなさい。</span>',
      vocab_writing : '<span class="en">Practice spelling the following words/expressions.</span><span class="ja">それぞれの言葉を何度も書きなさい。</span>',
      vocab_fill : '<span class="en">Write the Japanese definition for the following words/expressions.</span><span class="ja">日本語でそれぞれの言葉の定義を書きなさい。</span>',
      
      // additional kana info
      kana_multi : '<span class="en">Choose the correct Romaji for the %{KANA}.</span><span class="ja">%{KANA}のローマ字を選択しなさい。</span>',
      kana_writing : '<span class="en">Practice writing the following %{KANA}.</span><span class="ja">%{KANA}を書きなさい。</span>',
      kana_fill : '<span class="en">Complete the chart by filling in the Romaji.</span><span class="ja">チャートでローマ字を書き込みなさい。</span>',
      
      // addition number info
      num_multi : '<span class="en">Read the Japanese and choose the correct numbers.</span><span class="ja">日本語を読んで正解の数を選択しなさい。</span>',
      num_writing : '<span class="en">Practice spelling the following numbers.</span><span class="ja">それぞれの数を書きなさい。</span>',
      num_fill : '<span class="en">Write the following numbers in Japanese (hiragana).</span><span class="ja">平仮名でそれぞれの数を書きなさい。</span>',
      
      kanji_readings_multi : '<span class="en">Choose the correct readings for each kanji.</span><span class="ja">それぞれの漢字の正解の読み方を選択しなさい。</span>',
      kanji_readings_drag : '<span class="en">Match each kanji with their readings.</span><span class="ja">それぞれの漢字を正解の読み方に合わせなさい。</span>',
      kanji_yomikata : '<p class="en" style="margin-top:10px;margin-bottom:0;">▶ indicates the <em>onyomi</em> (pronunciation originally borrowed from Chinese).<br>▷ indicates the <em>kunyomi</em> (native Japanese reading).</p><p class="ja" style="margin-top:10px;margin-bottom:0;">「▶」は音読み（中国の読み方）<br>「▷」は訓読み（日本の読み方）</p>',
      
      kanji_meanings_multi : '<span class="en">Choose the correct meanings for each kanji.</span><span class="ja">それぞれの漢字の正解の意味を選択しなさい。</span>',
      kanji_meanings_drag : '<span class="en">Match each kanji with their meanings.</span><span class="ja">それぞれの漢字を正解の意味に合わせなさい。</span>',
      
      chat : '<span class="en">Chat with Kan-tan!</span><span class="ja">カンたんと話しましょう！</span>',
      
      end_quiz : '<span class="en">End Quiz</span><span class="ja">テストを終了する</span>',
      
      // options for exercise variations
      opts : {
        kana : {
          kana : 'Drag and Drop',
          multi : 'Multiple Choice',
          writing : 'Writing Practice',
          fill : 'Fill in the Chart'
        },
        
        numbers : {
          drag : 'Drag and Drop',
          multi : 'Multiple Choice',
          writing : 'Spelling Practice',
          fill : 'Write the Numbers'
        },
        
        kanji : {
          multi : 'Multiple Choice',
          drag : 'Drag and Drop'
        },
        
        vocab : {
          drag : 'Drag and Drop',
          multi : 'Multiple Choice',
          writing : 'Spelling Practice',
          fill : 'Write the Definition',
          vocab_fill : 'Write the Definition'
        },
        
        practice : {
          fill : 'Written',
          multi : 'Multiple Choice',
          drag : 'Drag and Drop'
        },
        
        stroke : {
          stroke : 'Stroke Order Practice',
          drawing : 'Extended Drawing Practice'
        }
      },
      
      mistakes : '<span class="en">The items outlined in <span class="t-red t-bold">red</span> were answered wrong before finding the correct answer. Review these problems before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>問題は不正解です。この問題を復習してやり直してください。</span>',
      writing_mistakes : '<span class="en">The items outlined in <span class="t-red t-bold">red</span> were answered wrong. Review these problems before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>問題は不正解です。この問題を復習してやり直してください。</span>',
      multi_mistakes : '<span class="en">The answers you selected that were wrong are outlined in <span class="t-red t-bold">red</span>. The correct answers are outlined in <span class="t-blue t-bold">blue</span>. Review these problems before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>問題は不正解で、正解の答えは<span class="t-blue t-bold">青い</span>です。この問題を復習してやり直してください。</span>',
      stroke_mistakes : '<span class="en">The characters you drew that were wrong are outlined in <span class="t-red t-bold">red</span>. Please review the stroke order and number of strokes for these characters before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>漢字は不正解です。書き順を復習してやり直してください。</span><br><br><b>Note:</b> Sometimes answers may be marked wrong by mistake, due to a mismatch in the recognition algorithm.<br>Please use your own discretion if this occurs.',
      fill_mistakes : '<span class="en">The items underlined in <span class="t-red t-bold">red</span> were answered wrong, the correct answers are listed underneath in <span class="t-green t-bold">green</span>. Review these problems before trying again.</span><span class="ja">正解は<span class="t-red t-bold">赤い下線</span>の問題の下に<span class="t-green t-bold">緑色</span>で書かれています。この問題を復習してやり直してください。</span>',
      chat_mistakes : 'The answers you selected that were wrong are marked with the <span class="reply-wrong"></span> label. Review Kan-tan\'s advice under these answers before trying again.',
      sub_answers : '<b>Note:</b> Answers inside <span class="t-blue t-bold">blue</span> parentheses separated by "<span class="alt-phrase-sep">/</span>" are a list of possible sub-answers; only one can be used.<br>For example.. <span class="t-green"><span class="alt-phrase">(</span>あの<span class="alt-phrase-sep">/</span>その<span class="alt-phrase">)</span>ねこ</span>: そのねこ or あのねこ <span class="t-green">(good)</span> vs あの/そのねこ <span class="t-red">(bad)</span><br><span class="t-green"><span class="alt-phrase">(</span>この<span class="alt-phrase-sep">/</span><span class="alt-phrase">)</span>ねこ</span> means the sub-answer is optional; it can be left out.',
      
      // buttons
      // review button for drag/drop exercises
      review : '<div id="review-exercise" class="center clearfix"><button id="review-button" class="button purple" onclick="Kantan.review();"><i class="fa">&#xf02d;</i><span class="en">Review</span><span class="ja">復習する</span></button></div>',
      // furigana toggle for vocab exercises <i class="fa">&#xf2a8;</i>
      toggle_furigana : '<button id="toggle-furigana" class="button furigana-button" onclick="Kantan.toggle.furigana();"><ruby class="furigana-icon">読<rt>よ</rt></ruby><span class="en">Furigana: <span class="furigana-show">OFF</span><span class="furigana-hide">ON</span></span><span class="ja">振り仮名：<span class="furigana-show">OFF</span><span class="furigana-hide">ON</span></span></button>',
      // toggles Romaji Input mode
      romaji_input_on : '<button id="toggle-romaji-input" class="button" onclick="Kantan.toggle.romajiInput(this);"><i class="fa">&#xf11c;</i><span class="en">Romaji Input: </span><span class="ja">ローマ字入力：</span>ON</button>',
      romaji_input_off : '<button id="toggle-romaji-input" class="button opt-off" onclick="Kantan.toggle.romajiInput(this);"><i class="fa">&#xf11c;</i><span class="en">Romaji Input: </span><span class="ja">ローマ字入力：</span>OFF</button>',
      // check answers button for written exercises
      check_answers : '<div id="check-answers" class="center"><button id="check-answers-button" class="button green" onclick="Kantan.check.answers();"><i class="fa">&#xf00c;</i><span class="en">Check Answers</span><span class="ja">答え合わせをする</span></button></div>',
      // check answer button for single problems
      check_answer : KN_Lang == 'en' ? 'Check answer' : '答えを確認する',
      // button that returns the user to the dictionary after practicing selected vocab
      back_to_dict : '<button class="button" onclick="Kantan.reset();"><i class="fa">&#xf021;</i><span class="en">Back to Dictionary</span><span class="ja">辞書に戻る</span></button>',
      // mark read button
      marked_read : '<i class="fa">&#xf046;</i><span class="en">Read</span><span class="ja">既読</span>',
      marked_unread : '<i class="fa">&#xf096;</i><span class="en">Unread</span><span class="ja">未読</span>'
    },

    // info about the currently active exercise
    active : {
      type : null, // current exercise type
      exercise : null, // placeholder for the active exercise's data
      index : 0, // index where active.exercise is located
      path : window.location.pathname.replace(/.*?\/lessons.*?\/(.*?\/.*?)\/.*/g, '$1'), // current exercise path
    },
    
    // exercise list
    exercises : window.KantanExercises || null,

    // scroll to the specified element: Kantan.scrollTo('#lesson-3')
    // scrolling can be delayed by passing a value that evaluates to true (true; 1; '.') to the second param; delay
    // the second param is mostly for script generated content, i.e. the exercises, since there's a small delay before the content is visible
    scrollTo : function (el, delay) {
      // check if el is a selector
      if (typeof el == 'string') {
        el = document.querySelector(el);
      }

      var scroll = function () {
        if (el) {
          document.body.scrollTop = el.offsetTop - 10;
          document.documentElement.scrollTop = el.offsetTop - 10;
        }
      };

      // scroll immediately or wait 100ms
      // the latter is for exercises, where there's a slight delay before content is available
      if (delay) {
        setTimeout(scroll, 100);
      } else {
        scroll();
      }
    },

    
    // quiz types
    // feel free to use as a reference for selecting types or within code as Kantan.QuizType.TYPE
    QuizType : {
      DRAG: 'drag',
      KANA: 'kana',
      WRITING: 'writing',
      MULTI: 'multi',
      FILL: 'fill',
      VOCAB_FILL: 'vocab_fill', // multiple choice like written exercise
      STROKE: 'stroke',
      DRAWING: 'drawing'
    },

    // To generate a quiz simply pass an object with the necessary data (see vocab-1/index.html and other quiz files for examples)
    generateQuiz : function (o) {
      // cache exercise data for resetting exercises
      if (!Kantan.exerciseData && window.JSON) {
        Kantan.exerciseData = JSON.stringify(o);
      }
      
      /***********************************
      =========# EXERCISE TYPES #=========
      ************************************
      ** 0. EXERCISE TYPE SELECTION     **
      ** 1. DRAG AND DROP               **
      ** 2. KANA DRAG AND DROP          **
      ** 3. WRITING PRACTICE            **
      ** 4. MULTIPLE CHOICE             **
      ** 5. FILL IN THE BLANKS          **
      ** 6. STROKE ORDER                **
      ** 7. DRAWING PRACTICE            **
      ** 8. WRITTEN VOCAB               **
      ** 9. LET'S CHAT WITH KAN-TAN     **
      ************************************/
      var zone = document.getElementById('quiz-zone'); // area where quizzes are inserted
      
      // # 0. EXERCISE TYPE SELECTION #
      // mainly for exercises that provide multiple exercise variations
      // handles switching and conversion of exercises
      if (typeof o.type === 'object') {
        // the `begin` query in the URL determines the exercise to immediately start (without popup confirmation)
        // example: https://sethclydesdale.github.io/kantan-japanese/lessons/lesson-1/vocab-1/?begin=0 (this starts multiple choice, 1 would start drag and drop)
        // `begin` or `start` may be used equally, whichever is preferred.
        var begin = /(?:begin|start)=\d/.test(window.location.search) ? window.location.search.replace(/.*?(?:begin|start)=(\d).*/, '$1') : false,
            i = 0, j = o.type.length, opts = '', modal;
        
        // parse options
        for (; i < j; i++) {
          opts += '<option value="' + i + '"' + (begin !== false ? (i == begin ? ' selected' : '') : storageOK && localStorage['KN_pref_' + o.format] == o.type[i] ? ' selected' : '') + '>' + Kantan.lang.opts[o.format][o.type[i]] + '</option>';
        }
        
        // japanese language for exercise types
        if (KN_Lang == 'ja') {
          opts = opts.replace('Drag and Drop', 'ドラッグ＆ドロップ')
                     .replace('Multiple Choice', '選択式')
                     .replace('Writing Practice', '書き練習')
                     .replace('Spelling Practice', 'スペルの練習') 
                     .replace('Write the Definition', '言葉を書く') 
                     .replace('Written', '筆記テスト')
                     .replace('Stroke Order Practice', '書き順の練習')
                     .replace('Extended Drawing Practice', '連続の書き順の練習')
                     .replace('Drawing Practice', '連続の書き順の練習')
                     .replace('Fill in the Chart', 'チャートを書き込む')
                     .replace('Write the Numbers', '数を書く');
        }
        
        // open selection window
        modal = KantanModal.open({
          title : '<span class="en">Please Select an Exercise Type</span><span class="ja">練習型を選択してください</span>',
          content : '<span class="en">Please select the type of exercise you would like to do, then click "Begin" to start studying.</span><span class="ja">練習型を選択してから練習を始めるために「始める」をクリックしてください。</span><br><br>'+
          '<div class="center">'+
            (/\/dictionary\/|\/custom-vocab\//.test(window.location) ? '' : '<div>'+
              '<b><span class="en">Current Exercise</span><span class="ja">今の練習</span></b><br>'+
              document.title.replace(/ \| Kantan Japanese.*$/, '')+
            '</div><br>')+
            
            '<div>'+
              '<b><span class="en">Exercise Type</span><span class="ja">練習型</span></b><br>'+
              '<select id="exercise-type">' + opts + '</select>'+
            '</div><br>'+
            
            '<div title="' + (KN_Lang == 'ja' ? '練習型を変更したいなら練習ページの下の「練習型を変更する」をクリックしてください。' : 'The exercise type can still be changed via the Change Exercise Type button at the bottom of an exercise.') + '">'+
              '<input id="modal-skip-ex-type" class="kantan_input_hidden" type="checkbox"' + (Kantan.pref.skipTypeSelect == 'true' ? ' checked' : '') + ' onchange="localStorage.KN_SkipTypeSelect = Kantan.pref.skipTypeSelect = this.checked">'+
              '<span tabindex="0" class="kantan_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
              '<label class="checkbox-label" for="modal-skip-ex-type"><span class="en">Skip Exercise Type Selection</span><span class="ja">練習型の選択をスキップする</span></label>'+
            '</div>'+
          '</div>',
          
          buttonHTML : '<span class="en">Begin</span><span class="ja">始める</span>',
          buttonColor : 'green',
          noClose : 1,
          zIndex : 'low',
          
          // generate quiz with selected type
          callback : function () {
            var type = document.getElementById('exercise-type').value;
            
            o.type = o.type[type];
            o.info = typeof o.info == 'object' && o.info[type] ? o.info[type] : o.info;
            
            // store exercise preference
            if (storageOK) {
              localStorage['KN_pref_' + o.format] = o.type;
            }
            
            // convert the quizlet to the selected type
            // vocab, kana, and number conversions
            if (/vocab|kana|numbers|kanji/.test(o.format)) {
              
              // reformats the quizlet for kana exercises, so that they can be converted to other exercise types
              if (o.format == 'kana' && o.type != 'kana') {
                var kana = {}, i, k;
                
                for (i in o.quizlet) {
                  for (k in o.quizlet[i]) {
                    kana[k] = o.quizlet[i][k];
                  }
                }
                
                o.quizlet = kana;
                
                // also change the info description
                o.info = o.info.replace('%{KANA}', (Kantan.active.exercise ? Kantan.active.exercise[1] : document.title).replace(/.*?(Hiragana|Katakana).*/, '$1'));
              }
              
              // formats kanji for readings quizzes
              if (o.format == 'kanji') {
                
                // kanji readings modifications
                if (o.readings) {
                  var i;

                  // add on and kun arrows to the readings
                  for (i in o.quizlet) {
                    var yomikata = o.quizlet[i].split('|');
                    o.quizlet[i] = 
                      (yomikata[0] ? '<span class="yomikata" title="' + ( KN_Lang == 'ja' ? '音読み' : 'on-yomi' ) + '">▶</span>' + yomikata[0] + '<br>' : '')+
                      (yomikata[1] ? '<span class="yomikata" title="' + ( KN_Lang == 'ja' ? '訓読み' : 'kun-yomi' ) + '">▷</span>' + yomikata[1] : '');
                  }

                  // add on/kun after the info box
                  o.info += Kantan.lang.kanji_yomikata;
                }
                
                // special classes for kanji readings and meanings
                if (o.type == 'drag' || o.type == 'multi') {
                  document.getElementById('exercise').className += o.readings ? ' kanji-readings' : o.meanings ? ' kanji-meanings' : '';
                }
              }
              
              // BEGIN conversion conditions for vocab or kana
              // multi-choice conversion
              if (o.type == 'multi') {
                var quizlet = [], keys = [], keys2 = [], currentAnswer, sentence, rubySentence, answer, answers, def, i, j, k, n, n2;
                
                // get keys for randomization of the vocabulary
                for (i in o.quizlet) {
                  keys.push(i);
                  keys2.push(i);
                }
                
                // randomly sort the vocab
                for (i = 0, j = keys.length; i < j; i++) {
                  n = Math.floor(Math.random() * keys.length);
                  def = keys[n].split('|');
                  currentAnswer = o.quizlet[keys[n]].replace(/\|.*?$/, '');
                  sentence = /\|/.test(o.quizlet[keys[n]]) ? o.quizlet[keys[n]].replace(/.*?\|(.*?$)/, '$1') : '';
                  rubySentence = /<ruby>/i.test(sentence);
                  
                  // push the question data
                  // kanji format conversion
                  if (o.format == 'kanji') {
                    var kanjiData = Kantan.kanji[def[0]];
                    
                    quizlet.push({
                      question : '<div class="kanji-data columns-3-in">'+
                        '<div class="kanji-container big-kanji">' + (def[1] ? '<ruby>' : '') + def[0] + (def[1] ? '<rt>' + def[1] + '</rt></ruby>' : '') + '</div>'+
                        (kanjiData ? // additional kanji data that is only shown after answering
                        '<div class="kanji-info">'+
                          (kanjiData.meaning ? '<div><span class="label">Meaning:</span>' + kanjiData.meaning + '</div>' : '')+
                          (kanjiData.onyomi ? '<div><span class="label">Onyomi:</span>' + kanjiData.onyomi + '</div>' : '')+
                          (kanjiData.kunyomi ? '<div><span class="label">Kunyomi:</span>' + kanjiData.kunyomi + '</div>' : '')+
                          (kanjiData.strokes ? '<div><span class="label">Strokes:</span>' + kanjiData.strokes + '</div>' : '')+
                        '</div>'+
                        '<div class="kanji-examples">' + Kantan.parse.exampleWords(kanjiData.example_words) + '</div>' :
                        '')+
                      '</div>',
                      answers : ['A' + currentAnswer]
                    });
                  }
                  
                  // standard conversion
                  else {
                    quizlet.push({
                      question : '<div class="multi-vocab">'+
                      '<ruby>' + def[0] + (def[1] ? '<rt>' + def[1] + '</rt></ruby>' : '<rt class="no-select">　</rt></ruby>')+
                      (Kantan.vocab ? Kantan.create.vocabAudio(def) : '')+
                      '<div class="multi-vocab-tags">' + (Kantan.vocab ? Kantan.parse.vocabTags(def, { excludeTextbooks : true }) : '') + '</div>'+
                      (sentence ? '<div class="multi-vocab-sentence"><hr>' + (rubySentence ? '' : '<ruby>') + sentence + (rubySentence ? '' : '<rt class="no-select">　</rt></ruby>') + '</div>' : '')+
                      '</div>',
                      answers : ['A' + currentAnswer]
                    });
                  }
                  
                  
                  // randomly assign answers
                  answers = keys2.slice();
                  answers.splice(n, 1);
                  k = 3;
                  
                  while (k --> 0) {
                    if (answers.length) {
                      n2 = Math.floor(Math.random() * answers.length);
                      answer = o.quizlet[answers[n2]].replace(/\|.*?$/, '');
                      
                      // prevent identical answers from showing
                      if (answer == currentAnswer) {
                        k++; // increment to try another
                      }
                      // otherwise add a new answer if it's not identical
                      else {
                        quizlet[i].answers.push(answer.charAt(0) == 'A' ? '!' + answer : answer);
                      }
                      
                      answers.splice(n2, 1);
                    } else {
                      break; // break out if there's no more answers, to prevent errors
                    }
                  }
                  
                  // remove the key
                  keys.splice(n, 1);
                }
                
                o.quizlet = quizlet;
              }
              
              // spelling practice conversion
              else if (o.type == 'writing') {
                var quizlet = {}, split, i;
                
                for (i in o.quizlet) {
                  split = i.split('|');
                  
                  // words which contain '／' have multiple variations, as such we should loop through and add these separately
                  for (var a = split[0].split('／'), b = 0, c = a.length, furi; b < c; b++) {
                    furi = split[1] ? split[1] : o.format == 'kana' ? o.quizlet[i] : '';
                    quizlet[a[b].replace(/\(.*?\)|（.*?）|～/g, '')] = furi;

                    // add additional variations if the word/expression contains optional parts
                    if (/\(.*?\)|（.*?）/.test(a[b])) {
                      quizlet[a[b].replace(/～|\(|\)|（|）/g, '')] = furi;
                    }
                  }
                }
                
                o.quizlet = quizlet;
                o.columns = 6;
              }
              
              // write the definition conversion
              else if (o.type == 'fill') {
                // written format for vocab
                if (/vocab|numbers/.test(o.format)) {
                  var quizlet = '<div class="count-problems columns-2 clear"><div>',
                      keys = [], def, problem, i, j, n;

                  // get keys
                  for (i in o.quizlet) {
                    keys.push(i);
                  }

                  // parse written quiz
                  for (i = 0, j = keys.length, n = Math.ceil(j/2); i < j; i++) {
                    def = keys[i].split('|');
                    
                    problem = ('{'+
                      // filter: /。|～/g (4 below)
                      // cannot be cached to a variable due to this bug: http://blog.stevenlevithan.com/archives/es3-regexes-broken
                      def[0].replace(/。|～/g, '')+ // answer 1
                      (def[1] ? '|' + def[1].replace(/。|～/g, '') : '')+ // answer 2
                      (/。|～/g.test(def[0]) ? '|' + def[0] : '')+ // unfiltered answer 1
                      (def[1] && /。|～/g.test(def[1]) ? '|' + def[1] : '')+ // unfiltered answer 2
                      // additional parsing
                    '}').replace(/\((.*?)\)/g, '%($1/)').replace(/（(.*?)）/g, '%($1/)') // adds optional sub-answers
                        .replace(/／/g, '|'); // adds additional answers
                    
                    quizlet += 
                    (i == n ? '</div><div>' : '')+ // changes columns
                    '<div class="problem">'+
                      o.quizlet[keys[i]].replace(/\|.*?$/, '') + '<br>'+
                      // add '|answer' flag to problem if it contains a horizontal bar
                      // the horizontal bar indicates multiple answers in this instance
                      (/\|/.test(problem) ? problem.replace('}', '|answer}') : problem)+ 
                    '</div>'; 
                    
                  }
                  
                  o.quizlet = quizlet + '</div></div>';
                }
                
                // written format for kana
                else if (o.format == 'kana') {
                  o.quizlet = o.chart;
                }
              }
            }
            
            // practice exercise variations, typically multiple choice
            // switches to either multi or fill (written test)
            else if (o.format == 'practice') {
              o.quizlet = o.quizlet[type]; // variations are handled file-side for better control
              
              var img = document.querySelector('.multi-quiz-image');
              
              // hide multi-choice images if written test is chosen
              if (o.type == 'fill' && img) {
                img.style.display = 'none';
              }
              
              // show multi-choice images if multiple choice is chosen
              else if (o.type == 'multi' && img) {
                img.style.display = '';
              }
            }
            
            // finally, launch the quiz
            Kantan.generateQuiz(o);
            
            // set exercise type changing to false so exercises will automatically start on retry if KN_SkipTypeSelect is enabled
            Kantan.changingExType = false;
          }
        });
        
        // auto start the exercise if "begin=NUMBER" is specified in the URL. OR Exercise Type Selection Skipping is Enabled
        // NUMBER should be the index of the drop down exercise types, starting at 0 for the first, 1 for the second, and so on..
        if (!Kantan.changingExType && (begin !== false || Kantan.pref.skipTypeSelect == 'true')) {
          modal.callback();
          KantanModal.close();
        }
        
        // create button to change exercise type (eliminates the need to press refresh or F5)
        Kantan.create.exerciseTypeButton();
        
        return false;
      }
      
      // log current type
      Kantan.active.type = o.type;
      
      // format grammar index links in the quiz info
      if (/\!GRI/.test(o.info)) {
        o.info = o.info.replace(/\{.*?\}/g, function (match) {
          var data = match.slice(1, match.length - 1).split('|'), hint, flag, sub, width, placeholder;
          return '<a href="' + getPaths() + 'lessons/references/grammar-index/' + Kantan.local + '#' + data[2] + '" target="_blank"' + ((Kantan.local && !Kantan.debug) ? '' : ' onclick="Kantan.getGrammarPoint(this, \'' + data[2] + '\'); return false;"') + '>' + data[1] + '</a>';
        });
      }

      // # 1. DRAG AND DROP #
      if (o.type == 'drag') {
        var quiz = '<div id="quiz-info" class="info-box"><div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '</div></div><div id="question-list">',
            dropList = '<div id="drop-list">',
            keysQ = [],
            keysA,
            key,
            helper,
            helperPresent,
            i;

        // generate a key list for the quizlet so we can randomly sort questions and answers
        for (i in o.quizlet) {
          keysQ.push(i);
        }
        keysA = keysQ.slice(0);

        // generate the questions
        while (keysQ.length) {
          i = Math.floor(Math.random() * keysQ.length);
          
          // | is used to separate a word from a helper
          helper = /\|/.test(keysQ[i]) ? 'data-helper="' + keysQ[i].split('|').pop() + '"' : null;
          
          // key for vocab data
          key = /\|/.test(keysQ[i]) ? keysQ[i].split('|').pop() : keysQ[i];
          
          // add the quiz items and drop zones
          quiz += '<div class="quiz-item-group">'+
            '<div class="quiz-item" ' + (helper || '') + '>'+
              (helper ? keysQ[i].replace(/(.*?)\|(.*)/, '$1<span class="hidden-text">$2</span>') : keysQ[i])+ // kanji + furigana
              // example sentence button
              (Kantan.vocab ? Kantan.create.vocabExample(key, true) : '')+ 
            '</div>'+
          '</div>';
          
          dropList += '<div tabindex="0" class="quiz-answer-zone' + (/\|/.test(keysQ[i]) ? ' helper-answer' : '') + '" data-text="' + keysQ[i].replace(/\|.*?$/, '') + '" data-mistakes="0"></div>';
          keysQ.splice(i, 1);
          
          ++Kantan.stats.problems;
          
          // indicate that a helper, such as furigana, is present
          if (!helperPresent && helper) {
            helperPresent = true;
          }
        }
        quiz += '</div>' + dropList + '</div>'; // close the question list and add the drop list
        
        // generate the answers
        quiz += '<div id="answer-list-container"><div id="answer-list-box"><div id="answer-list">';
        while (keysA.length) {
          i = Math.floor(Math.random() * keysA.length);
          quiz += '<div tabindex="0" class="quiz-item" data-answer="' + keysA[i].replace(/\|.*?$/, '') + '"><div class="quiz-item-text">' + o.quizlet[keysA[i]].replace(/\|.*?$/, '') + '</div></div>';
          keysA.splice(i, 1);
        }
        quiz += '</div></div></div>'; // close the answer list
        
        // add the quiz to the document
        zone.innerHTML = quiz.replace('id="question-list"', 'id="question-list"' + (helperPresent ? ' class="helper-present"' : '')) + Kantan.lang.review.replace('</div>', Kantan.lang.toggle_furigana + '</div>');
        
        // change the vocab orientation so that it's horizontal
        Kantan.toggle.vocabOrientation('false');
      }


      // # 2. KANA DRAG AND DROP #
      else if (o.type == 'kana') {
        var quiz = '<div id="quiz-info" class="info-box"><div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '</div></div><div id="question-list" class="clear">',
            answers = '<div id="answer-list-container"><div id="answer-list-box"><div id="answer-list">',
            kanaList = [],
            kana = o.quizlet,
            i = kana.length - 1,
            k, digraph;

        // create the columns for the student to drop the kana into
        for (; i > -1; i--) {
          quiz += '<div class="quiz-column">';

          // insert the romaji and empty container for dropping the kana
          for (k in kana[i]) {
            if (!digraph) digraph = k.length >= 2 ? ' digraph' : '';
            quiz += 
            '<div class="quiz-item-row">'+
              '<div tabindex="0" class="quiz-answer-zone' + digraph + '" data-text="' + kana[i][k] + '" data-mistakes="0"></div>'+
              '<div class="quiz-item' + digraph + '">' + kana[i][k] + '</div>'+
            '</div>';

            // put the kana into an array for later..
            kanaList.push('<div tabindex="0" class="quiz-item' + digraph + '" data-answer="' + kana[i][k] + '">' + k + '</div>');
            ++Kantan.stats.problems;
          }

          quiz += '</div>'; // close the column
        }

        // randomize the kana order, so the student cannot memorize the locations
        while (kanaList.length) {
          i = Math.floor(Math.random() * kanaList.length);
          answers += kanaList[i];
          kanaList.splice(i, 1);
        }

        // add the kana list to the document
        zone.innerHTML = quiz + '</div>' + answers + '</div></div></div>' + Kantan.lang.review;
      }


      // # 3. WRITING PRACTICE #
      else if (o.type == 'writing') {
        var quiz = '<div id="quiz-info" class="info-box"><div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '<br>' + Kantan.lang.help_typing.replace(/\{LOCAL\}/g, Kantan.local) + '</div></div><div id="question-list">',
            columns = o.columns,
            width = 'style="width:' + (100 / (columns + 1)) + '%;"',
            index = 0,
            helper = false,
            i, j, key;

        for (i in o.quizlet) {
          // key for vocab data
          key = o.quizlet[i] ? o.quizlet[i] : i;
          
          // create a new row
          quiz += '<div class="quiz-answer-row' + (o.quizlet[i] ? ' furi-row' : '') + '">'+
            '<div class="quiz-item" ' + (o.quizlet[i] ? 'data-helper="' + o.quizlet[i] + '"' : '') + ' ' + width + '>'+
              '<div class="quiz-item-text">' + i + '</div>'+
              // example sentence button
              (Kantan.vocab && Kantan.create.vocabExample(key, true))+
            '</div>';
          j = 0;

          // insert the writing zones
          while (columns --> 0) {
            quiz += '<div class="writing-zone" ' + width + '><input class="writing-zone-input" type="text" ' + ((!o.quiz && j++ < 3) ? 'placeholder="' + i + '"' : '') + ' data-answer="' + (o.quiz ? o.quizlet[i] : i) + '" data-mistakes="0" tabindex="0" ' + (o.quiz ? '' : 'oninput="Kantan.check.value(this);"') + ' onfocus="Kantan.input.index = ' + index++ + '"></div>';
            ++Kantan.stats.problems;
          }

          quiz += '</div>'; // close the row
          columns = o.columns; // reset column value for next iteration
        }
        
        // check if furigana is present and add a toggle button
        if (/data-helper/.test(quiz)) {
          helper = true;
        }

        // add the quiz to the document
        zone.innerHTML = quiz + '</div>' + Kantan.lang.check_answers.replace('</div>',
           Kantan.lang['romaji_input_' + (Kantan.pref.romajiInput == 'false' ? 'off' : 'on')]+
          (helper ? Kantan.lang.toggle_furigana + '</div>' : '')+
        '</div>');
        
        // add a class for non-practice writing exercises
        // this will remove helpers, forcing the student to recall what they learned
        if (o.quiz) {
          zone.className += ' no-helper';
        }
        
        // input field data
        Kantan.input = {
          map : document.querySelectorAll('.writing-zone-input'),
          index : 0
        };
        
        // auto-focus the first input field
        Kantan.input.map[0].autofocus = true;
        
        // activate Romaji Input if enabled
        if (Kantan.pref.romajiInput == 'true') Kantan.toggle.romajiInput(null, true);
      }


      // # 4. MULTIPLE CHOICE #
      else if (o.type == 'multi') {
        var quiz = '<div id="quiz-info" class="info-box"><div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '</div></div><div id="question-list">',
            answers = '<div id="answer-list">',
            option = 65, // used for tagging answers as A(65), B(66), C(67)..
            isAnswer = false,
            helper = false,
            vocab = /"format":"vocab"|"format":"kanji"/.test(Kantan.exerciseData),
            q = o.quizlet,
            i = 0,
            j = q.length,
            n;

        // create individual blocks for each question and hide them until later
        for (; i < j; i++) {
          quiz += '<div id="quiz-q' + i + '" class="question-block" data-qid="' + (i + 1) + '" style="display:none;"><div class="quiz-multi-question">' + (o.questionsAlignLeft ? '<div class="quiz-question-inner-text">' : '') + (typeof q[i].question != 'undefined' ? q[i].question.replace(/\{.*?\}/g, function (match) {
            var data = match.slice(1, match.length - 1).split('|');
          
            if (data[0] == '!IMG') {
              return Kantan.parse.image(data);
            }
          }) : '<div class="text-passage' + (q[i].vertical ? ' vertical-text' : '') + '" ' + (q[i].text.replace(/<br>/g, '').length < 50 ? 'style="text-align:center;"' : '') + '>' + q[i].text + '</div>' + (q[i].helper || '')) + (o.questionsAlignLeft ? '</div>' : '') + '</div>' + (vocab ? '<button class="button vocab-spoiler-toggle" onclick="Kantan.toggle.vocabSpoiler(this);"><i class="fa"></i><span class="en">Show Choices</span><span class="ja">選択肢を表示する</span></button><div class="vocab-spoiler">' : '');

          // ready-only questions contain text only, no answers
          if (q[i].text) {
            quiz += '<div class="quiz-multi-row"><div tabindex="0" class="button purple next-question" onclick="Kantan.progressQuiz(this, true);" onkeypress="event.key == \'Enter\' && Kantan.progressQuiz(this, true);"><span class="en">Next Question</span><span class="ja">次の問題</span></div></div>';
            ++Kantan.stats.exclude; // exclude this block from the overall score

          } else { // standard question block construction

            // add answers to the question block
            while (q[i].answers.length) {
              n = Math.floor(Math.random() * q[i].answers.length);

              // answers that begin with "A" are the correct answer. 'ATrue';
              // "!" is for answers that begin with "A", but aren't correct. '!Aomori Nebuta Festival'; lit. ! == NOT(correct)
              if (/^A|^\!/.test(q[i].answers[n])) {

                // marks the option as the correct answer if it begins with "A"
                if (q[i].answers[n].charAt(0) == 'A') {
                  isAnswer = true;
                }

                q[i].answers[n] = q[i].answers[n].slice(1);
              }

              quiz += '<div class="quiz-multi-row"><div tabindex="0" class="quiz-multi-answer" data-answer="' + isAnswer + '" data-option="' + String.fromCharCode(option++) + '" onclick="Kantan.progressQuiz(this);" onkeypress="event.key == \'Enter\' && Kantan.progressQuiz(this);"><div class="quiz-answer-inner-text">' + q[i].answers[n] + '</div></div></div>';
              isAnswer = false;

              q[i].answers.splice(n, 1);
            }

          }
          
          quiz +=  (vocab ? '</div>' : '') + '</div>'; // ends the question block
          option = 65; // resets the option id so the next answers begin with A, B, C..
          ++Kantan.stats.problems; // increment problems number
        }
        
        // check if furigana is present and add a toggle button
        if (/class="furigana"|class="inline-furi"|<ruby>/.test(quiz)) {
          helper = true;
        }
        
        // enables the vocab spoiler and other options for multi-choice if preferred
        if (vocab) {
          if (Kantan.pref.vocabSpoiler == 'true') zone.className += ' spoiler-mode';
          if (Kantan.pref.vocabTags == 'false') zone.className += ' vtags-off';
          if (Kantan.pref.exampleSentences == 'false') zone.className += ' reibun-off';
        }

        // add the multi-choice quiz to the quiz zone
        zone.innerHTML = quiz + '</div>'+
          '<div id="next-button" class="quiz-multi-row" style="margin-top:-20px; visibility:hidden;' + (Kantan.pref.feedbackMode == 'classic' ? 'display:none;' : '') + '"><div tabindex="0" class="button purple next-question" onclick="Kantan.showNextQuestion(this);" onkeypress="event.key == \'Enter\' && Kantan.showNextQuestion(this);"><span class="en">Next Question</span><span class="ja">次の問題</span></div></div>'+
          '<div id="quiz-progress"><div id="quiz-progress-bar"></div></div>'+
          '<div id="review-exercise" class="center clearfix">'+ 
            '<button id="multi-feedback-mode" class="button" onclick="Kantan.toggle.feedbackMode(this);"><i class="fa">&#xf05d;</i><span class="en">Feedback Mode: ' + (Kantan.pref.feedbackMode == 'classic' ? 'Classic' : 'Instant') + '</span><span class="ja">選択式モード：' + (Kantan.pref.feedbackMode == 'classic' ? 'クラシック' : 'インスタント') + '</span></button>'+
            (vocab ? '<button id="toggle-vocab-spoiler" class="button' + (Kantan.pref.vocabSpoiler == 'false' ? ' opt-off' : '') + '" onclick="Kantan.toggle.vocabSpoilerState(this);"><i class="fa">&#xf071;</i><span class="en">Spoiler: ' + (Kantan.pref.vocabSpoiler == 'true' ? 'ON' : 'OFF') + '</span><span class="ja">ネタバレ：' + (Kantan.pref.vocabSpoiler == 'true' ? 'ON' : 'OFF') + '</span></button>' : '')+
            (vocab ? '<button id="toggle-vtags" class="button' + (Kantan.pref.vocabTags == 'false' ? ' opt-off' : '') + '" onclick="Kantan.toggle.vocabTags(this);"><i class="fa">&#xf02b;</i><span class="en">Tags: ' + (Kantan.pref.vocabTags == 'true' ? 'ON' : 'OFF') + '</span><span class="ja">タッグ：' + (Kantan.pref.vocabTags == 'true' ? 'ON' : 'OFF') + '</span></button>' : '')+
            (vocab ? '<button id="toggle-reibun" class="button' + (Kantan.pref.exampleSentences == 'false' ? ' opt-off' : '') + '" onclick="Kantan.toggle.reibunState(this);"><i class="fa">&#xf037;</i><span class="en">Examples: ' + (Kantan.pref.exampleSentences == 'true' ? 'ON' : 'OFF') + '</span><span class="ja">例文：' + (Kantan.pref.exampleSentences == 'true' ? 'ON' : 'OFF') + '</span></button>' : '')+
            '<br>'+
            (Kantan.vocabJisho ? '' : '<button class="button text-selection-mode-button' + (Kantan.pref.textSelectMode == 'false' ? ' opt-off' : '') + '" onclick="Kantan.toggle.textSelection(this);"><i class="fa">&#xf246;</i><span class="en">Text Select Mode: ' + (Kantan.pref.textSelectMode == 'true' ? 'ON' : 'OFF') + '</span><span class="ja">テキスト選択モード：' + (Kantan.pref.textSelectMode == 'true' ? 'ON' : 'OFF') + '</span></button>')+
            (helper || o.readings || o.meanings ? Kantan.lang.toggle_furigana : '')+
          '</div>';
        
        // begin the quiz
        Kantan.progressQuiz('init');
      }
      
      
      // # 5. FILL IN THE BLANKS #
      else if (o.type == 'fill') {
        var helper = false;
        
        // check if furigana is present and add a toggle button
        if (/class="furigana"|class="inline-furi"|<ruby>/.test(o.quizlet)) {
          helper = true;
        }
        
        // disables the quick answer checker if preferred
        if (Kantan.pref.answerChecker == 'false') {
          zone.className += ' no-checking';
        }
        
        // add the quiz to the document
        zone.innerHTML = '<div id="quiz-info" class="info-box"><div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '<br>' + Kantan.lang.help_typing.replace(/\{LOCAL\}/g, Kantan.local) + '</div></div><div class="text-block">' + o.quizlet.replace(/\{.*?\}/g, function (match) {
          var data = match.slice(1, match.length - 1).split('|'), padding = 16, EN_margin = 1.8, hint, flag, sub, width, exclude, segment, placeholder;
          
          if (data[0] == '!IMG') {
            return Kantan.parse.image(data);
            
          } else if (data[0] == '!GRI') { // Grammar Index links
            return '<a href="' + getPaths() + 'lessons/references/grammar-index/' + Kantan.local + '#' + data[2] + '" target="_blank"' + ((Kantan.local && !Kantan.debug) ? '' : ' onclick="Kantan.getGrammarPoint(this, \'' + data[2] + '\'); return false;"') + '>' + data[1] + '</a>';
            
          } else if (data[0] == '!AUDIO') { // audio tracks
            return '<div class="audio-block center">'+
              '<audio id="' + data[1] + '" controls><source src="' + getPaths() + 'resources/audio/' + data[1] + '.mp3" type="audio/mpeg"></audio>'+
            '</div>';
            
          } else if (data[0] == '!PLAY') { // buttons for playing specific points of audio
            return '<button class="button play-button" onclick="Kantan.playAudio(\'' + data[1] + '\', ' + data[2] + ');"><i class="fa"></i></button>';
            
          } else if (data[0] == '!UNDERLINE') { // return underline input field
            for (var i = 1, j = data.length, str = '<span class="underline-field"><i class="underline-field-answer" style="display:none"><span class="writing-zone"><input class="writing-zone-input" type="text" data-answer="1"></span></i>', answer = false, correct = ''; i < j; i++) {
              // any answers prefixed with [A] are correct
              answer = /^\[A\]/.test(data[i]) ? 1 : 0;
              
              // if correct answer, strip out [A] and apply correct attribute
              if (answer) {
                if (!correct) correct = ' data-correct';
                data[i] = data[i].replace(/^\[A\]/, '');
              }
              
              str += '<span onclick="Kantan.underline(this, ' + answer + ');"' + correct + '>' + data[i] + '</span>';
            }
            
            return str + '</span>';
            
          } else {
            // Split the answer from the hint.
            // Syntax is {ANSWER|HINT|HIDE_HINT} HINT and HIDE_HINT is optional.
            // passing "answer" to HIDE_HINT will hide HINT and make it a secondary answer.
            // passing "furigana" to HIDE_HINT will hide HINT and make it furigana only to aid with reading.
            // passing "width:N" to HIDE_HINT will set the width of the field to N, manually. The hint will remain visible.
            // to show a hint along with a secondary answer, use this syntax: {ANSWER1|ANSWER2|answer;hint:HINT_TEXT}
            hint = data[1] ? data[1] : '',
            flag = ((data[10] || data[9] || data[8] || data[7] || data[6] || data[5] || data[4] || data[3] || data[2]) ? (data[10] || data[9] || data[8] || data[7] || data[6] || data[5] || data[4] || data[3] || data[2]) : '').split(';');
            
            // sub answer matches for answer 1 & 2 (used for calculating answer area width)
            if (/\%\((.*?)\)/.test(hint) || /\%\((.*?)\)/.test(data[0])) {
              sub = [
                data[0].match(/%\((.*?)\)/),
                hint.match(/%\((.*?)\)/)
              ];
            }

            ++Kantan.stats.problems; // increment problems number
            
            // set segmentation manually
            if (/segment/.test(flag)) {
              segment = /segment/.test(flag[0]) ? flag[0].split(':')[1] :
              flag[1] && /segment/.test(flag[1]) ? flag[1].split(':')[1] :
              flag[2] && /segment/.test(flag[2]) ? flag[2].split(':')[1] :
              flag[3] && /segment/.test(flag[3]) ? flag[3].split(':')[1] : null;
            }
            
            // ignore problem or words for TinySegmenter
            if (/exclude/.test(flag)) {
              exclude = /exclude/.test(flag[0]) ? flag[0].split(':')[1] :
              flag[1] && /exclude/.test(flag[1]) ? flag[1].split(':')[1] :
              flag[2] && /exclude/.test(flag[2]) ? flag[2].split(':')[1] :
              flag[3] && /exclude/.test(flag[3]) ? flag[3].split(':')[1] : 'all';
              if (!exclude && /exclude$/.test(flag)) exclude = 'all';
            }
            
            // set problem width manually
            if (/width:/.test(flag)) {
              width = /width:/.test(flag[0]) ? flag[0].split(':')[1] :
              flag[1] && /width:/.test(flag[1]) ? flag[1].split(':')[1] :
              flag[2] && /width:/.test(flag[2]) ? flag[2].split(':')[1] :
              flag[3] && /width:/.test(flag[3]) ? flag[3].split(':')[1] : 150;
            }
            
            // automatic width calculation for sub-answers %(../../../..) in answer 1 & 2; NOT getAlts
            else if (sub) {
              width = Math.max.apply(null, [
                (((
                  hint ? ((sub[0] && sub[0][1]) || '/').split('/').concat(((sub[1] && sub[1][1]) || '/').split('/')) :
                  ((sub[0] && sub[0][1]) || '/').split('/')
                ).sort(function (a, b) {
                    return b.length - a.length;

                })[0].length * (padding / (/[a-z]/i.test(hint || data[0]) && !/[\u3000-\u30FF]/.test(hint || data[0]) ? EN_margin : 1))) + padding) + (
                  ([hint.replace(/\%\((.*?)\)/g, ''), data[0].replace(/\%\((.*?)\)/g, '')].sort(function (a, b) {
                    return b.length - a.length;
                  })[0].length * (padding / (/[a-z]/i.test(hint || data[0]) && !/[\u3000-\u30FF]/.test(hint || data[0]) ? EN_margin : 1)))
                ),
                
                // width calculation from the hint flag
                (flag[1] && /hint:/.test(flag[1]) ? flag[1].split(':')[1] : flag[2] && /hint:/.test(flag[2]) ? flag[2].split(':')[1] : hint).length * (padding / (/[a-z]/i.test(flag[1] || flag[2]) && !/[\u3000-\u30FF]/.test(flag[1] || flag[2]) ? EN_margin : 1)) + padding
              ]);
            }
            
            // automatic width calculation between alternate answer params, %(../../../..), and hints
            else {
              width = Math.max.apply(null, [
                // automatic width calculation for answers 1-10
                data[0] ? data[0].length * (padding / (/[a-z]/i.test(data[0]) && !/[\u3000-\u30FF]/.test(data[0]) ? EN_margin : 1)) + padding : 0,
                data[1] ? data[1].length * (padding / (/[a-z]/i.test(data[1]) && !/[\u3000-\u30FF]/.test(data[1]) ? EN_margin : 1)) + padding : 0,
                flag[0] == 'answer' && data[3] && !/^%/.test(data[2]) ? data[2].length * (padding / (/[a-z]/i.test(data[2]) && !/[\u3000-\u30FF]/.test(data[2]) ? EN_margin : 1)) + padding : 0,
                flag[0] == 'answer' && data[4] && !/^%/.test(data[3]) ? data[3].length * (padding / (/[a-z]/i.test(data[3]) && !/[\u3000-\u30FF]/.test(data[3]) ? EN_margin : 1)) + padding : 0,
                flag[0] == 'answer' && data[5] && !/^%/.test(data[4]) ? data[4].length * (padding / (/[a-z]/i.test(data[4]) && !/[\u3000-\u30FF]/.test(data[4]) ? EN_margin : 1)) + padding : 0,
                flag[0] == 'answer' && data[6] && !/^%/.test(data[5]) ? data[5].length * (padding / (/[a-z]/i.test(data[5]) && !/[\u3000-\u30FF]/.test(data[5]) ? EN_margin : 1)) + padding : 0,
                flag[0] == 'answer' && data[7] && !/^%/.test(data[6]) ? data[6].length * (padding / (/[a-z]/i.test(data[6]) && !/[\u3000-\u30FF]/.test(data[6]) ? EN_margin : 1)) + padding : 0,
                flag[0] == 'answer' && data[8] && !/^%/.test(data[7]) ? data[7].length * (padding / (/[a-z]/i.test(data[7]) && !/[\u3000-\u30FF]/.test(data[7]) ? EN_margin : 1)) + padding : 0,
                flag[0] == 'answer' && data[9] && !/^%/.test(data[8]) ? data[8].length * (padding / (/[a-z]/i.test(data[8]) && !/[\u3000-\u30FF]/.test(data[8]) ? EN_margin : 1)) + padding : 0,
                flag[0] == 'answer' && data[10] && !/^%/.test(data[9]) ? data[9].length * (padding / (/[a-z]/i.test(data[9]) && !/[\u3000-\u30FF]/.test(data[9]) ? EN_margin : 1)) + padding : 0,
                
                // width calculation from the hint flag
                (flag[1] && /hint:/.test(flag[1]) ? flag[1].split(':')[1] : flag[2] && /hint:/.test(flag[2]) ? flag[2].split(':')[1] : hint).length * (padding / (/[a-z]/i.test(flag[1] || flag[2]) && !/[\u3000-\u30FF]/.test(flag[1] || flag[2]) ? EN_margin : 1)) + padding
              ]);
            }
            
            // placeholder texts
            placeholder =
              /placeholder:/.test(flag[0]) ? flag[0].split(':')[1] :
              flag[1] && /placeholder:/.test(flag[1]) ? flag[1].split(':')[1] :
              flag[2] && /placeholder:/.test(flag[2]) ? flag[2].split(':')[1] : null;
            
            // parse and return the input field
            return '<span class="writing-zone' + (/^!I|!MULTI:/.test(hint) ? ' multi-select' : ' standard-zone') + (/box:none/i.test(flag) ? ' no-box' : '') + '">'+
              '<input '+
                'class="writing-zone-input" '+
                'type="text" '+
                'data-answer="' + data[0] + '" '+
                (flag[0] == 'answer' ? 'data-answer2="' + hint + '" ' : '')+
                (flag[0] == 'answer' && data[3] ? 'data-answer3="' + data[2] + '" ' : '')+
                (flag[0] == 'answer' && data[4] ? 'data-answer4="' + data[3] + '" ' : '')+
                (flag[0] == 'answer' && data[5] ? 'data-answer5="' + data[4] + '" ' : '')+
                (flag[0] == 'answer' && data[6] ? 'data-answer6="' + data[5] + '" ' : '')+
                (flag[0] == 'answer' && data[7] ? 'data-answer7="' + data[6] + '" ' : '')+
                (flag[0] == 'answer' && data[8] ? 'data-answer8="' + data[7] + '" ' : '')+
                (flag[0] == 'answer' && data[9] ? 'data-answer9="' + data[8] + '" ' : '')+
                (flag[0] == 'answer' && data[10] ? 'data-answer10="' + data[9] + '" ' : '')+
                (flag[0] == 'furigana' ? 'data-furigana="' + hint + '" ' : '')+
                ((flag[0] == 'placeholder' || placeholder) ? 'placeholder="' + (placeholder || hint) + '" ' : '')+
                'data-mistakes="0" '+
                'tabindex="0" '+
                (exclude ? 'data-exclude="' + exclude + '" ' : '')+
                (segment ? 'data-segment="' + segment + '" ' : '')+
                'data-default-width="' + width + '" '+
                'style="width:' + (width * (Kantan.pref.fontSize ? (Kantan.pref.fontSize / 100) : 1)) + 'px;"'+
              '>'+
              (!/!I|!MULTI:/.test(hint) ? '<span class="answer-checker-container"><button class="button green answer-checker" title="' + Kantan.lang.check_answer + '" onclick="Kantan.check.answer(this);"><i class="fa">&#xf00c;</i></button></span>' : '')+
              ((hint && !/answer|furigana|placeholder/.test(flag[0]) || flag[1] && /hint:/.test(flag[1]) || flag[2] && /hint:/.test(flag[2])) ? '<span class="problem-hint' + ((flag[0] && /spoiler/.test(flag[0]) || flag[2] && /spoiler/.test(flag[2]) || flag[3] && /spoiler/.test(flag[3])) ? ' spoiler' : '') + '">' + (
                flag[1] && /hint:/.test(flag[1]) ? flag[1].split(':')[1] : 
                flag[2] && /hint:/.test(flag[2]) ? flag[2].split(':')[1] : hint
              
              ).replace(/(\!I.*?$|\!MULTI:.*?$)/, function (M, $1) { // text insert triggers (for particle/word selection exercises)
                if (/^!I|^!MULTI:/.test($1)) {
                  var splitter = !/／/.test($1) && /・/.test($1) ? '・' : '／', spacer = splitter, alpha = false, numeric = false, list = false, blank = false;
                  
                  // determine spacer used
                  if (/spacer/.test(flag[0])) {
                    // check if preset spacer
                    alpha = flag[0].split(':')[1] == 'alpha';
                    numeric = flag[0].split(':')[1] == 'numeric';
                    list = alpha || numeric ? true : false;
                    
                    // set spacer
                    spacer = (alpha || numeric) ? '' : flag[0].split(':')[1];
                  }
                  
                  // determine if background should be blank
                  if (flag[0] == 'nobg' || flag[1] == 'nobg') {
                    blank = true;
                  }
                  
                  // parse options
                  for (var trigger = $1.replace(/^!I|^!MULTI:/, '').split(splitter), i = 0, j = trigger.length, str = (!blank ? '<' + ( list ? 'ol' : 'div' ) + ' class="multi-selection' + ( alpha ? ' alpha' : numeric ? ' numeric' : '' ) + ' clear">' : ''); i < j; i++) {
                    str += (list ? '<li>' : '') + '<a href="#" onclick="Kantan.selectAnswer(this, ' + list + '); return false;" class="insert-trigger">' + trigger[i] + '</a>' + spacer + (list ? '</li>' : '');
                  }
                  
                  // remove stray spacer
                  if (!list) str = str.slice(0, str.length - spacer.length);
                  
                  // close list/block tags
                  if (!blank) str += list ? '</ol>' : '</div>';
                  
                  // return multi-selection field
                  return str;
                }
              }) + '</span>' : '')+
            '</span>';
          }
          
        })
        // chokai script toggler
        .replace(/<div id="script-(.*?)" class="chokai-script/g, '<div class="center"><button class="button" onclick="Kantan.toggle.chokaiScript(\'$1\');"><span class="en">Toggle Script</span><span class="ja">スクリプトをトグルする</span></button></div><div id="script-$1" class="chokai-script')+
          
        // buttons
        '</div>' + Kantan.lang.check_answers.replace('()', '(false, \'fill\')').replace('</div>',
           '<br>'+
           '<button id="toggle-insert-mode" class="button' + (Kantan.pref.easyMode == 'false' ? ' opt-off' : '') + '" onclick="Kantan.toggle.easyMode(this);"><i class="fa">&#xf0d0;</i><span class="en">Easy Mode: </span><span class="ja">イージーモード：</span>' + (Kantan.pref.easyMode == 'false' ? 'OFF' : 'ON') + '</button>'+
           Kantan.lang['romaji_input_' + (Kantan.pref.romajiInput == 'false' ? 'off' : 'on')]+
           (helper ? Kantan.lang.toggle_furigana : '')+
         '</div>'
        );
        
        // auto-focus the first input field
        document.querySelector('.writing-zone-input').autofocus = true;
        
        // activate easy mode if enabled
        if (Kantan.pref.easyMode == 'true') Kantan.initTinySegmenter();
        
        // activate Romaji Input if enabled
        if (Kantan.pref.romajiInput == 'true') Kantan.toggle.romajiInput(null, true);
      }
      
      
      // # 6. STROKE ORDER #
      else if (o.type == 'stroke') {
        var quiz = '<div id="quiz-info" class="info-box"><div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '</div></div><div id="question-list">',
            answers = '<div id="answer-list">',
            strokeNumbersHidden = Kantan.pref.strokeNumbers == 'false',
            strokeOrderHidden = Kantan.pref.strokeOrder == 'false',
            guideHidden = Kantan.pref.tracingGuide == 'false',
            q = o.quizlet,
            i = 0,
            j = q.length, img, readings;

        // create individual blocks for each question and hide them until later
        for (; i < j; i++) {
          if (q[i].kana) q[i].kanji = q[i].kana; // applies kana character to kanji property
          if (o.kanaType) o.kanaType = o.kanaType.charAt(0).toUpperCase() + o.kanaType.slice(1).toLowerCase();
          
          img = (/^\d+$|hi_\d+|ka_\d+|EX\d+/.test(q[i].order) ? getPaths() + 'resources/images/stroke-order/img/' + q[i].order + '.webp' : q[i].order);
          readings = q[i].reading ? q[i].reading.split('|') : '';
          
          // start question block
          quiz += '<div id="quiz-q' + i + '" class="question-block" data-qid="' + (i + 1) + '" style="display:none;">'+
            // kanji
            '<div class="quiz-multi-question">'+
              '<div class="kanji-data columns-3-in">'+
                '<div class="kanji-container big-kanji' + ( q[i].kana ? ' kana-font' : '' ) + '"' + (q[i].font ? ' style="font-family:' + q[i].font + '"' : '') + '>' + q[i].kanji + '</div>'+
                (q[i].kana ? '' :
                '<div class="kanji-info">'+
                  (q[i].meaning ? '<div><span class="label">Meaning:</span>' + q[i].meaning + '</div>' : '')+
                  (readings[0] ? '<div><span class="label">Onyomi:</span>' + readings[0] + '</div>' : '')+
                  (readings[1] ? '<div><span class="label">Kunyomi:</span>' + readings[1] + '</div>' : '')+
                  (q[i].strokes ? '<div><span class="label">Strokes:</span>' + q[i].strokes + '</div>' : '')+
                '</div>'+
                '<div class="kanji-examples">' + Kantan.parse.exampleWords(q[i].example_words) + '</div>')+
              '</div>'+
              '<div class="kanji-stroke-order">'+
                '<button class="button" onclick="Kantan.viewStrokeOrder(\'' + q[i].kanji + '\', \'' + q[i].order + '\', {animOnly:true' + (q[i].kana ? ',kana:\'' + o.kanaType.toLowerCase() + '\',strokes:' + q[i].strokes : '') + '});"><i class="fa">&#xf04b;</i><span class="en">Play Stroke Order</span><span class="ja">書き順を見る</span></button><br>'+
                '<div class="stroke-order-container"><img src="' + img + '" alt="' + ( KN_Lang == 'ja' ? '書き順' : 'stroke order' ) + '"/></div>'+
              '</div>'+
            '</div>'+
            
            // drawing area + buttons
            '<div class="quiz-multi-row">'+
              '<div class="kanji-canvas-stroke-count"><span class="label">Strokes Drawn:</span><span id="canvas-' + i + '-stroke-count">0</span>/' + q[i].strokes + '</div>'+
              '<canvas class="kanji-canvas" data-kanji="' + q[i].kanji + '" data-strokes="' + q[i].strokes + '" data-guide="' + (guideHidden ? false : true) + '"' + (q[i].kana && !q[i].font ? ' data-font="NotoSansJPWEB, NotoSansJP, SawarabiGothic, MS Gothic, Yu Gothic, Meiryo"' : q[i].font ? ' data-font="' + q[i].font + '"' : '') + ' id="canvas-' + i + '" width="200" height="200"' + (q[i].kana ? 'data-kana="true"' : '') + '></canvas>'+
            '</div>'+
            '<div class="kanji-canvas-actions quiz-multi-row center">'+
              '<button class="button" onclick="KanjiCanvas.erase(this.dataset.canvas)" data-canvas="canvas-' + i + '" title="(CTRL+X)"><i class="fa">&#xf12d;</i><span class="en">Erase</span><span class="ja">消す</span></button>'+
              '<button class="button" onclick="KanjiCanvas.deleteLast(this.dataset.canvas)" data-canvas="canvas-' + i + '" title="(CTRL+Z)"><i class="fa">&#xf0e2;</i><span class="en">Undo</span><span class="ja">取り消す</span></button>'+
              //'<button class="button" onclick="Kantan.check.kanji(this);" data-canvas="canvas-' + i + '" title="Check if stroke order is correct"><i class="fa">&#xf00c;</i><span class="en">Check</span><span class="ja">確認する</span></button>'+
            '</div>'+
            '<div class="quiz-multi-row">'+
              '<div tabindex="0" class="button purple next-question" onclick="Kantan.progressQuiz(this, false, \'stroke\');" onkeypress="event.key == \'Enter\' && Kantan.progressQuiz(this, false, \'stroke\');" data-canvas="canvas-' + i + '">' + (i + 1 == j ? Kantan.lang.end_quiz : '<span class="en">Next '+ (q[i].kana ? o.kanaType : 'Kanji') + '</span><span class="ja">次の' + (q[i].kana ? o.kanaType : '漢字') + '</span>') + '</div>'+
            '</div>'+
          // end question block
          '</div>';
          
          ++Kantan.stats.problems; // increment problems number
        }

        // add the quiz to the quiz zone
        zone.innerHTML = quiz + '</div><div id="quiz-progress"><div id="quiz-progress-bar"></div></div>'+
          '<div id="review-exercise" class="center clearfix">'+ 
            '<button id="toggle-stroke-order" class="button' + (strokeOrderHidden ? ' opt-off' : '') + '" onclick="Kantan.toggle.strokeOrder(this);"><i class="fa">&#xf1fc;</i><span class="en">Stroke Order: ' + (strokeOrderHidden ? 'OFF' : 'ON') + '</span><span class="ja">書き順：' + (strokeOrderHidden ? 'OFF' : 'ON') + 'する</span></button>'+
            '<button id="toggle-stroke-numbers" class="button' + (strokeNumbersHidden ? ' opt-off' : '') + '" onclick="Kantan.toggle.strokeNumbers(this);"><i class="fa">&#xf162;</i><span class="en">Stroke Numbers: ' + (strokeNumbersHidden ? 'OFF' : 'ON') + '</span><span class="ja">画数：' + (strokeNumbersHidden ? 'OFF' : 'ON') + 'する</span></button>'+
            '<br>'+
            '<button id="toggle-tracing-guide" class="button' + (guideHidden ? ' opt-off' : '') + '" onclick="Kantan.toggle.tracingGuide(this);"><i class="fa">&#xf031;</i><span class="en">Tracing Guide: ' + (guideHidden ? 'OFF' : 'ON') + '</span><span class="ja">トレースのガイド：' + (guideHidden ? 'OFF' : 'ON') + 'する</span></button>'+
            Kantan.lang.toggle_furigana+
          '</div>';
        
        // hide stroke order based on preferences
        if (strokeOrderHidden) {
          zone.className += ' stroke-order-hidden';
        }
        
        // set width of strokes
        KanjiCanvas.lineWidth = 8;
        
        // begin the quiz
        Kantan.progressQuiz('init', false, 'stroke');
      }
      
      
      // # 7. DRAWING PRACTICE #
      else if (o.type == 'drawing') {
        var quiz = '<div id="quiz-info" class="info-box"><div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '</div></div><div id="question-list">',
            strokeNumbersHidden = Kantan.pref.strokeNumbers == 'false',
            guideHidden = Kantan.pref.tracingGuide == 'false',
            columns = o.columns,
            width = 'style="width:' + (100 / (columns + 1)) + '%;"',
            q = o.quizlet, n = 0, i = 0, j = o.quizlet.length;

        for (; i < j; i++) {
          if (q[i].kana) q[i].kanji = q[i].kana; // applies kana character to kanji property
          
          // create a new row
          quiz += '<div class="quiz-answer-row">'+
          '<div class="drawing-zone" ' + width + '>'+
            '<div class="quiz-item">'+
              '<div class="quiz-item-text' + (q[i].kana ? ' kana-font' : '') + '"' + (q[i].font ? ' style="font-family:' + q[i].font + '"' : '') + '>' + q[i].kanji + '</div>'+
            '</div>'+
            '<button class="button stroke-order-button" onclick="Kantan.viewStrokeOrder(\'' + q[i].kanji + '\', \'' + q[i].order + '\', {strokes:' + q[i].strokes + (q[i].kana ? ',kana:\'' + o.kanaType.toLowerCase() + '\'' : '') + '}' + ');"><span class="en">Stroke Order</span><span class="ja">書き順を見る</span></button>'+
          '</div>';
          
          // insert the drawing zones
          while (columns --> 0) {
            quiz += '<div class="drawing-zone" ' + width + '>'+
              '<canvas class="kanji-canvas" data-kanji="' + q[i].kanji + '" data-guide="' + (o.columns - columns > 3 ? false : guideHidden ? false : true) + '"' + (q[i].kana && !q[i].font ? ' data-font="NotoSansJPWEB, NotoSansJP, SawarabiGothic, MS Gothic, Yu Gothic, Meiryo"' : q[i].font ? ' data-font="' + q[i].font + '"' : '') + ' data-strokes="' + q[i].strokes + '" data-size="100" id="canvas-' + n + '" width="110" height="110"' + (q[i].kana ? 'data-kana="true"' : '') + '></canvas>'+
              '<div class="kanji-canvas-actions">'+
                '<button class="button icon-only" onclick="KanjiCanvas.erase(this.dataset.canvas)" data-canvas="canvas-' + n + '" title="' + (KN_Lang == 'ja' ? '消す' : 'Erase') + ' (CTRL+X)"><i class="fa">&#xf12d;</i></button>'+
                '<button class="button icon-only" onclick="KanjiCanvas.deleteLast(this.dataset.canvas)" data-canvas="canvas-' + n + '" title="' + (KN_Lang == 'ja' ? '取り消す' : 'Undo') + ' (CTRL+Z)"><i class="fa">&#xf0e2;</i></button>'+
                (Kantan.debug ? '<button class="button icon-only" onclick="console.log(KanjiCanvas.recognize(this.dataset.canvas));" data-canvas="canvas-' + n + '" title="' + (KN_Lang == 'ja' ? 'テストする' : 'Test Recognition') + ' (CTRL+F)"><i class="fa">&#xf188;</i></button>' : '')+
              '</div>'+
            '</div>';
            ++Kantan.stats.problems;
            ++n; // increment unique canvas id
          }

          quiz += '</div>'; // close the row
          columns = o.columns; // reset column value for next iteration
        }

        // add the quiz to the document
        zone.innerHTML = quiz + '</div>' + Kantan.lang.check_answers.replace('()', '(false, \'drawing\')').replace('</div>', 
          '<button id="toggle-tracing-guide" class="button' + (guideHidden ? ' opt-off' : '') + '" onclick="Kantan.toggle.tracingGuide(this);"><i class="fa">&#xf031;</i><span class="en">Tracing Guide: ' + (guideHidden ? 'OFF' : 'ON') + '</span><span class="ja">トレースのガイド：' + (guideHidden ? 'OFF' : 'ON') + 'する</span></button>'+
          '<button id="toggle-stroke-numbers" class="button' + (strokeNumbersHidden ? ' opt-off' : '') + '" onclick="Kantan.toggle.strokeNumbers(this);"><i class="fa">&#xf162;</i><span class="en">Stroke Numbers: ' + (strokeNumbersHidden ? 'OFF' : 'ON') + '</span><span class="ja">画数：' + (strokeNumbersHidden ? 'OFF' : 'ON') + 'する</span></button>' + '</div>'
        );
        
        // initialize all canvases
        for (var c = document.querySelectorAll('.kanji-canvas'), i = 0, j = c.length; i < j; i++) {
          KanjiCanvas.init(c[i].id);
        }
        
        // set width of strokes
        KanjiCanvas.lineWidth = 6;
      }
      
      
      // # 8. WRITTEN VOCAB #
      else if (o.type == 'vocab_fill') {
        var quiz = '<div id="quiz-info" class="info-box"><div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '</div></div><div id="question-list">',
            keysQ = [],
            keysA = [],
            helper,
            helperPresent = false,
            rubySentence,
            n = 0,
            i;
        
        // enable kanji variants for answers as words with "often_kana" have their kanji variants automatically excluded
        // also swaps example sentences
        if (Kantan.vocabCache) {
          o.quizlet = Kantan.vocabQuizlet(Kantan.vocabCache, {
            forceKanji : true,
            swapExamples : true
          });
        }
        
        // generate a key list for the quizlet so we can randomly sort questions and answers
        for (i in o.quizlet) {
          keysA.push(i);
          keysQ.push(o.quizlet[i].split('|'))
        }
        
        // generate the questions
        while (keysA.length) {
          quiz += '<div id="quiz-q' + n + '" class="question-block" data-qid="' + (n + 1) + '" style="display:none;">';
          
          i = Math.floor(Math.random() * keysA.length);
          
          // | is used to separate a word from a helper
          helper = /\|/.test(keysA[i]) ? 'data-answer2="' + keysA[i].split('|').pop() + '"' : null;
          rubySentence = keysQ[i][1] ? /<ruby>/i.test(keysQ[i][1]) : false;
          
          // add the input zone
          quiz += 
          '<div class="quiz-multi-question">'+
            '<div class="multi-vocab fill-quiz">'+
              keysQ[i][0]+
              (Kantan.vocab ? '<div class="multi-vocab-tags">' + Kantan.parse.vocabTags(helper ? keysA[i].replace(/.*?\|(.*)/, '$1') : keysA[i], { excludeTextbooks : true }) + '</div>' : '')+
              (keysQ[i][1] ? '<div class="multi-vocab-sentence"><hr>' + (rubySentence ? '' : '<ruby>') + keysQ[i][1] + (rubySentence ? '' : '<rt class="no-select">　</rt></ruby>') + '</div>' : '')+
            '</div>'+
          '</div>'+
          '<div class="quiz-multi-row answering-zone center">'+
            '<span class="writing-zone" data-mistakes="0">'+
              '<input id="input-' + n + '" class="writing-zone-input" type="text" data-answer="' + (helper ? keysA[i].replace(/(.*?)\|.*/, '$1') : keysA[i]) + '" ' + (helper || '') + ' tabindex="0" onkeypress="event.key == \'Enter\' && this.value != \'\' && Kantan.check.vocabAnswer(this.id);">'+
              '<button class="button" onclick="if (document.getElementById(this.dataset.input).value == \'\') return false; Kantan.check.vocabAnswer(this.dataset.input)" data-input="input-' + n + '" title="' + Kantan.lang.check_answer + '"><i class="fa">&#xf00c;</i></button>'+
            '</span>'+
          '</div>'+
          '<div id="hint-' + n + '" class="quiz-multi-row vocab-hint center" style="display:none;">' + (helper ? keysA[i].replace(/(.*?)\|(.*)/, function (M, S1, S2) {
            return '<ruby>' + Kantan.maskString(S1.replace(/\(|\)|（|）/g, '')) + '<rt>' + Kantan.maskString(S2.replace(/\(|\)|（|）/g, '')) + '</rt></ruby>';
          }) :  Kantan.maskString(keysA[i])) + '</div>'+
          '<div class="quiz-multi-row vocab-hint center">'+
            '<button class="button" onclick="Kantan.vocabHint(this, this.dataset.hint)" data-hint="hint-' + n + '"><i class="fa">&#xf059;</i><span class="en">Show Hint</span><span class="ja">ヒントを表示する</span></button>'+
          '</div>'+
          '<div class="quiz-multi-row next-button-row">'+
            '<div tabindex="0" class="button purple next-question" onclick="Kantan.progressQuiz(this, false, \'vocab_fill\');" onkeypress="event.key == \'Enter\' && Kantan.progressQuiz(this, false, \'vocab_fill\');">' + (keysQ.length == 1 ? Kantan.lang.end_quiz : '<span class="en">Next Word</span><span class="ja">次の言葉</span>') + '</div>'+
          '</div>';
          keysA.splice(i, 1);
          keysQ.splice(i, 1);
          
          ++Kantan.stats.problems;
          
          // indicate that a helper, such as furigana, is present
          if (!helperPresent && helper) {
            helperPresent = true;
          }
          
          quiz += '</div>'; // ends the question block
          ++n;
        }
        
        // hide examples/tags if preferred
        if (Kantan.pref.vocabTags == 'false') zone.className += ' vtags-off';
        if (Kantan.pref.exampleSentences == 'false') zone.className += ' reibun-off';

        // add the quiz to the quiz zone
        zone.innerHTML = quiz + '</div>'+
          '<div id="quiz-progress"><div id="quiz-progress-bar"></div></div>'+
          '<div id="review-exercise" class="center clearfix">'+ 
            '<button id="toggle-vtags" class="button' + (Kantan.pref.vocabTags == 'false' ? ' opt-off' : '') + '" onclick="Kantan.toggle.vocabTags(this);"><i class="fa">&#xf02b;</i><span class="en">Tags: ' + (Kantan.pref.vocabTags == 'true' ? 'ON' : 'OFF') + '</span><span class="ja">タッグ：' + (Kantan.pref.vocabTags == 'true' ? 'ON' : 'OFF') + '</span></button>'+
            '<button id="toggle-reibun" class="button' + (Kantan.pref.exampleSentences == 'false' ? ' opt-off' : '') + '" onclick="Kantan.toggle.reibunState(this);"><i class="fa">&#xf037;</i><span class="en">Examples: ' + (Kantan.pref.exampleSentences == 'true' ? 'ON' : 'OFF') + '</span><span class="ja">例文：' + (Kantan.pref.exampleSentences == 'true' ? 'ON' : 'OFF') + '</span></button>'+
            Kantan.lang['romaji_input_' + (Kantan.pref.romajiInput == 'false' ? 'off' : 'on')]+
            (helperPresent ? Kantan.lang.toggle_furigana : '')+
          '</div>';
        
        // begin the quiz
        Kantan.progressQuiz('init', false, 'vocab_fill');
        
        var input = document.querySelector('.writing-zone-input');
        if (input) window.setTimeout(function () { input.focus() }, 100);
        
        // activate Romaji Input if enabled
        if (Kantan.pref.romajiInput == 'true') Kantan.toggle.romajiInput(null, true);
      }
      
      
      // # 9. LET'S CHAT WITH KAN-TAN #
      else if (o.type == 'chat') {
        var date = new Date(),
            birthday = date.getMonth() == 10 && date.getDate() == 20;
        
        // add the chat to the quiz zone
        zone.innerHTML =
          '<div id="quiz-info" class="info-box">'+
            '<div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text">' + o.info + '</div>'+
          '</div>'+
          '<div id="kantan-chat-container">'+
            '<div id="kantan-chat">'+
              '<div id="kantan-chat-title">'+
                '<i class="fa">&#xf086;</i>かんたんChat '+
                '<i id="kantan-chat-help" class="fa" tabindex="0" onclick="Kantan.chat.help();">&#xf128;</i>'+
                '<div id="kantan-chat-full" tabindex="0" onclick="Kantan.chat.toggleFullscreen(this);" title="Toggle full screen"><i class="fa">&#xf065;</i></div>'+
              '</div>'+
              '<div id="kantan-chat-messages">'+
                (/debug_chat=design/.test(window.location.href) ? // flag used for styling chat elements
                '<div class="chat-info">This is the beginning of your chat history with <b>Kan-tan</b>.</div>'+

                // combined messages
                '<div class="message-box left-side">'+
                  '<div class="message-avatar"><img src="' + getPaths() + 'resources/images/avatars/kan-tan.webp"></div>'+
                  '<div class="message-name">Kan-tan</div>'+
                  '<div class="message-list">'+
                    '<div class="message-row"><div class="message">おはようございます！</div></div>'+
                    '<div class="message-row"><div class="message">How are you doing today?</div></div>'+
                  '</div>'+
                '</div>'+

                // combined replies
                '<div class="message-box right-side">'+
                  '<div class="message-list">'+
                    '<div class="message-row"><div class="message">おはよう！</div></div>'+
                    '<div class="message-row"><div class="message">I\'m doing good!</div></div>'+
                  '</div>'+
                '</div>'+

                // message with image
                '<div class="message-box left-side">'+
                  '<div class="message-avatar"><img src="' + getPaths() + 'resources/images/avatars/kan-tan.webp"></div>'+
                  '<div class="message-name">Kan-tan</div>'+
                  '<div class="message-list">'+
                    '<div class="message-row"><div class="message">Look at this super cute backpack I bought yesterday!</div></div>'+
                    '<div class="message-row"><div class="message-image"><img src="' + getPaths() + 'resources/images/exercises/bag.webp"></div></div>'+
                  '</div>'+
                '</div>'+

                // single reply
                '<div class="message-box right-side">'+
                  '<div class="message-list">'+
                    '<div class="message-row"><div class="message">That\'s adorable!</div></div>'+
                  '</div>'+
                '</div>'+

                // multiple choice reply
                '<div class="message-box right-side">'+
                  '<div class="reply-box">'+
                    '<div class="reply-title"></div>'+
                    '<div class="reply-choice" tabindex="0" onclick="Kantan.chat.progress();">Reply 1</div>'+
                    '<div class="reply-choice" tabindex="0" onclick="Kantan.chat.progress();">Reply 2</div>'+
                  '</div>'+
                '</div>'+

                // multiple choice reply (scored)
                '<div class="message-box right-side">'+
                  '<div class="reply-box answer-box">'+
                    '<div class="reply-title"></div>'+
                    '<div class="reply-choice" tabindex="0" onclick="Kantan.chat.progress();">Reply 1</div>'+
                    '<div class="reply-choice" tabindex="0" onclick="Kantan.chat.progress();">Reply 2</div>'+
                  '</div>'+
                '</div>'+

                // input reply
                '<div class="message-box input-box right-side">'+
                  '<div class="reply-box">'+
                    '<div class="reply-title"></div>'+
                    '<div class="input-box-info">Input your name.</div>'+
                    '<div class="input-box-container">'+
                      '<input type="text" name="NAME">'+
                      '<button class="button" onclick="Kantan.chat.progress();"><i class="fa">&#xf1d8;</i>Send</button>'+
                    '</div>'+
                  '</div>'+
                '</div>'+

                 // typing placeholder
                '<div class="message-box left-side">'+
                  '<div class="message-avatar"><img src="' + getPaths() + 'resources/images/avatars/kan-tan.webp"></div>'+
                  '<div class="message-name">Kan-tan</div>'+
                  '<div class="message-list">'+
                    '<div class="message-row"><div class="message"><div class="typing-placeholder"><span></span><span></span><span></span></div></div></div>'+
                  '</div>'+
                '</div>'
                : 
                 // start screen for chat
                 '<div class="chat-info">Click the button below to begin chatting with <b>Kan-tan</b>!</div>'+
                 (birthday ? '<div class="bday-deco">'+
                   '<img src="' + getPaths() + 'resources/images/bday/bday-flag-left.webp">'+
                   '<img src="' + getPaths() + 'resources/images/bday/bday-flag-right.webp">'+
                 '</div>' : '')+
                 '<div class="chat-profile">'+
                   (birthday ? '<div class="bday-hat"><img src="' + getPaths() + 'resources/images/bday/bday-hat.webp">' : '')+
                   '<div class="chat-profile-avatar"><img src="' + getPaths() + 'resources/images/avatars/kan-tan.webp"></div>'+
                   (birthday ? '</div>' : '')+
                   '<div class="chat-profile-name">Kan-tan</div>'+
                   '<div class="chat-profile-status">Feeding stray cats!</div>'+
                   '<div class="chat-profile-birthday' + (birthday ? ' b-day' : '') + '" title="Birthday"><i class="fa">&#xf1fd;</i> ' + (birthday ? 'Happy Birthday!' : 'November 20') + '</div>'+
                 '</div>'+
                 '<div class="center"><button class="button" onclick="Kantan.chat.progress(true); this.onclick = null;"><i class="fa">&#xf075;</i>Start Chat</button></div>'
                )+
              '</div>'+
            '</div>'+
          '</div>'+
          '<div id="review-exercise" class="center clearfix">'+ 
            Kantan.lang.toggle_furigana+
            '<button id="toggle-fast-chat" class="button' + (Kantan.pref.fastChat == 'false' ? ' opt-off' : '') + '" onclick="Kantan.toggle.fastChat(this);"><i class="fa">&#xf050;</i><span class="en">Fast Chat: ' + (Kantan.pref.fastChat == 'true' ? 'ON' : 'OFF') + '</span><span class="ja">速いチャット：' + (Kantan.pref.fastChat == 'true' ? 'ON' : 'OFF') + '</span></button>'+
          '</div>';
        
        // set properties for the chat
        Kantan.chat.username = localStorage['KN_ChatData_NAME'] || 'Classmate';
        Kantan.chat.message = o.quizlet;
        Kantan.chat.branch = [];
        Kantan.chat.messageIndex = -1;
        Kantan.chat.branchIndex = -1;
        Kantan.chat.messageList = document.getElementById('kantan-chat-messages');
        Kantan.chat.msg_id = 0;
        Kantan.chat.list_id = 0;
        Kantan.chat.reply_id = 0;
        Kantan.chat.last = '';
        Kantan.chat.score = 0;
        
        // prompt the user to set a username if not set during the first chat instance and the {NAME} variable is used
        if (!localStorage['KN_ChatData_NAME'] && !/\/lesson-0\/chat-1\//.test(window.location.pathname) && /\{NAME\}/.test(document.body.innerHTML)) {
          KantanModal.open({
            title : 'Set かんたんChat Name',
            content :
              '<div class="center">'+
                '<p><img src="' + getPaths() + 'resources/images/kanny/kanny_guilty.webp" height="200" align="left">You have not set a username for かんたんChat yet. Kan-tan will use the name you\'ve set in chat from time to time to help you feel closer to her. We recommend setting one below before starting this exercise. You can also set it in the first chat exercise <a href="' + getPaths() + '/lessons/lesson-0/chat-1/' + Kantan.local + '"><b>here</b></a>, where Kan-tan will ask you your name.</p>'+
                '<div><b>Username:</b> <input type="text" oninput="KantanSettings.updateChatName(this);"></div>'+
                '<p><small>※The username entered above will be automatically saved locally upon typing.<br>You can change it at any time via Settings &gt; Kantan Chat Settings.<br>Defaults to "Classmate" if left blank.</small></p>'+
                '<div></div>'+
              '</div>',
            
            closeCallback : function () {
              Kantan.chat.username = localStorage['KN_ChatData_NAME'] || 'Classmate';
            }
          });
        }
      }
      
      
      // restore prior answers for written quizzes, if selected
      if (Kantan.currentAnswers) {
        if (o.type == Kantan.currentAnswers.type) { // only apply answers for same type!
          for (var a = document.querySelectorAll('.writing-zone-input'), i = 0, j = a.length; i < j; i++) {
            if (/multi-select/.test(a[i].parentNode.className)) {
              for (var x = a[i].parentNode.querySelectorAll('.insert-trigger'), y = 0, z = x.length; y < z; y++) {
                if (x[y].innerHTML == Kantan.currentAnswers.list[i]) {
                  x[y].click();
                  break;
                }
              }
            } else {
              a[i].value = Kantan.currentAnswers.list[i];
            }
          }
        }
        
        // delete the freshly applied answers to prevent reapplication, if not selected or all answers were correct
        delete Kantan.currentAnswers;
      }


      // # DRAG AND DROP FUNCTIONALITY #
      if (o.type == 'drag' || o.type == 'kana') {
        // setup drag and drop
        var drake = dragula([document.querySelector('#answer-list')], {
          isContainer : function (el) {
            return el.classList.contains('quiz-answer-zone');
          }
        });
        
        // events during drag
        drake.on('drag', function (el) {
          if (/answer-correct/.test(el.parentNode.className)) {
            this.cancel();
            return false;
          }
          
          // hide overflow during drag for touch screens
          if (Kantan.isTouch && Kantan.isTouching && document.body.style.overflow != 'hidden') {
            document.body.style.overflow = 'hidden';
          }

          // unmark marked items
          if (Kantan.markedItem) {
            Kantan.markedItem.className = Kantan.markedItem.className.replace(' markedItem', '');
            Kantan.markedItem = null;
          }
          
          // mark the draggable element
          Kantan.markedItem = el;
          el.className += ' markedItem';
        });
        
        if (Kantan.isTouch) {
          // restore overflow on drag cancel (touchscreens only)
          drake.on('cancel', function () {
            document.body.style.overflow = '';
          });
        }

        // check if the answer is correct before dropping the element
        drake.on('drop', function (el, target, source) {
          if (/answer-correct/.test(el.parentNode.className)) return false;
          
          if (Kantan.isTouch) document.body.style.overflow = ''; // restore overflow
          
          if (target.dataset.text) { // makes sure the element is a drop zone (data-text == data-answer)

            // if the answer is wrong we'll send the item back to the answer list
            if (el.dataset.answer != target.dataset.text) {
              document.getElementById('answer-list').appendChild(el);

              // global mistakes are incremented along with mistakes specific to problems
              target.dataset.mistakes = ++target.dataset.mistakes;
              
              // allows to see how many times target was gotten wrong while overall answers wrong number isn't bloated
              target.dataset.mistakes > 1 ? Kantan.stats.mistakes : ++Kantan.stats.mistakes;
              
            }
            
            // if the answer is correct we mark it correct
            else {
              target.className += ' answer-correct';
              
              // unmark the marked item that was dropped
              if (Kantan.markedItem) {
                Kantan.markedItem.className = 'quiz-item' + (/digraph/.test(Kantan.markedItem.className) ? ' digraph' : '');
                Kantan.markedItem = null;
              }
              
              // when all problems have been solved..
              // stop the timer, show the score, and congratulate the student
              if (++Kantan.stats.solved == Kantan.stats.problems) {
                Kantan.endQuiz();
              }
            }
          }
        });

        Kantan.drake = drake;
        
        // event listeners for marking and dropping answers with either a click or the 'Enter' key being pressed
        if (!Kantan.globalEventListenersSet) {
          Kantan.globalEventListenersSet = true; // prevents duplication of event listeners on Kantan.reset();
          
          ['click', 'keypress'].forEach(function (eventName) {
            document.addEventListener(eventName, function (e) {
              // if the event was a keypress and the key was not enter, bail out (same if the quiz is over)
              if (e.type == 'keypress' && e.key != 'Enter' || Kantan.quizOver) {
                return;
              }

              // check parentNode if no match (up to 3 times; e.g. 4-1: the initial element is not counted)
              // necessary as some quiz-items contain child nodes that go as deep as 3 nodes
              var target = e.target, n = 4, m = n - 1;
              while (n --> 0) {
                if (n < m) target = target.parentNode ? target.parentNode : target;
                
                // break out if match found
                if (/quiz-item(?: digraph|)$|quiz-answer-zone/.test(target.className)) break;
              }
              
              // bail out if selecting an already answered item
              if (/quiz-item/.test(target.className) && target.parentNode && /answer-correct/.test(target.parentNode.className)) {
                return;
              }
              
              // mark the currently active quiz item
              if (/quiz-item/.test(target.className) && target.parentNode.id == 'answer-list') {
                // unmark the last active quiz item
                if (Kantan.markedItem) {
                  Kantan.markedItem.className = Kantan.markedItem.className.replace(' markedItem', '');
                }

                // mark the new active one
                Kantan.markedItem = target;
                Kantan.markedItem.className += ' markedItem';
              }

              // attempt dropping the marked quiz item to an answer zone
              else if (Kantan.markedItem && /quiz-answer-zone/.test(target.className)) {
                // wrong answer
                if (Kantan.markedItem.dataset.answer != target.dataset.text) {
                  // remove the old notification
                  if (Kantan.wrongTimeout) {
                    document.getElementById('wrongAnswer').id = '';
                    clearTimeout(Kantan.wrongTimeout);
                    delete Kantan.wrongTimeout;
                  }

                  // if the answer is wrong we'll display a small notification using CSS (see #wrongAnswer in stylesheet.css)
                  target.id = 'wrongAnswer';

                  // remove the notification after 1 second
                  Kantan.wrongTimeout = setTimeout(function () {
                    document.getElementById('wrongAnswer').id = '';
                    delete Kantan.wrongTimeout;
                  }, 1000);

                  // global mistakes are incremented along with mistakes specific to problems
                  target.dataset.mistakes = ++target.dataset.mistakes;
                  ++Kantan.stats.mistakes;

                } 

                // correct answer
                else {
                  target.className += ' answer-correct';
                  target.appendChild(Kantan.markedItem);

                  // prevent the correct answer from being tabbed to
                  // this also includes the element we just added
                  target.tabIndex = -1;
                  target.firstChild.tabIndex = -1;

                  Kantan.markedItem.className = Kantan.markedItem.className.replace(' markedItem', '');
                  Kantan.markedItem = null;

                  // when all problems have been solved..
                  // stop the timer, show the score, and congratulate the student
                  if (++Kantan.stats.solved == Kantan.stats.problems) {
                    Kantan.endQuiz();
                  }
                }
              }

              // no conditions met, unmark the currently marked item
              else if (Kantan.markedItem) {
                Kantan.markedItem.className = Kantan.markedItem.className.replace(' markedItem', '');
                Kantan.markedItem = null;
              }

              // blur drop zone if clicking (clears confusion that one can mark a drop zone, then click a quiz item to drop it there)
              if (e.type == 'click' && /quiz-answer-zone/.test(e.target.className)) {
                e.target.blur();
              }
            });
          });
        }
      }


      // exercise timer
      var timer = new Timer(),
          clock = document.getElementById('quiz-timer');

      clock.innerHTML = '00:00:00'; // placeholder
      timer.start();
      timer.addEventListener('secondsUpdated', function (e) {
        clock.innerHTML = timer.getTimeValues().toString()
        Kantan.stats.time = Kantan.timer.getTotalTimeValues().seconds;
      });

      Kantan.timer = timer;
      
      if (Kantan.pref.autoPauseTimer != 'false') {
        document.addEventListener("visibilitychange", Kantan.startOrPauseTimerByVisibility);
      }

      // indicate the exercise has been loaded in
      document.getElementById('exercise').className += ' content-loaded ' + (o.type == 'stroke' ? 'stroke-quiz multi' : o.type == 'vocab_fill' ? 'vocab_fill-quiz multi' : o.type) + '-quiz';
      
      // set quiz class name
      document.body.className = document.body.className.replace(/[a-zA-z_-]+-quiz/g, '');
      document.body.className += ' ' + (o.type == 'stroke' ? 'stroke-quiz multi' : o.type == 'vocab_fill' ? 'vocab_fill-quiz multi' : o.type) + '-quiz';

      // jump to the exercise title
      Kantan.scrollTo('#main-title', true);
      
      // add dictionary for looking up words, but not for vocab exercises, since that would be cheating!
      // also disabled in the appendix and stroke order exercises
      if (Kantan.debug || (!/drag|kana|drawing|stroke/.test(o.type) && !Kantan.vocabJisho)) {
        if (Kantan.debug || (o.format && !/vocab|kana|numbers/.test(o.format)) || !o.format) {
          Kantan.quickJisho.create();
        }
      }
      
      // autofocus fallback (temp until Chromium fixes the autofocus bug)
      if (o.type == 'fill' || o.type == 'writing') {
        var autofocus = document.querySelector('[autofocus]');
        
        if (autofocus && autofocus != document.activeElement) {
          autofocus.focus();
          
          // lets us know if the fallback is still being used
          Kantan.debug && console.warn('autofocus failed: HTMLElement.focus() will be used as a fallback.');
        }
      }
      
      // autofocus answer options
      if (o.type == 'multi') {
        var q = document.querySelector(document.querySelector('.spoiler-mode') ? '.vocab-spoiler-toggle' : '.quiz-multi-answer');
        if (q) q.focus();
      }
      
      // audio events
      for (var a = document.querySelectorAll('AUDIO'), i = 0, j = a.length; i < j; i++) {
        // pause all audio elements that are current playing and only plays the one that was just clicked
        a[i].onplay = function () {
          for (var a = document.querySelectorAll('AUDIO'), i = 0, j = a.length; i < j; i++) {
            if (a[i] != this && !a[i].paused) {
              a[i].pause();
            }
          }
        };
        
        // logs time to console for debugging; mainly used for adding time stamps to the play buttons in listening exercises
        if (Kantan.debug) { // debug mode only
          a[i].ontimeupdate = function () {
            console.log(this.id, this.currentTime);
          };
        }
      }
      
      // insert authors and edit button for exercises
      var title = document.getElementById('main-title');
      if (title) {
        title.insertAdjacentHTML('afterend', 
          '<div id="exercise-info" class="panel">'+
            '<div id="author-list">' + (o.authors || 'Kan-tan') + '</div>'+
            (
              (/kana/.test(o.type) || o.kanaType) ? '' : // exclusions for editing
              '<a id="edit-page" class="button icon-only" onclick="Kantan.editExercise(); return false;" title="Edit exercise" href="' + getPaths() + 'lessons/tools/exercise-editor/' + Kantan.local + '"><i class="fa">&#xf040;</i></a>'
            )+
          '</div>'
        );
        
        // format author list
        if (window.formatAuthorList && !document.querySelector('.author-profile')) {
          formatAuthorList();
        }
      }
    },


    // increment the progress bar (for multi-choice quizzes)
    incrementProgressBar : function () {
      var bar = document.getElementById('quiz-progress-bar'),
          progress = Math.floor((Kantan.stats.solved+1) / Kantan.stats.problems * 100);

      bar.style.width = progress + '%';
      bar.innerHTML = '<span id="quiz-progress-text">' + (Kantan.stats.solved+1) + '/' + Kantan.stats.problems + '</span>';
    },


    // show the next question in a multi-choice quiz
    progressQuiz : function (answer, exclude, flag) {
      // prevent quiz progression while text selection mode is enabled or the quiz is over
      if (Kantan.pref.textSelectMode == 'true' || Kantan.quizOver) {
        return false;
      }
      
      // standard quiz progression
      if (answer == 'init') {
        document.getElementById('quiz-q' + Kantan.stats.solved).style.display = '';
        Kantan.incrementProgressBar();

      } else {
        // set the canvas as the answer if doing a stroke order exercise
        if (answer && flag == 'stroke') {
          var kanji = KanjiCanvas.recognize(answer.dataset.canvas), index; // find kanji with the given strokes
          
          // set the answer item as the canvas
          answer = answer.parentNode.parentNode.querySelector('.kanji-canvas');
          
          // debugging (logs info about matched kanji, match index, and whether the answer was correct or not)
          Kantan.debug && console.log('toDraw: ' + answer.dataset.kanji);
          Kantan.debug && console.log('Results: ' + kanji);
          Kantan.debug && console.log('Correct: ' + (new RegExp(answer.dataset.kanji).test(kanji) && answer.dataset.strokesAnswer == answer.dataset.strokes).toString());
          
          // mark the answer as correct or incorrect depending on: 1. the kanji presence and 2. the number of strokes.
          answer.dataset.answer = new RegExp(answer.dataset.kanji).test(kanji) && answer.dataset.strokesAnswer == answer.dataset.strokes;
        }
        
        // written vocab progression
        else if (answer && flag == 'vocab_fill') {
          answer = answer.parentNode.parentNode.querySelector('.writing-zone-input');
          
          // auto check answer if the user didn't check it 
          if (!/answer-correct|answer-wrong/.test(answer.parentNode.className)) {
            Kantan.check.vocabAnswer(answer.id);
          }
          
          // display the correct answer if the user got it wrong
          if (/answer-wrong/.test(answer.parentNode.className)) {
            var hint = answer.parentNode.parentNode.parentNode.querySelectorAll('.vocab-hint');
            hint[0].outerHTML = '<div class="quiz-multi-row vocab-hint correct-answers center">'+
              ('<ruby>' + answer.dataset.answer + '<rt>' + (answer.dataset.answer2 || '　') + '</rt></ruby>').replace(/\(|\)|（|）/g, '')+
              (/\(/.test(answer.dataset.answer) ?
                ('<br><ruby>' + answer.dataset.answer + '<rt>' + (answer.dataset.answer2 || '　') + '</rt></ruby>').replace(/\(.*?\)|（.*?）/g, '') :
                ''
              )
            '</div>';
            hint[1].style.display = 'none';
          }
        }
        
        // mark the selected answer for reviews
        answer.className += ' selected-answer';

        // hide NEXT button for read-only questions
        if (exclude) {
          answer.parentNode.className += ' hidden-answer';
        }

        // increment mistakes if the chosen answer was wrong and add a class to the parent
        if (answer.dataset.answer == 'false') {
          answer.parentNode.parentNode.className += ' wrong-answer';
          ++Kantan.stats.mistakes;
        }

        // if there's another question, show it and hide the last one
        var last = document.getElementById('quiz-q' + Kantan.stats.solved++),
            next = document.getElementById('quiz-q' + Kantan.stats.solved);
        
        
        // instantly feedback more
        if (Kantan.pref.feedbackMode == 'instant' && Kantan.active.type == 'multi') {
          // cache for nodes used in instant feedback mode
          if (!Kantan.multiNodes) {
            Kantan.multiNodes = {
              list : document.getElementById('question-list'),
              button : document.getElementById('next-button'),
              next : null,
              last : null
            };
          }

          // prevent reanswering questions (by initiating "quiz ended" state) + show the next button
          Kantan.quizOver = true;
          document.body.className += ' quiz-over';
          Kantan.multiNodes.button.style.visibility = 'visible';

          // cache these for use with showNextQuestion()
          Kantan.multiNodes.next = next;
          Kantan.multiNodes.last = last;
          
          if (!next) {
            Kantan.multiNodes.button.innerHTML = Kantan.multiNodes.button.innerHTML.replace(/Kantan\.showNextQuestion\(this\);/g, 'Kantan.endQuiz(\'' + (flag == 'stroke' ? flag : 'multi') + '\', true);').replace(/<span class="en">.*?<\/span><span class="ja">.*?<\/span>/, Kantan.lang.end_quiz);
          }
          
          Kantan.multiNodes.button.querySelector('.button').focus(); // focus next button
        }
        
        // classic progression (answers shown only at end)
        else {
          if (next) {
            next.style.display = ''; // show the next question
            last.style.display = 'none'; // hide the prior question

            // focus answer for next question
            var q = next.querySelector(
              document.querySelector('.spoiler-mode') ? '.vocab-spoiler-toggle' :
              document.querySelector('.writing-zone-input') ? '.writing-zone-input' : '.quiz-multi-answer'
            );
            if (q) q.focus();

            Kantan.incrementProgressBar();

          } else { // end the quiz if there's no new question
            Kantan.endQuiz(flag == 'stroke' ? flag : 'multi');
          }
        }
      }
      
      // initialize canvas for stroke order quizzes
      if (flag == 'stroke' && document.getElementById('canvas-' + Kantan.stats.solved)) {
        KanjiCanvas.init('canvas-' + Kantan.stats.solved);
      }
    },

    
    // proceeds to next question without interacting with answer values (mainly used for instant feedback mode)
    showNextQuestion : function (caller) {
      // hide prev question + show next one
      Kantan.multiNodes.next.style.display = '';
      Kantan.multiNodes.last.style.display = 'none';

      // restore active quiz state (not ended) + hide next button
      Kantan.quizOver = false;
      document.body.className = document.body.className.replace('quiz-over', '');
      Kantan.multiNodes.button.style.visibility = 'hidden';
      
      // focus answer for next question
      var q = Kantan.multiNodes.next.querySelector(
        document.querySelector('.spoiler-mode') ? '.vocab-spoiler-toggle' :
        document.querySelector('.writing-zone-input') ? '.writing-zone-input' : '.quiz-multi-answer'
      );
      if (q) q.focus();

      // increment progress
      Kantan.incrementProgressBar();
    },

    // ends the quiz
    endQuiz : function (type) {
      if (Kantan.viewingResults) return false;
      
      Kantan.quizOver = true; // marks quiz as over
      Kantan.viewingResults = true; // prevents duplicate calls to endQuiz
      
      // type value adjustments
      type = type == 'drawing' ? 'stroke' : type; // changes type to "stroke" for drawing practice, since they share many traits.
      
      // calculate the total score and grade based on problems solved and mistakes made
      var solved = Kantan.stats.solved - Kantan.stats.exclude,
          problems = Kantan.stats.problems - Kantan.stats.exclude, grade;

      Kantan.stats.score = Math.floor((solved - Kantan.stats.mistakes) * 100 / problems);
      Kantan.timer.stop();
      
      // finally calculate grade3
      grade = Kantan.stats.score >= 97 ? 'A+' :
              Kantan.stats.score >= 93 ? 'A' :
              Kantan.stats.score >= 90 ? 'A-' :
              Kantan.stats.score >= 87 ? 'B+' :
              Kantan.stats.score >= 83 ? 'B' :
              Kantan.stats.score >= 80 ? 'B-' :
              Kantan.stats.score >= 77 ? 'C+' :
              Kantan.stats.score >= 73 ? 'C' :
              Kantan.stats.score >= 70 ? 'C-' :
              Kantan.stats.score >= 67 ? 'D+' :
              Kantan.stats.score >= 63 ? 'D' :
              Kantan.stats.score >= 60 ? 'D-' : 'F';

      // hide the timer and store it so we can show the completion time in the results
      var result = document.getElementById('quiz-result'),
          timer = document.getElementById('quiz-timer');
      timer.style.display = 'none';

      // show the student their results
      result.style.display = 'block';
      result.innerHTML = 
      '<div id="complete-banner" class="center"><span class="en">Quiz Complete!</span><span class="ja">テスト終了！</span></div>'+
      '<div id="result-list">'+
        '<div class="result-row"><span class="result-label"><span class="en">Problems Solved:</span><span class="ja">問題を解いた：</span></span>' + problems + '</div>'+
        '<div class="result-row"><span class="result-label"><span class="en">Answers Wrong:</span><span class="ja">不正解の問題：</span></span>' + Kantan.stats.mistakes + '</div>'+
        '<div class="result-row"><span class="result-label"><span class="en">Score:</span><span class="ja">得点：</span></span><span id="completion-score">' + Kantan.stats.score + '%</span></div>'+
        '<div class="result-row"><span class="result-label"><span class="en">Completion Time:</span><span class="ja">かかった時間：</span></span>' + timer.innerHTML + '</div>'+
        '<div class="result-row"><span class="result-label"><span class="en">Record:</span><span class="ja"><span class="ja">最速記録：</span></span></span><span id="completion-record"></span></div>'+
        '<div class="result-row"><span class="result-label"><span class="en">Completed:</span><span class="ja"><span class="en">Completed:</span><span class="ja">完了回数：</span></span></span><span id="times-completed"></span></div>'+
        (Kantan.pref.SRS == 'true' ? '<div class="result-row"><span class="result-label"><span class="en">Next Review:</span><span class="ja">次の復習：</span></span><span id="review-date"></span></div>' : '')+
        '<div class="result-row center">'+
          '<p>'+
          ( // depending on the score, a specific message will show
            Kantan.stats.score == 100 ? '<span class="en">PERFECT! Great Job, you have mastered this quiz! Feel free to move on or challenge yourself by trying to beat your completion time.</span><span class="ja">満点！たいへんよくできました！</span>' :
            Kantan.stats.score > 70 ? '<span class="en">Nice work!</span><span class="ja">よくできました！</span> ' + Kantan.lang[type ? type + '_mistakes' : 'mistakes'] :
            '<span class="en">Keep studying!</span><span class="ja">頑張りましょう！</span> ' + Kantan.lang[type ? type + '_mistakes' : 'mistakes']
          )+
          (document.querySelector('.alt-phrase') ? '<br><br>' + Kantan.lang.sub_answers : '')+
          '</p>'+
          '<div class="quiz-results-icon">'+
            '<img src="' + getPaths() + 'resources/images/kanny/kanny_paper.webp">'+
            '<span class="quiz-results-grade ' + (Kantan.stats.score >= 85 ? 't-green' : Kantan.stats.score >= 70 ? 't-gold' : 't-red') + '">' + grade + '</span>'+
          '</div>'+
          '<div class="dialogue">'+
            (Kantan.stats.score >= 100 ? "Wow, you aced it!! As a reward for doing such a good job, I'll give you some of my favorite candy later!" :
             Kantan.stats.score >= 70 ? "You were so close to acing it! Let's go over what you got wrong together and give it another shot!" :
             "Don't give up! You'll get it next time as long as you keep on studying and practicing! Kanny believes in you!!"
            )+
          '</div>'+
          '<div class="center">'+
            (
              /\/dictionary\//.test(window.location) ? Kantan.lang.back_to_dict :
              '<button class="button" onclick="Kantan.reset();"><i class="fa">&#xf021;</i><span class="en">Try Again</span><span class="ja">やり直す</span></button>'
            )+
            '<button class="button" onclick="Kantan.breakTime();"><i class="fa">&#xf0f4;</i><span class="en">Take a Break</span><span class="ja">休憩する</span></button>'+
            '<a href="' + document.getElementById('nav-lessons').href + '" class="button"><i class="fa">&#xf19d;</i><span class="en">Back to Lessons</span><span class="ja">レッスン一覧に戻る</span></a><br>'+
            '<a id="save-exercise-data" class="button green" download="Kantan Profile Data.json" href="data:text/plain;charset=utf-8,' + KantanSettings.saveExerciseData() + '"><i class="fa">&#xf019;</i><span class="en">Save Profile Data</span><span class="ja">プロフィールデータをセーブする</span></a><br><br>'+
          '</div>'+
        '</div>'+
      '</div>';
      
      // show previously answered questions, hide progress bar, etc.
      if (type == 'stroke' || type == 'multi') {
        // show all questions and answers
        for (var q = document.querySelectorAll('[id^="quiz-q"]'), i = 0, j = q.length; i < j; i++) {
          q[i].style.display = '';
        }
        
        // hide the progress bar, next buttons, etc.
        var bar = document.getElementById('quiz-progress'),
            feedback = document.getElementById('multi-feedback-mode');
        
        if (bar) bar.style.display = 'none';
        if (feedback) feedback.style.display = 'none';
        if (Kantan.multiNodes) Kantan.multiNodes.button.style.display = 'none';
      }
      
      // save results in local storage
      if (storageOK && (Kantan.active.exercise && Kantan.active.exercise.length > 0) && !/references|tools/.test(Kantan.active.exercise[0])) {
        var lesson = Kantan.active.exercise[0].replace('lesson-', ''),
            lessonsResults = JSON.parse(localStorage.KantanResults) || {},
            result = unpackExerciseData(lessonsResults[lesson]),
            newDate = false,
            secondsToTime = function (duration) {
              var seconds = Math.floor(duration % 3600 % 60),
                  minutes = Math.floor(duration % 3600 / 60),
                  hours = Math.floor(duration / 3600);

              hours = (hours < 10) ? "0" + hours : hours;
              minutes = (minutes < 10) ? "0" + minutes : minutes;
              seconds = (seconds < 10) ? "0" + seconds : seconds;

              return hours + ":" + minutes + ":" + seconds;
            };
        
        // set score and show new record if any
        var oldScore = result.score,
            newScore = Kantan.stats.score,
            comScore = document.getElementById('completion-score');
        
        if (typeof oldScore == 'undefined' || newScore > oldScore) {
          result.score = newScore;
          comScore.innerHTML = comScore.innerHTML.replace(/.*?(\d+%).*/, '$1 <span class="new-record"></span>' + (typeof oldScore == 'undefined' ? '' : '<br><span class="result-label" style="margin-top:5px;"><span class="en">Old Score:</span><span class="ja">前の得点：</span></span>' + oldScore + '%'));
        }
        
        // set total completions
        result.completed = typeof result.completed != 'undefined' ? result.completed + 1 : 1;
        document.getElementById('times-completed').innerHTML = result.completed + ' time' + (result.completed > 1 ? 's' : '');
        
        // set time record
        var oldTime = result.time,
            newTime = Kantan.stats.time,
            record = document.getElementById('completion-record'),
            notSet = typeof result.time == 'undefined' || result.time == '';
        
        // new record
        if (notSet || newTime < oldTime) {
          result.time = newTime;
          record.innerHTML = timer.innerHTML + ' <span class="new-record"></span>' + (notSet ? '' : '<br><span class="result-label" style="margin-top:5px;"><span class="en">Old Record:</span><span class="ja">前の記録：</span></span>' + secondsToTime(oldTime));
        }
        // no new record
        else {
          record.innerHTML = secondsToTime(oldTime);
        }
        
        // SRS data
        if (Kantan.pref.SRS == 'true' && result.review != 'M') { // exclude mastered exercies from ever being updated again
          // update exercise with a new review date based on score if the exercise completed was on or past the current review date, or this is the first time a review is being set
          if (typeof result.review == 'undefined' || +new Date().setHours(0, 0, 0, 0) >= result.review) {
            var SRS_Data = Kantan.getNextReviewData(Kantan.stats.score, Kantan.stats.mistakes, typeof result.streak == 'undefined' ? 0 : result.streak, typeof result.review == 'undefined');
            result.streak = SRS_Data.streak;
            result.review = SRS_Data.reviewDate == 'mastered' ? 'M' : +SRS_Data.reviewDate;
            newDate = true;
          }
        }
        
        // show next review date in quiz stats
        if (typeof result.review != 'undefined') {
          var date = document.getElementById('review-date');
          if (date) {
            document.getElementById('review-date').innerHTML = (result.review == 'M' ? 'None; Exercise has been mastered' :
                                                               result.review == 'R' ? 'None; Exercise has been retired' :
                                                               getReviewData(result.review).date)+
                                                               (newDate ? ' <span class="new-record"></span>' : '')+
                                                               ' <a class="button small" href="' + document.getElementById('nav-reviews').href + '#review-list">Manage Reviews</a>';
          }
        }
        
        // repack the data and then save it to storage
        lessonsResults[lesson] = packExerciseData(result);
        localStorage.KantanResults = JSON.stringify(lessonsResults);

        // refresh the exercise list with the new results
        Kantan.create.removeExerciseList();
        Kantan.create.exerciseList();
        
        
        // shows data backup reminder if 10 or more exercises were completed
        if (Kantan.pref.backupReminder == 'true') {
          if (++Kantan.backupReminderCount >= 10) {
            Kantan.backupReminderCount = 0;

            setTimeout(function() {
              KantanModal.open({
                title : '<span class="en">Backup Profile Data?</span><span class="ja">プロフィールデータを保存しますか？</span>',
                content : '<span class="en">You\'ve recently completed 10 exercises. Would you like to backup your exercise score data?</span><span class="ja">練習が10回終わりました。練習の得点データを保存しますか？</span><br><br>'+
                '<div class="center">'+
                  '<a id="save-exercise-data" class="button green" download="Kantan Profile Data.json" href="data:text/plain;charset=utf-8,' + KantanSettings.saveExerciseData() + '"><i class="fa">&#xf019;</i><span class="en">Save Data</span><span class="ja">セーブする</span></a><br><br>'+
                  '<div title="' + (KN_Lang == 'ja' ? 'このポップアップを無効にします。\nデータを保存するリマインダーが再び有効にしたい場合は設定で有効にできます。' : 'Stops this popup from showing every 10 exercises.\nYou can re-enable the data backup reminder via the settings manager. ') + '">'+
                    '<input id="modal-data-backup-reminder" class="kantan_input_hidden" type="checkbox" onchange="localStorage.KN_BackupReminder = Kantan.pref.backupReminder = this.checked == true ? false : true;">'+
                    '<span tabindex="0" class="kantan_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
                    '<label class="checkbox-label" for="modal-data-backup-reminder"><span class="en">Disable Data Backup Reminders</span><span class="ja">データを保存するリマインダーを無効にする</span></label><br><br>'+
                  '</div>'+
                  '<div>'+
                    '<div class="donate-box clear">'+
                      '<div class="donate-icon"><i class="fa">&#xf004;</i></div>'+
                      '<div class="donate-text">If Kantan Japanese has helped you with your studies, please consider <a href="' + getPaths() + 'donate/' + Kantan.local + '" target="_blank">making a donation <i class="fa">&#xf08e;</i></a> if you can, to help support the continued development and maintenance of these resources. Your support is greatly appreciated!</div>'+
                    '</div>'+
                  '</div>'+
                '</div>',
                zIndex : 'low',
                focus : '#save-exercise-data'
              });
            }, 100);
          }

          // save count for other pages
          localStorage.KN_BackupReminderCount = Kantan.backupReminderCount;
        }
      }
      
      // kill drag event handlers
      if (Kantan.drake) {
        // slight delay is required, otherwise an error is thrown
        setTimeout(function () {
          Kantan.drake.destroy();
          delete Kantan.drake;
        }, 100);
      }
      
      // hide change exercise type button
      var changeType = document.getElementById('change-exercise-type-container');
      if (changeType) changeType.style.display = 'none';

      // this class will indicate the quiz is over so post-test styles can be applied
      document.getElementById('exercise').className += ' quiz-over';
      document.body.className += ' quiz-over';
      Kantan.scrollTo('#complete-banner', true); // jump to the quiz results
    },
    
    
    // resets exercise state, allowing students to redo quizzes without reloading the page
    reset : function (skipModal) {
      if (window.JSON) {
        var type = document.getElementById('exercise').className;
        // written answer preservation permission
        if (!skipModal && /fill-quiz|writing-quiz/.test(type) && !/vocab_fill-quiz/.test(type) && Kantan.stats.mistakes > 0) {
          return KantanModal.open({
            title : '<span class="en">Try again with your current answers?</span><span class="ja">前の答えを保存してやり直しますか？</span>',
            content : '<div><span class="en">Would you like to try again with your current answers? This will allow you to correct the answers you got wrong while preserving what you have already written.</span><span class="ja">前の答えを保存してやり直しますか？不正解の答えを修正することができます。</span></div><br>'+
            '<div><span class="en">※ Please note that your answers will be lost if you change the page or exercise type.</span><span class="ja">※ページや練習型を変更すると、答えは失われますのでご注意ください。</span></div>',
            buttonHTML : '<span class="en">Yes</span><span class="ja">はい</span>',
            closeButtonText : '<span class="en">No</span><span class="ja">いいえ</span>',
            customButton : '<button id="kantan-modal-cancel" class="button" onclick="KantanModal.close();"><span class="en">Cancel</span><span class="ja">戻る</span></button>',
            keepOpen : true,

            callback : function () {
              // get and cache current answers
              for (var currentAnswers = [], a = document.querySelectorAll('.writing-zone-input'), i = 0, j = a.length; i < j; i++) {
                currentAnswers.push(a[i].value);
              }
              
              // temporarily cache the answers and previous exercise type (in case of mulitple types, we can check and apply the answers or not)
              Kantan.currentAnswers = {
                type : /fill-quiz/.test(document.getElementById('exercise').className) ? 'fill' : 'writing',
                list : currentAnswers
              };
              
              KantanModal.close();
              Kantan.reset(true);
            },
            
            closeCallback : function () {
              KantanModal.close();
              Kantan.reset(true);
            }
          });
        }
        
        // reset data
        Kantan.exerciseComplete = false;
        Kantan.quizOver = false;
        Kantan.viewingResults = false;
        Kantan.isTouching = false;
        Kantan.pref.textSelectMode = 'false';
        Kantan.markedItem = null;
        Kantan.stats = {
          problems : 0,
            solved : 0,
          mistakes : 0,
             score : 0,
           exclude : 0,
              time : 0
        };
        
        if (Kantan.multiNodes) {
          delete Kantan.multiNodes;
        }
        
        // stop timer
        Kantan.timer.isRunning() && Kantan.timer.stop();
        
        // reset quick dictionary state
        if (Kantan.quickJisho.cache) {
          !Kantan.quickJisho.hidden && Kantan.quickJisho.toggle();
          Kantan.quickJisho.search('');
          Kantan.quickJisho.cache.search.value = '';
        }

        // hide exercise and reset contents
        var exercise = document.getElementById('exercise'),
            exTitle = document.getElementById('main-title'),
            exMore = document.querySelector('.more-exercises'),
            img = document.querySelector('.multi-quiz-image'),
            ime = document.getElementById('IME_Controls'),
            footer = document.querySelector('footer');
        
        document.body.className = document.body.className.replace(/review-mode|quiz-over/gi, '');
        exercise.className = 'content-block';
        exercise.innerHTML = (exTitle ? exTitle.outerHTML : '') + '<div id="quiz-result"></div><div id="quiz-zone" class="clear"></div>' + (img ? img.outerHTML : '') + '<div id="quiz-timer" class="center"></div>' + (exMore ? exMore.outerHTML : '');
        
        // remove IME
        if (ime) ime.parentNode.removeChild(ime);
        if (footer) footer.style.paddingBottom = '';
        
        // things to do depending on the page
        // appendix
        if (Kantan.vocabJisho) {
          // hide/show main containers
          exercise.style.display = 'none'; // hides exercise
          document.getElementById('appendix-tool').style.display = ''; // shows tools
          
          // scroll to the main titles
          Kantan.scrollTo(/\/dictionary\//.test(window.location) ? '#practice-words' : '.title');
          
          // launch exercise prompt based on the current page
          if (/\/dictionary\//.test(window.location)) Kantan.vocabJisho.launchExercise();
        } 
        
        // study tools
        else if (Kantan.tools) {
          // similar to appendix; see above comments
          exercise.style.display = 'none';
          document.getElementById('study-tool-editor').style.display = '';
          Kantan.scrollTo('.title');
        }
        
        // standard quizzes
        else {
          Kantan.generateQuiz(JSON.parse(Kantan.exerciseData));
          
          // reset script highlighting for exercises that have audio and scripts
          var scripts = document.querySelectorAll('.chokai-script');
          
          if (scripts) {
            for (var i = 0, j = scripts.length, audio; i < j; i++) {
              audio = document.getElementById(scripts[i].id.replace('script-', ''));
              
              if (audio) {
                Kantan.chokai.highlight(audio.id, Kantan.chokai.time[audio.id]);
                
                // reset sticky audio elements
                if (Kantan.stickyAudio.target && Kantan.stickyAudio.target.id == audio.id) {
                  Kantan.stickyAudio.static = audio.parentNode;
                  Kantan.stickyAudio.target = audio;
                }
              }
            }
          }
        }
        
      } else {
        window.location.reload(); // reloads the page if unable to use JSON to reset quizzes
      }
    },
    
    
    // allows the student to take a break before trying again
    breakTime : function () {
      KantanModal.open({
        title : '<span class="en">Take a Break?</span><span class="ja">休憩しますか？</span>',
        content : '<span class="en">Taking a break and waiting before trying again can greatly help with building your memory. 5 to 10 minute breaks are recommended, but you\'re free to adjust the time to your liking.' + (/"format":"vocab"/.test(Kantan.exerciseData) ? ' Please see <a href="' + getPaths() + 'help/vocab-memorization/' + Kantan.local + '" target="_blank">this page</a> for more tips on memorizing vocab.' : '') + '</span><span class="ja">休憩してからもう一度やってみると記憶力のために役立ちます。５、１０分の休憩がおすすめですが、お好みの時間が調整できます。' + (/"format":"vocab"/.test(Kantan.exerciseData) ? '単語を暗記するためのヒントには<a href="' + getPaths() + 'help/vocab-memorization/' + Kantan.local + '" target="_blank">このページ</a>をご覧ください。' : '') + '</span><br><br>'+
        '<div class="center"><span class="en">Wait </span><span class="ja">待つ時間：</span><input id="break-minutes" class="center" type="number" value="' + Kantan.breakTimer[Kantan.breakMultiplier] + '" min="1" max="60" onchange="Kantan.changeBreakMultiplier(this);"> <span class="en">Minute(s)</span><span class="ja">分</span></div>',
        buttonHTML : '<span class="en">Wait</span><span class="ja">待つ</span>',
        keepOpen : true,
        
        // initializes the break timer
        callback : function () {
          // increment default break time
          if (Kantan.breakMultiplier < (Kantan.breakTimer.length - 1)) {
            // automatically hide furigana for the 3rd session (if time is set manually, this is ignored)
            if (Kantan.breakMultiplier == 2 && !Kantan.breakTimerCustom) {
              var f = document.getElementById('toggle-furigana');
              if (f && /furigana-on/.test(document.getElementById('quiz-zone').className) == true) {
                f.click();
              }
            }
            
            
            Kantan.breakMultiplier++;
          }
          
          // request permission to show a notification when break time is up
          if (!Kantan.local && Kantan.canNotify && !/denied|granted/.test(Notification.permission)) {
            Notification.requestPermission();
          }
          
          var time = +document.getElementById('break-minutes').value, n;
          
          // corrects time
          if (time > 60) {
            time = 60;
          } else if (time <= 0) {
            time = 1;
          }
          
          // opens the break modal
          KantanModal.open({
            title : '<span class="en">Taking a Break</span><span class="ja">休憩中</span>',
            content : '<div id="break-timer" class="center">00:' + (time < 10 ? '0' : '') + time + ':00</div>',
            buttonHTML : '<span class="en">End Break Time</span><span class="ja">休憩を終了する</span>',
            keepOpen : Kantan.vocabJisho || (!Kantan.tools && /"format"/.test(Kantan.exerciseData)) ? true : false,
            
            // reloads the current exercise
            callback : function () {
              Kantan.reset();
              document.body.className = document.body.className.replace(' taking-a-break', '');
            }
          });
          
          document.body.className += ' taking-a-break'; // adjusts the style and functionality of the modal
          
          // turns the overlay into a soothing backround
          n = Math.floor(Math.random() * 10) + 1;
          document.getElementById('kantan-modal-overlay').style.backgroundImage = 'url(../../../resources/images/backgrounds/bg-' + (n < 10 ? '0' : '') + n + '.jpg)';
          
          // initialize timer
          var timer = new Timer(),
              clock = document.getElementById('break-timer');

          timer.start({
            startValues : { minutes : time },
            target : { seconds : 0 },
            countdown : true
          });
          
          // update the timer
          timer.addEventListener('secondsUpdated', function (e) {
            var timeString = timer.getTimeValues().toString();
            clock.innerHTML = timeString;
            
            // break time ends
            if (timeString == '00:00:00') {
              clock.innerHTML = '<span class="en">Break time is up!</span><span class="ja">休憩が終了しました！</span><div style="font-size:15px;"><span class="en">Click the button below to resume your studies.</span><span class="ja">勉強を続けるために下のボタンをクリックしてください。</span></div>';
              document.getElementById('kantan-modal-ok').style.display = 'inline-block';
              
              // notify the user that break time has ended
              if (!Kantan.local && Kantan.canNotify && Notification.permission == 'granted') {
                var notif = new Notification(document.title.replace(/ \| Kantan Japanese.*$/, ''), {
                  body : KN_Lang == 'ja' ? '休憩が終了しました！' : 'Break time is up!',
                  icon : document.querySelector('meta[property="og:image"]').content,
                  tag : 'breakTime-' + Kantan.active.index
                });
                
                // focus the tab
                notif.onclick = function () {
                  window.focus();
                  this.close();
                };
              }
            }
          });
        }
      });
    },
    
    // break time increments based on number of breaks taken (limited to 8 break periods (4hrs total) + 10 study sessions (avg per sesson is about 2-5 mintues))
    // studying over this period of time seems to greatly help with retention, so long as you utilize the vocab afterwards by reading, writing, etc.
    breakMultiplier : 0,
    breakTimer : [
      5,
      10,
      15, // recommended to hide furigana after this point (done automatically if timer isn't manually set)
      20,
      30,
      40,
      50,
      60 // review vocab once more, then wait a day or two to review to check retention (reading anytime after this period is fine)
    ],
    
    breakTimerCustom : false, // tells if time was set manually by the user so furigana state remains untouched
    
    // adjusts break multiplier based on user input
    changeBreakMultiplier : function (caller) {
      var n = Number(caller.value);
      
      if (n <= 5) {
        Kantan.breakMultiplier = 0;
      } else if (n <= 10) {
        Kantan.breakMultiplier = 1;
      } else if (n <= 15) {
        Kantan.breakMultiplier = 2;
      } else if (n <= 20) {
        Kantan.breakMultiplier = 3;
      } else if (n <= 30) {
        Kantan.breakMultiplier = 4;
      } else if (n <= 40) {
        Kantan.breakMultiplier = 5;
      } else if (n <= 50) {
        Kantan.breakMultiplier = 6;
      } else if (n <= 60) {
        Kantan.breakMultiplier = 7;
      }
      
      Kantan.breakTimerCustom = true;
    },
    

    // places draggable items into their correct places
    // allows the student to review meanings without having to consult their textbook
    review : function () {
      // ask for confirmation, just in case the button was clicked by accident
      KantanModal.open({
        title : '<span class="en">Activate Review Mode?</span><span class="ja">単語を復習しますか？</span>',
        content : '<span class="en">Are you sure you want to review? Your current progress will be lost.</span><span class="ja">今までの進み具合は失われます。よろしいですか？</span>',
        
        callback : function () {
          var a = document.querySelectorAll('[data-answer]'),
              i = 0,
              j = a.length;

          for (; i < j; i++) {
            document.querySelector('[data-text="' + a[i].dataset.answer + '"]').appendChild(a[i]);
          }

          // stop and hide timer + drag/drop
          Kantan.timer.stop();
          Kantan.drake.destroy();
          document.getElementById('quiz-timer').style.display = 'none';

          // show restart button
          document.getElementById('review-exercise').innerHTML = (
            /\/dictionary\//.test(window.location) ? Kantan.lang.back_to_dict :
            '<button class="button green" onclick="Kantan.reset();"><i class="fa">&#xf021;</i><span class="en">Restart</span><span class="ja">リセットする</span></button>'
          ) + (document.querySelector('.drag-quiz') ? Kantan.lang.toggle_furigana : '');

          // change the quiz info
          document.getElementById('quiz-info').innerHTML = '<div class="info-icon"><i class="fa">&#xf05a;</i></div><div class="info-text"><span class="en">You are currently in review mode; go ahead and take your time to study. When you are ready to practice this exercise, click the "restart" button.</span><span class="ja">復習モードになっていますので、ゆっくり勉強してください。復習し終わったら「リセットする」をクリックしてください。</span></div>';
          document.body.className += ' review-mode';
                    
          // hide change exercise type button
          var changeType = document.getElementById('change-exercise-type-container');
          if (changeType) changeType.style.display = 'none';
        }
      });
    },
    
    
    // functions and properties for Kantan Chat
    chat : {
      // progresses the chat
      progress : function (init) {
        // cleans start button up from chat
        if (init) {
          return Kantan.chat.clear(true);
        }

        // branch messages (messages that branch internally based on choices and then reconverge)
        if (Kantan.chat.branch.length) {
          // if no more branch messages, close the branch
          if (!Kantan.chat.branch[++Kantan.chat.branchIndex]) {
            Kantan.chat.branch = [];
            Kantan.chat.branchIndex = -1;
            Kantan.chat.progress();
          }

          else {
            Kantan.chat.write(Kantan.chat.branch[Kantan.chat.branchIndex]);
          }

        }

        // standard messages
        else {
          // end quiz if no more messages
          if (!Kantan.chat.message[++Kantan.chat.messageIndex]) {
            // exit full screen
            if (Kantan.chat.fullscreen) Kantan.chat.toggleFullscreen();
            
            // finally end the quiz
            return Kantan.endQuiz('chat');
          }
          
          Kantan.chat.write(Kantan.chat.message[Kantan.chat.messageIndex]);
        }
      },
      
      
      // write a message into the chat
      write : function (data) {
        // skip a score-based message if the user's score (problems correctly solved) is not equal to the requirement for the message
        if (typeof data.score != 'undefined' && data.score != Kantan.chat.score) {
          return Kantan.chat.progress();
        }
        
        // breaks out of current message list and starts a new one
        if (data.newList) Kantan.chat.last = '';
        
        // writes a message into the chat
        if (data.message || data.image) {
          var msg_id = Kantan.chat.msg_id++,
              list_id = Kantan.chat.list_id,
              name = data.name || 'Kan-tan',
              avatar = data.avatar || getPaths() + 'resources/images/avatars/kan-tan.webp',
              side = data.side || 'left',
              delay = side == 'left' && Kantan.pref.fastChat == 'false' ? 1000 + (Math.floor(Math.random() * 500)) : 250,
              list = Kantan.chat.messageList,
              msg, combine, falseFlag;
          
          // determine if lid should be incremented
          if (Kantan.chat.last != name) {
            Kantan.chat.last = name;
            list_id = ++Kantan.chat.list_id;
          }
          
          // if name is same as the last, messages will be combined
          else {
            list = document.getElementById('list_id_' + list_id);
            combine = true;
          }
          
          // show placeholder if left side (incoming) message
          if (side == 'left') {
            Kantan.chat.insertMessage(
              combine ? '<div class="message-row"><div id="msg_id_' + msg_id + '" class="message"><div class="typing-placeholder"><span></span><span></span><span></span></div></div></div>' :
              
              '<div class="message-box ' + side + '-side">'+
                '<div class="message-avatar"><img src="' + avatar + '"></div>'+
                '<div class="message-name">' + name + '</div>'+
                '<div id="list_id_' + list_id + '" class="message-list">'+
                  '<div class="message-row"><div id="msg_id_' + msg_id + '" class="message"><div class="typing-placeholder"><span></span><span></span><span></span></div></div></div>'+
                '</div>'+
              '</div>',
            list);
            
            // for updating the message content
            msg = document.getElementById('msg_id_' + msg_id);
          }
          
          // show message after either 500ms or 1ms depending on message type
          setTimeout(function () {
            // update typing placeholder with message
            if (msg) {
              // clears previously set false incorrect flag
              if (/\{FLAG:CLEAR_INCORRECT\}/.test(data.message)) {
                falseFlag = document.querySelector('.falseIncorrect');
                if (falseFlag) {
                  falseFlag.className = falseFlag.className.replace('reply-wrong', 'reply-correct').replace('falseIncorrect', '');
                }
              }
              
              if (data.image) msg.className = 'message-image';
              msg.innerHTML =
              // translation button
              (data.translation ? '<div class="translation-toggle"><a href="#" class="translation-toggler" onclick="Kantan.chat.translate(this); return false;">Show translation</a></div>' : '')+
              
              // standard message contents
              '<span class="message-original">'+
                (data.message ?
                  Kantan.chat.cleanMsg(Kantan.chat.parseMsg(data.message)) :
                 data.image ?
                  '<img src="' + getPaths() + 'resources/images/exercises/' + data.image + '">' : ''
                )+
              '</span>'+
                
              // translated message
              (data.translation ? '<span class="message-translated" style="display:none;">'+
                Kantan.chat.parseMsg(data.translation)+
              '</span>' : '');
              
              // scroll to message
              Kantan.chat.scroll();
            }
            
            // show reply choices
            if (data.reply || data.input_reply) {
              setTimeout(function () {
                Kantan.chat.writeReply(data);
              }, 250);
            }

            // otherwise auto-progress the chat
            else {
              setTimeout(Kantan.chat.progress, Kantan.pref.fastChat == 'true' ? 250 : 500);
            }
          }, (Kantan.pref.fastChat == 'true' ? 250 : data.delay || delay));
        }
        
        else if (data.reply || data.input_reply) {
          Kantan.chat.writeReply(data);
        }
        
        // writes info into the chat and then progresses it
        else if (data.info) {
          Kantan.chat.insertMessage('<div class="chat-info' + (
            // color classes for the info
            /^\{RED\}/.test(data.info) ? ' info-red' :
            /^\{GREEN\}/.test(data.info) ? ' info-green' : ''
          ) + '">' + data.info.replace(/^\{RED\}|^\{GREEN\}/g, '') + '</div>');
          
          if (data.delay) {
            setTimeout(Kantan.chat.progress, Kantan.pref.fastChat == 'true' ? 250 : data.delay)
          }
          
          else {
            Kantan.chat.progress();
          }
        }
        
        // delay node which delays the next message/action by the specified time
        else if (data.delay) {
          setTimeout(Kantan.chat.progress, Kantan.pref.fastChat == 'true' ? 250 : data.delay);
        }
      },
      
      
      // write a reply prompt into the chat
      writeReply : function (data) {
        // skip a score-based reply if the user's score (problems correctly solved) is not equal to the requirement for the message
        if (typeof data.score != 'undefined' && data.score != Kantan.chat.score) {
          return Kantan.chat.progress();
        }
        
        var reply_id = Kantan.chat.reply_id;
        
        // reset last message
        Kantan.chat.last = '';

        // standard multiple choice reply
        if (data.reply) {
          var opts = '', answer,
              i = 0,
              j = data.reply.length,
              problem = data.problem || false;

          // cache reply data for after input
          Kantan.chat.reply_data = data;
          Kantan.chat.reply_data.reply_id = Kantan.chat.reply_id++;

          // parse reply options
          for (; i < j; i++) {
            // some anwers are arrays with unique responses, so check first before setting the text
            answer = typeof data.reply[i] === 'object' ? data.reply[i][0] : data.reply[i];

            // finally add the option
            // answers that begin with "〇" are correct answers that add +1 to score
            opts += '<div class="reply-choice" tabindex="0" onclick="Kantan.chat.reply(Kantan.chat.reply_data, this);" onkeypress="/Enter| /i.test(event.key) && Kantan.chat.reply(Kantan.chat.reply_data, this); event.preventDefault();"' + ( answer.charAt(0) == '〇' ? 'data-answer="true"' : '') + ' data-index="' + i + '">' + Kantan.chat.cleanMsg(answer) + '</div>';
          }

          // insert reply options into chat
          Kantan.chat.insertMessage(
            '<div id="reply_id_' + reply_id + '" class="message-box right-side">'+
              '<div class="reply-box' + (problem ? ' answer-box' : '') + '">'+
                '<div class="reply-title"></div>'+
                opts+
              '</div>'+
            '</div>'
          );
        }

        // input based reply
        if (data.input_reply) {
          var reply = data.input_reply;

          // cache reply data for after input
          Kantan.chat.reply_data = data;
          Kantan.chat.reply_data.reply_id = Kantan.chat.reply_id++;

          // insert input field
          Kantan.chat.insertMessage(
            '<div id="reply_id_' + reply_id + '" class="message-box input-box right-side">'+
              '<div class="reply-box">'+
                '<div class="reply-title"></div>'+
                '<div class="input-box-info">' + reply.info + '</div>'+
                '<div class="input-box-container">'+
                  '<input id="kantan-chat-data_' + reply.id + '" type="text" onkeydown="/Enter/i.test(event.key) && Kantan.chat.reply(Kantan.chat.reply_data, this);"' + ( reply.placeholder ? ' value="' + reply.placeholder + '"' : '' ) + '>'+
                  '<button class="button" onclick="Kantan.chat.reply(Kantan.chat.reply_data, this);"><i class="fa">&#xf1d8;</i>Send</button>'+
                '</div>'+
              '</div>'+
            '</div>'
          );
        }
      },
      
      
      // write the user reply and process input data
      reply : function (data, caller) {
        // input reply
        if (/button|input/i.test(caller.tagName)) {
          var reply = data.input_reply,
              val = document.getElementById('kantan-chat-data_' + reply.id).value;

          // don't initiate reply if no value
          if (!val) {
            if (reply.error) alert(reply.error);
            return false; 
          }

          // sanitize the value if available
          else {
            val = sanitizeString(val);
          }

          // store variable data in localStorage
          if (reply.save) {
            localStorage['KN_ChatData_' + reply.id] = val;

            // update internal variables for the chat
            switch (reply.id) {
              case 'NAME':
                Kantan.chat.username = val;

              default:
                break;
            }
          }

          // remove the reply prompt
          Kantan.chat.removeMessage('reply_id_' + data.reply_id);

          // insert the user's reply into the chat
          Kantan.chat.insertMessage(
            '<div id="reply_id_' + data.reply_id + '" class="message-box right-side">'+
              '<div class="message-list">'+
                '<div class="message-row"><div class="message">' + Kantan.chat.cleanMsg(reply) + '</div></div>'+
              '</div>'+
            '</div>'
          );

          // wait a few before continuing the chat
          setTimeout(Kantan.chat.progress, Kantan.pref.fastChat == 'true' ? 250 : 500);
        }
        
        // standard reply
        else {
          var reply = data.reply,
              msg = data.reply[+caller.dataset.index],
              correct, branch, falseFlag;
          
          // increment score params if a scored problem
          if (data.problem) {
            correct = caller.dataset.answer == 'true';
            
            if (correct) Kantan.chat.score++;
            else Kantan.stats.mistakes++;
            Kantan.stats.problems++;
            Kantan.stats.solved++
          }
          
          // correct message if it contains other objects
          if (typeof msg == 'object' && msg.length > 1) {
            // set the branch messages if available
            if (msg[1]) {
              // branches can be set as an object {} or array if multiple messages [{}, {}, {}]
              Kantan.chat.branch = msg[1][0] ? msg[1] : [msg[1]];
            }
            
            // finally fix the message so it inserts the string instead of the object
            msg = msg[0];
          }
          
          // remove the reply prompt
          Kantan.chat.removeMessage('reply_id_' + data.reply_id);
          
          // falsely display answer as incorrect to trick the user
          falseFlag = /\{FLAG:INCORRECT\}/.test(msg);

          // insert the user's reply into the chat
          Kantan.chat.insertMessage(
            '<div id="reply_id_' + data.reply_id + '" class="message-box right-side' + (data.problem ? ' reply-' + ((correct && !falseFlag) ? 'correct' : 'wrong') : '') + (falseFlag ? ' falseIncorrect' : '') + '">'+
              '<div class="message-list">'+
                '<div class="message-row"><div class="message">'+
                  // translation button
                  (data.translation ? '<div class="translation-toggle"><a href="#" class="translation-toggler" onclick="Kantan.chat.translate(this); return false;">Show translation</a></div>' : '')+
            
                  // standard message
                  '<span class="message-original">'+
                    Kantan.chat.cleanMsg(msg)+
                  '</span>'+
            
                  // translated message
                  (data.translation ? '<span class="message-translated" style="display:none;">'+
                    Kantan.chat.parseMsg(data.translation[+caller.dataset.index])+
                  '</span>' : '')+
                '</div></div>'+
              '</div>'+
            '</div>'
          );

          // wait a few before continuing the chat
          setTimeout(Kantan.chat.progress, Kantan.pref.fastChat == 'true' ? 250 : (data.delay || 500));
        }
        
        // clear reply data
        delete Kantan.chat.reply_data;
      },
      
      
      // cleans the message of various elements used for answers and other functionality
      cleanMsg : function (str) {
        if (typeof str !== 'string' || !str) {
          if (str.response) str = str.response;
          else if (str.message) str = str.message;
          else return 'MISSING_STRING';
        }
        
        return str.replace(/^〇|\{FLAG:.*?\}/g, '');
      },
      
      
      // parses variables unique to the chat, such as {NAME} for the student's username, emoji like :pout: etc., links and so on...
      parseMsg : function (str) {
        // fixes links when used on a local file system
        if (Kantan.local) {
          str = str.replace(/href\s*=\s*(["'])(?!(?:https?:))([^"']*)\1/gi, function (M, quote, url) {
            var hash = '', query = '', path = url, hashIndex, queryIndex;

            hashIndex = path.indexOf('#');
            if (hashIndex !== -1) {
              hash = path.slice(hashIndex);
              path = path.slice(0, hashIndex);
            }

            queryIndex = path.indexOf('?');
            if (queryIndex !== -1) {
              query = path.slice(queryIndex);
              path = path.slice(0, queryIndex);
            }

            path = path.replace(/[^/]*$/, 'index.html');

            return 'href=' + quote + path + query + hash + quote;
          });
        }
        
        // return the parsed string
        return str.replace(/{NAME}/gm, Kantan.chat.username) // username var
                  // emoji
                  .replace(/:(.*?):/gmi, function(M, $1) {
                    return '<img class="emote" src="' + getPaths() + 'resources/images/kanny/emotes/' + $1.toLowerCase() + '.webp">'
                  })
                  // ensure links always open in a new tab
                  .replace(/<a /gi, '<a target="_blank"');
      },
      
      
      // inserts the HTML into the chat and formats unique chat variables/emoji
      insertMessage : function (html, container) {
        (container || Kantan.chat.messageList).insertAdjacentHTML('beforeend', Kantan.chat.parseMsg(html));
          
        // scroll to newest message
        Kantan.chat.scroll();
        
        // focus the message contents if they contain an input or button
        if (/<input|reply-choice/.test(html)) {
          var focusable = document.querySelector('#' + html.replace(/.*?id="(.*?)".*/, '$1') + ' ' + (/<input/.test(html) ? 'input' : '.reply-choice'));
          
          if (focusable) focusable.focus();
        }
      },
      
      
      // removes the specified message
      removeMessage : function (id) {
        Kantan.chat.messageList.removeChild(document.getElementById(id));
      },
      
      
      // clears the chat
      clear : function (progress) {
        Kantan.chat.messageList.className = 'fade';
        
        setTimeout(function() {
          Kantan.chat.messageList.innerHTML = '';
          Kantan.chat.messageList.className = '';
          
          if (progress) {
            Kantan.chat.progress();
          }
        }, 250);
      },
      
      
      // translates a message
      translate : function (caller) {
        var msg = caller.parentNode.parentNode,
            og = msg.querySelector('.message-original'),
            trans = msg.querySelector('.message-translated');
        
        // translate the message
        if (/none/i.test(trans.style.display)) {
          trans.style.display = '';
          og.style.display = 'none';
          caller.innerText = 'Show original';
        }
        
        // show original message
        else {
          trans.style.display = 'none';
          og.style.display = '';
          caller.innerText = 'Show translation';
        }
      },
      
      
      // scrolls to the bottom of the message list
      scroll : function () {
        Kantan.chat.messageList.scrollTop = Kantan.chat.messageList.scrollHeight;
      },
      
      
      // toggles fullscreen for the chat interface
      toggleFullscreen : function (caller) {
        if (!caller) caller = document.getElementById('kantan-chat-full');
        if (!Kantan.chat.originalIcon) Kantan.chat.originalIcon = caller.innerHTML;
        
        var chat = document.getElementById('kantan-chat'),
            jisho = document.getElementById('quick-jisho-toggle');
        
        // enter full screen mode
        if (!Kantan.chat.fullscreen) {
          if (jisho) jisho.style.right = '20px';
          chat.className += ' fullscreen';
          caller.innerHTML = '<i class="fa">&#xf066;</i>';
          document.body.style.overflow = 'hidden';
          Kantan.chat.fullscreen = true;
        }
        
        // exit full screen mode
        else {
          if (jisho) jisho.style.right = '';
          chat.className = chat.className.replace('fullscreen', '');
          caller.innerHTML = Kantan.chat.originalIcon;
          document.body.style.overflow = '';
          Kantan.chat.fullscreen = false;
        }  
      },
      
      
      // opens a popup with helpful information about Kantan Chat
      help : function () {
        KantanModal.open({
          title : '<span class="en">How to Use Kantan Chat</span><span class="ja">かんたんChatの使い方</span>',
          content : '<p class="clear" style="padding-top:55px;"><img src="' + getPaths() + 'resources/images/kanny/kanny_happy.webp" style="max-height:200px; float:left; margin-top:-55px; margin-right:5px; cursor:pointer;" onclick="this.src = \'' + getPaths() + 'resources/images/kanny/kanny_pout.webp\'">In Kantan Chat you will converse with our website\'s mascot, Kan-tan. This exercise type is similar to our multiple choice exercises, but more conversational. And unlike multiple choice exercises, Kan-tan will correct you if you\'re wrong and tell you why your answer was wrong, in addition to letting you know the correct way to respond.</p>'+
          
          '<h4 class="sub-title">About Replies</h4>'+
          '<p>One important thing to note is that <b>not all of your replies count towards your exercise score</b>, so feel free to choose whichever reply you like. Replies that ARE scored are marked with the <span class="graded"></span> label, so pay special attention to these replies as they will affect your score! You can see an example of our reply field below.</p>'+
          
          '<div class="message-box right-side" style="padding:0;">'+
            '<div class="reply-box answer-box" style="margin:0 auto; display:block;">'+
              '<div class="reply-title"></div>'+
              '<div class="reply-choice" tabindex="0">Answer 1</div>'+
              '<div class="reply-choice" tabindex="0">Answer 2</div>'+
            '</div>'+
          '</div>'+
          
          '<p>Just like with multiple choice, select the answer that you think is the most appropriate for graded replies. And whatever you like for standard replies!</p>'+
          
          '<h4 class="sub-title">Correct and Wrong Answers</h4>'+
          '<p>If the answer you selected was correct, it will be marked with the <span class="reply-correct"></span> label. On the other hand, if the answer you selected was wrong, it will be marked with the <span class="reply-wrong"></span> label. If you got any answers wrong, be sure to look back in the chat for this label so that you can find and review Kan-tan\'s advice!</p>'+
          
          '<h4 class="sub-title">Input Replies</h4>'+
          '<p>Some replies may prompt you for input, such as your name. The data you input during these replies is saved and used later on in other chats with Kan-tan, giving the feeling that Kan-tan actually remembers what you told her! If you ever want to change or delete this data, you can do so via the <b>Settings Manager</b> under the <b>Kantan Chat Settings</b> section.</p>'+
          
          '<h4 class="sub-title">Message Speed</h4>'+
          '<p>By default, messages from Kan-tan arrive at a speed of 1 to 1.5 seconds to make the chat flow feel relatively natural. If you feel this is too slow or want to pick up where you left off, click the <b>Fast Chat</b> button below the chat box to enable Fast Chat mode. In this mode, all messages arrive at a speed of 0.25 seconds which is nigh instant.</p>'+
          '<div class="center">'+
            '<button id="toggle-fast-chat" class="button opt-off" onclick="Kantan.destroyCandy();"><i class="fa">&#xf050;</i><span class="en">Fast Chat: OFF</span><span class="ja">速いチャット：OFF</span></button><br>'+
            '<small>※This is a demo button and doesn\'t actually work. Don\'t click it. Seriously, don\'t.</small>'+
          '</div>'+
          '<p>Click the Fast Chat button again if you want to return the chat to its normal speed.</p>',

          customSize : {
            top : '5%',
            left : '20%',
            right : '20%',
            bottom : '10%'
          }
        });
      }
    },
    
    
    // destroy's Kan-tan's candy stash
    destroyCandy : function () {
      KantanModal.open({
        title : 'Candy Annihilated',
        content : '<p class="center t-25">You made Kan-tan cry!</p>'+

        '<div class="center"><img src="' + getPaths() + 'resources/images/kanny/kanny_cry.webp" style="max-height:400px;"></div>'+
        
        '<p class="center t-25">That button you just clicked destroyed Kan-tan\'s candy stash! How could you do such a thing!?</p>',

        customSize : {
          top : '5%',
          left : '20%',
          right : '20%',
          bottom : '10%'
        }
      });
    },
    
    
    // gets the next review date and streak for an exercise using SM-2 formula
    //     score = a score from 0-100 (usually from Kantan.stats.score)
    //     wrong = number of problems wrong (usually from Kantan.stats.mistakes)
    //    streak = the user's passing review streak for this exercise (stored in localStorage.KantanResults)
    // firstTime = boolean; ignores streak incrementation if no previous reviews are logged so the user can review the exercise on the next day
    // returns an object with the next review date and the streak (the exercise is retired after 5 passing reviews in a row)
    // usage: Kantan.getNextReviewData(EXERCISE_SCORE, WRONG_COUNT, PERFECT_STREAK, FIRST_TIME); Kantan.getNextReviewData(100, 0, 3, false), Kantan.getNextReviewData(100, 0, 0, true)
    getNextReviewData : function (score, wrong, streak, firstTime) {
      score = score || 0;
      wrong = wrong || 0;
      streak = streak || 0;
      
      // increment streak UNLESS this is the first time the user has done this exercise
      if (!firstTime) {
        // increment the streak by 1 if the student passes with high marks (e.g., an A) or only gets 1 problem wrong with a passing score
        if (score >= 90 || (wrong <= 1 && score >= 75)) {
          streak++;
        } 
        // soft fail (60-89)
        // 80-89 = -1 streak
        // 70-79 = -2 streak
        // 60-69 = -3 streak
        else if (score >= 80) {
          streak--;
        }
        else if (score >= 70) {
          streak -= 2;
        }
        else if (score >= 60) {
          streak -= 3;
        }
        // hard fail; reset streak for reviewing the next day
        else {
          streak = 0;
        }
      }

      // ensure the streak never drops below 0
      if (streak < 0) {
        streak = 0;
      }

      // if the user has 5 perfect reviews in a row, consider the exercise content "mastered" which will retire it for reviews
      if (streak >= 5) {
        return {
          reviewDate : 'mastered',
          streak : streak > 5 ? 5 : streak
        };
      }

      // calculate easiness factor
      var quality = Math.max(0, Math.min(5, (score / 20))),
          easinessFactor = 2.5 + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

      if (easinessFactor < 1.3) {
        easinessFactor = 1.3;
      }

      // determine the interval for the next review
      var interval = 1;

      // review tomorrow if the score is less than 60 (a fail), no streak is set, or this is the first time the user has reviewed this exercise
      if (score < 60 || streak == 0 || firstTime) {
        interval = 1;
      }

      // increments the next review interval based on the passing review streak
      // streak 0: 1 day (initial firstTime streak; streak incrementation is ignored)
      // streak 1: 6 days
      // streak 2: 15 days
      // streak 3: 38 days
      // streak 4: 94 days
      // streak 5: retired
      else {
        interval = Math.ceil(6 * Math.pow(easinessFactor, streak - 1));
        
        // apply some fuzz so reviews don't all fall on the same day
        var fuzzFactor = (0.25 - (streak * 0.05)) || 0.05,
            fuzzRange = Math.ceil(interval * fuzzFactor),
            randomShift = Math.floor(Math.random() * (fuzzRange * 2 + 1)) - fuzzRange;

        interval += randomShift;
        if (interval < 1) interval = 1;
      }

      // finally, set and return the next review date and current streak
      var nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);
      nextReviewDate.setHours(0, 0, 0, 0);

      return {
        reviewDate : nextReviewDate,
        streak : streak
      };
    },
    
    
    // converts to half-width characters if full-width (e.g. ＡＢＣ --> ABC)
    // used in check.answers to reduce erroneous incorrect answers due to usage of full-width characters.
    toHalfWidth : function (str) {
      return str.replace(/[\uFF01-\uFF5E]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
      });
    },
    
    // cleans answer strings of certain characters and normalizes case/char type to make matching less strict
    normalizeString : function (str, opt) {
      var s = Kantan.toHalfWidth(str).toLowerCase(), alt;
      
      // keeps alt answers for %(ALT1/ALT2/ETC)
      if (opt == 'keepAlts') {
        alt = str.match(/%\(.*?\)/);
        
        // remove alts to prevent them being cleaned
        if (alt && alt[0]) {
          s = s.replace(alt[0], 'ALT_ANSWERS');
        }
      }
      
      // clean string
      s = s.replace(/～|~|。|、|\,|\.|「|」|【|】|『|』|^\s+|\s+$|\n|\(|\)|（|）/g, '');
      
      // reinsert alts
      if (opt == 'keepAlts' && alt && alt[0]) s = s.replace('ALT_ANSWERS', alt[0]);
      
      return s;
    },
    
    // masks a string with _ to make it harder to identify the hint
    maskString : function (str) {
      if (typeof str !== 'string' || str.length == 0) return '';
      
      // normalize string to remove unnecessary characters that aren't helpful for the hints
      str = Kantan.normalizeString(str);

      var rep = '？', // replacement character
          n = str.length,
          maskLen = Math.min(n, Math.max(1, Math.round(n * 0.50))), // replaces 50% of string with the replacement character
          indices = [],
          idx, chars, i;
      

      if (maskLen >= n) return new Array(n + 1).join(rep);
      
      while (indices.length < maskLen) {
        idx = Math.floor(Math.random() * n);
        if (indices.indexOf(idx) === -1) {
          indices.push(idx);
        }
      }

      chars = str.split('');
      for (i = 0; i < indices.length; i++) {
        chars[indices[i]] = rep;
      }

      return chars.join('');
    },
    
    // shows the hint in written vocab exercises
    vocabHint : function (caller, id) {
      caller.parentNode.style.display = 'none';
      document.getElementById(id).style.display = '';
    },
    
    // underlines text in exercises where you need to underline parts of a sentence
    underline : function (caller, answer) {
      var input = caller.parentNode.getElementsByTagName('INPUT')[0],
          parts = caller.parentNode.querySelectorAll('span:not(.writing-zone)'), i = 0, j = parts.length, next;
      
      // reset class and remove the underline for each part of the sentence
      for (; i < j; i++) {
        parts[i].className = '';
        parts[i].dataset.mistakes = '0';
      }
      
      // apply the underline for the caller and the siblings next to it
      caller.className += 'ul-color inline';
      caller.dataset.mistakes = answer == '0' ? 1 : 0;
      next = caller.nextSibling;
      
      while (next) {
        next.className += 'ul-color inline';
        next.dataset.mistakes = answer == '0' ? 1 : 0;
        next = next.nextSibling;
      }
      
      // set the value for the answer field
      input.value = answer;
    },
    
    // selects the clicked answer for multi-choice input fields
    selectAnswer : function (caller, alpha) {
      var parent = caller;
      
      while (!/writing-zone/.test(parent.className)) {
        parent = parent.parentNode;
        
        if (parent.tagName == 'BODY') {
          break;
        }
      }
      
      var trigger = parent.querySelectorAll('.insert-trigger'), i = 0, j = trigger.length;
      
      // remove the underline for already selected triggers
      for (; i < j; i++) trigger[i].className = 'insert-trigger';
      
      // underline clicked trigger
      caller.className += ' selected-trigger';
      
      // set value for answer field
      parent.querySelector('.writing-zone-input').value = caller.innerHTML;
    },
    
    // functions that check the value of input fields
    check : {
      // checks the value of the current input and automatically moves onto the next input if the value is correct
      // speeds things up, so the student doesn't need to click or tab into the next input field
      busy : false, // prevents IMEs from triggering multiple input events when a value is correct
      value : function (input) {
        if (!Kantan.check.busy && input.value == input.dataset.answer) {
          Kantan.check.busy = true;
          
          var next = Kantan.input.map[Kantan.input.index + 1];

          // focuses the next input if available, otherwise it asks if the student wants to check their answers
          if (next) {
            next.focus();

          } else {
            window.setTimeout(function() { // delay required since final value seems to be erased when checked immediately
              input.blur();
              Kantan.check.answers(true);
              Kantan.check.busy = false;
            }, 10);
          }
        }
        
        // checks if currently busy processing the previous answer
        else if (Kantan.check.busy) {
          window.setTimeout(function() { // delay required to prevent text duplication when proceeding to already filled inputs
            Kantan.check.busy = false;
            
            // use `document.activeElement` over `input` as the latter causes previously input text to disappear on firefox
            if (document.activeElement && document.activeElement.value && document.activeElement.value == Kantan.input.map[Kantan.input.index - 1].value) { // clears up duplicated texts from IMEs on current input
              document.activeElement.value = '';
            }
          }, 10);
        }
      },
      
      
      // check the answers for writing exercises
      // mapEnded means the end of Kantan.input.map was reached via Kantan.check.value()
      answers : function (mapEnded, type) {
        !Kantan.exerciseComplete && KantanModal.open({
          title : '<span class="en">Check Answers?</span><span class="ja">答え合わせをしますか？</span>',
          content : mapEnded ? '<span class="en">The last input field has been filled in. Are you ready to check your answers?</span><span class="ja">最後の入力欄が入力されました。答え合わせをしてもよろしいですか？</span>' : '<span class="en">Checking your answers will end the quiz. Do you want to continue?</span><span class="ja">答え合わせをするとテストが終了します。よろしいですか？</span>',
          buttonHTML : '<span class="en">Yes, check my answers!</span><span class="ja">はい、答え合わせをしよう！</span>',
          buttonColor : 'green',
          
          callback : function () {
            Kantan.exerciseComplete = true;

            // hide check answers button
            document.querySelector('#check-answers button').style.display = 'none';
            
            // kanji/kana drawing quizzes
            if (type && type == 'drawing') {
              var answer = document.querySelectorAll('.kanji-canvas'), i = 0, j = answer.length, kanji;
              
              for (; i < j; i++) {
                kanji = KanjiCanvas.recognize(answer[i].id); // find kanji with the given strokes
                
                // debugging (logs info about matched kanji, match index, and whether the answer was correct or not)
                Kantan.debug && console.log('toDraw: ' + answer[i].dataset.kanji);
                Kantan.debug && console.log('Results: ' + kanji);
                Kantan.debug && console.log('Correct: ' + (new RegExp(answer[i].dataset.kanji).test(kanji) && answer[i].dataset.strokesAnswer == answer[i].dataset.strokes).toString());
                
                // correct answer
                if (new RegExp(answer[i].dataset.kanji).test(kanji) && answer[i].dataset.strokesAnswer == answer[i].dataset.strokes) {
                  answer[i].dataset.answer = true;
                } 
                
                // incorrect answer
                else {
                  answer[i].dataset.answer = false;
                  ++Kantan.stats.mistakes;
                }
                
                ++Kantan.stats.solved;
              }
            } 
            
            // standard written quizzes
            else {
              // loop over the inputs and check to see if the answers are correct
              var input = document.querySelectorAll('#exercise .writing-zone-input'),
                  i = 0, j = input.length, k, correct, val, data, answer, answerClean, alt, match, prefix, suffix, l, m;

              for (; i < j; i++) {
                correct = false;
                data = input[i].dataset;
                val = Kantan.normalizeString(input[i].value);

                // check for the correct answer
                for (k in data) {
                  if (/answer/.test(k)) {
                    answer = Kantan.normalizeString(data[k], 'keepAlts');
                    
                    // check if there's alternative answers in the answer
                    // alternative answers are given as %(alt1/alt2/etc.)
                    if (/%\(.*?\)/.test(answer)) {
                      match = answer.match(/^(.*?)%\((.*?)\)(.*)$/);
                      
                      if (match) {
                        alt = match[2].split('/');
                        prefix = match[1];
                        suffix = match[3];
                        l = 0;
                        m = alt.length;
                        
                        // check in alternatives for correct answer
                        while (l < m) {
                          if (val == (prefix + alt[l] + suffix)) {
                            correct = true;
                            break; // break out if correct answer is found
                          }
                          l++;
                        }
                      }
                    }

                    // otherwise check the answer normally
                    else if (val == answer) {
                      correct = true;
                    }

                    // break out of the loop when a correct answer is found 
                    if (correct) break;
                  }
                }

                // add classname to correct answers
                if (correct) {
                  var parent = input[i].parentNode.parentNode;
                  
                  if (parent && /underline-field-answer/.test(parent.className)) {
                    parent.parentNode.className += ' answer-correct';
                  } else {
                    input[i].parentNode.className += ' answer-correct';
                  }
                }

                // increment mistakes if the answer is incorrect
                else {
                  ++data.mistakes;
                  ++Kantan.stats.mistakes;

                  if (type == 'fill') {
                    input[i].parentNode.insertAdjacentHTML('beforeend', ('<span class="problem-answer">' + data.answer + (data.answer2 || data.furigana ? '<span class="secondary-answer' + (data.furigana ? ' furigana-only' : '') + '">' + (data.answer2 || data.furigana) + '</span>' : '') + '</span>').replace(/%\((.*?)\)/g, function (Match, $1) {
                      return '<span class="alt-phrase">(</span>' + $1.replace(/\//g, '<span class="alt-phrase-sep">/</span>') + '<span class="alt-phrase">)</span>'
                    }));
                  }
                }

                // increment problems solved
                ++Kantan.stats.solved;

                // disable the input
                input[i].disabled = true;
              }
            }

            Kantan.endQuiz(type ? type : 'writing'); // show quiz results
          }
        });
      },
      
      
      // checks a single answer in written quizzes and returns feedback
      answer : function (caller) {
        // open modal to show if answer is correct or not
        KantanModal.open({
          title : 'Quick Answer Checker',
          content : '<div id="answer-checker-result" class="loading"></div>',
          closeButtonHTML : '<span class="en">Return to Quiz</span><span class="ja">テストに戻る</span>',
          customSize : {
            top : '10%',
            left : '20%',
            bottom : '10%',
            right : '20%'
          },
          zIndex : 'low'
        });
        
        var correct = false,
            result = document.getElementById('answer-checker-result'),
            input = caller.parentNode.previousSibling,
            data = input.dataset,
            val = Kantan.normalizeString(input.value),
            note = '<div class="sub-note">※Though they may not be listed, additional mixed kana/kanji answers are also possible in addition to some writing style variations, such as している <i class="fa">&#xf061;</i> してる.</div>',
            diff = [], diffScore = 0, diffResult = '', closest = Infinity,
            answers = '<ol class="correct-answers t-green">', // list of correct answers
            answer, alt, k, match, prefix, suffix, i, j;
        
        // add silly message to popup content if there is no text in the input field
        if (!input.value && !Kantan.quizOver) {
          result.innerHTML = '<br><p>...You\'re not trying to cheat, are you?<div class="center"><img src="' + getPaths() + 'resources/images/kanny/kanny_pout.webp" width="300"></div></p>';
          result.className = '';
          return false;
        }
        
        // check for the correct answer
        for (k in data) {
          if (/answer/.test(k)) {
            // store internal answers and diffs for showing the student as long as it isn't a getAlts answer
            if (!(data[k].charAt(0) == '%' && data[k].slice(-1) == ')')) {
              answers += '<li>'+
                data[k].replace(/%\((.*?)\)/g, function (Match, $1) {
                  return '<span class="alt-phrase">(</span>' + $1.replace(/\//g, '<span class="alt-phrase-sep">/</span>') + '<span class="alt-phrase">)</span>'
                })+
              '</li>';
              
              // store diffs for comparison later
              diff.push(Kantan.getAnswerDiff(input.value, data[k]));
            }
            
            if (!correct) {
              // clean and normalize answer for checking
              answer = Kantan.normalizeString(data[k], 'keepAlts');
              
              // check if there's alternative answers in the answer
              // alternative answers are given as %(alt1/alt2/etc.)
              if (/%\(.*?\)/.test(answer)) {
                match = answer.match(/^(.*?)%\((.*?)\)(.*)$/);

                if (match) {
                  alt = match[2].split('/');
                  prefix = match[1];
                  suffix = match[3];
                  i = 0;
                  j = alt.length;

                  // check in alternatives for correct answer
                  while (i < j) {
                    if (val == (prefix + alt[i] + suffix)) {
                      correct = true;
                      break; // break out if correct answer is found
                    }
                    i++;
                  }
                }
              }

              // otherwise check the answer normally
              else if (val == answer) {
                correct = true;
              }
            }
          }
        }
        
        // close answers list
        answers += '</ol>';
        
        // remove loading placeholder
        result.className = '';
        
        // let the student know their answer is correct
        if (correct) {
          result.innerHTML =
            '<p>Your answer is <span class="t-green">correct</span>! Good job!</p>'+
            
            '<div class="mid-title">Your Answer</div>'+
            '<div class="t-green">' + input.value + '</div><br>'+
            
            '<div class="mid-title">Correct Answer' + (data.answer2 ? 's' : '') + '</div>'+
            answers + note;
        }
        
        // let the student know their answer is NOT correct
        else {
          // find the closest difference
          for (var i = 0, j = diff.length, diffScore; i < j; i++) {
            diffScore = diff[i].length + diff[i].replace(/.*?<.*?>(.*?)<.*?>.*?/g, '$1').length;
            
            if (diffScore < closest) {
              closest = diffScore;
              diffResult = diff[i];
            }
          };
          
          // show current answer and correct answers
          result.innerHTML =
            '<p>Sorry, but your answer is <span class="t-red">incorrect</span>.</p>'+
            
            '<div class="mid-title">Your Answer</div>'+
            '<p style="font-size:16px;">' + (!input.value ? 'You didn\'t even write an answer down, silly!' : !/answer-diff/.test(diff) ? 'Your answer is close, but <span class="ul-color">something is missing</span>!' : /^<span class="answer-diff">[^<\/>]*?<\/span>$/.test(diff) ? 'Your <span class="ul-color">entire</span> answer is wrong.' : '<span class="ul-color">Some parts</span> of your answer are wrong.') + '</p>'+
            '<div class="t-green">' + diffResult + '</div><br>'+
            
            '<div class="mid-title">Correct Answer' + (data.answer2 ? 's' : '') + '</div>'+
            (!Kantan.quizOver ? 
             '<p style="font-size:16px;">It is recommended to ONLY reveal the answers below if you are stumped.</p>'+
             '<button class="button yellow" onclick="this.nextSibling.style.display = \'\'; this.style.display = \'none\';"><i class="fa">&#xf2b7;</i>Reveal Answers</button>' : ''
            )+
            ((!Kantan.quizOver ? '<div style="display:none;">' : '') + answers + note.replace('</div>', '<br>If you suspect there\'s an error with these results, please contact us <a href="' + getPaths() + 'contact/' + Kantan.local + '" target="_blank">here</a>.</div>') + (!Kantan.quizOver ? '</div>' : ''));
        }
      },
      
      
      // checks the drawn kanji to see if it is correct
      kanji : function (caller) {
        var answer = caller.className == 'kanji-canvas' ? caller : caller.parentNode.parentNode.querySelector('.kanji-canvas'),
            kanji = KanjiCanvas.recognize(answer.id);

        // debugging (logs info about matched kanji, match index, and whether the answer was correct or not)
        Kantan.debug && console.log('toDraw: ' + answer.dataset.kanji);
        Kantan.debug && console.log('Results: ' + kanji);
        Kantan.debug && console.log('Correct: ' + (new RegExp(answer.dataset.kanji).test(kanji) && answer.dataset.strokesAnswer == answer.dataset.strokes).toString());

        // correct answer
        if (new RegExp(answer.dataset.kanji).test(kanji) && answer.dataset.strokesAnswer == answer.dataset.strokes) {
          answer.dataset.answer = true;
        } 

        // incorrect answer
        else {
          answer.dataset.answer = false;
        }
      },
      
      
      // checks the answer in written vocab exercises
      vocabAnswer : function (id) {
        var input = document.getElementById(id), problem, answer, example, next,
            cleanString = function (str) {
              return Kantan.normalizeString(str);
            };
        
        if (input) {
          answer = cleanString(input.value);
          problem = input.parentNode;
          example = problem.parentNode.parentNode.querySelector('.multi-vocab-sentence-ja');
          next = problem.parentNode.parentNode.querySelector('.next-question');
          
          // reset class value so classes are not duplicated
          problem.className = problem.className.replace(/answer-correct|answer-wrong/, '');
          
          // correct
          if (answer == cleanString(input.dataset.answer) || (input.dataset.answer2 && answer == cleanString(input.dataset.answer2)) ||
              answer == cleanString(input.dataset.answer.replace(/\(.*?\)|（.*?）/, '')) || (input.dataset.answer2 && answer == cleanString(input.dataset.answer2.replace(/\(.*?\)|（.*?）/, '')))) {
            problem.className += ' answer-correct';
            problem = problem.parentNode.parentNode;
            
            // show japanese example sentence
            example.style.visibility = 'visible';
            
            // focus next button
            next.focus();
            
            // auto-progress to the next problem (disabled)
            // note: maybe consider adding this as an option
            /*window.setTimeout(function () {
              if (!/none/.test(problem.style.display)) {
                problem.querySelector('.next-question').click();
              }
            }, 500);*/
          }
          
          // incorrect
          else {
            problem.className += ' answer-wrong';
            problem.dataset.wrong = 'true';
            
            // increment mistake counters
            +problem.dataset.mistakes++;
            Kantan.stats.mistakes++;
          }
        }
      },
      
      
      // checks the read state for the current page
      // pass along true to init to add the mark as read button to a page and initiate the scroll listener
      // place <div id="quiz-timer"></div> at the bottom of a page's content-block to insert the button at the bottom of the page
      readState : function (init) {
        if (storageOK) {
          if (init) { // insert mark as read button upon page load
            document.getElementById('quiz-timer').insertAdjacentHTML('beforebegin', 
              '<div id="list-controls-bottom" class="center">'+
                '<button id="mark-as-read" class="button opt-off" onclick="Kantan.toggle.readState();"></button>'+
              '</div>'
            );
            
            // add read progress bar and initiate scroll listener
            Kantan.check.readProgress(true);
          }
          
          var button = document.getElementById('mark-as-read'),
              path = window.location.pathname.replace(/.*?\/lessons\/lesson-(\d+\/.*?)\/.*/, '$1'),
              results = Kantan.exerciseResults || JSON.parse(localStorage.KantanResults),
              read;
          
          // marks read
          if (button) {
            if (results[path] == 'R') {
              button.innerHTML = Kantan.lang.marked_read;
              button.className = 'button dark-green';
              read = true;
            }

            // marks unread
            else {
              button.innerHTML = Kantan.lang.marked_unread;
              button.className = 'button opt-off';
              read = false;
            }
            
            // set listener to auto-mark exercise read once, if unread
            // deprecated: readProgress now handles auto-marking
            /*if (init && !read) {
              Kantan.check.markReadVisibility();
              document.addEventListener('scroll', Kantan.check.markReadVisibility);
            }*/
            
            // jump to the beginning of a read-only page IF no hash is applied
            if (init && !window.location.hash && (!results[path] || results[path] == 'R')) {
              Kantan.scrollTo('#main-title', true);
              window.location.hash = '#main-title'; // set hash so the jump only occurs once
            }
            
            Kantan.readStateToggled = read;
            
            if (!read) {
              // save scroll position in article if not marked as read
              document.addEventListener('scroll', function () {
                if (!Kantan.readStateToggled) {
                  // save updated scroll state to local storage after a slight delay so we don't abuse the browser with thousands of JSON.stringify calls
                  if (window.KN_SaveScrollState) clearTimeout(window.KN_SaveScrollState);
                  window.KN_SaveScrollState = setTimeout(function () {
                    if (Kantan.readStateToggled) return; // prevent overwriting read state if marked read before this function triggers
                    results[path] = 'R' + document.getElementById('read-progress-text').innerText.match(/\d+/)[0] + '|' + (window.pageYOffset != null ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop).toFixed();
                    localStorage.KantanResults = JSON.stringify(results);
                  }, 100);
                }
              });
              
              // restore scroll position in article after a slight delay to compensate for sudden page jumps from images and such
              if (results[path] != 'R') {
                setTimeout(function () {
                  window.scrollTo({ top : results[path].split('|')[1] });
                }, 100);
              }
            }
          }
        }
      },

      // checks if the mark read button is visible and auto marks it if it is
      // deprecated: readProgress now handles auto-marking read
      /*markReadVisibility : function () {
        if (Kantan.pref.autoRead == 'false') return false;
        if (!Kantan.readStateToggled) {
          var rect = document.getElementById('mark-as-read').getBoundingClientRect(),
              visible = rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight) - (rect.height)) &&
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth);

          if (visible) {
            Kantan.toggle.readState();
          }
        }
      },*/
      
      
      // adds a read progress bar and checks how much of an article has been read
      readProgress : function (init) {
        if (init === true) {
          document.body.insertAdjacentHTML('afterbegin', '<div id="read-progress-container"><div id="read-progress"></div><div id="read-progress-text"></div></div>');
          document.addEventListener('scroll', Kantan.check.readProgress, false);
        }

        var read = document.getElementById('mark-as-read'),
            main = document.getElementById('main-title'),
            scrollTop = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
        
        if (read && main) {
          var rect = read.getBoundingClientRect(),
              offset = main.getBoundingClientRect().top + scrollTop,
              scrollTop = scrollTop - (offset - 25),
              end = ((rect.top + scrollTop) - ((window.innerHeight || document.documentElement.clientHeight) - (rect.height * 2))),
              progress = document.getElementById('read-progress'),
              percent;
          
          // prevent division by zero
          if (end < 1) end = 1;
          
          // calculate read percent
          percent = (scrollTop - 0) / (end - 0) * 100;
          percent = Math.max(0, Math.min(100, percent)).toFixed(2);
          
          // set read progress bar width and style
          progress.style.width = percent + '%';
          progress.parentNode.className = percent >= 100 ? 'fully-read' : '';
          progress.nextSibling.innerText = 'Read: ' + percent + '%';
          
          // mark article read if at 100%
          if (Kantan.pref.autoRead != 'false' && !Kantan.readStateToggled && percent >= 100) {
            Kantan.toggle.readState();
          }
        }
      },
      
      
      // checks if a word has been entered correctly within an input and applies a colored border to the field
      word : function (caller) {
        if (caller.value) {
          if (Kantan.normalizeString(caller.value) == Kantan.normalizeString(caller.dataset.word)) {
            caller.style.borderColor = 'green';
          } else {
            caller.style.borderColor = 'red';
          }
        } else {
          caller.style.borderColor = '';
        }
      }
    },

    
    // functions that toggle the display of elements
    toggle : {
      
      // toggle the exercise list
      exerciseList : function (button) {
        button.className = button.className == 'list-open' ? '' : 'list-open';
      },
      
      
      // toggles the display of lists
      list : function (el) {
        var closed = 'lesson-title',
            opened = closed + ' lesson-open';

        el.className = el.className == opened ? closed : opened;

        // close any open lists
        for (var a = el.parentNode.querySelectorAll('.lesson-title'), i = 0, j = a.length; i < j; i++) {
          if (a[i] != el) {
            a[i].className = closed;
          }
        }
      },
      
      
      // hides vocab notes in vocabulary lists
      vocabNotes : function (caller, forceHide) {
        // hide notes
        if (Kantan.pref.vocabNotes == 'true' || forceHide) {
          document.body.className += ' no-vocab-notes';
          caller.innerHTML = caller.innerHTML.replace(/ON/g, 'OFF');
          caller.className += ' opt-off';
          Kantan.pref.vocabNotes = 'false';
        }
        
        // show notes
        else {
          document.body.className = document.body.className.replace('no-vocab-notes', '');
          caller.innerHTML = caller.innerHTML.replace(/OFF/g, 'ON');
          caller.className = caller.className.replace('opt-off', '');
          Kantan.pref.vocabNotes = 'true';
        }
        
        // save preference to storage
        if (storageOK) {
          localStorage.KN_VocabNotes = Kantan.pref.vocabNotes;
        }
      },
      
      
      // toggles furigana in drag and drop quizzes
      furigana : function () {
        var body = document.documentElement,
            state = Kantan.pref.furigana || (/furigana-off/.test(body.className) ? 'false' : 'true');
        
        // hide or show the textual aids
        switch (state) {
          case 'true' :
            state = 'false';
            body.className = body.className.replace('furigana-on', 'furigana-off');
            break;
            
          case 'false' :
            state = 'true';
            body.className = body.className.replace('furigana-off', 'furigana-on');
            break;
            
          default :
            break;
        }
        
        // save settings if supported
        Kantan.pref.furigana = state;
        
        if (storageOK) {
          localStorage.KN_Furigana = state;
        }
      },
      
      
      // toggles the multiple choice feedback mode
      feedbackMode : function (button) {
        switch (Kantan.pref.feedbackMode) {
          case 'classic':
            button.innerHTML = button.innerHTML.replace('Classic', 'Instant').replace('クラシック', 'インスタント');
            break;
            
          case 'instant':
            button.innerHTML = button.innerHTML.replace('Instant', 'Classic').replace('インスタント', 'クラシック');
            break;
            
          default:
            break;
        }
        
        KantanSettings.updateFeedbackMode();
      },
      
      
      // toggles the multiple choice vocab spoiler
      vocabSpoilerState : function (button) {
        var zone = document.getElementById('quiz-zone'), state;
        
        switch (Kantan.pref.vocabSpoiler) {
          case 'true':
            button.innerHTML = button.innerHTML.replace(/ON/g, 'OFF');
            button.className += ' opt-off';
            zone.className = zone.className.replace('spoiler-mode', '');
            state = 'OFF';
            break;
            
          case 'false':
            button.innerHTML = button.innerHTML.replace(/OFF/g, 'ON');
            button.className = button.className.replace('opt-off', '');
            zone.className += ' spoiler-mode';
            state = 'ON';
            break;
            
          default:
            break;
        }
        
        KantanSettings.updateSpoilerMode(null, state);
      },
      
      
      // toggles the display of example sentences
      reibunState : function (button) {
        var zone = document.getElementById('quiz-zone'), state;
        
        switch (Kantan.pref.exampleSentences) {
          case 'true':
            zone.className += ' reibun-off';
            button.innerHTML = button.innerHTML.replace(/ON/g, 'OFF');
            button.className += ' opt-off';
            state = 'OFF';
            break;
            
          case 'false':
            zone.className = zone.className.replace('reibun-off', '');
            button.innerHTML = button.innerHTML.replace(/OFF/g, 'ON');
            button.className = button.className.replace('opt-off', '');
            state = 'ON';
            break;
            
          default:
            break;
        }
        
        KantanSettings.updateReibunState(null, state);
      },
      
      
      // toggles the display of vocabulary tags
      vocabTags : function (button) {
        var zone = document.getElementById('quiz-zone'), state;
        
        switch (Kantan.pref.vocabTags) {
          case 'true':
            zone.className += ' vtags-off';
            button.innerHTML = button.innerHTML.replace(/ON/g, 'OFF');
            button.className += ' opt-off';
            state = 'OFF';
            break;
            
          case 'false':
            zone.className = zone.className.replace('vtags-off', '');
            button.innerHTML = button.innerHTML.replace(/OFF/g, 'ON');
            button.className = button.className.replace('opt-off', '');
            state = 'ON';
            break;
            
          default:
            break;
        }
        
        KantanSettings.updateVocabTags(null, state);
      },
      
      
      // toggles the vocab spoiler in multi-choice vocab
      vocabSpoiler : function (button) {
        var spoiler = button.nextSibling;
        
        // turn spoiler on
        if (/spoiler-off/.test(spoiler.className)) {
          spoiler.className = spoiler.className.replace('spoiler-off', '');
          button.innerHTML = button.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
        }
        
        // turn spoiler off
        else {
          spoiler.className += ' spoiler-off';
          button.innerHTML = button.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
        }
      },
      
      
      // toggles the orientation of drag and drop vocab from vertical-vertical to horizontal-horizontal
      vocabOrientation : function (customState) {
        var zone = document.getElementById('quiz-zone'),
            state = customState || 'false',
            answer = document.querySelectorAll('.quiz-answer-zone'),
            i = 0,
            j = answer.length;
        
        // change the vocab orientation
        switch (state) {
          case 'true' :
            state = 'false';
            zone.className = zone.className.replace(' vocab-horizontal', '');
            
            // revert answer zones to their original positions
            for (var dropList = document.getElementById('drop-list'); i < j; i++) {
              dropList.appendChild(answer[i]);
            }
            
            break;
            
          case 'false' :
            state = 'true';
            zone.className += ' vocab-horizontal';
            
            // reposition answer zones
            for (var group = document.querySelectorAll('.quiz-item-group'); i < j; i++) {
              group[i].appendChild(answer[i]);
            }
            
            break;
            
          default :
            break;
        }
        
        // save settings if supported
        if (storageOK && !customState) {
          localStorage.KN_VocabHorizontal = state;
        }
      },
      
      
      // toggles display of stroke numbers in stroke order quizzes
      strokeNumbers : function (button) {
        var zone = document.getElementById('quiz-zone');
        
        // hide or show the textual aids
        switch (Kantan.pref.strokeNumbers) {
          case 'true' :
            Kantan.pref.strokeNumbers = 'false';
            button.innerHTML = button.innerHTML.replace(/ON/g, 'OFF');
            button.className += ' opt-off';
            break;
            
          case 'false' :
            Kantan.pref.strokeNumbers = 'true';
            button.innerHTML = button.innerHTML.replace(/OFF/g, 'ON');
            button.className = button.className.replace('opt-off', '');
            break;
            
          default :
            break;
        }
        
        // save settings if supported
        if (storageOK) {
          localStorage.KN_StrokeNumbers = Kantan.pref.strokeNumbers;
        }
        
        // redraw each canvas
        for (var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length; i < j; i++) {
          if (KanjiCanvas['canvas_' + a[i].id]) KanjiCanvas.redraw(a[i].id, false);
        }
      },
      
      
      // toggles stroke order in stroke order quizzes
      strokeOrder : function (button) {
        var zone = document.getElementById('quiz-zone'),
            state = Kantan.pref.strokeOrder || (/stroke-order-hidden/.test(zone.className) ? 'false' : 'true');
        
        // hide or show the textual aids
        switch (state) {
          case 'true' :
            state = 'false';
            zone.className = zone.className += ' stroke-order-hidden';
            button.innerHTML = button.innerHTML.replace(/ON/g, 'OFF');
            button.className += ' opt-off';
            break;
            
          case 'false' :
            state = 'true';
            zone.className = zone.className.replace(' stroke-order-hidden', '');
            button.innerHTML = button.innerHTML.replace(/OFF/g, 'ON');
            button.className = button.className.replace('opt-off', '');
            break;
            
          default :
            break;
        }
        
        // save settings if supported
        if (storageOK) {
          localStorage.KN_StrokeOrder = state;
        }
        
        // save temp pref
        Kantan.pref.strokeOrder = state;
      },
      
      
      // toggles tracing guides in the stroke order quizzes
      tracingGuide : function (button, drawingPractice) {
        var zone = document.getElementById('quiz-zone'),
            state = Kantan.pref.tracingGuide;
        
        // hide or show the tracing guides
        switch (state) {
          case 'true' :
            state = 'false';
            button.innerHTML = button.innerHTML.replace(/ON/g, 'OFF');
            button.className += ' opt-off';
            break;
            
          case 'false' :
            state = 'true';
            button.innerHTML = button.innerHTML.replace(/OFF/g, 'ON');
            button.className = button.className.replace('opt-off', '');
            break;
            
          default :
            break;
        }
        
        // loop through and update the data-guide value and redraw each canvas
        var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length
        
        // Stroke Order loop
        if (!drawingPractice) {
          for (; i < j; i++) {
            a[i].dataset.guide = state;
            if (KanjiCanvas['canvas_' + a[i].id]) KanjiCanvas.redraw(a[i].id, true);
          }
        }
        
        // Drawing Practice loop
        else {
          for (var n = 0, kanji = ''; i < j; i++) {
            // resets counter if new row
            if (a[i].dataset.kanji != kanji) {
              kanji = a[i].dataset.kanji;
              n = 0;
            }
            
            // changes the guide state of the first 3 canvases
            if (n++ < 3) {
              a[i].dataset.guide = state;
              if (KanjiCanvas['canvas_' + a[i].id]) KanjiCanvas.redraw(a[i].id, true);
            }
          }
        }
        
        // save settings if supported
        if (storageOK) {
          localStorage.KN_TracingGuide = state;
        }
        
        // save temp pref
        Kantan.pref.tracingGuide = state;
      },
      
      
      // toggles fast chat for kantan chat
      fastChat : function (button) {
        var state;
        
        switch (Kantan.pref.fastChat) {
          case 'true':
            button.innerHTML = button.innerHTML.replace(/ON/g, 'OFF');
            button.className += ' opt-off';
            state = 'false';
            break;
            
          case 'false':
            button.innerHTML = button.innerHTML.replace(/OFF/g, 'ON');
            button.className = button.className.replace('opt-off', '');
            state = 'true';
            break;
            
          default:
            break;
        }
        
        KantanSettings.updateFastChat(null, state);
      },
      
      
      // toggles text selection for buttons in multi-choice quizzes
      textSelection : function (button) {
        var zone = document.getElementById('quiz-zone');
        
        // hide or show the textual aids
        switch (Kantan.pref.textSelectMode) {
          case 'true' :
            Kantan.pref.textSelectMode = 'false';
            zone.className = zone.className.replace(' text-selection-mode', '');
            button.innerHTML = button.innerHTML.replace(/ON/g, 'OFF');
            button.className += ' opt-off';
            break;
            
          case 'false' :
            Kantan.pref.textSelectMode = 'true';
            zone.className = zone.className += ' text-selection-mode';
            button.innerHTML = button.innerHTML.replace(/OFF/g, 'ON');
            button.className = button.className.replace('opt-off', '');
            break;
            
          default :
            break;
        }
      },
      
      // toggles display of the script in listening comprehension exercises
      chokaiScript : function (scriptId) {
        var script = document.getElementById('script-' + scriptId);
        
        if (script) {
          script.style.display = /none/.test(script.style.display) ? '' : 'none';
        }
      },
      
      
      // toggles the marked read state for read-only pages
      readState : function () {
        if (storageOK) {
          var button = document.getElementById('mark-as-read'),
              path = window.location.pathname.replace(/.*?\/lessons\/lesson-(\d+\/.*?)\/.*/, '$1'),
              results = Kantan.exerciseResults || JSON.parse(localStorage.KantanResults);

          // unmarks read
          if (results[path] == 'R') {
            delete results[path];
            button.innerHTML = Kantan.lang.marked_unread;
            button.className = 'button opt-off';
          }
          
          // marks read
          else {
            if (!results) results = {};
            results[path] = 'R';
            button.innerHTML = Kantan.lang.marked_read;
            button.className = 'button dark-green';
          }
          
          // update storage and local state
          localStorage.KantanResults = JSON.stringify(results);
          
          // refresh the exercise list with the new results
          var open = document.querySelector('.list-open') ? true : false; // check if menu is open to reopen it
          
          Kantan.create.removeExerciseList();
          Kantan.create.exerciseList();
          
          // reopen exercise list
          if (open) {
            document.getElementById('toggle-exercises').click();
          }
          
          // stops read state from being toggled by scroll listener
          Kantan.readStateToggled = true;
        }
      },
      
      
      // toggles easy input mode for written quizzes
      easyMode : function (caller) {
        // insert TinySegmenter into the page
        if (typeof window.TinySegmenter == 'undefined') {
          Kantan.initTinySegmenter(function () {
            Kantan.toggle.easyMode(caller);
          });
          return;
        }
        
        var state = Kantan.pref.easyMode,
            controls = document.querySelectorAll('.easy-mode-controls'),
            i = 0, j = controls.length;
        
        // turn easy mode off
        if (state == 'true') {
          state = 'false';
          for (; i < j; i++) controls[i].style.display = 'none';
          
          // update button states
          caller.innerHTML = caller.innerHTML.replace(/ON/g, 'OFF');
          caller.className += ' opt-off';
        }
        
        // turn easy mode on
        else {
          state = 'true';
          for (; i < j; i++) controls[i].style.display = '';
          
          // update button states
          caller.innerHTML = caller.innerHTML.replace(/OFF/g, 'ON');
          caller.className = caller.className.replace('opt-off', '');
        }
        
        // update final state
        localStorage.KN_EasyMode = state;
        Kantan.pref.easyMode = state;
      },
      
      
      // toggles Romaji Input mode for written quizzes
      romajiInput : function (caller, init) {
        getScript('lib/wanakana.js', function () {
          var state = init ? false : Kantan.pref.romajiInput,
              input = document.querySelectorAll('.writing-zone-input'),
              controls = document.getElementById('IME_Controls'),
              footer = document.querySelector('footer'),
              i = 0, j = input.length;

          // turn Romaji Input off
          if (state == 'true') {
            state = 'false';
            
            for (; i < j; i++) {
              wanakana.unbind(input[i]);
            }

            // update button states
            caller.innerHTML = caller.innerHTML.replace(/ON/g, 'OFF');
            caller.className += ' opt-off';
            
            // hide ime controls
            if (controls) controls.style.display = 'none';
            if (footer) footer.style.paddingBottom = '';
          }

          // turn Romaji Input on
          else {
            state = 'true';
            Kantan.IMEMode = Kantan.IMEMode ? Kantan.IMEMode : 'Hiragana';
            
            for (; i < j; i++) {
              for (; i < j; i++) {
                wanakana.bind(input[i], {
                  IMEMode: 'to' + Kantan.IMEMode
                });
              }
            }

            // update button states
            if (!init) {
              caller.innerHTML = caller.innerHTML.replace(/OFF/g, 'ON');
              caller.className = caller.className.replace('opt-off', '');
            }
            
            // showIME controls
            if (controls) {
              controls.style.display = '';
            }
            // create IME controls
            else {
              document.body.insertAdjacentHTML('beforeend', '<div id="IME_Controls"><button id="ime-toggle" class="button purple" onclick="Kantan.switchIMEMode(this);" title="Toggle input mode (CTRL+ALT+K)"><i class="fa">&#xf11c;</i><span class="en">Input Mode: Hiragana</span><span class="ja">入力モード：ひらがな</span></button></div>');
            }
            
            if (footer) footer.style.paddingBottom = '60px';
          }

          // update final state
          if (!init) {
            localStorage.KN_RomajiInput = state;
            Kantan.pref.romajiInput = state;
          }
        }, function () { return window.wanakana ? true : false });
      }
      
    },
    
    // switches the IME mode between Hiragana and Katakana when Romaji Input is enabled
    switchIMEMode : function (caller) {
      // switch to Katakana
      if (Kantan.IMEMode == 'Hiragana') {
        Kantan.IMEMode = 'Katakana';
        caller.innerHTML = caller.innerHTML.replace('Hiragana', 'Katakana').replace('ひらがな', 'カタカナ');
      }
      // switch to Hiragana
      else {
        Kantan.IMEMode = 'Hiragana';
        caller.innerHTML = caller.innerHTML.replace('Katakana', 'Hiragana').replace('カタカナ', 'ひらがな');
      }
      
      // update inputs with new IME mode
      for (var input = document.querySelectorAll('.writing-zone-input'), i = 0, j = input.length; i < j; i++) {
        wanakana.unbind(input[i]);
        wanakana.bind(input[i], {
          IMEMode: 'to' + Kantan.IMEMode
        });
      }
    },
    
    // segments a Japanese sentence into words/letters using the native Intl.Segmenter method
    // type = word||grapheme (pass segment:word||grapheme to a problem to force native segmentation; {猫が可愛いですね|ねこがかわいいですね|segment:word})
    segment : function (str, type) {
      str = str || '';
      type = type == 'word' ? 'word' :
             type == 'grapheme' ? 'grapheme' : 'word';
      
      var segmenter = new Intl.Segmenter('ja-JP', { granularity: type }),
          segments = segmenter.segment(str),
          val = [];
      
      segments = Array.from(segments);

      for (var i = 0, j = segments.length; i < j; i++) {
        val.push(segments[i].segment);
      }
      
      return val;
    },
    
    // initialize TinySegmenter
    // flag options for problems in written exercises: {ANSWER1|ANSWER2|answer;exclude} {ANSWER1|ANSWER2|answer;exclude:でも,では}
    initTinySegmenter : function (callback) {
      // function for inserting the buttons for each input field
      var insertButtons = function () {
        Kantan.easyMode = {};

        for (var a = document.querySelectorAll('.writing-zone-input'), i = 0, j = a.length, str, segmenter, segments, id, width, n, index, answer, fallback, segMode; i < j; i++) {
          segMode = a[i].dataset.segment || null;
          
          if (!/multi-select/.test(a[i].parentNode.className) && a[i].dataset.exclude != 'all') { // exclusions
            segmenter = new TinySegmenter();
            answer = a[i].dataset.answer.replace(/%\((.*?)\)/g, function (match, $1) {
              // only insert one of the optional alt answers from %(ALT1/ALT2/ETC) as a button
              var alts = $1.split('/');
              return alts[0] ? alts[0] : '';
            });
            
            // exclude words from this instance of TinySegmenter
            if (a[i].dataset.exclude && a[i].dataset.exclude != 'all') {
              for (var word = a[i].dataset.exclude.split(','), k = 0, l = a.length; k < l; k++) {
                segmenter.removeWord(word[k]);
              }
            }
            
            // get segments
            fallback = null;
            segments = segMode ? Kantan.segment(answer, segMode) : segmenter.segment(answer);
            
            // fallback for breaking a single word into segments if only 1 item is returned
            if (!segMode && segments.length <= 1 && window.Intl && window.Intl.Segmenter) {
              fallback = 'word';
              segments = Kantan.segment(answer, fallback);
              
              // final fallback for if segments are STILL less than 2
              if (segments.length <= 1) {
                fallback = 'grapheme';
                segments =  Kantan.segment(answer, fallback);
              }
            }
            
            // log segments for debugging purposes
            if (Kantan.debug) {
              console[fallback ? (segments.length > 1 ? 'warn' : 'error') : 'log']((i + 1) + '. ' + (fallback ? (segments.length > 1 ? '[Intl.Segmenter Fallback: ' + fallback + '] ' : '[Segmentation Failed: not enough segments] ') : '') + a[i].dataset.answer, segments);
            }

            // turn segments into buttons, but ONLY if there's more than 1
            if (segments.length > 1) {
              id = 0;
              width = +a[i].dataset.defaultWidth;
              
              str = '<div class="easy-mode-controls" '+
                'data-default-width="' + width + '" '+
                'style="width:' + (width * (Kantan.pref.fontSize ? (Kantan.pref.fontSize / 100) : 1)) + 'px;"'+
              '>';

              // store data for later
              Kantan.easyMode[i] = {
                input : a[i],
                value : []
              };

              // randomize segments so the answers are out of order
              while (segments.length) {
                // get random index
                n = Math.floor(Math.random() * segments.length);
                
                // prevent first segment from being inserted first
                if (id == 0 && n == 0) {
                  n = segments.length - 1;
                }

                // add button
                str += '<button class="button" onclick="Kantan.insertValue(this, ' + i + ', ' + (id++) + ');">' + segments[n] + '</button>';

                // remove this string from the array
                segments.splice(n, 1);
              }

              // insert easy mode buttons into field
              a[i].parentNode.insertAdjacentHTML('beforeend', str + '<button class="button red icon" onclick="Kantan.eraseValue(this);"><i class="fa">&#xf12d;</i></button></div>');
            }
          }
        }
      };
      
      // load the script for tiny segmenter if it is not defined yet
      getScript('lib/j-segmenter.js', function (firstRun) {
        if (firstRun) {
          insertButtons();
          if (callback) callback();

        } else {
          insertButtons();
        }
      });
    },
    
    // insert selected value into the input zone
    // caller = node, the button being pressed
    // input = number, index id for the input (see Kantan.easyMode when enabled)
    // id = number, unique identifier for a string's chunk. Used to correctly reference identitical strings (e.g., 'は|1' will only replace or insert 'は|1' and NOT 'は|2')
    insertValue : function (caller, input, id) {
      var insert = function () {
        // remove value from input
        if (/opt-off/.test(caller.className)) {
          Kantan.easyMode[input].value.splice(Kantan.easyMode[input].value.indexOf(caller.innerText + '|' + id), 1);
          caller.className = caller.className.replace('opt-off', '');
        }

        // add value to input
        else {
          Kantan.easyMode[input].value.push(caller.innerText + '|' + id);
          caller.className += ' opt-off';
        }

        // format and apply the value to the input field
        for (var val = '', i = 0, j = Kantan.easyMode[input].value.length; i < j; i++) {
          val += Kantan.easyMode[input].value[i].split('|')[0];
        }

        Kantan.easyMode[input].input.value = val;
      };
      
      // safety check for overwriting input
      if (Kantan.easyMode[input].input.value && Kantan.easyMode[input].input.value != Kantan.easyMode[input].value.join('').replace(/\|\d+/g, '')) {
        KantanModal.open({
          title : '<span class="en">Overwrite Answer?</span><span class="ja">答えを上書きしますか？</span>',
          content : '<span class="en">Your previous answer will be overwritten. Do you want to continue?</span><span class="ja">今の答えは上書きされます。よろしいですか？</span>',
          buttonHTML : '<span class="en">Overwrite</span><span class="ja">上書きする</span>',
          buttonColor : 'red',

          callback : function () {
            insert();
          }
        });
      }
      
      else {
        insert();
      }
    },
    
    
    // erases the contents of an input field during easy mode
    eraseValue : function (caller) {
      KantanModal.open({
        title : '<span class="en">Erase Answer?</span><span class="ja">答えを消しますか？</span>',
        content : '<span class="en">Your answer will be erased. Do you want to continue?</span><span class="ja">答えは消されます。よろしいですか？</span>',
        buttonHTML : '<span class="en">Erase</span><span class="ja">消す</span>',
        buttonColor : 'red',

        callback : function () {
          for (var a = caller.parentNode.querySelectorAll('.opt-off'), i = 0, j = a.length; i < j; i++) {
            a[i].click();
          }
        }
      });
    },

    
    // functions that create new functionality and adds it to the document
    // usually functions that are executed via init
    create : {
      
      // creates prev/next exercise buttons
      exerciseButtons : function () {
        var more = '<div class="more-exercises clear">',
            a, i = 1, k = 0, pass = ['prev', 'next', 'done'];
        
        while (i < 1000) {
          if (pass[k] == 'done' || !pass[k]) break;
          
          // increment/decrement to find next/prev exercise
          a = Kantan.exercises[pass[k] == 'prev' ? Kantan.active.index - i : pass[k] == 'next' ? Kantan.active.index + i : Kantan.active.index];
          
          // add button to more
          if (!/^>|^#/.test(a)) {
            if (a) {
              a = a.split('|');

              // create the next/prev link
              more += '<a href="../../../lessons/' + a[0] + '/' + Kantan.local + Kantan.debug + '" class="button ' + pass[k] + '-ex" title="' + (pass[k] == 'prev' ? 'Previous' : 'Next') + ' exercise">' + a[1] + '</a>';
            }

            // reset vars for next pass
            a = null;
            i = 1;
            k++;
            
          } else {
            i++;
          }
        }

        // add the "more exercises" buttons to the document
        var timer = document.getElementById('quiz-timer');
        if (timer) timer.insertAdjacentHTML('afterend', more + '</div>');
      },
      

      // removes the exercise list when needed update without refreshing the page
      removeExerciseList : function () {
        var list = document.getElementById('exercise-list'),
            toggle = document.getElementById('toggle-exercises');
        
        if (list) list.parentNode.removeChild(list);
        if (toggle) toggle.parentNode.removeChild(toggle);
      },


      // creates the exercise list
      exerciseList : function () {
        var main = 
          '<div id="page-list">'+
            '<div><a id="nav-home" href="' + getPaths() + '' + Kantan.local + '" class="button' + (getPaths() == '' ? ' active-page' : '') + '"><i class="fa">&#xf015;</i><span class="en">Home</span><span class="ja">トップページ</span></a></div>'+
            '<div><a id="nav-lessons" href="' + getPaths() + 'lessons/' + Kantan.local + '" class="button' + (/\/lessons\/(?:index|$)/.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf19d;</i><span class="en">Lessons</span><span class="ja">レッスン一覧</span></a></div>'+
            '<div><a id="nav-reviews" href="' + getPaths() + 'reviews/' + Kantan.local + '" class="button' + (/\/reviews\/(?:index|$)/.test(window.location.pathname) ? ' active-page' : '') + '" ' + (Kantan.pref.SRS == 'false' ? 'style="display:none;"' : '') + '><i class="fa">&#xf274;</i><span class="en">Reviews</span><span class="ja">復習</span><span id="nav-reviews-due">' + (window.KantanReviews && KantanReviews.due ? KantanReviews.due : '') + '</span></a></div>'+
            (getPaths() != '' ? '<div><a id="nav-notes" href="#profile" onclick="Kantan.openProfile(); return false;" class="button"><i class="fa">&#xf007;</i><span class="en">Profile</span><span class="ja">プロフィール</span></a></div>' : '')+
            (getPaths() != '' ? '<div><a id="nav-notes" href="#notes" onclick="Kantan.openNotes(); return false;" class="button"><i class="fa">&#xf24a;</i><span class="en">Notes</span><span class="ja">ノート</span></a></div>' : '')+
            //'<div><a id="nav-grammar" href="' + getPaths() + 'lessons/references/grammar-index/' + Kantan.local + '" class="button' + (/\/grammar-index\//.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf02d;</i><span class="en">Grammar</span><span class="ja">文法</span></a></div>'+
            '<div><a id="nav-resources" href="' + getPaths() + 'learning-resources/' + Kantan.local + '" class="button' + (/\/learning-resources\//.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf15c;</i><span class="en">Resources</span><span class="ja">学習資料</span></a></div>'+
            '<div><a id="nav-help" href="' + getPaths() + 'help/' + Kantan.local + '" class="button' + (/\/help\//.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf059;</i>FAQ</a></div>'+
            //'<div><a id="nav-download" href="' + getPaths() + 'download/' + Kantan.local + '" class="button' + (/\/download\//.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf019;</i><span class="en">Download</span><span class="ja">ダウンロードする</span></a></div>'+
            '<div><a id="nav-contribute" href="' + getPaths() + 'contribute/' + Kantan.local + '" class="button' + (/\/contribute\//.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf2b5;</i><span class="en">Contribute</span><span class="ja">貢献する</span></a></div>'+
            '<div><a id="nav-contact" href="' + getPaths() + 'contact/' + Kantan.local + '" class="button' + (/\/contact\//.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf1d8;</i><span class="en">Contact</span><span class="ja">お問い合わせ</span></a></div>'+
            '<div><a id="nav-about" href="' + getPaths() + 'about/' + Kantan.local + '" class="button' + (/\/about\//.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf0c0;</i><span class="en">About</span><span class="ja">プロジェクトについて</span></a></div>'+
            '<div><a id="nav-donate" href="' + getPaths() + 'donate/' + Kantan.local + '" class="button' + (/\/donate\//.test(window.location.pathname) ? ' active-page' : '') + '"><i class="fa">&#xf004;</i><span class="en">Donate</span><span class="ja">寄付する</span></a></div>'+
            '<div>' + Kantan.lang.toggle_furigana.replace('toggle-', 'nav-') + '</div>'+
            '<div><a id="nav-settings" href="#settings" onclick="KantanSettings.manager(); return false;" class="button"><i class="fa">&#xf013;</i><span class="en">Settings</span><span class="ja">設定</span></a></div>'+
          '</div>'+
          '<div class="social-links center">'+
            '<span><a href="https://x.com/KantanJapanese" target="_blank" class="social-twitter" title="Follow us on X (Twitter)"></a></span>'+
            '<span><a href="https://www.reddit.com/r/KantanJapanese/" target="_blank" class="social-reddit" title="Discuss Japanese with us on Reddit"></a></span>'+
            '<span><a href="https://github.com/SethClydesdale/kantan-japanese" target="_blank" class="social-github" title="Collaborate with us on GitHub"></a></span>'+
          '</div>';
        
        if (Kantan.exercises) {
          var attrs = 'class="lesson-title" onclick="Kantan.toggle.list(this);" onkeydown="event.key == \'Enter\' && Kantan.toggle.list(this);" tabindex="0"', // lesson-title attrs
              list = 
              '<nav id="exercise-list">'+
                '<h3 class="main-title"><span class="en">Quick Navigation</span><span class="ja">レッスン一覧</span></h3>'+
                '<button id="random-exercise" class="button" onclick="Kantan.randomExercise();" title="' + (KN_Lang == 'ja' ? 'ランダム練習' : 'Random Exercise') + '"><i class="fa">&#xf074;</i></button>'+
                '<div id="lessons-list"><h4 ' + attrs + '><span class="en">Page Links</span><span class="ja">ページリンクと設定</span></h4><ul id="page-links">' + main + '</ul>',
              i = 0,
              j = Kantan.exercises.length,
              title,
              
              linkData,
              active,
              tagOpen,

              // vars for grouping sub-sections
              currentGroup,
              group = '',
              groups = /workbook-\d+/,
              groupTitles = {
                'workbook' : 'ワークブック'
              };


          if (storageOK && !localStorage.KantanResults) {
            localStorage.KantanResults = JSON.stringify({});
          }
          
          // parse exercise data
          if (storageOK && localStorage.KantanResults) {
            Kantan.exerciseResults = JSON.parse(localStorage.KantanResults);
          }

          // loop over all the exercises and place them into their respective lesson group
          for (; i < j; i++) {
            // creates a new section
            if (Kantan.exercises[i].charAt(0) == '>') {
              if (tagOpen) list += '</ul>'; // close prior section
              
              title = Kantan.exercises[i].replace(/^>\s+|^>/g, '');
              
              list += '<h4 ' + attrs + '>' + title + '</h4><ul id="' + title.toLowerCase().replace(/\s/g, '-') + '" class="lesson-section-list">';
                
              tagOpen = true;
            }
            
            // creates a header
            else if (Kantan.exercises[i].charAt(0) == '#') {
              list += '<li><h4 class="sub-lesson-title">' + Kantan.exercises[i].replace(/^#\s+|^#/g, '') + '</h4></li>';
            }
            
            // creates a link
            else {
              linkData = Kantan.exercises[i].split('|');

              // add the exercise link to the group and display results
              var result = unpackExerciseData(Kantan.exerciseResults[linkData[0].replace('lesson-', '')]),
                  score = result.score,
                  resultsTooltip = KN_Lang == 'ja' ? 'テストの得点' : 'Exercise score',
                  resultSpans = {
                    read: '<span class="exercise-results result--read" title="Already read">',
                    reading: '<span class="exercise-results result--reading" title="Reading">',
                    perfect: '<span class="exercise-results result--perfect" title="' + resultsTooltip + '">',
                    good: '<span class="exercise-results result--good" title="' + resultsTooltip + '">',
                    average: '<span class="exercise-results result--average" title="' + resultsTooltip + '">',
                    low: '<span class="exercise-results result--low" title="' + resultsTooltip + '">',
                  },

                  resultSpan =  score == 'R' ? resultSpans.read : /^R\d+/.test(score) ? resultSpans.reading : score == 100 ? resultSpans.perfect : score >= 70 ? resultSpans.good : score >= 60 ? resultSpans.average : resultSpans.low,
                  prevScore = (score > -1 || score == 'R' || /^R\d+/.test(score)) ? resultSpan + '<span class="results-text">' + (score == 'R' ? '<i class="fa">&#xf00c;</i>' : score == 100 ? '<i class="fa">&#xf005;</i>' : /^R/.test(score) ? score.slice(1) : score) + '</span></span>' : '';
              
              list += '<li class="menu-item-list"><a href="../../../lessons/' + linkData[0] + '/' + Kantan.local + Kantan.debug + '" ' + (prevScore ? 'class="exercise-done"' : '') + '>' + linkData[1] + prevScore + '</a></li>';
            }
          }

          // add the exercise list to the document
          var content = document.getElementById('content') || document.body;
          if (content) content.insertAdjacentHTML('afterbegin', '<a href="#toggle-exercises" id="toggle-exercises" onclick="Kantan.toggle.exerciseList(this); return false;" title="' + (KN_Lang == 'ja' ? '練習問題一覧をトグルする' : 'Toggle exercise list') + '"></a>' + list + '</ul></div></nav>');

          // open the current lesson and scroll to the active exercise
          if (Kantan.active.exercise) {
            // highlight the active exercise and scoll to it
            active = document.querySelector('a[href*="' + Kantan.active.exercise[0] + '"]:not(#link-grammar)');
            active.className += ' active-lesson';
            active = active.parentNode;
            
            // open the active lesson
            Kantan.toggle.list(active.parentNode.previousSibling);

            // jump to the active exercise
            document.getElementById('lessons-list').scrollTop = active.offsetTop - (active.getBoundingClientRect().height + (window.matchMedia && matchMedia('(pointer:coarse)').matches ? 0 : 6));
          }
        }
        
        // creates quick nav for non-exercise pages
        else {
          var nav = 
              '<a href="#toggle-navigation" id="toggle-exercises" onclick="Kantan.toggle.exerciseList(this); return false;" title="' + (KN_Lang == 'ja' ? 'クイックナビゲーションをトグルする' : 'Toggle quick navigation') + '"></a>'+
              '<nav id="exercise-list">'+
                '<h3 class="main-title"><span class="en">Quick Navigation</span><span class="ja">クイックナビゲーション</span></h3>'+
                '<div id="lessons-list">'+
                  main+
                '</div>'+
              '</nav>';

          // add the quick nav to the document
          document.getElementById('content').insertAdjacentHTML('afterbegin', nav);
        }
      },
      
      
      // creates button for refreshing the page and triggering the exercise type selection
      exerciseTypeButton : function () {
        // container and button creation
        var timer = document.getElementById('quiz-timer'),
            div = document.createElement('DIV'),
            button = document.createElement('BUTTON');
        
        // container and button attributes
        div.id = 'change-exercise-type-container';
        div.className = 'center';
        
        button.id = 'change-exercise-type';
        button.className = 'button yellow';
        button.innerHTML = '<i class="fa">&#xf021;</i> <span class="en">Change Exercise Type</span><span class="ja">練習型を変更する</span>';
        
        // action to perform on click of the button
        button.onclick = function () {
          // opens a prompt warning the user that the exercise will end
          KantanModal.open({
            title : '<span class="en">Change Exercise Type?</span><span class="ja">練習型を変更しますか？</span>',
            content : '<span class="en">To change the exercise type, you must quit the current exercise. Do you want to quit?</span><span class="ja">練習型を変更するためにテストが終了しなければいけません。よろしいですか？</span>',
            buttonHTML : '<span class="en">Quit</span><span class="ja">終了する</span>',
            buttonColor : 'red',
            closeButtonText : '<span class="en">Cancel</span><span class="ja">戻る</span>',
            keepOpen : /\/dictionary\//.test(window.location) || (!Kantan.tools && /"format"/.test(Kantan.exerciseData)) ? true : false,
            
            // clicking "OK" will reload the exercise, leading to the exercise type selection screen
            callback : function () {
              // remove start/begin queries, so the user can select a new exercise type
              if (/(?:begin|start)=\d/.test(window.location.search)) {
                if (window.history && window.history.pushState) {
                  window.history.pushState({}, document.title, window.location.href.replace(window.location.search, '') + Kantan.debug);
                } 
              
                // remove the old fashioned way if the history API cannot be used
                else {
                  window.location.search = '';
                  return;
                }
              } 
              
              // set flag so KN_SkipTypeSelect doesn't trigger while trying to change the exercise type
              Kantan.changingExType = true;
              
              // reset exercise state
              Kantan.reset();
            }
          });
        }
        
        // appends the button to the container
        div.appendChild(button);
        
        // adds the container and button to the document
        if (timer.nextSibling) {
          timer.parentNode.insertBefore(div, timer.nextSibling);
          
        } else {
          timer.parentNode.appendChild(div);
        }
      }
    },
    
    
    // parsing functions
    parse : {
      // parse images
      image : function (data) {
        // data[n] (n = 0, 1, 2..)
        // 0 = flag (ex. !IMG)
        // 1 = file name
        // 2 = alt text (optional)
        var url = /^http/.test(data[1]) ? data[1] : '../../../resources/images/exercises/' + data[1];

        return '<a href="' + url + '" target="blank" title="' + (KN_Lang == 'ja' ? '画像の全体を見る' : 'View full image') + '" class="lesson-image"><img src="' + url + '" alt="' + (data[2] || data[1]) + '" /></a>';
      },
      
      
      // parse word practice zones in articles to practice typing
      wordPractice : function (doc) {
        doc = doc || document; // used for altering iframe content, specifically for the article editor
        var a = doc.querySelectorAll('.word-practice'), i = 0, j = a.length
        
        if (j) {
          for (; i < j; i++) {
            a[i].innerHTML = a[i].innerHTML
            // kanji/romaji practice
            .replace(/\{(.*?)\|(.*?)\}/gmi, '<span class="t-25">$1</span><br><input type="text" class="full-width" data-word="$2" onkeyup="Kantan.check.word(this);">')
            // kana practice
            .replace(/\{(.*?)\}/gmi, '<input type="text" class="full-width" data-word="$1" onkeyup="Kantan.check.word(this);">');
          }
        }
      },
      
      // parses a list (object; see KantanReviews.list in the console) of links into HTML for the SRS review list
      reviewLinks : function (list, settings) {
        settings = settings || {};

        var str = '<ul' + (settings.addClass ? ' class="lesson-section-list"' : '') + '>', purge = [], score, title, k;
        for (k in list) {
          score = list[k].score;
          title = KantanExercises[KantanExercises.findIndex(function(element) {
            return element.indexOf('lesson-' + k) !== -1
          })];

          // add exercise to list if it exists
          if (title) {
            title = title.split('|')[1];
            str += '<li>'+
              '<a href="' + getPaths() + 'lessons/lesson-' + k + '/' + Kantan.local + '"><span class="exercise-results result--' + (score == 'R' ? 'read' : /^R\d+/.test(score) ? 'reading' : score == 100 ? 'perfect' : score >= 70 ? 'good' : score >= 60 ? 'average' : 'low') + '" title="' + (KN_Lang == 'ja' ? 'テストの得点' : 'Exercise score') + '"><span class="results-text">' + (score == 'R' ? '<i class="fa">&#xf00c;</i>' : score == 100 ? '<i class="fa">&#xf005;</i>' : /^R/.test(score) ? score.slice(1) : score) + '</span></span>' + title + (typeof list[k].streak != 'undefined' && !settings.noStreak ? '<span class="review-streak" title="Streak"><i class="fa">&#x' + (list[k].streak >= 5 ? 'f005' : list[k].streak > 2 ? 'f123' : 'f006') + ';</i> ' + list[k].streak + '</span>' : '') + '</a>'+
              (settings.retire ? '<button class="button icon-only round" onclick="Kantan.retireReview(this);" data-exercise="' + k + '" title="Retire review"><i class="fa">&#xf186;</i></button>' : '')+
              (settings.revive ? '<button class="button icon-only round" onclick="Kantan.reviveReview(this);" data-exercise="' + k + '" title="Revive for review"><i class="fa">&#xf0e2;</i></button>' : '')+
            '</li>';

          }

          // otherwise add id to purge list as exercise is no longer available
          else {
            purge.push(k);
          }
        }

        // purge bad exercise IDs
        if (purge.length) {
          Kantan.purgeBadExercises(purge);
        }

        return str + '</ul>';
      },
      
      
      // Displays exercise results next to each exercise and stats in the profile section
      profileStats : function () {
        if (storageOK && localStorage.KantanResults) {
          var exResults = JSON.parse(localStorage.KantanResults),
              result, score, k,
              grammar = 0,
              completed = 0,
              perfected = 0,
              passed = 0,
              barely = 0,
              failed = 0, 
              read = 0,
              reading = 0,
              passingRate = 0;

          window.KantanExList = {
            complete : {},
            perfect : {},
            passed : {},
            barely : {},
            failed : {},
            read : {},
            reading : {}
          };

          for (k in exResults) {
            result = unpackExerciseData(exResults[k]);
            score = result.score;

            // increment stats and store exercise data
            if (!/R/.test(score)) { // exlude read-only pages
              completed++;
              if (score == 100) {
                perfected++;
                KantanExList.perfect[k] = result;
              }

              else if (score >= 70) {
                passed++;
                KantanExList.passed[k] = result;
              }

              else if (score >= 60) {
                barely++;
                KantanExList.barely[k] = result;
              }

              else {
                failed++;
                KantanExList.failed[k] = result;
              }

              KantanExList.complete[k] = result;
            }

            // sort read/reading
            else if (/R/.test(score)) {
              if (score == 'R') {
                read++;
                KantanExList.read[k] = result;
              } else {
                reading++;
                KantanExList.reading[k] = result;
              }
            }

            // increment grammar points read
            else if (/grammar-\d+/.test(k)) {
              grammar++;
            }

            for (var a = document.querySelectorAll('a[href*="lesson-' + k + '/"]'), i = 0, j = a.length; i < j; i++) {
              if (a[i] && typeof score != 'undefined') { // ICON: <i class="fa">' + (score == 100 ? '&#xf005;' : score >= 70 ? '&#xf00c;' : score >= 60 ? '&#xf10c;' : '&#xf00d;') + '</i> '
                a[i].className += ' exercise-done';
                a[i].insertAdjacentHTML('beforeend', '<span class="exercise-results result--' + (score == 'R' ? 'read' : /^R\d+/.test(score) ? 'reading' : score == 100 ? 'perfect' : score >= 70 ? 'good' : score >= 60 ? 'average' : 'low') + '" title="' + (KN_Lang == 'ja' ? 'テストの得点' : 'Exercise score') + '"><span class="results-text">' + (score == 'R' ? '<i class="fa">&#xf00c;</i>' : score == 100 ? '<i class="fa">&#xf005;</i>' : /^R/.test(score) ? score.slice(1) : score) + '</span></span>');
              }
            }
          }
          
          passingRate = (((perfected + passed + barely) / completed) * 100).toFixed(2);
          
          // update stat counters
          if (document.getElementById('grammar-learned')) {
            // general stats
            document.getElementById('days-studied').innerHTML = localStorage.KN_DaysStudied || 0;
            document.getElementById('grammar-learned').innerHTML = grammar;

            // exercises
            document.getElementById('exercises-completed').innerHTML = '<a href="javascript:Kantan.viewExercises(\'complete\');">' + completed + '</a>';
            document.getElementById('exercises-perfected').innerHTML = '<a href="javascript:Kantan.viewExercises(\'perfect\');">' + perfected + '</a>';
            document.getElementById('exercises-passed').innerHTML = '<a href="javascript:Kantan.viewExercises(\'passed\');">' + passed + '</a>';
            document.getElementById('exercises-barely').innerHTML = '<a href="javascript:Kantan.viewExercises(\'barely\');">' + barely + '</a>';
            document.getElementById('exercises-failed').innerHTML = '<a href="javascript:Kantan.viewExercises(\'failed\');">' + failed + '</a>';
            document.getElementById('passing-rate').innerHTML = (passingRate == 'NaN' ? 0 : passingRate) + '%';

            // articles
            document.getElementById('articles-read').innerHTML = '<a href="javascript:Kantan.viewExercises(\'read\', \'articles\');">' + read + '</a>';
            document.getElementById('articles-reading').innerHTML = '<a href="javascript:Kantan.viewExercises(\'reading\', \'articles\');">' + reading + '</a>';

            // review data
            if (window.KantanReviews) {
              document.getElementById('profile-reviews-due').innerHTML = '<a href="javascript:Kantan.viewExercises(\'due\', \'review\');">' + window.KantanReviews.due + '</a>';
              document.getElementById('profile-reviews-upcoming').innerHTML = '<a href="javascript:Kantan.viewExercises(\'upcoming\', \'review\');">' + window.KantanReviews.upcoming + '</a>';
              document.getElementById('profile-reviews-mastered').innerHTML = '<a href="javascript:Kantan.viewExercises(\'mastered\', \'review\');">' + window.KantanReviews.mastered + '</a>';
              document.getElementById('profile-reviews-retired').innerHTML = '<a href="javascript:Kantan.viewExercises(\'retired\', \'review\');">' + window.KantanReviews.retired + '</a>';
            } else {
              document.getElementById('profile-stats').className += ' no-reviews';
            }

            document.getElementById('profile-data-save').href = 'data:text/plain;charset=utf-8,' + KantanSettings.saveExerciseData();
          }
        }
      }
    },
    
    
    // quick dictionary functionality
    quickJisho : {
      hidden : true, // display state of dictionary
      selectorHidden : true, // display state of "lookup button"
      tabbing : false, // prevents selection change from occuring while tabbing
      
      // creates the quick dictionary button and popup
      create : function () {
        if (Kantan.quickJisho.cache) return; // prevent duplication of the quickJisho
        
        var button = document.createElement('DIV'),
            box = document.createElement('DIV'),
            selector = document.createElement('BUTTON'),
            frag = document.createDocumentFragment();
        
        // button attrs
        button.id = 'quick-jisho-toggle';
        button.innerHTML = '<i class="fa">&#xf02d;</i>';
        button.title = KN_Lang == 'ja' ? 'クイック辞書をトグルする' : 'Toggle Quick Dictionary';
        button.tabIndex = 0;
        button.onclick = Kantan.quickJisho.toggle;
        button.onkeypress = function (e) {
          e.key == 'Enter' && Kantan.quickJisho.toggle();
        }
        
        // box attrs
        box.id = 'quick-jisho-window';
        box.className = 'quick-jisho-hidden';
        box.innerHTML = 
          '<div class="quick-jisho-header">' +
            '<h3 id="quick-jisho-title" class="main-title"> <span class="en">Quick Dictionary</span><span class="ja">クイック辞書</span> <span id="quick-jisho-hits"></span> </h3> ' +
            '<i class="fa fa-hover" tabindex="0" onclick="Kantan.quickJisho.toggle();" onkeydown="event.key == \'Enter\' && Kantan.quickJisho.toggle();" title="' + (KN_Lang == 'ja' ? '最小化' : 'Minimize') + '">&#xf2d1;</i>  ' +
          '</div>' +
          '<div id="quick-jisho-content">' +
            '<div class="quick-jisho-row center">' +
              '<input tabindex="0" id="quick-jisho-search" type="text" placeholder="' + ( KN_Lang == 'ja' ? '探す…' : 'Search...' ) + '" oninput="Kantan.quickJisho.search(this.value);">' +
            '</div>' +
            '<div class="quick-jisho-row">' +
              '<ul id="quick-jisho-results"></ul>' +
            '</div>' +
          '</div>';
        
        // selection button
        selector.id = 'quick-jisho-selector';
        selector.className = 'button';
        selector.style.display = 'none';
        selector.innerHTML = '<i class="fa">&#xf002;</i><span class="en">Look up</span><span class="ja">辞書で調べる</span>';
        selector.onclick = Kantan.quickJisho.lookUp;
        selector.tabIndex = 0;
        
        // add nodes to the document
        frag.appendChild(box);
        frag.appendChild(button);
        frag.appendChild(selector);
        document.body.appendChild(frag);
        var footerRight = document.querySelector('.footer-right');
        footerRight.style.marginRight = '40px'; // offset footer so texts are visible
        
        // node cache
        Kantan.quickJisho.cache = {
          box : box,
          search : document.getElementById('quick-jisho-search'),
          results : document.getElementById('quick-jisho-results'),
          hits : document.getElementById('quick-jisho-hits'),
          selector : document.getElementById('quick-jisho-selector')
        };
        
        // selection handler
        document.onselectionchange = Kantan.quickJisho.getSelection;
        
        // get mouse position for adjusting x/y values of the selector
        document.onmousemove = function (e) {
          Kantan.quickJisho.x = Math.abs(e.pageX - document.body.clientWidth) < 100 ? e.pageX - 95 : e.pageX;
          Kantan.quickJisho.y = Math.abs(e.pageY - document.body.clientHeight) < 40 ? e.pageY - 32 : e.pageY + 12;
        };
        
        // key handler for focusing the dictionary lookup button with a tab press
        document.onkeydown = function (e) {
          if (e.key == 'Tab' && !Kantan.quickJisho.selectorHidden && document.activeElement != Kantan.quickJisho.cache.selector) {
            Kantan.quickJisho.tabbing = true;
            Kantan.quickJisho.cache.selector.focus();
            e.preventDefault();
          }
        };
      },
      
      
      // toggles the quick dictionary
      toggle : function () {
        // load in the dictionary definitions
        if (!Kantan.vocab && !Kantan.quickJisho.loading) {
          Kantan.quickJisho.loading = true;
          
          getScript('data/vocab.js', function () {
            if (Kantan.quickJisho.cache.search.value) {
              Kantan.quickJisho.search(Kantan.quickJisho.cache.search.value);
            }

            Kantan.quickJisho.loading = false;
          });
        }
        
        
        // toggle dictionary display
        if (Kantan.quickJisho.hidden) {
          Kantan.quickJisho.cache.box.className = '';
          Kantan.quickJisho.hidden = false;
          Kantan.quickJisho.cache.search.focus();
          
        } else {
          Kantan.quickJisho.cache.box.className = 'quick-jisho-hidden';
          Kantan.quickJisho.hidden = true;
        }
      },
      
      
      // searches the dictionary
      search : function (value, retry) {
        // clear existing timeout
        if (Kantan.quickJisho.searchTimeout) {
          window.clearTimeout(Kantan.quickJisho.searchTimeout);
        }

        // wait 300ms before submitting search, just in case the user is still typing
        Kantan.quickJisho.searchTimeout = window.setTimeout(function() {
          var matches = [],
              results = '',
              hits = 0,
              search = ['kanji', 'readings', 'romaji', 'meaning', 'tag', 'lesson'], // where to search in each vocab object
              word, result, key, kanjiKey, rank, k, i, j = search.length, cleanKey;

          Kantan.quickJisho.cache.results.innerHTML = '';

          if (value) {
            value = Kantan.toHalfWidth(sanitizeString(value)).toLowerCase();

            for (k in Kantan.vocab) {
              for (i = 0; i < j; i++) {
                if (Kantan.vocab[k][search[i]] !== undefined) {
                  word = Kantan.vocab[k]; // vocab word data
                  result = Kantan.vocab[k][search[i]].toString().toLowerCase(); // result normalized to lowercase for matching with value

                  if (
                    // standard search
                    result.indexOf(value) != -1 || k.indexOf(value) != -1 ||
                    // full type search (doesn't use abbr; int --> interjection)
                    search[i] == 'tag' && Kantan.vocabTagKey[Kantan.vocab[k][search[i]]] && Kantan.vocabTagKey[Kantan.vocab[k][search[i]]].toLowerCase().indexOf(value) != -1 ||
                    // lesson search
                    search[i] == 'lesson' && (('l' + result).indexOf(value) != -1 || ('lesson ' + result).indexOf(value) != -1) ||
                    // kana only search
                    value == 'kana' && word.often_kana ||
                    // textbook filters
                    /genki/.test(value) && word.genki ||
                    /tobira/.test(value) && (word.tobira_b || word.tobira_i) ||
                    /quartet/.test(value) && word.quartet
                  ) {
                    cleanKey = Kantan.cleanVocabKey(k);
                    key = cleanKey.toLowerCase();
                    kanjiKey = (word.kanji || '').toString().toLowerCase();

                    // ranking: 0 = exact, 1 = prefix, 2 = meaning prefix, 3 = other
                    if (key == value || kanjiKey == value) {
                      rank = 0;
                    } else if (key.indexOf(value) === 0 || kanjiKey.indexOf(value) === 0) {
                      rank = 1;
                    } else if (search[i] == 'meaning' && result.indexOf(value) === 0) {
                      rank = 2;
                    } else {
                      rank = 3;
                    }

                    matches.push({
                      rank: rank,
                      length: key.length,
                      index: matches.length,
                      html: '<li tabindex="0" class="definition clear">'+
                        '<div class="def-ja ruby-always-visible">'+
                          (word.kanji ? '<ruby>' + word.kanji : cleanKey)+
                          (word.kanji ? '<rt>' + (word.readings || cleanKey) + '</rt></ruby>' : '')+
                          Kantan.create.vocabExample(k)+
                          Kantan.create.vocabAudio(k)+
                        '</div>'+
                        '<div class="def-tags">' + Kantan.parse.vocabTags(k) + '</div>'+
                        '<div class="def-en">' + word.meaning.replace(/\[(?:polite|casual|humble)\]/gi, '') + '</div>'+
                        (typeof word.lesson == 'number' ?
                         '<span class="def-label" title="' + (KN_Lang == 'en' ? 'Lesson ' + word.lesson : '第' + word.lesson + '課') + '">L' + word.lesson + '</span>' :
                         '<span class="def-label extra-vocab" title="Extra vocab">EX</span>'
                        ) +
                      '</li>'
                    });

                    hits++;
                    break; // break out if hit is found and look for the next word that matches
                  }
                }
              }
            }

            // sort by rank, then shorter reading first, then original order
            matches.sort(function (a, b) {
              return a.rank - b.rank || a.length - b.length || a.index - b.index;
            });

            for (i = 0; i < matches.length; i++) {
              results += matches[i].html;
            }
          }

          // perform a kanji only search if the previous one yielded no results
          if (!retry && !results && value && /[\u3400-\u9faf]/.test(value)) {
            var kanji = value.match(/[\u3400-\u9faf]+/);

            if (kanji && kanji[0]) {
              Kantan.quickJisho.search(kanji[0], true);
            }
          }

          // show results
          else {
            Kantan.quickJisho.cache.results.innerHTML = results ? results : value ? '<li><span class="en">No results found for "' + value + '".</span><span class="ja">「' + value + '」が見つかりませんでした。</span></li>' : '';
            Kantan.quickJisho.cache.hits.innerHTML = hits ? '(' + hits + ')' : '';
          }

          delete Kantan.quickJisho.searchTimeout;
        }, 300);
      },
      
      
      // look up a selected word
      lookUp : function () {
        if (Kantan.quickJisho.hidden) {
          Kantan.quickJisho.toggle();
        }

        Kantan.quickJisho.cache.search.value = ''.trim ? Kantan.quickJisho.selectedText.trim() : Kantan.quickJisho.selectedText;
        Kantan.quickJisho.search(Kantan.quickJisho.cache.search.value);

        // hide the selector search
        this.style.display = 'none';
        Kantan.quickJisho.selectorHidden = true;
      },
      
      
      // gets the selected text and shows the look up button
      getSelection : function () {
        // disables quick jisho look up if preferred
        if (Kantan.pref.jishoLookUp == 'false') return false;
        
        // returns if tabbing to the lookup button
        // required, as some browsers change selection when focusing a new element w/focus()
        if (Kantan.quickJisho.tabbing) {
          // delay setting "tabbing" to false, as the selection change tends to proc twice for focus changes
          if (!Kantan.quickJisho.tabbingOff) { // prevent duplication of timeout
            Kantan.quickJisho.tabbingOff = setTimeout(function () {
              Kantan.quickJisho.tabbing = false;
              delete Kantan.quickJisho.tabbingOff;
            }, 10);
          }
          
          return false;
        }
        
        // get the currently selected texts
        if (document.getSelection) {
          var selection = document.getSelection();

          if (selection.type == 'Range' && selection.toString && !/quick-jisho/.test(selection.focusNode.className)) {
            // stores selected text for searches
            Kantan.quickJisho.selectedText = selection.toString();
            
            // update lookup button position
            Kantan.quickJisho.cache.selector.style.left = Kantan.quickJisho.x + 'px';
            Kantan.quickJisho.cache.selector.style.top = Kantan.quickJisho.y + 'px';
            
            // show lookup button
            if (Kantan.quickJisho.selectorHidden) {
              Kantan.quickJisho.cache.selector.style.display = '';
              Kantan.quickJisho.selectorHidden = false;
            }

          } else { // hide lookup button and clear selection
            Kantan.quickJisho.selectedText = '';

            if (!Kantan.quickJisho.selectorHidden) {
              Kantan.quickJisho.cache.selector.style.display = 'none';
              Kantan.quickJisho.selectorHidden = true;
            }
          }
        }
      }
    },
    
    
    // removes loading placeholder
    stopLoading : function (el) {
      el = el || document.querySelector('.loading');
      el.className = el.className.replace('loading', '');
    },
    
    
    // designate an audio element as a sticky audio element that follows the user when scrolling
    stickyAudio : {
      init : function (id) {
        document.body.insertAdjacentHTML('beforeend', '<div id="sticky-audio"></div>');

        Kantan.stickyAudio.static = document.getElementById(id);
        Kantan.stickyAudio.sticky = document.getElementById('sticky-audio');
        Kantan.stickyAudio.target = Kantan.stickyAudio.static.getElementsByTagName('AUDIO')[0];
        
        // fix the height of the original audio element's parent to prevent jittering
        Kantan.stickyAudio.static.style.height = Kantan.stickyAudio.target.getBoundingClientRect().height + 'px';

        window.addEventListener('scroll', function() {
          // add the audio element to the sticky element if off-screen
          if (Kantan.stickyAudio.static.getBoundingClientRect().bottom <= 0 && Kantan.stickyAudio.target.parentNode.id != 'sticky-audio') {
            Kantan.stickyAudio.sticky.appendChild(Kantan.stickyAudio.target);
          }
          
          // add the audio element back to its original parent if on-screen
          else if (Kantan.stickyAudio.static.getBoundingClientRect().bottom >= 1 && Kantan.stickyAudio.target.parentNode.id == 'sticky-audio') {
            Kantan.stickyAudio.static.appendChild(Kantan.stickyAudio.target);
          }
        });
      }
    },
    
    
    // plays the specific audio element
    playAudio : function (id, time) {
      // play the targeted audio file
      var audio = document.getElementById(id);
      
      if (audio) {
        audio.currentTime = time || 0;
        audio.play();
      }
    },
    
    
    // highlights chokai script lines when playing audio
    chokai : {
      time : {},
      lines : {},
      highlight : function (id, time) {
        var audio = document.getElementById(id);
        
        Kantan.chokai.lines[id] = document.querySelectorAll('#script-' + id + ' .line');
        Kantan.chokai.time[id] = time;

        if (audio) {
          audio.addEventListener('timeupdate', function () {
            // apply the highlighted class to lines when a time range is matched
            // the time array indices correspond to those in Kantan.chokai.lines
            for (var i = 0, j = time.length, active; i < j; i++) {
              if (this.currentTime >= time[i][0] && this.currentTime <= time[i][1] && Kantan.chokai.lines[id][i]) {
                if (!/highlighted/.test(Kantan.chokai.lines[id][i].className)) {
                  var active = document.querySelector('.line.highlighted');
                  if (active) {
                    active.className = active.className.replace('highlighted', '');
                  }

                  Kantan.chokai.lines[id][i].className += ' highlighted';
                }
              }
            }

            // remove highlight class if the time range is less than or greater than the first or last time stamp
            if (this.currentTime < time[0][0] || this.currentTime > time[time.length - 1][1]) {
              var active = document.querySelector('.line.highlighted');
              if (active) {
                active.className = active.className.replace('highlighted', '');
              }
            }
          });
        }
      }
    },
    
    
    // displays an image in a popup window
    viewImage : function (img, src) {
      KantanModal.open({
        title : 'Image Viewer',
        content : '<div class="center"><img src="' + img + '" style="max-width:none;"></div>'+
                  (src ? '<hr><div class="center" style="padding-bottom:3px;"><b>Source:</b> <a href="' + src + '?ref=kantan_japanese" target="_blank">' + src + '</a></div>' : ''),
        fullscreen : true
      });
    },
    
    
    // for viewing the stroke order in Kanji Writing Practice exercises
    // options:
    // kana : true = kana stroke order
    // animOnly : true = only show the stroke order animation
    viewStrokeOrder : function (kanji, order, opt) {
      opt = opt || {};
      
      var img = getPaths() + 'resources/images/stroke-order/img/' + order + '.webp',
          svg = getPaths() + 'resources/images/stroke-order/svg/' + order + '.svg',
          supLink = '<a class="button" href="' + (opt.kana ? getPaths() + 'resources/images/stroke-order/' + opt.kana + '-chart.webp' : 'https://app.kanjialive.com/' + kanji) + '" target="_blank"><i class="fa">&#xf08e;</i>' + (opt.kana ? '<span class="en">View ' + opt.kana + ' chart</span><span class="ja">' + (opt.kana == 'hiragana' ? 'ひらがな' : 'カタカナ') + 'のチャートを見る</span>' : '<span class="en">View on Kanji Alive</span><span class="ja">Kanji Aliveで見る</span>') + '</a>',
          size = opt.animOnly ? 300 : 150;
          
      KantanModal.open({
        title : kanji + '<span class="en"> Stroke Order</span><span class="ja">の書き順</span>',
        content :
          '<div class="kanji-stroke-order center">'+
            //'<div class="big-kanji' + (opt.kana ? ' kana-font' : '') + '"' + ( /り/.test(kanji) ? ' style="font-family:SawarabiGothic, MS Gothic, Yu Gothic, NotoSansJP, Meiryo;"' : '' ) + '>' + kanji + '</div>'+
            '<div id="stroke-order-animation" class="kanji-canvas" style="width:' + size + 'px;">'+
              '<object data="' + svg + '" type="image/svg+xml" height="' + size + '" width="' + size + '"></object>'+
              // '<img src="' + svg + '" height="200" width="200">'+
            '</div>'+
            '<button class="button" onclick="Kantan.replayStrokeOrder();"><i class="fa">&#xf01e;</i><span class="en">Replay</span><span class="ja">リプレイする</span></button><br><br>'+
            ((Kantan.kanji && Kantan.kanji[kanji]) || opt.strokes ? '<div><b>Number of Strokes:</b> ' + (opt.strokes || Kantan.kanji[kanji].strokes) + '</div>' : '')+
            (opt.animOnly ? supLink :
              '<div class="stroke-order-container">'+
                '<img src="' + img + '" alt="' + ( KN_Lang == 'ja' ? '書き順' : 'stroke order' ) + '"/><br>'+
                supLink+
              '</div>'
            )+
          '</div>',
        
        customSize : {
          top : '5%',
          left : '10%',
          right : '10%',
          bottom : '10%'
        }
      });
    },
    
    
    // replays the stroke order animation
    replayStrokeOrder : function () {
      var anim = document.getElementById('stroke-order-animation');
      anim.innerHTML = anim.innerHTML;
    },
    
    
    // Returns a list of alternative answers for a string. Generally used for mixed kana/kanji answers.
    // Special thanks to Patrick Roberts for helping me improve this function (stackoverflow.com/a/59337819/12502093)
    // USAGE: Kantan.getAlts('...{A}...{B}...{C}...', '1|2|3'); // add 'true' to the 3rd arg to return an array
    // The text within curly braces is replaced with the identical index in the second argument, so:
    // A can only be A or 1, B can only be B or 2, and so on...
    getAlts : function (str, alt, arrayOnly) {
      var subs = alt.split('|'),
          length = subs.length,
          permutations = Math.pow(2, length),
          results = [],
          i = 0,
          parts = [],
          regex = /\{(.*?)\}/g,
          match,
          lastIndex = 0,
          slotIndex = 0,
          j, part, bit, result;
      
      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          parts.push(str.slice(lastIndex, match.index));
        }
        parts.push({
          isSlot: true,
          content: match[1],
          index: slotIndex++
        });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < str.length) {
        parts.push(str.slice(lastIndex));
      }
      
      for (; i < permutations; ++i) {
        result = "";
        for (j = 0; j < parts.length; j++) {
          part = parts[j];
          if (part.isSlot) {
             bit = length - 1 - part.index;
             result += ((1 << bit) & i) ? subs[part.index] : part.content;
          } else {
             result += part;
          }
        }
        results.push(result);
      }
      
      // append ?debug to the URL for debug logs
      /*if (Kantan.debug) {
        var len = results.length;
        console[len / permutations * 100 == 100 ? 'log' : 'warn'](len + '/' + permutations + ' (' + (len / permutations * 100) + '% combo coverage for ' + length + ' replacements; ' + (permutations - len) + ' missing combos)', results);
      }*/

      return arrayOnly ? results : '%(' + results.join('/') + ')|';
    },
    
    
    // highlights the difference in an answer
    // str1 = student's answer or string to be compared against string2
    // str2 = correct answer or string to be compared to
    // USAGE: Kantan.getAnswerDiff('ぬこ', 'ねこ'); // '<span class="answer-diff">ぬ</span>こ'
    getAnswerDiff : function (str1, str2) { 
      var n = str1.length,
          m = str2.length,
          dp = [],
          row, r, c, i, j;

      // build LCS table
      for (r = 0; r <= n; r++) {
        row = [];
        for (c = 0; c <= m; c++) {
          row.push(0);
        }
        dp.push(row);
      }

      for (i = 1; i <= n; i++) {
        for (j = 1; j <= m; j++) {
          if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }

      // find which characters in str1 are part of the LCS
      var currI = n,
          currJ = m,
          isCommon = [], k;
      
      for (k = 0; k < n; k++) {
        isCommon.push(false);
      }

      while (currI > 0 && currJ > 0) {
        if (str1.charAt(currI - 1) === str2.charAt(currJ - 1)) {
          isCommon[currI - 1] = true;
          currI--;
          currJ--;
        } else if (dp[currI - 1][currJ] > dp[currI][currJ - 1]) {
          currI--;
        } else {
          currJ--;
        }
      }

      // construct the result string
      var result = "",
          inDiff = false,
          x;

      for (x = 0; x < n; x++) {
        if (!isCommon[x]) {
          // the character is different/missing in str2
          if (!inDiff) {
            result += '<span class="answer-diff">';
            inDiff = true;
          }
          result += str1.charAt(x);
        } else {
          // the character is in str2
          if (inDiff) {
            result += '</span>';
            inDiff = false;
          }
          result += str1.charAt(x);
        }
      }

      // close tag if ended inside a difference
      if (inDiff) {
        result += '</span>';
      }

      return result;
    },
    
    
    // returns the specified grammar point in a popup window
    getGrammarPoint : function (caller, id) {
      // check if grammar point is being opened in the popup window, to cache the currently opened grammar point
      var parent = caller.parentNode;
      while (parent) {
        if (parent.id == 'kantan-modal-content') {
          // push new history entry
          Kantan.grammarPointHistory.push(parent.innerHTML);
          break;
          
        } else if (parent.tagName == 'BODY' || !parent) {
          break;
          
        } else {
          parent = parent.parentNode;
        }
      }
      
      // open modal
      KantanModal.open({
        title : 'Quick Grammar Review',
        content : '<div id="appendix-tool" class="loading"></div>',
        customButton : 
        (Kantan.grammarPointHistory.length ? '<button id="kantan-modal-back" class="button" onclick="Kantan.grammarPointBack(this);" title="Go back to previous grammar point."><i class="fa">&#xf112;</i><span class="en">Back</span><span class="ja">先の文法ノートに戻る</span></button>' : '')+
        '<a href="' + caller.href + '" class="button" target="_blank"><i class="fa">&#xf08e;</i><span class="en">View in Grammar Index</span><span class="ja">文法索引で見る</span></a>',
        customSize : {
          top : '10%',
          left : '20%',
          bottom : '10%',
          right : '20%'
        },
        zIndex : 'low',
        
        // clears grammar history when closed
        closeCallback : function () {
          Kantan.grammarPointHistory = [];
        }
      });
      
      Get(caller.href, function (data) {
        var zone = document.getElementById('appendix-tool'),
            subId = id.replace(/l\d+-p\d+-(.*)/, '$1'),
            grammar = data.match(new RegExp('(<h3 id="' + id.replace(/-\d+$/, '') + '"[\\s\\S]*?<\/table><br>)', 'm')), // should return h3 title and table right below it
            url = caller.href.replace(/#.*$/, ''); // clean grammar index url for use in anchor links
        
        if (grammar && grammar[0]) {
          if (zone) {
            // trim out grammar point number and format anchor links for use with the quick grammar review modal
            zone.innerHTML = grammar[0].replace(/表現ノート\d+\. |読みのストラテジー\d+\. |\d+\.(?: |)/, '').replace(/href="#(l\d+-p\d+)"/g, 'onclick="Kantan.getGrammarPoint(this, \'$1\'); return false;" target="_blank" href="' + url + '#$1"');
            zone.className = 'grammar-index';
            
            if (!/l/.test(subId)) {
              document.getElementById('kantan-modal-content').scrollTop = document.getElementById(id).offsetTop + 20;
            }
          }
        } else if (zone) {
          zone.innerHTML = '<br><b><span class="en">Failed to retrieve grammar point. Click "View in Grammar Index" to try viewing the grammar point directly.</span><span class="ja">文法項目の取得に失敗しました。「文法索引で見る」をクリックして、文法項目を直接見てみてください。</span></b>';
          zone.className = 'center';
        }
      });
    },
    
    // return to a previously viewed grammar point in the quick grammar review window
    grammarPointHistory : [],
    grammarPointBack : function (button) {
      if (Kantan.grammarPointHistory.length) {
        var content = document.getElementById('kantan-modal-content');
        content.innerHTML = Kantan.grammarPointHistory.pop();
        content.scrollTop = 0;
        
        // hide button if no more history entries
        if (!Kantan.grammarPointHistory.length) {
          button.style.display = 'none';
        }
      }
    },
    
    
    // takes the user to a random exercise
    randomExercise : function () {
      // random exercise preference (current lesson)
      if (Kantan.pref.randomExercise == 'lesson' && /lesson-\d+/.test(window.location.href)) {
        var regex = new RegExp(window.location.href.replace(/.*?(lesson-\d+).*/, '$1/')),
            list = Kantan.exercises.filter(function(a) { return regex.test(a) });
      } 
      
      // random exercise preference (random, previously completed lesson)
      else if (Kantan.pref.randomExercise == 'completed' && localStorage.KantanResults && JSON.parse(localStorage.KantanResults)) {
        var Results = JSON.parse(localStorage.KantanResults), list = [], k;
        
        for (k in Results) {
          if (Results[k] != 'R') { // exclusions (R = reading material)
            list.push('lesson-' + k);
          }
        }
        
        if (!list[0]) {
          return alert(KN_Lang == 'ja' ? '完成した練習が足りませんのでランダム練習はできません。' : 'Cannot select a random exercise, because you have not completed enough exercises yet.');
        }
      }
      
      else if (Kantan.pref.randomExercise == 'custom' && KN_RandomList.length) {
        var list = KN_RandomList;
      } 
      
      // default (all lessons), triggers this instead of preference if in the appendix or study tools since they're not lessons
      else {
        var regex = /^>|^#/,
            list = Kantan.exercises.filter(function(a) { return !regex.test(a) });
      }
      
      // the random exercise
      var exercise = list[Math.floor(Math.random() * list.length)].split('|');
      
      // only take the user to random lessons
      if (/lesson-\d+/.test(exercise[0])) {
        window.location.href = '../../../lessons/' + exercise[0] + '/' + Kantan.local + Kantan.debug;
        
      } else { // try again if not a lesson
        Kantan.randomExercise();
      }
    },
    

    // start or pause timer according to page visibility
    startOrPauseTimerByVisibility : function () {
      if (document.hidden && Kantan.timer.isRunning()) {
        Kantan.timer.pause();
      } else if (!document.hidden && Kantan.timer.isPaused() && !Kantan.isTimerPausedByPopup) {
        Kantan.timer.start();
      }
    },


    // pause timer when open popup
    pauseTimerWhenOpenPopup: function () {
       Kantan.timer.pause();
       Kantan.isTimerPausedByPopup = true;
    },


    // start timer when close popup
    startTimerWhenClosePopup: function () {
       Kantan.timer.start();
       Kantan.isTimerPausedByPopup = false;
    },
    
    
    // initial setup for exercise functionality and pages
    init : function () {
      if (Kantan.exercises) {
        // finds the currently active exercise in the exercise list and sets up essential data for following statements
        var i = 0,
            j = Kantan.exercises.length,
            result = document.getElementById('quiz-result'),
            lesson;

        for (; i < j; i++) {
          if (Kantan.active.path == Kantan.exercises[i].split('|')[0]) {
            Kantan.active.exercise = Kantan.exercises[i] ? Kantan.exercises[i].split('|') : null;
            Kantan.active.index = i;
            break;
          }
        }

        // add exercise title to the document
        if (result) {
          if (Kantan.active.exercise && !/[a-z]+-editor/.test(window.location.pathname)) {
            lesson = /^references/.test(Kantan.active.exercise[0]) ? 'reference' : /^tools/.test(Kantan.active.exercise[0]) ? 'tools' : +Kantan.active.exercise[0].replace(/lesson-(\d+).*/, '$1'); // current lesson

            result.insertAdjacentHTML('beforebegin', '<h2 id="main-title" class="content-title">' + (
              lesson == 'tools' ? 'Tool' :
              lesson == 'reference' ? 'References' :
              'Lesson ' + lesson
            ) + ' - ' + Kantan.active.exercise[1] + '</h2>');

          } else {
            result.insertAdjacentHTML('beforebegin', '<h2 id="main-title" class="content-title">' + document.querySelector('TITLE').innerText.replace(/\s\|.*/, '') + '</h2>');
          }
        }


        // touch listeners for touch screen events
        if (Kantan.isTouch) {
          document.ontouchstart = function () {
            Kantan.isTouching = true;
          }

          document.ontouchend = function () {
            Kantan.isTouching = false;
          }

          document.ontouchcancel = function () {
            Kantan.isTouching = false;
          }
        }


        // setup navigational objects
        Kantan.create.exerciseButtons();
      }

      // create exercise list/quick navigation
      Kantan.create.exerciseList();
      
      // define Kantan in the global namespace
      window.Kantan = this;
    },
    
    
    // functionality setup for the app
    initApp : function () {
      if (window.KantanMobile) {
        // class for styling the mobile version + android
        document.documentElement.className += ' mobile-app android';

        // wait for cordova plugins/apis to be ready
        document.addEventListener('deviceready', function () {

          // save the scroll position for the current page
          function getScrollKey() {
            return 'scroll:' + location.href;
          }

          function saveScrollPosition() {
            try {
              sessionStorage.setItem(
                getScrollKey(),
                String(window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
              );
            } catch (e) {}
          }

          // restore the scroll position for the current page
          function restoreScrollPosition() {
            try {
              var shouldRestore = sessionStorage.getItem('restoreScrollOnBack'),
                  saved = sessionStorage.getItem(getScrollKey());

              if (shouldRestore === 'true' && saved !== null) {
                sessionStorage.removeItem('restoreScrollOnBack');

                setTimeout(function () {
                  window.scrollTo(0, parseInt(saved, 10) || 0);
                }, 0);
              }
            } catch (e) {}
          }

          // save scroll position while scrolling
          window.addEventListener('scroll', saveScrollPosition, false);

          // restore scroll position only when returning via back button
          restoreScrollPosition();

          // find a[download] links
          function findDownloadAnchor(node) {
            while (node && node !== document) {
              if (
                node.tagName &&
                node.tagName.toLowerCase() === 'a' &&
                node.getAttribute('download') !== null
              ) {
                return node;
              }
              node = node.parentNode;
            }
            return null;
          }

          // save files to the user's device from a[download] links
          function saveDataUrl(anchor) {
            var href = anchor.getAttribute('href'),
                filename = anchor.getAttribute('download') || 'download.txt',
                commaIndex, payload, isBase64, data;

            if (!href || href.indexOf('data:') !== 0) {
              return;
            }

            commaIndex = href.indexOf(',');
            payload = commaIndex >= 0 ? href.substring(commaIndex + 1) : '';
            isBase64 = /;base64,/i.test(href);
            data = isBase64 ? payload : decodeURIComponent(payload);

            if (!window.resolveLocalFileSystemURL || !cordova.file || !window.LocalFileSystem) {
              KantanModal.open({
                title: window.KN_Lang == 'ja' ? '保存エラー' : 'Save Failed',
                content:
                  '<p>' +
                  (window.KN_Lang == 'ja'
                    ? 'ファイル保存機能を利用できません。'
                    : 'The file saving feature is not available.') +
                  '</p>',
                buttonHTML: 'OK'
              });
              return;
            }

            // resolve a writable location on the device and create/find the Documents folder
            var baseDir =
              cordova.file.externalRootDirectory ||
              cordova.file.externalDataDirectory ||
              cordova.file.dataDirectory;

            window.resolveLocalFileSystemURL(baseDir, function (rootDir) {
              rootDir.getDirectory('Documents', { create: true }, function (dirEntry) {
                dirEntry.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {
                  fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function () {
                      var title = window.KN_Lang == 'ja' ? '保存完了' : 'File Saved';
                      var content =
                        '<p>' +
                          (window.KN_Lang == 'ja'
                            ? '次のファイルが正常に保存されました。'
                            : 'The following file was saved successfully.') +
                        '</p>' +
                        '<p><b>' + filename + '</b></p>' +
                        '<p>' +
                          (window.KN_Lang == 'ja'
                            ? '保存先は端末のドキュメントフォルダ、またはアプリのストレージです。'
                            : 'The file was saved to your device documents folder or app storage.') +
                        '</p>' +
                        '<div class="text-block" style="word-break:break-all;font-size:12px;">' +
                          '<b>' + (window.KN_Lang == 'ja' ? '保存先' : 'Saved at') + ':</b><br>' +
                          fileEntry.nativeURL +
                        '</div>';

                      KantanModal.open({
                        title: title,
                        content: content,
                        buttonHTML: 'OK'
                      });
                    };

                    fileWriter.onerror = function (err) {
                      KantanModal.open({
                        title: window.KN_Lang == 'ja' ? '保存エラー' : 'Save Failed',
                        content:
                          '<p>' +
                          (window.KN_Lang == 'ja'
                            ? 'ファイルの保存に失敗しました。もう一度お試しください。'
                            : 'Failed to save the file. Please try again.') +
                          '</p>',
                        buttonHTML: 'OK'
                      });

                      console.error(err);
                    };

                    if (isBase64) {
                      var byteCharacters = atob(data);
                      var byteNumbers = new Array(byteCharacters.length);
                      for (var i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      var byteArray = new Uint8Array(byteNumbers);
                      fileWriter.write(new Blob([byteArray]));
                    } else {
                      fileWriter.write(new Blob([data], { type: 'text/plain' }));
                    }
                  }, function (err) {
                    console.error(err);
                  });
                }, function (err) {
                  console.error(err);
                });
              }, function (err) {
                console.error(err);
              });
            }, function (err) {
              console.error(err);
            });
          }

          // handle downloading for a[download] links
          document.addEventListener('click', function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement,
                anchor = findDownloadAnchor(target);

            if (!anchor) {
              return;
            }

            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;

            saveDataUrl(anchor);
          }, false);

          // handle android back button
          document.addEventListener('backbutton', function () {
            if (window.KantanModal && window.KantanModal.isOpen) {
              window.KantanModal.close();
              return;
            }

            // save the current scroll position before going back
            saveScrollPosition();

            if (window.history && window.history.length > 1) {
              // restore scroll only when returning via back button
              sessionStorage.setItem('restoreScrollOnBack', 'true');
              window.history.back();
              return;
            }

            if (navigator.app && navigator.app.exitApp) {
              navigator.app.exitApp();
            }
          }, false);

        }, false);
      }
    },
    
    
    // initial setup of the SRS review list
    initReviewList : function () {
      var list = document.getElementById('review-lists'),
          due = document.getElementById('reviews-due'),
          upcoming = document.getElementById('reviews-upcoming'),
          mastered = document.getElementById('reviews-mastered'),
          retired = document.getElementById('reviews-retired'),
          tab_due = document.getElementById('tab-due'),
          tab_upcoming = document.getElementById('tab-upcoming'),
          tab_mastered = document.getElementById('tab-mastered'),
          tab_retired = document.getElementById('tab-retired'),
          dates = [], data, reviews, i, j, k;
      
      // setup save button for profile data
      document.getElementById('profile-data-save').href = 'data:text/plain;charset=utf-8,' + KantanSettings.saveExerciseData();
      
      // show placeholder if SRS is disabled
      if (Kantan.pref.SRS == 'false') {
        list.innerHTML = 
          '<div class="center review-list" style="display:block;"><div class="placeholder">The Spaced Repetition System is currently disabled. Click the button below to enable it.<br>'+
          '<button class="button green" onclick="localStorage.KN_SRS = \'true\'; window.location.reload();"><i class="fa">&#xf011;</i>Enable SRS</button></div></div>';
      }
      
      // show all reviews otherwise
      else {
        if (window.KantanReviews) {
          reviews = '';
          
          // parse due reviews
          for (k in KantanReviews.list.due) {
            dates.push(k);
          }
          dates.sort();
          
          // parse dates and exercises
          for (i = dates.length - 1; i > -1; i--) {
            data = getReviewData(dates[i]);
            reviews += '<h4 class="sub-lesson-title">' + data.date + ' <span class="t-' + (data.days == 0 ? 'yellow' : 'amber') + '">(due ' + (data.days == 0 ? 'today' : data.days.toString().slice(1) + ' day' + (data.days == 1 ? '' : 's') + ' ago') + ')</span></h4>'+
                       Kantan.parse.reviewLinks(KantanReviews.list.due[dates[i]], { retire : true });
          }
          due.innerHTML = /<li>/.test(reviews) ? reviews : '';
          tab_due.innerHTML += ' (' + KantanReviews.due + ')';
          
          
          // parse upcoming reviews into groups based on dates
          reviews = '';
          dates = [];
          
          // sort dates
          for (k in KantanReviews.list.upcoming) {
            dates.push(k);
          }
          dates.sort();
          
          // parse dates and exercises
          for (i = 0, j = dates.length; i < j; i++) {
            data = getReviewData(dates[i]);
            reviews += '<h4 class="sub-lesson-title">' + data.date + ' <span class="t-yellow">(due ' + (data.days == 1 ? 'tomorrow' : 'in ' + data.days + ' days') + ')</span></h4>'+
                       Kantan.parse.reviewLinks(KantanReviews.list.upcoming[dates[i]], { retire : true });
          }
          
          // finally apply upcoming reviews
          upcoming.innerHTML = /<li>/.test(reviews) ? reviews : '';
          tab_upcoming.innerHTML += ' (' + KantanReviews.upcoming + ')';

          // parse mastered reviews
          reviews = Kantan.parse.reviewLinks(KantanReviews.list.mastered);
          mastered.innerHTML = /<li>/.test(reviews) ? reviews : '';
          tab_mastered.innerHTML += ' (' + KantanReviews.mastered + ')';

          // parse retired reviews
          reviews = Kantan.parse.reviewLinks(KantanReviews.list.retired, { revive : true });
          retired.innerHTML = /<li>/.test(reviews) ? '<div class="center"><button class="button red" onclick="Kantan.clearRetiredReviews(this);"><i class="fa">&#xf1f8;</i>Clear Retired Reviews</button></div>' + reviews : '';
          tab_retired.innerHTML += ' (' + KantanReviews.retired + ')';
          
          // set default tab depending on review content
          if (KantanReviews.due) tab_due.click();
          else if (KantanReviews.upcoming) tab_upcoming.click();
          else if (KantanReviews.mastered) tab_mastered.click();
          else if (KantanReviews.retired) tab_retired.click();
          
        } else {
          due.innerHTML = '';
          upcoming.innerHTML = '';
          mastered.innerHTML = '';
          retired.innerHTML = '';
        }
      }
    },
    
    // purges exercise IDs that no longer exist
    // IDs = array, usually passed from parseReviewLinks which checks internally if an exercise exists or not
    purgeBadExercises : function (IDs) {
      for (var data = JSON.parse(localStorage.KantanResults), i = 0, j = IDs.length; i < j; i++) {
        delete data[IDs[i]];
      }
      
      localStorage.KantanResults = JSON.stringify(data);
    },
    
    // switches the reviews shown in the review page
    switchReviewTab : function (caller, list) {
      list = document.getElementById('reviews-' + list);
      
      if (!list) return false;
      
      var buttons = caller.parentNode.querySelectorAll('.button'),
          lists = list.parentNode.querySelectorAll('.review-list'),
          i = 0, j = buttons.length;
      
      for (; i < j; i++) {
        lists[i].style.display = 'none';
        buttons[i].className = buttons[i].className.replace('active-tab', '');
      }
      
      list.style.display = 'block';
      caller.className += ' active-tab';
    },
    
    // revives a retired exercise for review
    reviveReview : function (caller) {
      KantanModal.open({
        title : '<span class="en">Revive for Review?</span><span class="ja">復習のために復活しますか？</span>',
        content : 'Are you sure you want to revive "<b>' + caller.parentNode.firstChild.innerHTML.replace(/^<.*?>.*?<\/.*?><\/.*?>/, '').replace(/<.*?>.*?<\/.*?>$/, '') + '</b>" for review? It will be immediately added to the Due section for you to review.',
        buttonHTML : '<span class="en">Revive</span><span class="ja">復活する</span>',
        buttonColor : 'green',

        callback : function () {
          var results = JSON.parse(localStorage.KantanResults),
              data = unpackExerciseData(results[caller.dataset.exercise]),
              due = document.getElementById('reviews-due'),
              retired = document.querySelector('#reviews-retired ul'),
              list = due.getElementsByTagName('UL')[0],
              tabDue = document.getElementById('tab-due'),
              tabRetired = document.getElementById('tab-retired');
          
          // update internal data
          data.review = new Date().setHours(0, 0, 0, 0);
          data.streak = 0;
          results[caller.dataset.exercise] = packExerciseData(data);
          localStorage.KantanResults = JSON.stringify(results);
          
          // adjust number of reviews
          KantanReviews.due++;
          KantanReviews.retired--;
          tabDue.innerHTML = tabDue.innerHTML.replace(/\(\d+\)/, '(' + KantanReviews.due + ')');
          tabRetired.innerHTML = tabRetired.innerHTML.replace(/\(\d+\)/, '(' + KantanReviews.retired + ')');
          
          // add this review to the exisiting due review list
          if (list) {
            list.appendChild(caller.parentNode);
          }
          
          // otherwise create a new due review list
          else {
            list = document.createElement('UL');
            list.appendChild(caller.parentNode);
            due.innerHTML = '';
            due.appendChild(list);
          }
          
          // change revive button to retire button
          caller.parentNode.innerHTML = caller.parentNode.innerHTML
            .replace(/\uf0e2/, '\uf186')
            .replace('reviveReview', 'retireReview')
            .replace('Revive for review', 'Retire review');
          
          // hide clear all retired reviews button
          if (!retired.childNodes.length) {
            document.querySelector('#reviews-retired .button.red').parentNode.style.display = 'none';
          }
        }
      });
    },
    
    // permanantly retires an exercise for review
    retireReview : function (caller) {
      KantanModal.open({
        title : '<span class="en">Retire Review?</span><span class="ja">この復習をリタイアしますか？</span>',
        content : 'Are you sure you want to retire "<b>' + caller.parentNode.firstChild.innerHTML.replace(/^<.*?>.*?<\/.*?><\/.*?>/, '').replace(/<.*?>.*?<\/.*?>$/, '') + '</b>" from reviews? All review data (streak, next review date, etc.) will be lost for this exercise and it will no longer show up in Due or Upcoming reviews.',
        buttonHTML : '<span class="en">Retire</span><span class="ja">リタイアする</span>',
        buttonColor : 'red',

        callback : function () {
          var results = JSON.parse(localStorage.KantanResults),
              data = unpackExerciseData(results[caller.dataset.exercise]),
              upcoming = caller.parentNode.parentNode.previousSibling && caller.parentNode.parentNode.previousSibling.className == 'sub-lesson-title' ? caller.parentNode.parentNode : null,
              retired = document.getElementById('reviews-retired'),
              list = retired.getElementsByTagName('UL')[0],
              tab = document.getElementById('tab-' + (upcoming ? 'upcoming' : 'due')),
              tabRetired = document.getElementById('tab-retired');
          
          // update internal data
          data.review = 'R';
          data.streak = 0;
          results[caller.dataset.exercise] = packExerciseData(data);
          localStorage.KantanResults = JSON.stringify(results);
          
          // adjust number of reviews
          KantanReviews[upcoming ? 'upcoming' : 'due']--;
          KantanReviews.retired++;
          tab.innerHTML = tab.innerHTML.replace(/\(\d+\)/, '(' + KantanReviews[upcoming ? 'upcoming' : 'due'] + ')');
          tabRetired.innerHTML = tabRetired.innerHTML.replace(/\(\d+\)/, '(' + KantanReviews.retired + ')');
          
          // add this review to the exisiting retired review list
          if (list) {
            list.appendChild(caller.parentNode);
          }
          
          // otherwise create a new retired review list
          else {
            list = document.createElement('UL');
            list.appendChild(caller.parentNode);
            retired.innerHTML = '';
            retired.appendChild(list);
            list.insertAdjacentHTML('beforebegin', '<div class="center"><button class="button red" onclick="Kantan.clearRetiredReviews(this);"><i class="fa">&#xf1f8;</i>Clear Retired Reviews</button></div>');
          }
          
          // change retire button to revive button
          caller.parentNode.innerHTML = caller.parentNode.innerHTML
            .replace(/\uf186/, '\uf0e2')
            .replace('retireReview', 'reviveReview')
            .replace('Retire review', 'Revive for review');
          
          // show clear all retired reviews button
          var clearAll = document.querySelector('#reviews-retired .button.red');
          if (clearAll) {
            clearAll.parentNode.style.display = '';
          }
          
          // hide upcoming date title if no more reviews for this list
          if (upcoming && !upcoming.childNodes.length) {
            upcoming.parentNode.removeChild(upcoming.previousSibling)
            upcoming.parentNode.removeChild(upcoming);
          }
        }
      });
    },
    
    // clears all retired exercises
    clearRetiredReviews : function (caller) {
      KantanModal.open({
        title : '<span class="en">Clear All Retired Reviews?</span><span class="ja">すべてのリタイアした復習を消しますか？</span>',
        content : '<span class="en">All retired reviews will be deleted. Do you want to continue?</span><span class="ja">すべてのリタイアした復習は消されます。よろしいですか？</span>',
        buttonHTML : '<span class="en">Clear All</span><span class="ja">すべてを消す</span>',
        buttonColor : 'red',

        callback : function () {
          var results = JSON.parse(localStorage.KantanResults),
              retired = document.getElementById('reviews-retired'),
              exercises = retired.querySelectorAll('ul li'), i = 0, j = exercises.length,
              tabRetired = document.getElementById('tab-retired');
          
          // hide button
          caller.parentNode.style.display = 'none';
          
          // delete all retired exercises
          for (; i < j; i++) {
            delete results[exercises[i].querySelector('.button').dataset.exercise];
            exercises[i].parentNode.removeChild(exercises[i]);
          }
          localStorage.KantanResults = JSON.stringify(results);
          
          // adjust number of reviews
          KantanReviews.retired = 0;
          tabRetired.innerHTML = tabRetired.innerHTML.replace(/\(\d+\)/, '(' + KantanReviews.retired + ')');
          
          window.setTimeout(function () {
            alert('All retired reviews have been deleted successfully!');
          }, 100);
        }
      });
    },
    
    // opens a window with a list of exercises
    viewExercises : function (list, type) {
      type = type || 'exlist';
      list = list || 'complete';
      
      var title = {
        complete : 'Completed',
        perfect : 'Perfected',
        passed : 'Passed',
        barely : 'Barely Passed',
        failed : 'Failed',
        due : 'Due',
        upcoming : 'Upcoming',
        mastered : 'Mastered',
        retired : 'Retired',
        read : 'Read',
        reading : 'Reading'
      }[list], reviews = '';
      
      if (list == 'due') {
        // parse due reviews into groups based on dates
        var dates = [], k;

        // sort dates
        for (k in KantanReviews.list.due) {
          dates.push(k);
        }
        dates.sort();
        // parse dates and exercises
        for (var i = dates.length - 1, data; i > -1; i--) {
          data = getReviewData(dates[i]);
          reviews += '<h4 class="sub-lesson-title">' + data.date + ' <span class="t-' + (data.days == 0 ? 'yellow' : 'amber') + '">(due ' + (data.days == 0 ? 'today' : data.days.toString().slice(1) + ' day' + (data.days == 1 ? '' : 's') + ' ago') + ')</span></h4>'+
                     Kantan.parse.reviewLinks(KantanReviews.list.due[dates[i]], { addClass : true });
        }
      }
      
      if (list == 'upcoming') {
        // parse upcoming reviews into groups based on dates
        var dates = [], k;

        // sort dates
        for (k in KantanReviews.list.upcoming) {
          dates.push(k);
        }
        dates.sort();

        // parse dates and exercises
        for (var i = 0, j = dates.length, data; i < j; i++) {
          data = getReviewData(dates[i]);
          reviews += '<h4 class="sub-lesson-title">' + data.date + ' <span class="t-yellow">(' + (data.days == 1 ? 'tomorrow' : 'in ' + data.days + ' days') + ')</span></h4>'+
                     Kantan.parse.reviewLinks(KantanReviews.list.upcoming[dates[i]], { addClass : true });
        }
      }
      
      reviews = 
        list == 'due' ? '<div id="exercise-viewer">' + reviews + '</div>' :
        list == 'upcoming' ? '<div id="exercise-viewer">' + reviews + '</div>' :
        Kantan.parse.reviewLinks(
          type == 'exlist' ? KantanExList[list] :
          type == 'articles' ? KantanExList[list] :
          type == 'review' ? KantanReviews.list[list] : {},
          { noStreak : type == 'review' ? false : true, addClass : true }
        );
      
      KantanModal.open({
        title : type == 'exlist' ? 'Exercises - ' + title :
                type == 'articles' ?  'Reading Material - ' + title :
                type == 'review' ? title + ' Reviews' : '',
        content : /<li>/.test(reviews) ? reviews : '<p class="center"><b style="font-size:20px;">No ' + (type == 'articles' ? 'reading material' : 'exercises') + ' found.</b></p>',
        customSize : {
          top : '10%',
          left : '20%',
          bottom : '10%',
          right : '20%'
        }
      });
    },
    
    
    // initialize standard read-only page (articles, grammar explanations, charts, etc.)
    initPage : function (opts) {
      opts = opts || {};
      
      // add edit button for editing read-only pages
      var info = document.getElementById('article-info');
      if (info) {
        info.insertAdjacentHTML('beforeend', '<a id="edit-page" class="button icon-only" onclick="Kantan.editPage(); return false;" title="Edit article" href="' + getPaths() + 'lessons/tools/article-editor/' + Kantan.local + '"><i class="fa">&#xf040;</i></a>');
      }
      
      // parses word practice zones
      Kantan.parse.wordPractice();
      
      // add mark as read button and initiate scroll listener
      if (!opts.noReadState) Kantan.check.readState(true);
      
      // initialize the quick dictionary
      Kantan.quickJisho.create();
      
      // initialize highlighting for example dialogue
      Kantan.exampleHighlighter.init();
      
      // show page content
      Kantan.stopLoading();
    },
    
    
    // opens the current page into the article editor
    editPage : function () {
      var editor = document.getElementById('edit-page').href;
      
      KantanModal.open({
        title : 'Edit Article?',
        content :
          '<p>This article will be opened in our article editor so that you can edit it. Would you Like to continue?</p>'+
          '<p><b>IMPORTANT:</b> Please note that proceeding will overwrite any content currently saved in the article editor. <a href="' + editor + '" target="_blank"><b>Click here</b></a> first to backup your content if you need to.</p>',
        buttonHTML : '<i class="fa">&#xf08e;</i>Open in Article Editor',
        buttonColor : 'yellow',
        
        callback : function () {
          // dedents HTML so it doesn't look as messy in the editor
          function normalizeWhitespace(html) {
            if (!html) return '';
            // remove empty lines at the very beginning and end
            var lines = html.replace(/^\s*[\r\n]/, '').replace(/[\r\n]\s*$/, '').split(/\r?\n/);
            var minIndent = Infinity;

            // find the minimum indentation level among non-empty lines
            for (var i = 0; i < lines.length; i++) {
              var line = lines[i];
              if (line.trim().length > 0) {
                var match = line.match(/^[ \t]*/);
                var indent = match ? match[0].length : 0;
                if (indent < minIndent) {
                  minIndent = indent;
                }
              }
            }

            if (minIndent === Infinity || minIndent === 0) {
              return lines.join('\n');
            }

            // remove the minimum indentation from all lines
            var normalized = [];
            for (var j = 0; j < lines.length; j++) {
              var line2 = lines[j];
              normalized.push(line2.trim().length === 0 ? '' : line2.substring(minIndent));
            }

            return normalized.join('\n');
          }
          
          var content = document.getElementById('article-content') || document.getElementById('vocab-list') || document.getElementById('kanji-list');
          
          // get and save content for transfer to our article editor
          localStorage['KN_Editor_pgTitle'] = document.querySelector('[name="title"]').getAttribute('content').replace(' | Kantan Japanese', '');
          localStorage['KN_Editor_pgDesc'] = document.querySelector('[name="description"]').getAttribute('content');
          localStorage['KN_Editor_pgAuthor'] = document.getElementById('author-list').dataset.originalList;
          localStorage['KN_Editor_pgPublished'] = document.getElementById('publish-date').innerHTML.replace(/<.*?>.*?<\/.*?>/, '');
          localStorage['KN_Editor_pgRevised'] = document.getElementById('revision-date').innerHTML;
          localStorage['KN_Editor_pgContent'] = normalizeWhitespace(content.innerHTML)
                                                // removals
                                                .replace(/<a.*?class="anchor fa"><span class="anchor-icon">.*?<\/span><\/a>| title="View full image"| tabindex="0"/g, '')
                                                // remove index.html from links if edited offline
                                                .replace(/\/index\.html/g, '\/')
                                                // remove max-width on images since it's applied on page load via JS from the width="" attribute
                                                .replace(/(width="\d+") style="max-width: \d+px;"/g, '$1')
                                                // normalize local links by removing domain and only keeping path references
                                                .replace(/href=".*?\/((?:lessons|contact|download|donate|privacy|learning-resources|reviews|about|help)\/.*?)"/g, 'href="' + getPaths() + '$1"')
                                                // convert Font Awesome/Private Use Area characters back to hex entities
                                                .replace(/[\uE000-\uF8FF]/g, function(match) {
                                                  return '&#x' + match.charCodeAt(0).toString(16) + ';';
                                                })
                                                // convert literal non-breaking spaces back to &nbsp; so they are visible in the editor
                                                .replace(/\u00A0/g, '&nbsp;')
                                                // convert invisible zero-width spaces back to their entity so they aren't hidden in the editor
                                                .replace(/\u200B/g, '&#8203;');
          
          // go to article editor
          window.setTimeout(function () {
            window.open(editor, '_blank').focus();
          }, 10);
        }
      });
    },
    
    
    // opens the current exercise into the article editor
    editExercise : function () {
      var editor = document.getElementById('edit-page').href;
      
      KantanModal.open({
        title : 'Edit Exercise?',
        content :
          '<p>This exercise will be opened in our exercise editor so that you can edit it. Would you Like to continue?</p>'+
          '<p><b>IMPORTANT:</b> Please note that proceeding will overwrite any content currently saved in the exercise editor. <a href="' + editor + '" target="_blank"><b>Click here</b></a> first to backup your content if you need to.</p>',
        buttonHTML : '<i class="fa">&#xf08e;</i>Open in Exercise Editor',
        buttonColor : 'yellow',
        
        callback : function () {
          // temporarily store page data for loading into the editor
          localStorage.KN_Editor_TempPageData = document.documentElement.innerHTML;
          
          // go to exercise editor
          window.setTimeout(function () {
            window.open(editor, '_blank').focus();
          }, 10);
        }
      });
    },
    
    
    // saves user notes to browser storage
    saveNotes : function (str) {
      if (storageOK) {
        localStorage.KN_Notes = str;
      }
    },
    
    // loads user notes into the my notes textarea and initializes codemirror
    initNotes : function (callback) {
      var notes = document.getElementById('my-notes');
      
      if (notes) {
        // default/saved value for the editor
        notes.value = localStorage.KN_Notes || '# My Notes\nWrite your notes here!\n\n--------\n\nYou can use markdown to style your notes:\n**Bold**\n*Italic*\n> Quote\n`Code`\n# Title\n1. Numbered list\n- Unordered list';
        
        // add codemirror styles to head section of the document
        document.head.insertAdjacentHTML('beforeend', 
          '<link rel="stylesheet" href="' + getPaths() + 'resources/javascript/lib/codemirror/codemirror.css">'+
          '<link rel="stylesheet" href="' + getPaths() + 'resources/javascript/lib/codemirror/ayu-dark.css">'
        );
        
        // load in all required codemirror assets
        getScript('lib/codemirror/codemirror.js', function () {
          getScript('lib/codemirror/markdown.js', function () {
            getScript('lib/codemirror/active-line.js', function () {
              // CTRL+D duplicate command
              var duplicateCommand = function(cm) {
                var selection = cm.getSelection();
                if (selection) {
                  cm.replaceSelection(selection + selection);

                } else {
                  var cursor = cm.getCursor(),
                      line = cm.getLine(cursor.line);

                  cm.replaceRange(line + '\n', {line: cursor.line, ch: 0});
                }
              };

              // codemirror settings
              Kantan.notesEditor = CodeMirror.fromTextArea(notes, {
                mode: 'markdown',
                lineNumbers: true,
                lineWrapping: true,
                theme: document.querySelector('.dark-mode') ? 'ayu-dark' : 'default',
                inputStyle: 'textarea',
                spellcheck: true,
                styleActiveLine: true,
                tabSize : 2,
                extraKeys: {
                  'Ctrl-D': duplicateCommand,
                  'Cmd-D': duplicateCommand // for mac
                }
              });

              // listen for changes in the CodeMirror editor and save them
              Kantan.notesEditor.on("change", function(cm) {
                Kantan.saveNotes(cm.getValue());
              });
              
              // show editor
              notes.parentNode.className = '';
              
              // callback to run after initialization
              callback && callback();
            });
          });
        });
      }
    },
    
    // opens the user notes in a popup window
    openNotes : function () {
      KantanModal.open({
        title : 'Notes',
        content :
          '<div id="my-notes-container" class="loading">'+
            '<textarea id="my-notes"></textarea>'+
          '</div>',
        
        customSize : {
          top : '5%',
          left : 'auto !important',
          bottom : '5%',
          right : 'auto !important',
          width : '100%',
          maxWidth : '1200px'
        }
      });
      
      Kantan.initNotes(function () {
        Kantan.notesEditor.focus();
      });
    },
    
    // opens the user profile in a popup window
    openProfile : function () {
      // show placeholder and load exercise list if it's not present on the page
      if (!window.KantanExercises) {
        KantanModal.open({
          title : 'Profile',
          content : '<div class="loading"></div>',

          customSize : {
            top : '5%',
            left : 'auto !important',
            bottom : '5%',
            right : 'auto !important',
            width : '100%',
            maxWidth : '1200px'
          }
        });
        
        getScript('data/lesson-list.js', Kantan.openProfile);
        return false;
      }
      
      // show the user their stats
      KantanModal.open({
        title : 'Profile',
        content :
        `<div id="profile-stats" class="columns-2 clear">
          <div>
            <h3 class="section-title">Statistics</h3>
            <ul>
              <li><span class="label">Days Studied:</span><span id="days-studied">0</span></li>
              <li><span class="label">Grammar Learned:</span><span id="grammar-learned">0</span></li>
              <li><span class="label">Passing Rate:</span><span id="passing-rate">0</span></li>
            </ul>
            <h3 class="main-color">Exercises</h3>
            <ul>
              <li><span class="label">Completed:</span><span id="exercises-completed">0</span></li>
              <li><span class="label">Perfected:</span><span id="exercises-perfected">0</span></li>
              <li><span class="label">Passed:</span><span id="exercises-passed">0</span></li>
              <li><span class="label">Barely Passed:</span><span id="exercises-barely">0</span></li>
              <li><span class="label">Failed:</span><span id="exercises-failed">0</span></li>
            </ul>
            <h3 class="main-color">Reading Material</h3>
            <ul>
              <li><span class="label">Read:</span><span id="articles-read">0</span></li>
              <li><span class="label">Reading:</span><span id="articles-reading">0</span></li>
              <li><span class="label"><a id="nav-notes" href="#notes" onclick="Kantan.openNotes(); return false;" class="button"><i class="fa">&#xf24a;</i><span class="en">Notes</span><span class="ja">ノート</span></a></span></li>
            </ul>
          </div>

          <div>
            <h3 class="section-title">Reviews</h3>
            <ul>
              <li><span class="label">Due:</span><span id="profile-reviews-due">0</span></li>
              <li><span class="label">Upcoming:</span><span id="profile-reviews-upcoming">0</span></li>
              <li><span class="label">Mastered:</span><span id="profile-reviews-mastered">0</span></li>
              <li><span class="label">Retired:</span><span id="profile-reviews-retired">0</span></li>
            </ul>
            <a href="` + getPaths() + `reviews/` + Kantan.local + `" class="button"><span class="en">Manage Reviews</span><span class="ja">復習のページへ</span></a>
          </div>
        </div>

        <h4 class="center sub-title">Profile Data</h4>
        <div class="center">
          <a id="profile-data-save" class="button green" download="Kantan Profile Data.json" href="data:text/plain;charset=utf-8,` + KantanSettings.saveExerciseData() + `"><i class="fa">&#xf019;</i><span class="en">Save</span><span class="ja">セーブする</span></a>
          <button id="profile-data-load" class="button yellow" onclick="this.nextSibling.click();"><i class="fa">&#xf093;</i><span class="en">Load</span><span class="ja">ロードする</span></button><input id="load-data" class="hidden-input" type="file" accept=".json" onchange="KantanSettings.loadExerciseData(this, true);">
          <button id="settings-view-exercise-data" class="button" onclick="KantanSettings.viewExerciseData(true);"><i class="fa">&#xf1c9;</i><span class="en">View Data</span><span class="ja">データを見る</span></button>
        </div>`,
        
        customSize : {
          top : '10%',
          left : '20%',
          bottom : '10%',
          right : '20%'
        },
        
        preserveState : true
      });
      
      // parse the stats and reupdate the modal state with them
      Kantan.parse.profileStats();
      KantanModal.state.content = document.getElementById('kantan-modal').innerHTML;
    },
    
    
    // example highlighter
    exampleHighlighter : {
      // Japanese and English lines
      lines : {
        active : [],
        JA : [],
        EN : []
      },
      
      // gets lines for the example highlighter and adds event handlers
      init : function () {
        for (var lines = document.querySelectorAll('.example .line'), i = 0, j = lines.length; i < j; i++) {
          if (/columns-2-in/.test(lines[i].parentNode.parentNode.className)) { // only include example lines that are in column elements
            // add lines to either JA or EN based on the parent's class name
            // labeled typically contains JA examples
            if (/labeled/.test(lines[i].parentNode.className)) {
              Kantan.exampleHighlighter.lines.JA.push(lines[i]);
              // add unique identifier to the line for matching to our lines array
              lines[i].dataset.index = Kantan.exampleHighlighter.lines.JA.length - 1;
            } else {
              Kantan.exampleHighlighter.lines.EN.push(lines[i]);
              lines[i].dataset.index = Kantan.exampleHighlighter.lines.EN.length - 1;
            }

            // event handlers for applying our highlight
            lines[i].onmouseenter = function () {
              Kantan.exampleHighlighter.highlight(this);
            };

            lines[i].onmouseleave = function () {
              Kantan.exampleHighlighter.highlight(this, 'true');
            };
          }
        }
      },
      
      
      // core highlight function
      highlight : function (caller, removeOnly) {
        // unhighlight active lines
        for (var i = 0, j = Kantan.exampleHighlighter.lines.active.length; i < j; i++) {
          Kantan.exampleHighlighter.lines.active[i].className = Kantan.exampleHighlighter.lines.active[i].className.replace(/active-line/, '');
        }
        
        if (removeOnly == 'true') return;
        
        // highlight new lines
        i = caller.dataset.index;
        Kantan.exampleHighlighter.lines.active = [Kantan.exampleHighlighter.lines.JA[i], Kantan.exampleHighlighter.lines.EN[i]];
        
        for (var i = 0, j = Kantan.exampleHighlighter.lines.active.length; i < j; i++) {
          Kantan.exampleHighlighter.lines.active[i].className += ' active-line';
        }
      }
    },
    
    
    // initial setup of vocab lists
    // parseSettings = custom parsing settings for Kantan.parse.vocabList();
    /*
      {
        onlyKana : true, // used to force only kana (no kanji displayed)
        romaji : true, // used to display romaji (overrides kanji)
        maxMeanings : 3, // limits the number of meanings shown for all words to 3
      }
    */
    initVocabList : function (parseSettings) {
      var info = document.getElementById('article-info'),
          lesson = window.location.pathname.replace(/.*?\/lesson-(\d+)\/.*/, '$1'),
          notes;
      
      // vocab list parsing
      Kantan.parse.vocabList(parseSettings ? parseSettings : null);
      
      if (info) {
        // setup vocab list controls
        info.insertAdjacentHTML('afterend', 
          '<div id="list-controls-top" class="center">'+
            '<button id="toggle-vocab-notes" class="button" onclick="Kantan.toggle.vocabNotes(this);"><i class="fa">&#xf24a;</i><span class="en">Notes: ON</span><span class="ja">ノート：ON</span></button>'+
            '<button id="vocab-anki-deck" class="button" onclick="Kantan.convertAnkiDeck(\'vocab\', ' + lesson + ');"><i class="fa">&#xf005;</i><span class="en">Anki Deck</span><span class="ja">Ankiデッキ</span></button>'+
            '<button id="vocab-spreadsheet" class="button" onclick="Kantan.convertSpreadsheet(\'vocab\', ' + lesson + ');"><i class="fa">&#xf0ce;</i><span class="en">Spreadsheet</span><span class="ja">エクセルシート</span></button>'+
            '<button id="print-list" class="button" onclick="Kantan.printList();"><i class="fa">&#xf02f;</i><span class="en">Print</span><span class="ja">プリント</span></button>'+
          '</div>'
        );
        
        // cache buttons for toggling settings
        notes = document.getElementById('toggle-vocab-notes');
        
        // add edit button for editing read-only pages
        info.insertAdjacentHTML('beforeend', '<a id="edit-page" class="button icon-only" onclick="Kantan.editPage(); return false;" title="Edit article" href="' + getPaths() + 'lessons/tools/article-editor/' + Kantan.local + '"><i class="fa">&#xf040;</i></a>');
      }
      
      // hides vocab notes depending on preference
      if (notes && Kantan.pref.vocabNotes == 'false') {
        Kantan.toggle.vocabNotes(notes, true);
      }
      
      // add mark as read button and initiate scroll listener
      Kantan.check.readState(true);
      
      // initialize the quick dictionary
      Kantan.quickJisho.create();
      
      // show page content
      Kantan.stopLoading();
    },
    
    
    // initial setup of kanji lists
    // parseSettings = custom parsing settings for Kantan.parse.kanjiList();
    /*
      {
        no settings yet
      }
    */
    initKanjiList : function (parseSettings) {
      var info = document.getElementById('article-info'),
          lesson = window.location.pathname.replace(/.*?\/lesson-(\d+)\/.*/, '$1'),
          notes;
      
      // vocab list parsing
      Kantan.parse.kanjiList(parseSettings ? parseSettings : null);
      
      if (info) {
        // setup kanji list controls
        info.insertAdjacentHTML('afterend', 
          '<div id="list-controls-top" class="center">'+
            '<button id="vocab-anki-deck" class="button" onclick="Kantan.convertAnkiDeck(\'kanji\', ' + lesson + ');"><i class="fa">&#xf005;</i><span class="en">Anki Deck</span><span class="ja">Ankiデッキ</span></button>'+
            '<button id="vocab-spreadsheet" class="button" onclick="Kantan.convertSpreadsheet(\'kanji\', ' + lesson + ');"><i class="fa">&#xf0ce;</i><span class="en">Spreadsheet</span><span class="ja">エクセルシート</span></button>'+
            '<button id="print-list" class="button" onclick="Kantan.printList(\'kanji\');"><i class="fa">&#xf02f;</i><span class="en">Print</span><span class="ja">プリント</span></button>'+
          '</div>'
        );
        
        // add edit button for editing read-only pages
        info.insertAdjacentHTML('beforeend', '<a id="edit-page" class="button icon-only" onclick="Kantan.editPage(); return false;" title="Edit article" href="' + getPaths() + 'lessons/tools/article-editor/' + Kantan.local + '"><i class="fa">&#xf040;</i></a>');
      }
      
      // add mark as read button and initiate scroll listener
      Kantan.check.readState(true);
      
      // initialize the quick dictionary
      Kantan.quickJisho.create();
      
      // show page content
      Kantan.stopLoading();
    },
    
    
    // converts vocab/kanji list into useable anki deck
    // type = 'vocab' || 'kanji'
    // lesson = number (e.g., 0, 1, 2, 3)
    convertAnkiDeck : function (type, lesson) {
      // show temp loading placeholder while sql.js loads
      KantanModal.open({
        title : '<span class="en">Anki Deck Settings</span><span class="ja">Ankiデッキの設定</span>',
        content : '<div class="loading"></div>',
        zIndex : 'low',
        customSize : {
          top : '10%',
          left : '20%',
          bottom : '10%',
          right : '20%'
        }
      });
      
      // load sql.js and show modal for customizing the anki deck
      getScript('lib/sql.js', function () {
        type = type ? type.toLowerCase() : 'vocab';
        lesson = lesson || 0;

        // create the database for generating our anki deck
        initSqlJs().then(function (sql) {
          window.SQL = sql;

          // deck and file name
          var name = type == 'vocab' ? lesson == 'all' ? "Kantan Vocabulary - All Lessons" : "Kantan Vocabulary - Lesson " + lesson :
                     type == 'kanji' ? lesson == 'all' ? "Kantan Kanji - All Lessons" : "Kantan Kanji - Lesson " + lesson : '';

          // open popup for customizing the anki deck
          KantanModal.open({
            title : '<span class="en">Anki Deck Settings</span><span class="ja">Ankiデッキの設定</span>',
            content : '<p>You can adjust the settings for this Anki deck below. Once everything is to your liking, click the "Download Deck" button to generate and download your Anki deck.</p><br>'+
            '<div class="center">'+
              '<div>'+
                '<b class="inline-title"><span class="en">Deck Name</span><span class="ja">デッキの名前</span></b><br>'+
                name+
              '</div><br>'+

              '<div>'+
                '<b class="inline-title"><span class="en">Deck Order</span><span class="ja">デッキのオーダー</span></b><br>'+
                '<select id="deck-order">'+
                  '<option value="1">Japanese-English</option>'+
                  '<option value="2">English-Japanese</option>'+
                '</select>'+
              '</div><br>'+

              (type == 'vocab' ? '<div>'+
                '<b class="inline-title"><span class="en">Furigana Display</span><span class="ja">振り仮名の表示</span></b><br>'+
                '<select id="deck-furigana">'+
                  '<option value="1">On hover</option>'+
                  '<option value="2">Visible</option>'+
                  '<option value="3">Hidden</option>'+
                '</select>'+
              '</div><br>' :

               type == 'kanji' ? '<div>'+
                '<b class="inline-title"><span class="en">Example Words</span><span class="ja">例語</span></b><br>'+
                '<select id="deck-examples">'+
                  '<option value="1">On</option>'+
                  '<option value="2">Off</option>'+
                '</select>'+
              '</div><br>' : ''
              )+
            '</div>',

            buttonHTML : '<i class="fa">&#xf019;</i><span class="en">Download Deck</span><span class="ja">デッキをダウンロードする</span>',
            buttonColor : 'green',
            zIndex : 'low',
            keepOpen : true,
            customSize : {
              top : '10%',
              left : '20%',
              bottom : '10%',
              right : '20%'
            },

            // generate deck with selected settings
            callback : function () {
              var order = document.getElementById('deck-order').value,
                  furigana = document.getElementById('deck-furigana'),
                  example_words = document.getElementById('deck-examples');

              var m = new Model({
                id : "1767472688529",
                name : name,

                flds : [
                  { name: "Question" },
                  { name: "Answer" }
                ],

                req : [
                  [0, "all", [0]]
                ],

                tmpls : [
                  {
                    'name': 'Card',
                    'qfmt': '<span class="question-side">{{Question}}</span>',
                    'afmt': '<span class="answer-side">{{Answer}}</span>'
                  }
                ],

                css : 
                (type == 'vocab' ?
                  '.word { font-size:42px; }'+
                  '.sentence { font-size:32px; }'+
                  '.meaning, .sentence.meaning { font-size:26px; }'+
                  '.main-color { color:#39C; }'+
                  '.ul-color { border-bottom:2px solid #39C; }'+
                  'hr { border:none; border-bottom:2px solid #999; }'+
                  'ruby rt { color:#DDD; background:#DDD; border:1px solid #CCC; border-radius:10px;' + (furigana == '3' ? ' display:none;' : '') + ' }'+
                  'ruby:hover rt' + (furigana == '2' ? ', ruby rt' : '') + ' { color:#333; background:none; border-color:transparent; }'+
                  '.card { color:#333; background-color:#EEE; font-size:25px; font-family:"メイリオ", "Meiryo", "Osaka", "ＭＳ Ｐゴシック", "MS PGothic", "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", Arial, sans-serif; text-align:center; }'+
                  '.note { font-size:16px; }'+
                  '.note span { font-style:italic; }'+
                  '/* Night Mode CSS */'+
                  '.nightMode hr { border-color:#555; }'+
                  '.nightMode ruby rt { color:#333; background:#333; border-color:#444; }'+
                  '.nightMode ruby:hover rt' + (furigana == '2' ? ', .nightMode ruby rt' : '') + ' { color:#CCC; background:none; border-color:transparent; }'+
                  '.nightMode.card { color:#CCC; background-color:#222; }' :

                 type == 'kanji' ?
                  '.kanji { font-size:' + (order == 1 ? '100' : '50') + 'px; }'+
                  '.header { color:#39C; font-size:18px; font-weight:bold; margin-top:10px; }'+
                  '.reading { font-size:24px; }'+
                  '.meaning { font-size:24px; }'+
                  'hr { border:none; border-bottom:1px solid #999; }'+
                  '.card { color:#333; background-color:#EEE; font-size:25px; font-family:"メイリオ", "Meiryo", "Osaka", "ＭＳ Ｐゴシック", "MS PGothic", "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", Arial, sans-serif; text-align:center; }'+
                  '.examples ul { list-style-type:none; padding:0; margin:0; }'+
                  '.examples ul li { font-size:18px; text-align:center; }'+
                  /* Night Mode CSS */
                  '.nightMode hr { border-color:#555; }'+
                  '.nightMode.card { color:#CCC; background-color:#222; }' : ''
                )
              }),

              d = new Deck(1276438724672, name), word, kanji;

              // loop through vocab data and add words related to the current lesson
              if (Kantan.vocab && type == 'vocab') {
                furigana = furigana.value;

                for (var k in Kantan.vocab) {
                  word = Kantan.vocab[k];
                  if (lesson == 'all' || word.lesson == lesson) {
                    d.addNote(m.note([
                      // question side
                      (order == 1 ?
                        // Japanese-English
                        '<div class="word">' + (word.kanji && !word.often_kana ? '<ruby>' + word.kanji + '<rt>' + k + '</rt></ruby>' : k) + '</div><hr>'+
                        '<div class="sentence">' + word.example_ja + '</div>' :

                        // English-Japanese
                        '<div class="word">' + word.meaning + '</div><hr>'+
                        '<div class="sentence">' + word.example_en + '</div>'
                      ),

                      // answer side
                      (order == 1 ? 
                        // Japanese-English
                        '<div class="word">' + (word.kanji && !word.often_kana ? '<ruby>' + word.kanji + '<rt>' + k + '</rt></ruby>' : k) + '</div>'+
                        '<div class="meaning">' + word.meaning + '</div><hr>'+
                        '<div class="sentence">' + word.example_ja + '</div>'+
                        '<div class="sentence meaning">' + word.example_en + '</div>'+ 
                        (word.note ? '<hr><div class="note">※<span>' + word.note + '</span></div>' : '') :

                        // English-Japanese
                        '<div class="word">' + word.meaning + '</div>'+
                        '<div class="meaning">' + (word.kanji && !word.often_kana ? '<ruby>' + word.kanji + '<rt>' + k + '</rt></ruby>' : k) + '</div><hr>'+
                        '<div class="sentence">' + word.example_en + '</div>'+
                        '<div class="sentence meaning">' + word.example_ja + '</div>'+
                        (word.note ? '<hr><div class="note">※<span>' + word.note + '</span></div>' : '')
                      )
                    ]));
                  }
                }
              }

              // kanji decks
              else if (Kantan.kanji && type == 'kanji') {
                example_words = example_words.value;

                for (var k in Kantan.kanji) {
                  kanji = Kantan.kanji[k];
                  if (lesson == 'all' || kanji.lesson == lesson) {
                    d.addNote(m.note([
                      // question side
                      (order == 1 ?
                        // Japanese-English
                        '<div class="kanji">' + k + '</div>' :

                        // English-Japanese
                        '<div class="kanji">' + kanji.meaning + '</div>'
                      ),

                      // answer side
                      (order == 1 ? 
                        // Japanese-English
                        '<div class="kanji">' + k + '</div>'+
                        '<div class="header">Meaning</div>'+
                        '<div class="meaning">' + kanji.meaning + '</div>'+
                        (kanji.onyomi ? '<div class="header">Onyomi</div>'+
                        '<div class="reading">' + kanji.onyomi + '</div>' : '')+
                        (kanji.kunyomi ? '<div class="header">Kunyomi</div>'+
                        '<div class="reading">' + kanji.kunyomi + '</div>' : '')+
                        (example_words == 1 ? '<div class="header">Example Words</div>'+
                        '<div class="examples">' + Kantan.parse.exampleWords(kanji.example_words) + '</div>' : '') :

                        // English-Japanese
                        '<div class="kanji">' + kanji.meaning + '</div>'+
                        '<div class="header">Kanji</div>'+
                        '<div class="meaning">' + k + '</div>'+
                        (kanji.onyomi ? '<div class="header">Onyomi</div>'+
                        '<div class="reading">' + kanji.onyomi + '</div>' : '')+
                        (kanji.kunyomi ? '<div class="header">Kunyomi</div>'+
                        '<div class="reading">' + kanji.kunyomi + '</div>' : '')+
                        (example_words == 1 ? '<div class="header">Example Words</div>'+
                        '<div class="examples">' + Kantan.parse.exampleWords(kanji.example_words) + '</div>' : '')
                      )
                    ]));
                  }
                }
              }

              // package and save deck
              var p = new Package()
              p.addDeck(d)
              p.writeToFile(name + '.apkg');
            }
          });
        });
      }, function () {
        return window.initSqlJs ? true : false;
      });
    },
    
    
    // converts vocab/kanji list into excel spreadsheet
    // type = 'vocab' || 'kanji'
    // lesson = number (e.g., 0, 1, 2, 3)
    convertSpreadsheet : function (type, lesson) {
      type = type ? type.toLowerCase() : 'vocab';
      lesson = lesson || 0;
      
      // name for the file
      var name = type == 'vocab' ? lesson == 'all' ? "Kantan Vocabulary - All Lessons" : "Kantan Vocabulary - Lesson " + lesson :
                 type == 'kanji' ? lesson == 'all' ? "Kantan Kanji - All Lessons" : "Kantan Kanji - Lesson " + lesson : '';
      
      // open popup for customizing the spreadsheet
      KantanModal.open({
        title : '<span class="en">Spreadsheet Settings</span><span class="ja">エクセルシートの設定</span>',
        content : '<p>You can adjust the settings for this spreadsheet below. Once everything is to your liking, click the "Download Spreadsheet" button to generate and download your spreadsheet.</p><br>'+
        '<div class="center">'+
          '<div>'+
            '<b class="inline-title"><span class="en">Spreadsheet Name</span><span class="ja">シートの名前</span></b><br>'+
            name+
          '</div><br>'+

          '<div>'+
            (type == 'vocab' ?
              '<b class="inline-title"><span class="en">Furigana Display</span><span class="ja">振り仮名の表示</span></b><br>'+
              '<select id="sheet-furigana">'+
                '<option value="1">Visible</option>'+
                '<option value="2">Hidden</option>'+
                '<option value="3">Hiragana only</option>'+
              '</select>' : ''
            )+
        
            (type == 'kanji' ?
              '<b class="inline-title"><span class="en">Example Words</span><span class="ja">例語</span></b><br>'+
              '<select id="sheet-examples">'+
                '<option value="1">On</option>'+
                '<option value="2">Off</option>'+
              '</select>' : ''
            )+
          '</div><br>'+
        '</div>',

        buttonHTML : '<i class="fa">&#xf019;</i><span class="en">Download Spreadsheet</span><span class="ja">シートをダウンロードする</span>',
        buttonColor : 'green',
        zIndex : 'low',
        keepOpen : true,
        customSize : {
          top : '10%',
          left : '20%',
          bottom : '10%',
          right : '20%'
        },

        // generate spreadsheet with selected settings
        callback : function () {
          var spreadsheet = ExcelBuilder.createWorkbook(),
              sheet = spreadsheet.createWorksheet({ name: type == 'vocab' ? 'Vocabulary' : 'Kanji' }),
              stylesheet = spreadsheet.getStyleSheet(),
              
              // sheet styles
              head = stylesheet.createFormat({
                alignment : {
                  horizontal : 'center',
                  vertical : 'center',
                  wrapText: true
                },

                font : {
                  fontName : 'Arial',
                  bold : true,
                  size : 14
                }
              }),

              sectionStyle = stylesheet.createFormat({
                alignment : {
                  horizontal : 'center',
                  vertical : 'center',
                  wrapText: true
                },

                font : {
                  fontName : 'Arial',
                  bold : true,
                  size : 13,
                  color : 'FFFFFFFF'
                },

                fill: {
                  type: 'pattern',
                  patternType: 'solid',
                  fgColor: 'FF3399CC'
                }
              }),

              content = stylesheet.createFormat({
                alignment : {
                  horizontal : 'center',
                  vertical : 'center',
                  wrapText: true
                },

                font : {
                  fontName : 'Arial',
                  size : 12
                }
              }),

              contentLeft = stylesheet.createFormat({
                alignment : {
                  vertical : 'center',
                  wrapText: true
                },

                font : {
                  fontName : 'Arial',
                  size : 12
                }
              }),

              contentJP = stylesheet.createFormat({
                alignment : {
                  horizontal : 'center',
                  vertical : 'center',
                  wrapText: true
                },

                font : {
                  fontName : 'Meiryo',
                  size : 12
                }
              }),

              contentLeftJP = stylesheet.createFormat({
                alignment : {
                  vertical : 'center',
                  wrapText: true
                },

                font : {
                  fontName : 'Meiryo',
                  size : 12
                }
              }),

              bigKanji = stylesheet.createFormat({
                alignment : {
                  horizontal : 'center',
                  vertical : 'center',
                  wrapText: true
                },

                font : {
                  fontName : 'Meiryo',
                  size : 36
                }
              }),

              exampleStyle = stylesheet.createFormat({
                alignment : {
                  horizontal : 'left',
                  vertical : 'center',
                  wrapText: true
                },

                font : {
                  fontName : 'Meiryo',
                  size : 12
                }
              }),

              furigana = document.getElementById('sheet-furigana'),
              example_words = document.getElementById('sheet-examples'),
              
              data = [
                // vocab sheet head
                type == 'vocab' ? [
                  { value: 'Word', metadata: { style: head.id } },
                  { value: 'Meaning', metadata: { style: head.id } },
                  { value: 'Example', metadata: { style: head.id } },
                  { value: 'Type', metadata: { style: head.id } }
                ] :
                 
                // kanji sheet head
                type == 'kanji' ? [
                  { value: 'Kanji', metadata: { style: head.id } },
                  { value: 'Meaning', metadata: { style: head.id } },
                  { value: 'Reading', metadata: { style: head.id } },
                  { value: 'Stroke Count', metadata: { style: head.id } }
                ] : [],
              ];
          
          // add example words column
          if (type == 'kanji' && example_words && example_words.value == '1') {
            data[0].push({ value: 'Example Words', metadata: { style: head.id } });
          }
          
          // add Lesson column to head if the sheet is for ALL lessons
          if (lesson == 'all') {
            data[0].push({ value: 'Lesson', metadata: { style: head.id } });
          }

          // vocab parsing
          if (Kantan.vocab && type == 'vocab') {
            furigana = furigana.value;
            
            var section = document.querySelectorAll('#vocab-list .section-title'), i = 0, j = section.length,
                table = document.querySelectorAll('#vocab-list table');
            
            // parse tables on vocab list pages
            if (j) {
              for (; i < j; i++) {
                // section title row
                if (section) {
                  data.push([
                    { value: '', metadata: { style: sectionStyle.id } },
                    { value: section[i].innerText, metadata: { style: sectionStyle.id } },
                    { value: '', metadata: { style: sectionStyle.id } },
                    { value: '', metadata: { style: sectionStyle.id } }
                  ])
                }

                // table data
                for (var a = table[i].querySelectorAll('[data-word]'), k = 0, l = a.length, word, key; k < l; k++) {
                  key = a[k].dataset.word;
                  word = Kantan.vocab[key];

                  if (word) {
                   data.push([
                      { value: word.kanji && !word.often_kana && furigana != '3' ? word.kanji + (furigana == '2' ? '' : '\n' + key) : key, metadata: { style: contentJP.id } },
                      { value: word.meaning, metadata: { style: content.id } },
                      { value: (word.example_ja.replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, { '1' : '$1[$2]', '2' : '$1', '3' : '$2' }[furigana]) + '\n' + word.example_en).replace(/<br>/g, '\n').replace(/<.*?>/g, ''), metadata: { style: exampleStyle.id } },
                      { value: Kantan.parse.vocabTags(key, { plain : true, excludeTextbooks : true }), metadata: { style: content.id } }
                    ]);
                  }
                }
              }
            }

            // standard parsing using vocab.js and the lesson number
            else {
              var word, dataset;
              for (var k in Kantan.vocab) {
                word = Kantan.vocab[k];
                if (word && (lesson == 'all' || word.lesson == lesson)) {
                  dataset = [
                    { value: word.kanji && !word.often_kana && furigana != '3' ? word.kanji + (furigana == '2' ? '' : '\n' + k) : k, metadata: { style: contentJP.id } },
                    { value: word.meaning, metadata: { style: content.id } },
                    { value: (word.example_ja ? word.example_ja.replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, { '1' : '$1[$2]', '2' : '$1', '3' : '$2' }[furigana]) + '\n' + word.example_en : '').replace(/<br>/g, '\n').replace(/<.*?>/g, ''), metadata: { style: exampleStyle.id } },
                    { value: Kantan.parse.vocabTags(k, { plain : true, excludeTextbooks : true }), metadata: { style: content.id } }
                  ];
                  
                  // add lesson number if the sheet is for all lessons
                  if (lesson == 'all') {
                    dataset.push({ value: typeof word.lesson == 'undefined' ? '' : word.lesson, metadata: { style: content.id } });
                  }
                  
                  data.push(dataset);
                }
              }
            }
          }
          
          // kanji parsing
          else if (Kantan.kanji && type == 'kanji') {
            example_words = example_words.value;
            
            var kanji, dataset;
            for (var k in Kantan.kanji) {
              kanji = Kantan.kanji[k];
              if (kanji && (lesson == 'all' || kanji.lesson == lesson)) {
                dataset = [
                  { value: k, metadata: { style: bigKanji.id } },
                  { value: kanji.meaning, metadata: { style: content.id } },
                  { value: (kanji.onyomi ? 'Onyomi: ' + kanji.onyomi : '') + (kanji.onyomi && kanji.kunyomi ? '\n' : '')+
                           (kanji.kunyomi ? 'Kunyomi: ' + kanji.kunyomi : ''),
                    metadata: { style: contentLeftJP.id }
                  },
                  { value: kanji.strokes, metadata: { style: content.id } }
                ];
                
                if (example_words == '1') {
                  dataset.push({ value: Kantan.parse.exampleWords(kanji.example_words, 'plain'), metadata: { style: contentLeftJP.id } });
                }
                
                // add lesson number if the sheet is for all lessons
                if (lesson == 'all') {
                  dataset.push({ value: typeof kanji.lesson == 'undefined' ? '' : kanji.lesson, metadata: { style: content.id } });
                }

                data.push(dataset);
              }
            }
          }
          
          // update sheet data
          sheet.setRowInstructions(0, { height: 30 }); // set head size
          sheet.setData(data); // insert data into sheet
          
          // freeze head row so it sticks to the top when scrolling
          sheet.sheetView.pane.state = 'frozen';
          sheet.sheetView.pane.freezePane(0, 1, 'A0');
          
          // set width for columns
          var columns = type == 'vocab' ? [{width:50}, {width:50}, {width:60}, {width:30}] :
                        type == 'kanji' ? [{width:20}, {width:30}, {width:30}, {width:20}] : [];
          
          if (example_words == '1') columns.push({width:40});
          if (lesson == 'all') columns.push({width:15});
          
          sheet.setColumns(columns);
          
          // add sheet to the spreadsheet and download the file
          spreadsheet.addWorksheet(sheet);
          ExcelBuilder.downloadExcelFile(spreadsheet, name + '.xlsx');
        }
      });
    },
    
    
    // prints the kanji or vocab list
    // pass 'vocab' or 'kanji' to type, defaults to vocab
    printList : function (type) {
      type = type || 'vocab';
      
      // add class for print specific styles
      document.body.className += ' printing ' + type + '-list';
      
      // open print window
      window.print();
      
      // hide printing styles
      document.body.className = document.body.className.replace('printing ' + type + '-list', '');
    },
    
    
    // checks for new version on GitHub
    // callback returns two params: status and version
    // status = new|up-to-date|error
    // version = latest version number from GitHub
    checkForUpdate : function (callback) {
      Get('https://raw.githubusercontent.com/SethClydesdale/kantan-japanese/refs/heads/main/javascript/data/version-data.json', function (data) {
        // stop execution if an error occurred while fetching the version data
        if (data == 'error') {
          if (callback) callback('error', data);
          return false;
        }
        
        // parse response data and version numbers for comparison
        data = JSON.parse(data);
        var v1 = KantanVersion,
            v2 = data.version,
            parts1 = v1.split('.'),
            parts2 = v2.split('.'),
            maxLength = Math.max(parts1.length, parts2.length);

        // check each version number
        for (var i = 0, num1, num2; i < maxLength; i++) {
          num1 = parseInt(parts1[i], 10) || 0;
          num2 = parseInt(parts2[i], 10) || 0;

          // up-to-date; break out and do nothing
          if (num1 > num2) {
            if (callback) callback('up-to-date', data);
            break;
          }

          // new version found
          if (num2 > num1) {
            if (callback) callback('new', data);
          }
        }
      });
    },
    
    
    // view the current version of Kantan Japanese in a popup window
    viewVersion : function () {
      KantanModal.open({
        title : 'Kantan Japanese Version Info',
        content :
          '<div class="center">'+
            '<p>Below is the current version and release notes for this build of Kantan Japanese.</p>'+
            '<strong>Current Version:</strong> ' + KantanVersion + '<br>'+
            '<a class="button purple" href="https://github.com/SethClydesdale/kantan-japanese/releases/tag/v.' + KantanVersion + '" target="_blank" style="margin-top:10px;"><i class="fa">&#xf09b;</i>View Release Notes</a>'+
            '<br><hr>'+
      
            '<p>You can use the button below to check for a new release on GitHub.</p>'+
            '<button id="check-for-update" class="button green"><i class="fa">&#xf021;</i>Check for Update</button>'+
            '<div id="update-results"></div>'+
          '</div>'
      });
      
      // checks for update on github with the button is clicked
      document.getElementById('check-for-update').onclick = function () {
        var results = document.getElementById('update-results');
        
        // hide button and info texts
        this.previousSibling.style.display = 'none';
        this.style.display = 'none';
        
        // show placeholder while we fetch version data
        results.innerHTML = '<strong>Checking...</strong>';
        
        // fetch and compare version data
        Kantan.checkForUpdate(function (status, data) {
          if (status == 'new') {
            results.innerHTML = 
              '<p>A new version of Kantan Japanese has been found on GitHub! Click the button below to download the latest version.</p>'+
              '<a class="button green" href="https://github.com/SethClydesdale/kantan-japanese/archive/refs/tags/v.' + data.version + '.zip"><i class="fa">&#xf019;</i>Download Version ' + data.version + '</a><br>'+
              '<a class="button purple" href="https://github.com/SethClydesdale/kantan-japanese/releases/tag/v.' + data.version + '" target="_blank"><i class="fa">&#xf09b;</i>View Release Notes</a><br>'+
              '<p>'+
                (data.notes ? data.notes : // show special update instructions from the version-data file, if any
                  'Once downloaded, simply unzip the contents and copy them to your current installation folder to update your local copy of Kantan Japanese.'
                )+
              '</p>';
            
          } else if (status == 'up-to-date') {
            results.innerHTML = '<p><strong>Kantan Japanese is up-to-date!</strong></p>';
            
          } else if (status == 'error') {
            results.innerHTML = '<p><strong class="t-red">ERROR:</strong> Could not fetch version data.</p>'
          }
        });
      }
    }
  };
  
  
  // prevent progress loss on page change
  window.onbeforeunload = function () {
    var lossDetected = false,
        type = document.getElementById('exercise');
    
    if (type) {
      type = type.className;

      // determine exercise type and find if the user may incur progress loss for the current exercise
      if (/quiz-over/.test(type) || document.querySelector('.review-mode')) { // ignore this check completely if the quiz is over or student is in review mode
        lossDetected = false;
      } 

      // check if any of the inputs have been filled in for a written quiz
      else if (/fill-quiz|writing-quiz/.test(type)) {
        for (var a = document.querySelectorAll('.writing-zone-input'), i = 0, j = a.length; i < j; i++) {
          if (a[i].value != '') { // mark as a "loss" if an input is filled in and break out of the loop
            lossDetected = true;
            break;
          }
        }
      }

      // check if any of the canvases have been drawn on
      else if (/drawing-quiz|stroke-quiz/.test(type)) {
        for (var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length; i < j; i++) {
          if (KanjiCanvas['recordedPattern_' + a[i].id] && KanjiCanvas['recordedPattern_' + a[i].id].length) { // mark as a "loss" if a canvas has been drawn on and break out of the loop
            lossDetected = true;
            break;
          }
        }
      }

      // check if progress has been made in the following quizzes
      else if (/multi-quiz|drag-quiz|kana-quiz/.test(type) && Kantan.stats.solved > 0) {
        lossDetected = true;
      }

      // return warning about progress loss
      if (lossDetected) {
        return KN_Lang == 'ja' ? '進み具合は失われます。よろしいですか？' : 'Your progress will be lost. Do you want to continue?';
      }
    }
  };
  
  
  // initial setup
  Kantan.init();
  
  // App specific functions
  Kantan.initApp();
}(window, document));
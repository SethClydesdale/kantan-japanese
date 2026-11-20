// # MODIFICATIONS FOR ALL PAGES (<HEAD>) #
(function (window, document) {
  'use strict';
  
  // Version of Kantan Japanese
  // used to compare with the version-data.json file in the repo (offline/local build only)
  // if the repo version is greater, the user will be prompted to update
  window.KantanVersion = '0.0.0';
  
  // Platform that's being used (change this when generating other versions; remember to minify!)
  // web = web/local raw version
  // android = android app
  // ios = ios app
  // desktop = desktop app
  window.KantanPlatform = /android/i.test(navigator.userAgent) ? 'android' : 'web';
  
  // detects if using the mobile version
  window.KantanMobile = /android/i.test(navigator.userAgent) && window.cordova ? true : false;
  
  
  // apply class to body for OS based fixes
  if (document.documentElement) {
    document.documentElement.className += /Linux/.test(window.navigator.platform) ? ' os-linux' : '';
  }
  
  // Global used for telling if the site is being used offline with MS Edge (pre-chromium).
  // Helps prevent "unspecified errors" caused by checking for the existence of localStorage support offline.
  window.offlineEdge = window.location.protocol == 'file:' && /Edge/.test(navigator.userAgent);
  
  // Global used for checking localStorage support (ex: storageOK && localStorage.myStorageItem)
  // prevents long winded conditions everytime we want to use storage
  window.storageOK = navigator.cookieEnabled && !offlineEdge && window.localStorage ? true : false;
  
  // user language preference (either en or ja)
  window.KN_Lang = storageOK && localStorage.KN_Lang ? localStorage.KN_Lang : 'en';
  
  // user's random exercise list
  window.KN_RandomList = storageOK && localStorage.KN_RandomList ? JSON.parse(localStorage.KN_RandomList) : [];
  
  // # KANTAN MODAL #
  // creates a modal or closes one
  window.KantanModal = {
    isOpen : false,
    
    // opens a new modal
    // params: object (optional)
    // {
    //           title : string, (popup title)
    //         content : string, (popup content)
    //      buttonHTML : string, (custom HTML for the OK button)
    //      buttonText : string, (custom text for the OK button)
    //      buttonColor: string, (changes button color; green|yellow|red|pink)
    // closeButtonText : string, (custom text for the close button)
    // closeButtonHTML : string, (custom HTML for the close button)
    // closeButtonColor: string, (changes button color; green|yellow|red|pink)
    //         noFocus : bool, (keeps buttons from being focused)
    //           focus : string, (pass a css selector to focus a specific element; overrides noFocus)
    //      fullscreen : bool, modal takes up the entire screen
    //      customSize : object, manually set the top, left, right, and bottom css properties
    //    customButton : string, add custom HTML to the button area
    //        keepOpen : bool, (keeps the modal open when clicking the callback button; useful for opening another modal afterwards)
    //   preserveState : bool, (preserves the current window and reopens it if another modal was opened)
    //        scrollTo : string, (pass a css selector to scroll that element into focus in the popup)
    //         noClose : bool, (removes the close button)
    //          zIndex : 'low', lowers the z-index so the exercise menu can be used
    //        callback : function (function to execute when the OK button is clicked)
    //   closeCallback : function (function to execute when the close button is clicked)
    // } // all values are optional
    open : function (o) {
      o = o ? o : {};

      if (KantanModal.isOpen) {
        KantanModal.close(true);
      }
      
      KantanModal.isOpen = true;
      
      // create the modal and set its params
      var modal = document.createElement('DIV'), button, buttons;
      modal.id = 'kantan-modal';
      modal.innerHTML = 
      '<div id="kantan-modal-overlay"' + ( o.zIndex == 'low' ? ' style="z-index:1;"' : '' ) + '></div>'+
      '<div id="kantan-modal-body"' + (o.fullscreen ? ' class="fullscreen"' : '') + ' style="' + ( o.zIndex == 'low' ? 'z-index:2;' : '' ) + ( o.customSize ? 'top:' + (o.customSize.top || 'auto') + ';right:' + (o.customSize.right || 'auto') + ';bottom:' + (o.customSize.bottom || 'auto') + ';left:' + (o.customSize.left || 'auto') + ';width:' + (o.customSize.width || 'auto') + ';max-width:' + (o.customSize.maxWidth || 'none') + ';' : '' ) + '">'+
        '<h2 id="kantan-modal-header">' + ( o.title ? o.title : 'Popup' ) + '</h2>'+
        '<div id="kantan-modal-content"' + (o.overflowX ? 'style="overflow-x:' + o.overflowX + ';"' : '') + '>' + ( o.content ? o.content : '' ) + '</div>'+
        '<div id="kantan-modal-buttons" class="center">'+
          (o.noClose ? '' : '<button id="kantan-modal-close" class="button' + (o.closeButtonColor ? ' ' + o.closeButtonColor : '') + '" onclick="KantanModal.close();">' + (o.closeButtonText ? o.closeButtonText : o.closeButtonHTML ? o.closeButtonHTML : '<span class="en">Close</span><span class="ja">戻る</span>') + '</button>')+
          (o.customButton ? o.customButton : '') +
        '</div>'+
      '</div>'+
      (o.preserveState ? '<span id="saved-modal-state"></span>' : '');

      // create a button for the callback function
      if (o.callback) {
        button = document.createElement('BUTTON');
        buttons = modal.querySelector('#kantan-modal-buttons');

        // set button params
        if (o.buttonText) {
          button.innerText = o.buttonText ? o.buttonText : 'OK';
        } else {
          button.innerHTML = o.buttonHTML ? o.buttonHTML : '<span class="en">OK</span><span class="ja">はい</span>';
        }
        button.id = 'kantan-modal-ok';
        button.className = 'button' + (o.buttonColor ? ' ' + o.buttonColor : '');
        button.onclick = function () {
          o.callback();
          !o.keepOpen && KantanModal.close();
        };

        // insert button into buttons list
        buttons.insertBefore(button, buttons.firstChild);
      }

      // add the modal to the document
      document.body.style.overflow = 'hidden';
      document.body.appendChild(modal);

      // focus confirm/ok button
      if (o.focus) {
        document.querySelector(o.focus).focus();
        
      } else if (!o.noFocus) {
        document.getElementById('kantan-modal-' + (o.callback ? 'ok' : 'close')).focus();
      }
      
      // apply close button callback
      if (o.closeCallback) {
        document.getElementById('kantan-modal-close').onclick = function () {
          o.closeCallback();
          !o.keepOpen && KantanModal.close();
        };
      }
      
      // scroll to the specified element if provided
      if (o.scrollTo) {
        var content = document.getElementById('kantan-modal-content'),
            element = document.querySelector(o.scrollTo);
        
        if (element) {
          content.scrollTop = element.offsetTop - 20;
        }
      }

      // pause the timer when opening the modal
      if (window.Kantan && Kantan.timer && Kantan.timer.isRunning()) {
        Kantan.pauseTimerWhenOpenPopup();
      }
      
      // preserve modal if preferred
      if (o.preserveState) {
        KantanModal.state = {
          content : modal.innerHTML,
          scroll : 0
        };
      }
      
      return o;
    },

    // close the modal
    close : function (autoClose) {
      var modal = document.getElementById('kantan-modal'),
          state = document.getElementById('saved-modal-state'),
          content = document.getElementById('kantan-modal-content');
      
      // delete modal state or save scroll state
      if (KantanModal.state && state) {
        if (!autoClose) {
          delete KantanModal.state;
          
        } else if (content) {
          KantanModal.state.scroll = content.scrollTop;
        }
      }
      
      // close current modal
      if (modal) {
        document.body.style.overflow = '';
        document.body.removeChild(modal);
        KantanModal.isOpen = false;
      }

      // resume the timer when closing the modal
      if (window.Kantan && Kantan.timer && Kantan.timer.isPaused()) {
        Kantan.startTimerWhenClosePopup();
      }
      
      // repoen a preserved modal
      if (KantanModal.state && !autoClose) {
        KantanModal.open();
        document.getElementById('kantan-modal').innerHTML = KantanModal.state.content;
        if (KantanModal.state.scroll) document.getElementById('kantan-modal-content').scrollTop = KantanModal.state.scroll;
      }
    }
  };
  
  
  // # CUSTOM INPUTS #
  window.CreateCustomInputs = function () {
    for (var input = document.querySelectorAll('input[type="checkbox"], input[type="radio"]'), i = 0, j = input.length, type; i < j; i++) {
      if (!/light-switch-checkbox|kantan_input_hidden/g.test(input[i].outerHTML)) { // exclusions
        input[i].className += ' kantan_input_hidden';
        input[i].insertAdjacentHTML('afterend', '<span tabindex="0" class="kantan_pseudo_' + input[i].type + '" onclick="if (this.parentNode.tagName != \'LABEL\') this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"/>');
      }
    }
  };
  
  
  // # JUMP ARROWS #
  // Add arrows to each target that return the student to the specified element
  window.AddJumpArrowsTo = function (targets, tag, title) {
    for (var a = document.querySelectorAll(targets), i = 0, j = a.length; i < j; i++) {
      a[i].insertAdjacentHTML('beforeEnd', '<a href="#' + (tag ? tag : '') + '" class="jump-arrow fa" title="' + (title ? title : '') + '">&#xf062;</a>');
    }
  };
  
  
  // # getPaths (helper function) #
  // finds out how deep a file is and returns a path that leads to the root
  // example: getPaths() + 'resources/css/stylesheet-dark.css'
  window.getPaths = function () {
    var path = window.location.pathname;
    
    if (/\/lessons\/.*?\//.test(path)) {
      return '../../../'
      
    } else if (/\/help\/.*?\/|\/contribute\/.*?\//.test(path)) {
      return '../../'    
      
    } else if (/\/lessons\/|\/contact\/|\/contribute\/|\/download\/|\/donate\/|\/privacy\/|\/learning-resources\/|\/reviews\/|\/about\/|\/help\/(?:index|$)/.test(path)) {
      return '../';  
               
    } else {
      return '';
    }
  };
  
  
  // # REVIEW DATA GETTER #
  // calculates how many days until a review is due for an exercise and returns a formatted date as well
  // pass along the MS for a date (e.g., +new Date())
  // mainly used for the review dates stored in localStorage.KantanResults
  window.getReviewData = function(reviewDate) {
    if (typeof reviewDate == 'undefined') return {};
    else reviewDate = +reviewDate;
    
    // convert passed MS to a date object
    reviewDate = new Date(reviewDate);

    // set current date @ the start of the day (0:00)
    var today = new Date(), days;
    today.setHours(0, 0, 0, 0);

    // calculate days until review
    days = Math.round((reviewDate.getTime() - today.getTime()) / (1000*60*60*24));

    return {
      date : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'][reviewDate.getMonth()] + ' ' + reviewDate.getDate() + ', ' + reviewDate.getFullYear(),
      days : days
    };
  };
    
  
  // # EXERCISE DATA PACKER #
  // parses exercise score data into a workable format
  // exercise score data is stored in the following format: 'score|time|completed|streak|review'
  //     score = exercise score; 0-100%
  //      time = completion time record
  // completed = number of times completed
  //    streak = passing review streak
  //    review = review date for the exercise
  window.unpackExerciseData = function (data) {
    var o = {};

    if (data) {
      // convert data into string and split into chunks
      data = data.toString().split('|');

      // set and name data using the chunks
      if (data[0]) o.score = /^R\d+/.test(data[0]) ? data[0] : /\d/.test(data[0]) ? +data[0] : data[0];
      if (data[1]) o.time = +data[1];
      if (data[2]) o.completed = +data[2] || 0;
      if (data[3]) o.streak = +data[3] || 0;
      if (data[4]) o.review = data[4] == 'R' ? 'R' : data[4] == 'M' ? 'M' : parseInt(data[4], 36);
    }

    return o;
  };
  
  // # EXERCISE DATA UNPACKER #
  // returns parsed score data back into its original storage format
  // mainly used for saving updated score data to local storage
  window.packExerciseData = function (data) {
    return data.score + '|'+
           data.time + '|'+
           data.completed+
           (typeof data.streak != 'undefined' ? '|' + data.streak + '|' : '')+
           (typeof data.review != 'undefined' ? data.review.toString(36) : '');
  };
  
  
  /* # SETTINGS MANAGER # */
  // functions for managing global site settings
  window.KantanSettings = {
    // list of settings
    // used when resetting or exporting settings data, so make sure to add any new settings' ID here
    list : [
      'KN_FontSize',
      'KN_PageWidth',
      'KN_Lang',
      'KN_Theme',
      'KN_DarkMode',
      'KN_AutoRead',
      'KN_Adverts',
      'KN_Analytics',
      'KN_CustomCSS',
      'KN_Furigana',
      'KN_SpoilerMode',
      'KN_VocabTags',
      'KN_VocabNotes',
      'KN_ExampleSentences',
      'KN_VocabHorizontal',
      'KN_FeedbackMode',
      'KN_RandomExercise',
      'KN_SRS',
      'KN_SkipTypeSelect',
      'KN_JishoLookUp',
      'KN_AnswerChecker',
      'KN_FastChat',
      'KN_ChatData_NAME',
      'KN_RomajiInput',
      'KN_EasyMode',
      'KN_StrokeNumbers',
      'KN_StrokeOrder',
      'KN_TracingGuide',
      'KN_AutoPauseTimer',
      'KN_BackupReminder',
      'KN_RandomSpoiler'
    ],
    
    // opens window to manage settings
    // scroll: css selector of element to scroll to in the settings manager
    manager : function (scroll) {
      // various settings and their selected||default values
      var KN_FontSize = +localStorage.KN_FontSize || 100,
          KN_PageWidth = +localStorage.KN_PageWidth || 100,
          KN_Lang = localStorage.KN_Lang || 'en',
          KN_Theme = localStorage.KN_Theme || 'blue',
          KN_DarkMode = localStorage.KN_DarkMode || 'off',
          KN_AutoRead = localStorage.KN_AutoRead || 'true',
          KN_Adverts = localStorage.KN_Adverts || 'on',
          KN_Analytics = localStorage.KN_Analytics || 'on',
          KN_CustomCSS = localStorage.KN_CustomCSS || '',
          KN_Furigana = localStorage.KN_Furigana || 'true',
          KN_SpoilerMode = localStorage.KN_SpoilerMode || 'false',
          KN_VocabTags = localStorage.KN_VocabTags || 'true',
          KN_VocabNotes = localStorage.KN_VocabNotes || 'true',
          KN_ExampleSentences = localStorage.KN_ExampleSentences || 'true',
          KN_VocabHorizontal = localStorage.KN_VocabHorizontal || 'true', // deprecated as setting (Vocab is forced horizontal by default now)
          KN_FeedbackMode = localStorage.KN_FeedbackMode || 'instant',
          KN_RandomExercise = localStorage.KN_RandomExercise || 'all',
          KN_SRS = localStorage.KN_SRS || 'true',
          KN_SkipTypeSelect = localStorage.KN_SkipTypeSelect || 'false',
          KN_JishoLookUp = localStorage.KN_JishoLookUp || 'true',
          KN_AnswerChecker = localStorage.KN_AnswerChecker || 'true',
          KN_FastChat = localStorage.KN_FastChat || 'false',
          KN_ChatName = localStorage.KN_ChatData_NAME || '',
          KN_RomajiInput = localStorage.KN_RomajiInput || 'false',
          KN_EasyMode = localStorage.KN_EasyMode || 'false',
          KN_StrokeNumbers = localStorage.KN_StrokeNumbers || 'false',
          KN_StrokeOrder = localStorage.KN_StrokeOrder || 'true',
          KN_TracingGuide = localStorage.KN_TracingGuide || 'true',
          KN_AutoPauseTimer = localStorage.KN_AutoPauseTimer || 'true',
          KN_BackupReminder = localStorage.KN_BackupReminder || 'true',
          KN_RandomSpoiler = localStorage.KN_RandomSpoiler || 'true';
      
      // create stylesheet for settings
      if (!KantanSettings.stylesheet) {
        KantanSettings.createStylesheet();
      }
      
      // open settings popup
      KantanModal.open({
        title : '<span class="en">Settings Manager</span><span class="ja">ウェブサイトの設定</span>',
        content : '<p><span class="en">You can manage your settings for Kantan Japanese in this window.<br>※ Please note that all data is saved locally to the browser, so clearing your browser\'s cache will reset your settings.</span><span class="ja">ここでKantan Japaneseの設定が変更できます。<br>※ウェブサイトの設定はブラウザーで保存していますのでキャッシュをクリアすると失います。注意してください。</span></p>'+
        
        '<div class="section-title" style="margin-top:30px;"><span class="en">Display</span><span class="ja">表示</span></div>'+
        '<div class="kantan-settings-list">'+
          '<div class="setting-sub-title"><span class="en">General Settings</span><span class="ja">一般の設定</span></div>'+
          /* // temporarily disabled
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Font Size:</span><span class="ja">フォントサイズ：</span>'+
            '</span>'+
            '<input id="font-size-range" type="range" min="100" max="200" value="' + KN_FontSize + '" oninput="KantanSettings.updateFontSize(this);" onchange="KantanSettings.updateFontSize(this, true);"><span id="font-size-value">' + KN_FontSize + '%</span>'+
            '<div class="desc"><span class="en">Increases the font size for the site.</span><span class="ja">ウェブサイトのフォントサイズが増えられます。</span></div>'+
          '</div>'+*/
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Page Width:</span><span class="ja">ページ幅：</span>'+
            '</span>'+
            '<input id="page-width-range" type="range" min="100" max="500" value="' + KN_PageWidth + '" oninput="KantanSettings.updatePageWidth(this);" onchange="KantanSettings.updatePageWidth(this, true);"><span id="page-width-value">' + KN_PageWidth + '%</span>'+
            '<div class="desc"><span class="en">Increases the maximum page width for the site (up to the size of your screen).</span><span class="ja">スクリーンサイズまで最高のページ幅が増えられます。</span></div>'+
          '</div>'+
          
          '<div class="setting-sub-title"><span class="en">Language Settings</span><span class="ja">言語の設定</span></div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Furigana:</span><span class="ja">振り仮名：</span>'+
            '</span>'+
            '<button id="settings-furigana" class="button' + (KN_Furigana == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateFurigana(this);">' + (KN_Furigana == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Enable or disable reading aids for kanji.</span><span class="ja">漢字の振り仮名がトグルできます。</span></div>'+
          '</div>'+
        
          '<div id="settings-lang-box" class="setting">'+
            '<span class="label">'+
              '<span class="en">Language:</span><span class="ja">言語：</span>'+
            '</span>'+
            '<select id="settings-lang" onchange="KantanSettings.updateLang(this);">'+
              '<option value="en"' + ( KN_Lang == 'en' ? ' selected' : '' ) + '>English</option>'+
              '<option value="ja"' + ( KN_Lang == 'ja' ? ' selected' : '' ) + '>日本語</option>'+
            '</select>'+
            '<div class="desc"><span class="en">Changes the language of buttons, popups, etc. on the website. Try changing the language to 日本語 for some extra immersion!</span><span class="ja">ボタン、ポップアップなどの言語が変更できます。</span></div>'+
          '</div>'+
        
          
          '<div class="setting-sub-title"><span class="en">Theme Settings</span><span class="ja">テーマの設定</span></div>'+
          /* 
          // Remnant from Genki/Quartet
          // We MAY consider adding additional theme colors in the future
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Theme:</span><span class="ja">テーマ：</span>'+
            '</span>'+
            '<select id="settings-theme" onchange="KantanSettings.updateTheme(this);">'+
              '<option value="blue"' + ( KN_Theme == 'blue' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? '青い色' : 'Blue') + '</option>'+
              '<option value="green"' + ( KN_Theme == 'green' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? '緑色' : 'Green') + '</option>'+
              '<option value="cerise"' + ( KN_Theme == 'cerise' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? 'チェリーピンク' : 'Cerise') + '</option>'+
              '<option value="orange"' + ( KN_Theme == 'orange' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? 'オレンジ' : 'Orange') + '</option>'+
            '</select>'+
            '<div class="desc"><span class="en">Changes the main color of the website.</span><span class="ja">ウェブサイトのテームが変更できます。</span></div>'+
          '</div>'+
          */
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Dark Mode:</span><span class="ja">ダークモード：</span>'+
            '</span>'+
            '<button id="settings-dark-mode" class="button' + (KN_DarkMode == 'on' ? '' : ' opt-off') + '" onclick="KantanSettings.updateDarkMode(this);">' + (KN_DarkMode == 'on' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Enable or disable Dark Mode.</span><span class="ja">ダークモードのテーマがトグルできます。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Custom CSS:</span><span class="ja">カスタムCSS：</span><br><a href="https://www.w3schools.com/css/css_intro.asp" target="_blank" style="font-weight:normal;"><span><span class="en">What is CSS?</span><span class="ja">CSSって何？</span></span></a>'+
            '</span>'+
            '<textarea id="page-custom-css" oninput="KantanSettings.updateCustomCSS(this, true);">' + KN_CustomCSS + '</textarea>'+
            '<div class="desc"><span class="en">Use your own CSS to customize the design of the site to your liking.</span><span class="ja">自分のCSSが使えます。</span></div>'+
          '</div>'+
        '</div>'+
        
        
        '<div class="section-title" style="margin-top:30px;"><span class="en">General</span><span class="ja">一般</span></div>'+
        '<div class="kantan-settings-list">'+
          '<div id="settings-auto-read-box" class="setting">'+
            '<span class="label">'+
              '<span class="en">Auto-mark Read:</span><span class="ja">自動既読：</span>'+
            '</span>'+
            '<button id="settings-auto-read" class="button' + (KN_AutoRead == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateAutoRead(this);">' + (KN_AutoRead == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Automatically marks read-only pages as "Read" when you scroll to the end of their content.</span><span class="ja">読み取り専用ページの末尾までスクロールすると、ページを自動で既読にします。</span></div>'+
          '</div>'+
        
          '<div class="setting-sub-title"><span class="en">Homepage Settings</span><span class="ja">トップページの設定</span></div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Random Vocab/Kanji Spoiler:</span><span class="ja">ランダム言葉と漢字のネタバレ：</span>'+
            '</span>'+
            '<button id="settings-random-spoiler" class="button' + (KN_RandomSpoiler == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateRandomSpoiler(this);">' + (KN_RandomSpoiler == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Toggles the display of the spoiler for the Random Vocab and Kanji modules. Turn this option off if you want to see the meanings right away.</span><span class="ja">トップページではランダム言葉と漢字のネタバレの表示がトグルできます。</span></div>'+
          '</div>'+
        '</div>'+
        
        
        ((window.location.protocol == 'file:' || /localhost/.test(window.location.href)) ? '' : '<div class="section-title" style="margin-top:30px;"><span class="en">Privacy</span><span class="ja">プライバシー</span></div>'+
        '<div class="kantan-settings-list">'+
          '<div id="settings-ads-box" class="setting">'+
            '<span class="label">'+
              '<span class="en">Ads:</span><span class="ja">広告：</span>'+
            '</span>'+
            '<button id="settings-ads" class="button' + (KN_Adverts == 'on' ? '' : ' opt-off') + '" onclick="KantanSettings.updateAdverts(this);">' + (KN_Adverts == 'on' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Enable or disable Ads.<br>Ads help support our staff and cover development costs, but if they\'re annoying or distracting, you can turn them off with this option. We strictly adhere to a rule of only two ads per page: one banner at the top of the page and one at the very bottom of the page.</span><span class="ja">広告がトグルできます。<br>広告はこのウェブサイトの開発者を支えますが邪魔だったら無効にできます。</span></div>'+
          '</div>'+
         
          '<div id="settings-analytics-box" class="setting">'+
            '<span class="label">'+
              '<span class="en">Analytics Tracking:</span><span class="ja">アクセス解析：</span>'+
            '</span>'+
            '<button id="settings-analytics" class="button' + (KN_Analytics == 'on' ? '' : ' opt-off') + '" onclick="KantanSettings.updateAnalytics(this);">' + (KN_Analytics == 'on' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc">Enable or disable Analytics tracking.<br>Analytics data is used to analyize how the website is being used and to track website traffic. If you prefer to preserve your privacy, you may disable analytics tracking with this option.</div>'+
          '</div>'+
        '</div>'
        )+
        
        
        '<div class="section-title" style="margin-top:30px;"><span class="en">Exercises</span><span class="ja">練習</span></div>'+
        '<div class="kantan-settings-list">'+
          '<div class="setting-sub-title"><span class="en">General Settings</span><span class="ja">一般の設定</span></div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Skip Exercise Type Selection:</span><span class="ja">練習型の選択をスキップする：</span>'+
            '</span>'+
            '<button id="settings-skip-ex-type" class="button' + (KN_SkipTypeSelect == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateSkipExType(this);">' + (KN_SkipTypeSelect == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Skips that pesky exercise type selection prompt and instantly starts exercises when enabled.<br>The exercise type can still be changed manually via the Change Exercise Type button at the bottom of an exercise.</span><span class="ja">練習型を選択するポップアップがスキップしてすぐに練習できます。<br>練習型を変更したいなら練習ページの下の「練習型を変更する」をクリックしてください。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Spaced Repetition System:</span><span class="ja">間隔反復：</span>'+
            '</span>'+
            '<button id="settings-srs" class="button' + (KN_SRS == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateSRS(this);">' + (KN_SRS == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Enable or disable the Spaced Repetition review system for exercises. <a href="https://en.wikipedia.org/wiki/Spaced_repetition" target="_blank">What is SRS?</a></span><span class="ja">練習の間隔反復がトグルできます。<a href="https://ja.wikipedia.org/wiki/%E9%96%93%E9%9A%94%E5%8F%8D%E5%BE%A9" target="_blank">間隔反復って何？</a></span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Exercise Data Backup Reminder:</span><span class="ja">練習データを保存するリマインダー：</span>'+
            '</span>'+
            '<button id="settings-data-backup-reminder" class="button' + (KN_BackupReminder == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateDataBackupReminder(this);">' + (KN_BackupReminder == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Shows a reminder every 10 exercises to backup your profile data.</span><span class="ja">プロフィールデータを保存するリマインダーのポップアップがトグルできます。</span></div>'+
          '</div>'+
        
          '<div id="settings-profile-data-box" class="setting">'+
            '<span class="label">'+
              '<span class="en">Save/Load Profile Data:</span><span class="ja">プロフィールデータをセーブ／ロードする：</span>'+
            '</span>'+
            '<a id="settings-save-exercise-data" class="button green" download="Kantan Profile Data.json" href="data:text/plain;charset=utf-8,' + KantanSettings.saveExerciseData() + '"><i class="fa">&#xf019;</i><span class="en">Save</span><span class="ja">セーブする</span></a>'+
            '<button id="settings-load-exercise-data" class="button yellow" onclick="this.nextSibling.click();"><i class="fa">&#xf093;</i><span class="en">Load</span><span class="ja">ロードする</span></button><input id="settings-load-data" class="hidden-input" type="file" accept=".json" onchange="KantanSettings.loadExerciseData(this);">'+
            '<button id="settings-view-exercise-data" class="button" onclick="KantanSettings.viewExerciseData();"><i class="fa">&#xf1c9;</i><span class="en">View Data</span><span class="ja">データを見る</span></button>'+
            '<div class="desc"><span class="en">Save or load your profile data.<br>This data is stored locally in the browser, so it\'s highly recommended that you save your data periodically so you don\'t lose it.</span><span class="ja">プロフィールデータがセーブ／ロードできます。<br>このデータはブラウザーで保存していますのでキャッシュをクリアすると失います。ですから、定期的にセーブするのがおすすめします。</span></div>'+
          '</div>'+
        
          
          '<div class="setting-sub-title"><span class="en">Vocabulary Settings</span><span class="ja">単語の設定</span></div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Vocabulary Notes:</span><span class="ja">単語のノート：</span>'+
            '</span>'+
            '<button id="settings-vocab-notes" class="button' + (KN_VocabNotes == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateVocabNotes(this);">' + (KN_VocabNotes == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Toggles the display of the notes/info section in vocabulary lists.</span><span class="ja">単語のリストではノート・情報部分の表示がトグルできます。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Answer Spoiler:</span><span class="ja">答えのネタバレ：</span>'+
            '</span>'+
            '<button id="settings-vocab-spoiler" class="button' + (KN_SpoilerMode == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateSpoilerMode(this);">' + (KN_SpoilerMode == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Hides the choices in multiple choice vocab and kanji exercises, similar to a flash card mode.<br>Turn this mode on if you keep looking at the choices to remember what a word means instead of recalling it from memory.</span><span class="ja">単語と漢字の練習では選択肢が隠せます。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Vocabulary Tags:</span><span class="ja">単語のタグ：</span>'+
            '</span>'+
            '<button id="settings-vocab-tags" class="button' + (KN_VocabTags == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateVocabTags(this);">' + (KN_VocabTags == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Toggles the display of vocabulary tags in vocabulary exercises.</span><span class="ja">単語の練習では単語のタグの表示がトグルできます。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Example Sentences:</span><span class="ja">例文：</span>'+
            '</span>'+
            '<button id="settings-example-sentences" class="button' + (KN_ExampleSentences == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateReibunState(this);">' + (KN_ExampleSentences == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Toggles the display of example sentences in vocabulary exercises.</span><span class="ja">単語の練習では例文の表示がトグルできます。</span></div>'+
          '</div>'+
          
          '<div class="setting-sub-title"><span class="en">Multiple Choice Settings</span><span class="ja">選択式の設定</span></div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Multiple Choice Feedback Mode:</span><span class="ja">選択式モード：</span>'+
            '</span>'+
            '<select id="settings-feedback-mode" onchange="KantanSettings.updateFeedbackMode(this);">'+
              '<option value="classic"' + ( KN_FeedbackMode == 'classic' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? 'クラシック' : 'Classic') + '</option>'+
              '<option value="instant"' + ( KN_FeedbackMode == 'instant' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? 'インスタント' : 'Instant') + '</option>'+
            '</select>'+
            '<div class="desc"><span class="en">Changes the feedback mode for multple choice quizzes.<br>Instant shows if your answer was correct right away, whereas Classic only shows your answers at the end of the quiz.</span><span class="ja">選択式モードが変更できます。<br>「インスタント」は答えが正解か不正解をすぐに見せます。</span></div>'+
          '</div>'+
        
        
          '<div class="setting-sub-title"><span class="en">Written Quiz Settings</span><span class="ja">筆記テストの設定</span></div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Quick Answer Checker:</span><span class="ja">答えを確認するボタン：</span>'+
            '</span>'+
            '<button id="settings-answer-checker" class="button' + (KN_AnswerChecker == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateAnswerChecker(this);">' + (KN_AnswerChecker == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Toggles the display of the check answer button that is shown above problems when you hover over them in written quizzes. This feature is still available for analyzing answers after the quiz is over if disabled.</span><span class="ja">筆記テストでは問題の上で答えを確認するボタンの表示がトグルできます。</span></div>'+
          '</div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Romaji Input Mode:</span><span class="ja">ローマ字入力：</span>'+
            '</span>'+
            '<button id="settings-romaji-input" class="button' + (KN_RomajiInput == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateRomajiInput(this);">' + (KN_RomajiInput == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Toggles Romaji Input Mode for written quizzes. If you don\'t have a Japanese keyboard or IME, enable this setting to type in Hiragana or Katakana using Romaji.</span><span class="ja">筆記テストではローマ字入力がトグルできます。</span></div>'+
          '</div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Easy Mode:</span><span class="ja">イージーモード：</span>'+
            '</span>'+
            '<button id="settings-easy-mode" class="button' + (KN_EasyMode == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateEasyMode(this);">' + (KN_EasyMode == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Toggles Easy Input Mode for written quizzes. If you\'re stumped on an answer or don\'t have a Japanese keyboard or IME, enable this setting to show buttons below input fields for inserting answers.</span><span class="ja">筆記テストではイージーモードがトグルできます。</span></div>'+
          '</div>'+
        
        
          '<div class="setting-sub-title"><span class="en">Kantan Chat Settings</span><span class="ja">かんたんChatの設定</span></div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Chat Name:</span><span class="ja">チャットの名前：</span>'+
            '</span>'+
            '<input type="text" value="' + KN_ChatName + '" oninput="KantanSettings.updateChatName(this);">'+
            '<div class="desc"><span class="en">Changes the name used for you in Kantan Chat.</span><span class="ja">かんたんChatではあなたの名前が変更できます。</span></div>'+
          '</div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Fast Chat:</span><span class="ja">速いチャット：</span>'+
            '</span>'+
            '<button id="settings-fast-chat" class="button' + (KN_FastChat == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateFastChat(this);">' + (KN_FastChat == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Makes messages appears faster in Kantan Chat.</span><span class="ja">かんたんChatではONになったらメッセージがもっと速く現れます。</span></div>'+
          '</div>'+
          
        
          '<div class="setting-sub-title"><span class="en">Kanji Stroke Order Settings</span><span class="ja">書き順の設定</span></div>'+
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Stroke Order:</span><span class="ja">書き順の表示：</span>'+
            '</span>'+
            '<button id="settings-stroke-order" class="button' + (KN_StrokeOrder == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateStrokeOrder(this);">' + (KN_StrokeOrder == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Enable or disable the stroke order display in kanji stroke order exercises.</span><span class="ja">書き順の練習での書き順の表示がトグルできます。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Tracing Guide:</span><span class="ja">書き順のトレースガイド：</span>'+
            '</span>'+
            '<button id="settings-tracing-guide" class="button' + (KN_TracingGuide == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateTracingGuide(this);">' + (KN_TracingGuide == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Enable or disable the tracing guide display in kanji stroke order exercises.</span><span class="ja">書き順の練習でのトレースガイドの表示がトグルできます。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Stroke Numbers:</span><span class="ja">書き順のナンバー：</span>'+
            '</span>'+
            '<button id="settings-stroke-numbers" class="button' + (KN_StrokeNumbers == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateStrokeNumbers(this);">' + (KN_StrokeNumbers == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Hide or show the stroke numbers that display when you check kanji in stroke order exercises.</span><span class="ja">書き順の練習では書き順のナンバーの表示がトグルできます。</span></div>'+
          '</div>'+
          
        
          '<div class="setting-sub-title"><span class="en">Miscellaneous Settings</span><span class="ja">その他の設定</span></div>'+
          '<div id="random-exercise-box" class="setting">'+
            '<span class="label">'+
              '<span class="en">Random Exercise Range:</span><span class="ja">ランダム練習の範囲：</span>'+
            '</span>'+
            '<select id="random-exercise-type" onchange="KantanSettings.updateRandomExercise(this);">'+
              '<option value="all"' + ( KN_RandomExercise == 'all' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? 'すべての課' : 'All Lessons') + '</option>'+
              '<option value="lesson"' + ( KN_RandomExercise == 'lesson' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? '今の課' : 'Current Lesson') + '</option>'+
              '<option value="completed"' + ( KN_RandomExercise == 'completed' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? '終えた練習問題のみ' : 'Completed Exercises') + '</option>'+
              '<option value="custom"' + ( KN_RandomExercise == 'custom' ? ' selected' : '' ) + '>' + (KN_Lang == 'ja' ? 'カスタム' : 'Custom') + '</option>'+
            '</select>'+
            '<button id="random-exercise-list" class="button" style="display:' + (KN_RandomExercise == 'custom' ? '' : 'none') + ';" onclick="KantanSettings.randomExerciseList();"><i class="fa">&#xf03a;</i><span class="en">Random Exercise List</span><span class="ja">ランダム練習リスト</span></button>'+
            '<div class="desc"><span class="en">Changes the range for the Random Exercise button in the exercise list.<br>Change to Current Lesson if you want to avoid exercises above your current level.<br>Custom allows you to select your own exercises.</span><span class="ja">練習問題一覧でランダム練習ボタンの範囲が変更できます。<br>「カスタム」は自分で練習問題が選択できます。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Quick Jisho Look Up:</span><span class="ja">クイック辞書の調べるポップアップ：</span>'+
            '</span>'+
            '<button id="settings-jisho-lookup" class="button' + (KN_JishoLookUp == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateJishoLookUp(this);">' + (KN_JishoLookUp == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Enable or disable the look up button that appears when you select texts.<br>This feature may interfere with some IMEs, so it is recommended to disable it if you encounter any issues.</span><span class="ja">テキストを選択した時に調べるポップアップの表示がトグルできます。</span></div>'+
          '</div>'+
        
          '<div class="setting">'+
            '<span class="label">'+
              '<span class="en">Pause Timer Automatically:</span><span class="ja">練習の時間の停止：</span>'+
            '</span>'+
            '<button id="settings-timer-auto-pause" class="button' + (KN_AutoPauseTimer == 'true' ? '' : ' opt-off') + '" onclick="KantanSettings.updateTimerAutoPause(this);">' + (KN_AutoPauseTimer == 'true' ? 'ON' : 'OFF') + '</button>'+
            '<div class="desc"><span class="en">Enable or disable pausing timer when you leave or hide the exercise page</span><span class="ja">練習でページを変更すると時間が停止できます。</span></div>'+
          '</div>'+
        '</div>'+
        
        '<div class="section-title" style="margin-top:30px;"><span class="en">Other</span><span class="ja">その他</span></div>'+
        '<div class="kantan-settings-list">'+
          '<div id="settings-save-data" class="setting">'+
            '<span class="label">'+
              '<span class="en">Save/Load Settings:</span><span class="ja">設定データをセーブ／ロードする：</span>'+
            '</span>'+
            '<a id="settings-save-data" class="button green" download="Kantan Settings.json" href="data:text/plain;charset=utf-8,' + encodeURIComponent(KantanSettings.saveSettingsData().replace(/\n/g, '\r\n')) + '"><i class="fa">&#xf019;</i><span class="en">Save</span><span class="ja">セーブする</span></a>'+
            '<button id="settings-load-data" class="button yellow" onclick="this.nextSibling.click();"><i class="fa">&#xf093;</i><span class="en">Load</span><span class="ja">ロードする</span></button><input id="settings-load-setting-data" class="hidden-input" type="file" accept=".json" onchange="KantanSettings.loadSettingsData(this);">'+
            '<button id="settings-view-data" class="button" onclick="KantanSettings.viewSettingsData();"><i class="fa">&#xf1c9;</i><span class="en">View Data</span><span class="ja">データを見る</span></button>'+
            '<div class="desc"><span class="en">Save or load your settings data.</span><span class="ja">設定データがセーブ／ロードできます。</span></div>'+
          '</div>'+
        
          '<div id="settings-reset-box" class="setting">'+
            '<span class="label">'+
              '<span class="en">Revert to Default Settings:</span><span class="ja">デフォルト設定に戻す：</span>'+
            '</span>'+
            '<button id="settings-reset" class="button red" onclick="KantanSettings.revert();"><i class="fa">&#xf0e2;</i><span class="en">Reset Settings</span><span class="ja">設定をリセットする</span></button>'+
            '<div class="desc"><span class="en">Resets all settings to their default values.</span><span class="ja">すべての設定が初期状態に戻せます。</span></div>'+
          '</div>'+
        '</div>',

        buttonText : 'Close',
        noFocus : true,
        focus : '#font-size-range',
        overflowX : 'hidden',
        scrollTo : scroll || null,
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
    
    
    // asks if the user wants to reload the page to apply their new settings
    reloadPrompt : function (scroll) {
      KantanModal.open({
        title : '<span class="en">Reload Required</span><span class="ja">ページリロードが必要です</span>',
        content : '<span class="en">The page needs to be reloaded for your changes to take effect. Do you want to reload now?</span><span class="ja">設定を反映するためにページリロードが必要です。リロードしてもよろしいですか？</span>',
        buttonHTML : '<span class="en">Reload</span><span class="ja">リロードする</span>',
        closeButtonText : '<span class="en">Return to Settings</span><span class="ja">設定に戻る</span>',

        callback : function () {
          window.location.reload();
        },

        closeCallback : function () {
          setTimeout(function () {
            KantanSettings.manager(scroll);
          }, 10);
        }
      });
    },
    
    
    // reverts settings to their default values by deleting their localStorage items
    revert : function () {
      KantanModal.open({
        title : '<span class="en">Revert to Default Settings?</span><span class="ja">すべての設定を初期状態に戻しますか？</span>',
        content : '<span class="en">All of your settings will be reset to their default values. Do you want to continue?</span><span class="ja">すべての設定を初期状態に戻してもよろしいですか？</span>',
        buttonHTML : '<span class="en">Reset Settings</span><span class="ja">設定をリセットする</span>',
        buttonColor : 'red',
        closeButtonText : '<span class="en">Return to Settings</span><span class="ja">設定に戻る</span>',

        callback : function () {
          var settings = KantanSettings.list, i = 0, j = settings.length;

          for (; i < j; i++) {
            localStorage.removeItem(settings[i]);
          }
          
          setTimeout(function () {
            KantanSettings.reloadPrompt('#settings-reset-box');
          }, 10);
        },

        closeCallback : function () {
          setTimeout(function () {
            KantanSettings.manager('#settings-reset-box');
          }, 10);
        }
      });
    },
    
    
    // returns exercise data as a string for saving through download links
    saveExerciseData : function () {
      if (storageOK && localStorage.KantanResults) {
        var data = JSON.parse(localStorage.KantanResults)
        
        // save days studied
        if (localStorage.KN_DaysStudied) {
          data['days-studied'] = localStorage.KN_DaysStudied;
        }
        
        // save user notes
        if (localStorage.KN_Notes) {
          data['my-notes'] = localStorage.KN_Notes;
        }
        
        return encodeURIComponent(JSON.stringify(data));
      } else {
        return '';
      }
    },
    
    
    // loads the user's profile data
    loadExerciseData : function (input, reload) {
      var file = input.files[0],
          reader = new FileReader();
      
      reader.onload = function (e) {
        var data = JSON.parse(e.target.result);
        
        // apply profile data if correct file is uploaded
        if (data['days-studied']) {
          // save unique items to localStorage
          localStorage.KN_DaysStudied = data['days-studied'] || '0';
          localStorage.KN_Notes = data['my-notes'] || '';
          
          // delete unique items so they don't pollute the exercise results
          delete data['days-studied'];
          delete data['my-notes'];
          
          // apply remaining items to the exercise results
          localStorage.KantanResults = JSON.stringify(data);

          if (reload) {
            window.location.reload();
          }

          else {
            alert(KN_Lang == 'ja' ? 'プロフィールデータが成功にロードされました。得点データをアップデートするためにページをリロードしてください。' : 'Profile data has been loaded successfully! Please reload the page to update your scores.');
          }
        }
        
        // show error if not the correct profile data file
        else {
          alert('ERROR: Failed to load profile data. Please try again or contact support: https://github.com/SethClydesdale/kantan-japanese/issues');
        }
        
        input.value = null;
      };
      
      reader.readAsText(file, 'UTF-8');
    },
    
    
    // displays the user's profile data in a popup so they can view/copy it
    viewExerciseData : function (noCallback) {
      var data = localStorage.KantanResults ? JSON.parse(localStorage.KantanResults) : {};
      
      if (localStorage.KN_DaysStudied) {
        data['days-studied'] = localStorage.KN_DaysStudied;
      }
      
      if (localStorage.KN_Notes) {
        data['my-notes'] = localStorage.KN_Notes;
      }
      
      KantanModal.open({
        title : '<span class="en">Profile Data</span><span class="ja">プロフィールデータ</span>',
        content : 
        '<div class="center">'+
          '<textarea id="copy-data" onfocus="this.select();" style="width:80%;height:150px;" readonly>' + (data ? JSON.stringify(data, '', '  ') : KN_Lang == 'ja' ? 'データが見つかりませんでした。(ᓀ‸ᓂ)' : 'No data found. (ᓀ‸ᓂ)') + '</textarea><br>'+
          '<button class="button" onclick="CopyText(document.getElementById(\'copy-data\').value, this);"><i class="fa">&#xf0c5;</i><span class="en">Copy</span><span class="ja">コピーする</span></button>'+
        '</div>',
        
        closeCallback : function () {
          if (!noCallback) {
            window.setTimeout(function () {
              KantanSettings.manager('#settings-profile-data-box');
            }, 10);
          }
        }
      });
    },
    
    
    // returns all settings in a JSON string for saving though a download link
    saveSettingsData : function () {
      var settings = KantanSettings.list, i = 0, j = settings.length, data = {};
      
      for (; i < j; i++) {
        if (localStorage[settings[i]]) data[settings[i]] = localStorage[settings[i]];
      }
      
      return JSON.stringify(data);
    },
    
    
    // loads the user's settings data
    loadSettingsData : function (input, reload) {
      var file = input.files[0],
          reader = new FileReader();
      
      reader.onload = function (e) {
        var settings = JSON.parse(e.target.result), k;
        
        for (k in settings) {
          localStorage[k] = settings[k];
        }
        
        alert(KN_Lang == 'ja' ? '設定データが成功にロードしました。ページがリロードします。' : 'Settings data has been loaded successfully! The page will now reload.');
        
        window.location.reload();
      };
      
      reader.readAsText(file, 'UTF-8');
    },
    
    
    // displays the user's settings data in a popup so they can view/copy it
    viewSettingsData : function (noCallback) {
      KantanModal.open({
        title : '<span class="en">Settings Data</span><span class="ja">設定データ</span>',
        content : 
        '<div class="center">'+
          '<textarea id="copy-data" onfocus="this.select();" style="width:80%;height:150px;" readonly>' + JSON.stringify(JSON.parse(KantanSettings.saveSettingsData()), '', '  ') + '</textarea><br>'+
          '<button class="button" onclick="CopyText(document.getElementById(\'copy-data\').value, this);"><i class="fa">&#xf0c5;</i><span class="en">Copy</span><span class="ja">コピーする</span></button>'+
        '</div>',
        
        closeCallback : function () {
          if (!noCallback) {
            window.setTimeout(function () {
              KantanSettings.manager('#settings-save-data');
            }, 10);
          }
        }
      });
    },
    
    
    // update button state for settings
    updateButton : function (caller, callback) {
      // switches button state to ON if it's off
      if (/opt-off/.test(caller.className)) {
        caller.innerText = 'ON';
        caller.className = caller.className.replace('opt-off', '');
        callback && callback('ON');
      }
      
      // switches button state to OFF if it's on
      else {
        caller.innerText = 'OFF';
        caller.className += ' opt-off';
        callback && callback('OFF');
      }
    },
    
    
    // updates the font size
    // TODO: below CSS needs to be completely changed to match those in our new styles
    updateFontSize : function (caller, updateCSS) {
      var n = (caller ? +caller.value : localStorage.KN_FontSize) / 100;
      
      // update number value
      if (caller) caller.nextSibling.innerText = caller.value + '%';
      
      // update the CSS
      if (updateCSS) {
        var css = '/*FONT-SIZE-START*/'+
          // font size
          'footer li:before { font-size:' + (6 * n) + 'px }'+
          '.kana-quiz.quiz-over [data-mistakes]:after { font-size:' + (8 * n) + 'px }'+
          '.quiz-over .vocab-horizontal [data-mistakes]:after, .verb-quiz.quiz-over [data-mistakes]:after { font-size:' + (10 * n) + 'px }'+
          '.define, #announcement .announcement .date, #quick-search-results li[data-lesson]:before, .writing-quiz .quiz-item:before, .furigana-on #question-list .quiz-item:before, .furigana, .inline-furi i, ruby rt, .secondary-answer, .def-ja.def-furi i { font-size:' + (11 * n) + 'px }'+
          '#exercise-title:after, .title[data-page]:after, #exercise-list li a[data-page]:hover:after, #exercise-list li a[data-page]:focus:after, .leg-desc, .sectionNumber3rd { font-size:' + (12 * n) + 'px }'+
          '.kanji-readings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .kanji-meanings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .image-list span i, .checkbox-label { font-size:' + (13 * n) + 'px }'+
          'body, p, input[type="text"], input[type="number"], textarea, select, #announcement .announcement, #link-list span, .workbook-title, .normal-block, .quiz-over [data-mistakes]:after, #wrongAnswer:before, .writing-quiz .quiz-item, input.writing-zone-input, .quiz-multi-question, .quiz-multi-answer, .text-block, .fill-quiz .writing-zone-input, .problem-hint, .problem-answer, .definition, .lesson-summary, #exercise-list .sub-lesson-title, .button:not(.play-button), a.button, #study-tool-settings li { font-size:' + (14 * n) + 'px }'+
          '#exercise-list .lesson-title, #kantan-modal-content, .table.grammar-table td { font-size:' + (15 * n) + 'px }'+
          '#link-list i, #exercise:before, .loading:before, .sub-lesson-title, .workbook-title, .title-desc, #exercise .text-passage, #complete-banner, #downloadCode:before, .definition-count, .multi-vocab rt, .table-head { font-size:' + (16 * n) + 'px }'+
          '.group-selectors .select-all:before, .group-selectors .deselect-all:before { font-size:' + (17 * n) + 'px }'+
          '.button .fa, .more-exercises a:after, .more-exercises a:before, #link-github i, #link-help i, .title-med, .sub-title, #exercise-list .main-title, .quiz-multi-answer:before, #kantan-site-settings, .dictionary-index li, #quick-jisho-title { font-size:' + (18 * n) + 'px }'+
          '#quick-actions h2, .lesson-title, .vocab-key:before { font-size:' + (20 * n) + 'px }'+
          '.section-title, #exercise-title, #break-timer, #announcement .fa, .multi-vocab-sentence { font-size:' + (24 * n) + 'px }'+
          '.kanji-readings.drag-quiz #question-list .quiz-item, .kanji-meanings.drag-quiz #question-list .quiz-item { font-size:' + (26 * n) + 'px }'+
          '.title { font-size:' + (28 * n) + 'px }'+
          '.multi-vocab { font-size:' + (32 * n) + 'px }'+
          // width
          '.slim-ruby ruby { width:' + (10 * n) + 'px }'+
          '.result-label { width:' + (150 * n) + 'px }'+
          '.kana-quiz .quiz-answer-zone:empty, .kana-quiz .quiz-item { width:' + (35 * n) + 'px }'+
          // height
          '.problem-hint, .problem-answer { height:' + (20 * n) + 'px }'+
          '#quiz-progress, #quiz-progress-bar { height:' + (25 * n) + 'px }'+
          '#kantan-site-settings { height:' + (26 * n) + 'px }'+
          '.kanji-meanings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .drag-quiz .quiz-item, .drag-quiz .quiz-answer-zone { height:' + (28 * n) + 'px }'+
          '.vocab-key:before, .kana-quiz .quiz-answer-zone:empty, .kana-quiz .quiz-item { height:' + (30 * n) + 'px }'+
          '#kantan-modal-buttons, #kantan-modal-header { height:' + (40 * n) + 'px }'+
          '.kanji-meanings.drag-quiz .quiz-answer-zone, .kanji-meanings.drag-quiz #question-list .quiz-item, .kanji-meanings.drag-quiz #question-list .quiz-item, .kanji-meanings.drag-quiz .quiz-answer-zone, .kanji-readings.drag-quiz .quiz-answer-zone, .kanji-readings.drag-quiz .quiz-item { height:' + (48 * n) + 'px }'+
          '#announcement { height:' + (105 * n) + 'px }'+
          '#announcement .announcement { height:' + (70 * n) + 'px }'+
          '.multi-vocab { min-height:' + (64 * n) + 'px }'+
          // line-height
          '.secondary-answer { line-height:' + (10 * n) + 'px; }'+
          '#exercise-list li a[data-page]:focus:after, #exercise-list li a[data-page]:hover:after { line-height:' + (12 * n) + 'px; }'+
          '.writing-quiz .quiz-item:before, .furigana-on #question-list .quiz-item:before { line-height:' + (15 * n) + 'px; }'+
          '.kanji-readings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .kanji-meanings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .drag-quiz .quiz-item, .drag-quiz .quiz-answer-zone, .problem-hint, .problem-answer { line-height:' + (20 * n) + 'px; }'+
          '.kana-quiz .quiz-answer-zone:empty, .kana-quiz .quiz-item { line-height:' + (22 * n) + 'px; }'+
          '#kantan-site-settings, #quiz-progress-text { line-height:' + (26 * n) + 'px; }'+
          '#quick-jisho-title { line-height:' + (32 * n) + 'px; }'+
          '.vocab-key:before { line-height:' + (34 * n) + 'px; }'+
          '#kantan-modal-buttons, #kantan-modal-header { line-height:' + (40 * n) + 'px; }'+
          '.kanji-readings.drag-quiz #question-list .quiz-item, .kanji-meanings.drag-quiz #question-list .quiz-item { line-height:' + (44 * n) + 'px; }'+
          // padding
          '.vocab-key { padding-top:' + (30 * n) + 'px; }'+
          // margin
          '.writing-quiz .furigana-on #question-list .quiz-item[data-helper] { margin-bottom:' + (3 * n) + 'px; }'+
          '.quiz-multi-answer.next-question:before { margin-top:-' + (9 * n) + 'px; }'+
          '.quiz-multi-answer:before { margin-top:-' + (10 * n) + 'px; }'+
          '.writing-quiz .quiz-answer-row.furi-row { margin-bottom:' + (12 * n) + 'px; }'+
          '.def-ja.def-furi { margin-bottom:' + (15 * n) + 'px; }'+
          '.vocab-horizontal.furigana-on #question-list .quiz-item, .furigana-on #question-list .quiz-item[data-helper], .furigana-on #drop-list .quiz-answer-zone.helper-answer { margin-bottom:' + (18 * n) + 'px; }'+
          '.problem-hint, .problem-answer { margin-bottom:-' + (20 * n) + 'px; }'+
          '.fill-quiz .small-margin .block, .fill-quiz .small-margin .problem { margin-bottom:' + (25 * n) + 'px; }'+
          '.question-block { margin:' + (30 * n) + 'px 0; }'+
          '.fill-quiz .big-margin, .fill-quiz .example-problem, .fill-quiz .problem, .fill-quiz.quiz-over td .writing-zone { margin-bottom:' + (40 * n) + 'px; }'+
          // positioning
          '.kana-quiz .answer-correct .quiz-item:before { top:-' + (5 * n) + 'px; right:-' + (8 * n) + 'px; }'+
          '.writing-quiz .quiz-item:before, .furigana-on #question-list .quiz-item:before, .def-ja.def-furi i { bottom:-' + (15 * n) + 'px }'+
          '.question-block:after { top:-' + (20 * n) + 'px }'+
          '.quiz-multi-answer:before { left:-' + (25 * n) + 'px }'+
          '#kantan-modal-content { top:' + (40 * n) + 'px }'+
          '#kantan-modal-content { bottom:' + (40 * n) + 'px }'+
          '#wrongAnswer:before { right:-' + (70 * n) + 'px }'+
          '.quiz-over [data-mistakes]:after { right:-' + (85 * n) + 'px }'+
          // bottom borders
          '.fill-quiz .writing-zone-input, .section-title, .lesson-title, #link-list a { border-bottom-width:' + ( 2 * n ) + 'px; }'+
          // modal position
          '#kantan-modal-body { top:' + (10 / n) + '%; left:' + (25 / n) + '%; right:' + (25 / n) + '%; bottom:' + (40 / n) + '%; }'+
          // exercise list
          '#exercise-list { width:' + (300 * n) + 'px; left:-' + (301 * n) + 'px; }'+
          '#toggle-exercises.list-open { left:' + ((300 * n) - 30) + 'px; }'+
          // quick jisho
          '#quick-jisho-window { height:' + ( 300 * n ) + 'px; width:' + ( 500 * n ) + 'px; }'+
          '#quick-jisho-window.quick-jisho-hidden { bottom:-' + (310 * n) + 'px; }'+
          '#quick-jisho-results { height:' + (219 * n) + 'px; }'+
          '#quick-jisho-search { height:' + (35 * n) + 'px; }'+
          '.quick-jisho-row, #quick-jisho-results { padding:' + (3 * n) + 'px; }'+
          '#quick-jisho-selector { border-radius:' + (15 * n) + 'px; }'+
          // quick nav sub-section buttons
          '#quick-nav-list a.sub-section-button { font-size:' + ( 11 * n ) + 'px; height:' + ( 18 * n ) + 'px; width:' + ( 18 * n ) + 'px; line-height:' + ( 20 * n ) + 'px; left:-' + ( 22 * n ) + 'px; }'+
          '#quick-nav-list li:before { height:' + ( 6 * n ) + 'px; width:' + ( 6 * n ) + 'px; left:-' + ( 16 * n ) + 'px; }'+
          '#quick-nav-list li ul li:before { height:' + ( 4 * n ) + 'px; width:' + ( 4 * n ) + 'px; }'+
          // play buttons
          '.button.play-button { height:' + ( 25 * n ) + 'px; width:' + ( 25 * n ) + 'px; }'+
          '.button.play-button i { font-size:' + ( 14 * n ) + 'px; }'+
          // example
          '.example-problem:before { font-size:' + ( 12 * n ) + 'px; line-height:' + ( 12 * n ) + 'px; padding:' + ( 2 * n ) + 'px; border-radius:' + ( 5 * n ) + 'px; }'+
          '.example-problem.inline-columns { padding-left:' + ( 62 * n ) + 'px; }'+
          // furigana (disabled; reason: 10/25/2020 furigana update)
          //'ruby { bottom:-' + ( 16 * n ) + 'px; margin:-' + ( 16 * n ) + 'px 0 ' + ( 16 * n ) + 'px 0 }'+
          //'ruby rt { height:' + ( 15 * n ) + 'px; line-height:' + ( 15 * n ) + 'px; margin-top:-' + ( 1 * n ) + 'px; }'+
          // section numbers/icons
          '.sectionNumber3rd, .section-number { width:' + ( 22 * n ) + 'px; height:' + ( 22 * n ) + 'px; line-height:' + ( 21 * n ) + 'px; }'+
          // info icon
          '#quiz-info { padding:' + ( 15 * n ) + 'px ' + ( 15 * n ) + 'px ' + ( 15 * n ) + 'px ' + ( 50 * n ) + 'px; }'+
          '#quiz-info:before { font-size:' + ( 32 * n ) + 'px; margin-top:-' + ( 16 * n ) + 'px; left:' + ( 12 * n ) + 'px; }'+
          // announcement controls
          '#announcement .announce-controls { margin-top:-' + ( 15 * n ) + 'px; height:' + ( 30 * n ) + 'px; width:' + ( 20 * n ) + 'px; }'+
          '#announcement .announce-controls i.fa { font-size:' + ( 18 * n ) + 'px; line-height:' + ( 26 * n ) + 'px; }'+
          '#announcement .announce-controls.button-left { left:-' + ( 20 * n ) + 'px; }'+
          '#announcement .announce-controls.button-right { right:-' + ( 20 * n ) + 'px; }'+
          '#announce-list { margin:0 ' + ( 20 * n ) + 'px; }'+
          // overrides
          '.drawing-quiz .stroke-order-button, .dictionary-group .group-selectors .button, .dict-search-wrapper .group-selectors .button, .button.icon-only, .kanji-stroke-order, .kanji-stroke-order .button, .drawing-zone { font-size:13px }'+
          '.dictionary-group .group-selectors .deselect-all:before, .dictionary-group .group-selectors .select-all:before, .dict-search-wrapper .group-selectors .deselect-all:before, .dict-search-wrapper .group-selectors .select-all:before { font-size:17px }'+
          '.button.icon-only .fa, #random-exercise i { font-size:18px }'+
        '/*FONT-SIZE-END*/';
        
        // replace old css rules
        if (/\/\*FONT-SIZE-START\*\//.test(KantanSettings.stylesheet.innerText)) {
          KantanSettings.stylesheet.innerText = KantanSettings.stylesheet.innerText.replace(/\/\*FONT-SIZE-START\*\/.*?\/\*FONT-SIZE-END\*\//, css);
        }

        // add new css rules
        else {
          KantanSettings.stylesheet.innerText += css;
        }
        
        // update the width of input elements
        if (caller) { // if caller is not present, CSS was updated on page load, thus the following elements are null
          for (var input = document.querySelectorAll('[data-default-width]'), i = 0, j = input.length; i < j; i++) {
            input[i].style.width = (input[i].dataset.defaultWidth * n) + 'px';
          }
        }
      }
      
      // save setting to localStorage
      if (caller) {
        localStorage.KN_FontSize = caller.value;
        Kantan.pref.fontSize = caller.value;
      }
    },
    
    
    // updates the page width
    updatePageWidth : function (caller, updateCSS) {
      var n = (caller ? +caller.value : localStorage.KN_PageWidth) / 100;
      
      // update number value
      if (caller) caller.nextSibling.innerText = caller.value + '%';
      
      // update the CSS
      if (updateCSS) {
        var css = '/*PAGE-WIDTH-START*/'+
          '.content-block, #content { max-width:' + (1200 * n) + 'px }'+
        '/*PAGE-WIDTH-END*/';
        
        // replace old css rules
        if (/\/\*PAGE-WIDTH-START\*\//.test(KantanSettings.stylesheet.innerText)) {
          KantanSettings.stylesheet.innerText = KantanSettings.stylesheet.innerText.replace(/\/\*PAGE-WIDTH-START\*\/.*?\/\*PAGE-WIDTH-END\*\//, css);
        } 
        
        // add new css rules
        else {
          KantanSettings.stylesheet.innerText += css;
        }
      }
      
      // save setting to localStorage
      if (caller) localStorage.KN_PageWidth = caller.value;
    },
    
    
    // updates language preference
    updateLang : function (caller, lang) {
      KN_Lang = lang ? lang : caller.value;
      document.documentElement.className = document.documentElement.className.replace(/lang-(?:en|ja)/, 'lang-' + (lang ? lang : caller.value));
      
      // save preference to cache
      if (storageOK) {
        localStorage.KN_Lang = lang ? lang : caller.value;
      }
      
      // reset settings manager to apply new language
      if (!lang) {
        KantanSettings.manager('#settings-lang-box');
        document.getElementById('settings-lang').focus();
      }
    },
    
    
    // updates theme state
    updateTheme : function (caller) {
      var theme = document.getElementById('website-theme');
      
      // remove current theme
      if (theme) {
        theme.parentNode.removeChild(theme);
      }
      
      // apply new theme
      if (caller.value != 'blue') {
        var theme = document.createElement('LINK');
        theme.id = 'website-theme';
        theme.href = getPaths() + 'resources/css/themes/theme-' + caller.value + '.css';
        theme.rel = 'stylesheet';
        document.head.appendChild(theme);
      }
      
      // save preference to cache
      if (storageOK) {
        localStorage.KN_Theme = caller.value;
      }
    },
    
    
    // updates dark mode state
    updateDarkMode : function (caller) {
      document.getElementById('light-switch-checkbox').click();
      KantanSettings.updateButton(caller);
    },
    
    
    // updates auto-read state
    updateAutoRead : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        state = state == 'ON' ? 'true' : 'false';
        localStorage.KN_AutoRead = state;
        Kantan.pref.autoRead = state;
      });
    },
    
    
    // updates fast chat state
    updateFastChat : function (caller, state) {
      var button = document.getElementById('toggle-fast-chat');
      
      if (button && !state) {
        button.click();
      }
      
      if (caller) {
        KantanSettings.updateButton(caller, function (state) {
          if (!button) {
            state = state == 'ON' ? 'true' : 'false';
            localStorage.KN_FastChat = state;
            Kantan.pref.fastChat = state;
          }
        });
      }
      
      else {
        localStorage.KN_FastChat = state;
        Kantan.pref.fastChat = state;
      }
    },
    
    
    // updates the username used in Kantan Chat
    updateChatName : function (caller) {
      localStorage.KN_ChatData_NAME = sanitizeString(caller.value);
    },
    
    
    // updates adverts state
    updateAdverts : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        localStorage.KN_Adverts = state == 'ON' ? 'on' : 'off';
        KantanSettings.reloadPrompt('#settings-ads-box');
      });
    },
    
    
    // updates analytics state
    updateAnalytics : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        localStorage.KN_Analytics = state == 'ON' ? 'on' : 'off';
      });
    },
    
    
    // updates custom css
    updateCustomCSS : function (caller, updateCSS) {
      // update the CSS
      if (updateCSS) {
        var css = '/*CUSTOM-CSS-START*/' + (caller ? caller.value : localStorage.KN_CustomCSS) + '/*CUSTOM-CSS-END*/';
        
        // replace old css rules
        if (/\/\*CUSTOM-CSS-START\*\//.test(KantanSettings.stylesheet.innerText)) {
          KantanSettings.stylesheet.innerText = KantanSettings.stylesheet.innerText.replace(/\/\*CUSTOM-CSS-START\*\/.*?\/\*CUSTOM-CSS-END\*\//, css);
        } 
        
        // add new css rules
        else {
          KantanSettings.stylesheet.innerText += css;
        }
      }
      
      // save setting to localStorage
      if (caller) localStorage.KN_CustomCSS = caller.value;
    },
    
    
    // updates the feedback mode preference
    updateFeedbackMode : function (caller) {
      var mode = caller ? caller.value : window.Kantan && Kantan.pref.feedbackMode == 'classic' ? 'instant' : 'classic';
      
      localStorage.KN_FeedbackMode = mode;

      if (window.Kantan && Kantan.pref.feedbackMode) {
        Kantan.pref.feedbackMode = mode;
      }

      // toggle display state of the next button
      var next = document.getElementById('next-button');

      if (next) {
        // automatically proceed to next question if the student answered while in instant mode and switched to classic mode
        if (Kantan.pref.feedbackMode == 'classic' && /visible/.test(next.style.visibility)) {
          next.firstChild.click();
        }

        next.style.display = Kantan.pref.feedbackMode == 'classic' ? 'none' : '';
      }
    },
    
    
    // updates the random exercise preference
    updateRandomExercise : function (caller) {
      var list = document.getElementById('random-exercise-list');
      
      if (caller) { 
        localStorage.KN_RandomExercise = caller.value;
        
        if (window.Kantan) {
          Kantan.pref.randomExercise = caller.value;
        }
        
        if (list) {
          list.style.display = caller.value == 'custom' ? '' : 'none';
        }
      }
    },
    
    // opens a window to manage random exercise selection
    randomExerciseList : function () {
      KantanModal.open({
        title : '<span class="en">Random Exercise List</span><span class="ja">ランダム練習リスト</span>',
        content : 
          '<span class="en">Please select the exercises that you would like to practice.</span><span class="ja">練習するための練習問題を選択してください。</span>'+
          '<div class="columns-2 clear">'+
            '<div>'+
              '<h3 class="main-color"><span class="en">Selected Exercises</span><span class="ja">選択した練習問題</span></h3>'+
              '<div id="random-selected" class="random-exercise-list"></div>'+
            '</div>'+
            '<div>'+
              '<h3 class="main-color"><span class="en">Exercises</span><span class="ja">練習問題</span></h3>'+
              '<div id="random-list" class="random-exercise-list"></div>'+
            '</div>'+
          '</div>'+
          '<div class="center"><button class="button red" onclick="KantanSettings.clearRandomList();"><i class="fa">&#xf12d;</i><span class="en">Clear Selected Exercises</span><span class="ja">選択した練習問題を解除する</span></button></div>',
        closeButtonText : '<span class="en">Return to Settings</span><span class="ja">設定に戻る</span>',

        closeCallback : function () {
          setTimeout(function () {
            KantanSettings.manager('#random-exercise-box');
          }, 10);
        },
        
        customSize : {
          top : '5%',
          left : '10%',
          bottom : '5%',
          right : '10%'
        }
      });
      
      // parse random exercise list
      var parseExercises = function () {
        // parse the exercise list and selected exercise list
        for (var list = '', selected = '', i = 0, j = KantanExercises.length, data, checked, item; i < j; i++) {
          checked = KN_RandomList.indexOf(KantanExercises[i]) != -1;
          data = KantanExercises[i].split('|');
          
          if (!/tools|references|^>|^#|-list$/i.test(data[0])) {
            item = '<div data-lesson="' + data[0].replace(/.*?lesson-(\d+).*/, 'L$1') + '" data-path="' + data[0] + '" data-name="' + data[1] + '">'+
                '<input class="def-selector kantan_input_hidden" type="checkbox" onchange="KantanSettings.updateRandomList(this, \'' + KantanExercises[i] + '\');"' + (KN_RandomList.indexOf(KantanExercises[i]) != -1 ? ' checked' : '') + '>'+
                '<span tabindex="0" class="kantan_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
              '<a href="' + getPaths() + 'lessons/' + data[0] + '/' + ((window.location.protocol == 'file:' || /localhost/.test(window.location.href)) ? 'index.html' : '') + '" target="_blank">' + data[1] + '</a>'+
            '</div>';
            
            list += item;
            if (checked) selected += item;
          }
        }
        
        // add the exercises to their respective lists
        document.getElementById('random-list').innerHTML = list;
        document.getElementById('random-selected').innerHTML = selected;
      };
      
      // load exercise data
      getScript('data/lesson-list.js', function () {
        parseExercises();
      }, function () { return window.KantanExercises ? true : false });
    },
    
    // updates the user's selected random exercises
    updateRandomList : function (caller, data) {
      
      // add exercise to the random list
      if (caller.checked) {
        KN_RandomList.push(data);
        
        document.getElementById('random-selected').appendChild(caller.parentNode.cloneNode(true));
      }
      
      // remove exercise from the random list
      else {
        KN_RandomList.splice(KN_RandomList.indexOf(data), 1);
        
        var selected = document.querySelector('#random-selected [data-path="' + caller.parentNode.dataset.path + '"]'),
            checkbox = document.querySelector('#random-list [data-path="' + caller.parentNode.dataset.path + '"] input');
        
        if (selected) selected.parentNode.removeChild(selected);
        if (checkbox) checkbox.checked = false;
      }
      
      // save selected exercises to local storage
      localStorage.KN_RandomList = JSON.stringify(KN_RandomList);
    },
    
    // clears the random exercise list
    clearRandomList : function () {
      if (confirm(KN_Lang == 'ja' ? 'すべての選択した練習問題を解除してもよろしいですか？' : 'All selected exercises will be cleared. Do you want to continue?')) {
        for (var a = document.querySelectorAll('#random-selected input'), i = 0, j = a.length; i < j; i++) {
          a[i].click();
        }
      }
    },
    
    
    // updates quick answer checker preference
    updateAnswerChecker : function (caller) {
      var state = true;
      
      // determine state either from button setting or internally
      if (caller) {
        KantanSettings.updateButton(caller, function (callback_state) {
          state = callback_state;
        });
      } else if (Kantan.pref.answerChecker) {
        state = Kantan.pref.answerChecker == 'true' ? 'ON' : 'OFF';
      }
      
      // update quick answer checker state if in exercise
      if (document.querySelector('.writing-zone')) {
        var zone = document.getElementById('quiz-zone');

        if (state == 'OFF') {
          zone.className += ' no-checking';
        } else {
          zone.className = zone.className.replace('no-checking', '');
        }
      }

      // update final state
      state = state == 'ON' ? 'true' : 'false';
      localStorage.KN_AnswerChecker = state;
      Kantan.pref.answerChecker = state;
    },
    
    
    // updates Romaji Input mode preference
    updateRomajiInput : function (caller) {
      var state = false;
      
      // determine state either from button
      KantanSettings.updateButton(caller, function (callback_state) {
        state = callback_state;
      });
      
      // update Romaji Input state
      var button = document.getElementById('toggle-romaji-input');
      
      // if the button is on the page, click it
      if (button) {
        button.click();
        
      } else {
        state = state == 'ON' ? 'true' : 'false';
        localStorage.KN_RomajiInput = state;
        Kantan.pref.romajiInput = state;
      }
    },
    
    
    // updates easy input mode preference
    updateEasyMode : function (caller) {
      var state = false;
      
      // determine state either from button
      KantanSettings.updateButton(caller, function (callback_state) {
        state = callback_state;
      });
      
      // update easy mode state
      var button = document.getElementById('toggle-insert-mode');
      
      // if the button is on the page, click it
      if (button) {
        button.click();
        
      } else {
        state = state == 'ON' ? 'true' : 'false';
        localStorage.KN_EasyMode = state;
        Kantan.pref.easyMode = state;
      }
    },
    
    
    // updates vocab spoiler preference
    updateSpoilerMode : function (caller, pushedState) {
      var state = pushedState || false;
      
      // determine state either from button setting or internally
      if (!pushedState) {
        if (caller) {
          KantanSettings.updateButton(caller, function (callback_state) {
            state = callback_state;
          });

        } else if (Kantan.pref.vocabSpoiler) {
          state = Kantan.pref.vocabSpoiler == 'true' ? 'OFF' : 'ON';
        }

        // update spoiler state if in exercise
        var button = document.getElementById('toggle-vocab-spoiler');
        
        if (button) {
          button.click();
        }
      }

      // update final state
      state = state == 'ON' ? 'true' : 'false';
      localStorage.KN_SpoilerMode = state;
      Kantan.pref.vocabSpoiler = state;
    },
    
    
    // updates vocab tags preference
    updateVocabTags : function (caller, pushedState) {
      var state = pushedState || true;
      
      // determine state either from button setting or internally
      if (!pushedState) {
        if (caller) {
          KantanSettings.updateButton(caller, function (callback_state) {
            state = callback_state;
          });

        } else if (Kantan.pref.vocabTags) {
          state = Kantan.pref.vocabTags == 'true' ? 'OFF' : 'ON';
        }

        // update state if in exercise
        var button = document.getElementById('toggle-vtags');

        if (button) {
          button.click();
        }
      }

      // update final state
      state = state == 'ON' ? 'true' : 'false';
      localStorage.KN_VocabTags = state;
      Kantan.pref.vocabTags = state;
    },
    
    
    // updates vocab notes preference
    updateVocabNotes : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        // click button to update setting if in exercise
        var button = document.getElementById('toggle-vocab-notes');
        if (button) {
          button.click();
        }
        
        // update storage setting
        else {
          localStorage.KN_VocabNotes = state == 'ON' ? 'true' : 'false';
        }
      });
    },
    
    
    // updates vocab example sentence preference
    updateReibunState : function (caller, pushedState) {
      var state = pushedState || true;
      
      // determine state either from button setting or internally
      if (!pushedState) {
        if (caller) {
          KantanSettings.updateButton(caller, function (callback_state) {
            state = callback_state;
          });

        } else if (Kantan.pref.exampleSentences) {
          state = Kantan.pref.exampleSentences == 'true' ? 'OFF' : 'ON';
        }

        // update state if in exercise
        var button = document.getElementById('toggle-reibun');

        if (button) {
          button.click();
        }
      }

      // update final state
      state = state == 'ON' ? 'true' : 'false';
      localStorage.KN_ExampleSentences = state;
      Kantan.pref.exampleSentences = state;
    },
    
    
    // updates furigana preference
    updateFurigana : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        var button = document.getElementById('toggle-furigana');

        // update preferences by clicking the button if it's present
        if (button) {
          button.click();
        }
        
        // otherwise manually update the localStorage preference and body's class attribute
        else {
          var state = state == 'ON' ? 'true' : 'false',
              body = document.documentElement;
          
          switch (state) {
            case 'true' :
              body.className = body.className.replace('furigana-off', 'furigana-on');
              break;

            case 'false' :
              body.className = body.className.replace('furigana-on', 'furigana-off');
              break;

            default :
              break;
          }
          
          localStorage.KN_Furigana = state;
          
          if (window.Kantan) {
            Kantan.pref.furigana = state;
          }
        }
      });
    },
    
    
    // updates the random vocab/kanji spoiler preference
    updateRandomSpoiler : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        state = state == 'ON' ? 'true' : 'false';
        localStorage.KN_RandomSpoiler = state;
        
        var i = 0, j, a;
        switch (state) {
          case 'true':
            for (a = document.querySelectorAll('.random-word .spoiler-off'), j = a.length; i < j; i++) {
              a[i].className = a[i].className.replace('-off', '');
            }
            break;
            
          case 'false':
            for (a = document.querySelectorAll('.random-word .spoiler'), j = a.length; i < j; i++) {
              a[i].className += '-off';
            }
            break;
            
          default:
            break;
        }
      });
    },

    
    // updates exercise type selection skipping preference
    updateSkipExType : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        state = state == 'ON' ? 'true' : 'false';
        localStorage.KN_SkipTypeSelect = state;
        
        if (window.Kantan) {
          Kantan.pref.skipTypeSelect = state;
        }
      });
    },

    
    // updates exercise type selection skipping preference
    updateJishoLookUp : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        state = state == 'ON' ? 'true' : 'false';
        localStorage.KN_JishoLookUp = state;
        
        if (window.Kantan) {
          Kantan.pref.jishoLookUp = state;
        }
      });
    },

    
    // updates stroke order preference
    updateStrokeOrder : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        var button = document.getElementById('toggle-stroke-order');

        // update preferences by clicking the button if it's present
        if (button) {
          button.click();
        }
        
        // otherwise manually update the localStorage preference
        else {
          state = state == 'ON' ? 'true' : 'false';
          localStorage.KN_StrokeOrder = state;
          
          if (window.Kantan) {
            Kantan.pref.strokeOrder = state;
          }
        }
      });
    },

    
    // updates stroke order preference
    updateTracingGuide : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        var button = document.getElementById('toggle-tracing-guide');

        // update preferences by clicking the button if it's present
        if (button) {
          button.click();
        }
        
        // otherwise manually update the localStorage preference
        else {
          state = state == 'ON' ? 'true' : 'false'
          localStorage.KN_TracingGuide = state;
          
          if (window.Kantan) {
            Kantan.pref.tracingGuide = state;
          }
        }
      });
    },

    
    // updates stroke order preference
    updateStrokeNumbers : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        var button = document.getElementById('toggle-stroke-numbers');

        // update preferences by clicking the button if it's present
        if (button) {
          button.click();
        }
        
        // otherwise manually update the localStorage preference
        else {
          state = state == 'ON' ? 'true' : 'false'
          localStorage.KN_StrokeNumbers = state;
          
          if (window.Kantan) {
            Kantan.pref.strokeNumbers = state;
          }
        }
      });
    },

    
    // updates data backup reminder
    updateDataBackupReminder : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        state = state == 'ON' ? 'true' : 'false';
        localStorage.KN_BackupReminder = state;
        
        if (window.Kantan) {
          Kantan.pref.backupReminder = state;
        }
      });
    },

    
    // updates SRS state
    updateSRS : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        state = state == 'ON' ? 'true' : 'false';
        localStorage.KN_SRS = state;
        
        if (window.Kantan) {
          Kantan.pref.SRS = state;
        }
        
        // update review data
        getKantanReviews();
        
        // set review data/hide review content depending on preference
        var nav = document.querySelectorAll('#nav-reviews'),
            navDue = document.querySelectorAll('#nav-reviews-due'),
            profile = document.getElementById('profile-stats');
        
        switch (state) {
          case 'true':
            // navbar changes
            if (nav) {
              for (var i = 0, j = nav.length; i < j; i++) {
                nav[i].style.display = '';
                navDue[i].innerText = KantanReviews.due;
              }
            }
            
            // homepage profile changes
            if (profile) {
              profile.className = profile.className.replace('no-reviews', '');
              document.getElementById('reviews-due').innerText = window.KantanReviews.due;
              document.getElementById('reviews-upcoming').innerText = window.KantanReviews.upcoming;
            }
            break;
            
          case 'false':
            if (nav) {
              for (var i = 0, j = nav.length; i < j; i++) {
                nav[i].style.display = 'none';
              }
            }
            if (profile) profile.className += ' no-reviews';
            break;
            
          default:
            break;
        }
      });
    },
    
    
    // updates timer auto pause preference
    updateTimerAutoPause : function (caller) {
      KantanSettings.updateButton(caller, function (state) {
        state = state == 'ON' ? 'true' : 'false';
        
        localStorage.KN_AutoPauseTimer = state;
        
        if (window.Kantan) {
          Kantan.pref.autoPauseTimer = state;
        }

        if (state == 'ON') {
          document.addEventListener("visibilitychange", Kantan.startOrPauseTimerByVisibility);
        } else {
          document.removeEventListener("visibilitychange", Kantan.startOrPauseTimerByVisibility);
        }
      });
    },
    
    // creates the global settings stylesheet
    createStylesheet : function () {
      if (!KantanSettings.stylesheet) {
        KantanSettings.stylesheet = document.createElement('STYLE');
        KantanSettings.stylesheet.type = 'text/css';

        // append stylesheet to the document
        document.getElementsByTagName('HEAD')[0].appendChild(KantanSettings.stylesheet);
      }
    }
  };
  
  // apply global settings on page load
  if (storageOK) {
    KantanSettings.createStylesheet();
    
    // applies settings while the page is still loading, so long as they're not their default values
    // apply selected font size
    if (localStorage.KN_FontSize && localStorage.KN_FontSize != '100') {
      KantanSettings.updateFontSize(false, true);
    }
    
    // apply selected page width
    if (localStorage.KN_PageWidth && localStorage.KN_PageWidth != '100') {
      KantanSettings.updatePageWidth(false, true);
    }
    
    // apply custom CSS
    if (localStorage.KN_CustomCSS && localStorage.KN_CustomCSS != '') {
      KantanSettings.updateCustomCSS(false, true);
    }
  }
  
  
  // # FURIGANA STATE #
  document.documentElement.className += ' furigana-' + ((storageOK && localStorage.KN_Furigana == 'false') ? 'off' : 'on');
  
  
  // # DARK MODE #
  if (storageOK) {
    // automatically enables dark mode (once) based on the user's preferences
    // disabled since I prefer to show our light theme by default
    /*if (!localStorage.KN_DarkMode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      localStorage.KN_DarkMode = 'on';
    }*/
    
    // applies the dark mode theme on page load
    if (localStorage.KN_DarkMode == 'on' && !/[a-z]+-editor/i.test(window.location.pathname)) {
      document.write('<link id="dark-mode" href="' + getPaths() + 'resources/css/stylesheet-dark.css" rel="stylesheet">');
      document.documentElement.className += ' dark-mode';
    }
  }
  
  // # ANDROID API #
  if (/android/i.test(navigator.userAgent)) {
    document.write('<script src="' + getPaths() + 'cordova.js"></script>');
  }
  
  // # LANGUAGE #
  // applies the selected language on page load
  if (storageOK) {
    if (localStorage.KN_Lang && localStorage.KN_Lang != 'lang-en') {
      document.documentElement.className = document.documentElement.className.replace(/lang-(?:en|ja)/, 'lang-' + localStorage.KN_Lang);
    }
  }
  
  
  // # THEME #
  // applies the selected theme on page load
  if (storageOK) {
    if (localStorage.KN_Theme && localStorage.KN_Theme != 'blue') {
      document.write('<link id="website-theme" href="' + getPaths() + 'resources/css/themes/theme-' + localStorage.KN_Theme + '.css" rel="stylesheet">');
    }
  }
  
  
  // # DAYS STUDIED COUNTER #
  // increments the days studied on each visit once a day
  if (storageOK) {
    if (!localStorage.KN_DaysStudied) localStorage.KN_DaysStudied = 1;
    if (!localStorage.KN_LastStudied) localStorage.KN_LastStudied = new Date().setHours(0, 0, 0, 0);

    var today = new Date().setHours(0, 0, 0, 0),
        lastStudied = parseInt(localStorage.KN_LastStudied);

    if (today > lastStudied) {
      localStorage.KN_DaysStudied = parseInt(localStorage.KN_DaysStudied) + 1;
      localStorage.KN_LastStudied = today; 
    }
  }
  
  
  // # SRS REVIEW DATA #
  // gets all due and upcoming reviews
  window.getKantanReviews = function () {
    var SRS = storageOK && localStorage.KN_SRS || 'true',
        results = storageOK && localStorage.KantanResults, k, result;
    
    // calculate how many reviews are due, upcoming, and cache the exercises for later use
    if (SRS == 'true' && results) {
      window.KantanReviews = {
        due : 0,
        upcoming : 0,
        mastered : 0,
        retired : 0,
        
        list : {
          due : {},
          upcoming : {},
          mastered : {},
          retired : {}
        }
      };
      
      results = JSON.parse(localStorage.KantanResults);
      
      for (k in results) {
        result = unpackExerciseData(results[k]);
        if (result.review) {
          if (result.review == 'M') {
            KantanReviews.mastered++;
            KantanReviews.list.mastered[k] = result;
            
          } else if (result.review == 'R') {
            KantanReviews.retired++;
            KantanReviews.list.retired[k] = result;
            
          } else if (getReviewData(result.review).days <= 0) {
            KantanReviews.due++;
            
            if (!KantanReviews.list.due[result.review]) KantanReviews.list.due[result.review] = {};
            KantanReviews.list.due[result.review][k] = result;

          } else {
            KantanReviews.upcoming++;
            
            if (!KantanReviews.list.upcoming[result.review]) KantanReviews.list.upcoming[result.review] = {};
            KantanReviews.list.upcoming[result.review][k] = result;
          }
        }
      }
    }
  };
  window.getKantanReviews();
  
  
  // # FONT PRE-LOADING #
  // pre-loads fonts for kanji canvases
  window.preLoadFonts = function () {
    // function used to redraw canvases once the font is loaded
    var redraw = function () {
      if (window.KanjiCanvas) {
        for (var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length; i < j; i++) {
          if (KanjiCanvas['canvas_' + a[i].id]) {
            KanjiCanvas.redraw(a[i].id, true);
          }
        }
      }
    };
    
    // loop through arguments to form @font-face rules and apply events for loading fonts
    for (var a = arguments, i = 0, j = arguments.length, styles = '', fonts = '', font; i < j; i++) {
      font = a[i].replace(/\..*?$/, '');
      fonts += font + (i == j - 1 ? '' : ', ');
      styles += 
        '@font-face {'+
          'font-family:"' + font + '";'+
          'src:url(' + getPaths() + 'resources/fonts/' + a[i] + ') format("' + (/otf/.test(a[i]) ? 'opentype' : /ttf/ ? 'truetype' : '') + '");'+
        '}\n';
    }
    
    // apply @font-face rules to the document
    document.write('<style>' + styles + '</style>');
    
    // load and render fonts
    if (document.fonts && document.fonts.load) {
      document.fonts.load('10px ' + fonts).then(redraw);
    } 
    // fallback
    else {
      document.write('<span style="font-family:' + fonts + ';opacity:0;position:absolute;font-size:0;height:0;width:0;">' + fonts + '</span>');
      window.setTimeout(redraw, 1500);
    }
  };
  
  
  // # LIMITED MODE WARNING #
  // If cookies are blocked, Kantan Japanese will run in limited mode. Settings are not remembered in this mode and certain features, such as dark mode, are unavailable.
  if (!navigator.cookieEnabled) {
    console.warn('Cookies are not available either due to host or browser settings. Kantan Japanese will function in limited mode where settings are not remembered and certain features are unavailable. This issue can commonly be resolved by enabling third-party cookies. Please see the following page for help.\nhttps://sethclydesdale.github.io/kantan-japanese/help/stuck-loading/\n\nIf the issue still occurs after enabling third-party cookies, please contact the developer for further assistance.\nhttps://github.com/SethClydesdale/kantan-japanese/issues');
  }
  
  
  // AJAX page getter
  window.Get = function (url, callback, type) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        callback(this.response); // callback on success
      } else {
        callback('error');
      }
    };

    // set response type
    if (typeof type != 'undefined') {
      xhttp.responseType = type;
    }

    // open and send the request
    xhttp.open('get', url, true);
    xhttp.send();

    return xhttp;
  };
  
  
  // # GET AND LOAD LOCAL SCRIPTS #
  window.loadedScripts = {};
  
  // callback value "firstRun" = true or false; tells if this is the first time the script has run
  // check = function that returns true or false when checking for a global variable and such
  window.getScript = function (file, callback, check) {
    if (check) {
      loadedScripts[file] = check();
    }
    
    if (!loadedScripts[file]) {
      loadedScripts[file] = true;

      var script = document.createElement('SCRIPT');
      script.src = /cordova/.test(file) ? file : getPaths() + 'resources/javascript/' + file;
      script.onload = function () {
        if (callback) callback(true);
      };
      document.body.appendChild(script);
      
    } else {
      callback && callback(false);
    }
  };
  
  
  // sanitizes strings to protect from XSS in user input answers
  window.sanitizeString = function (str) {
    return str.replace(/<script/gi, '&lt;script')
               .replace(/<\/script>/gi, '&lt;/script&gt;')
               .replace(/(data-)?\b(on[a-z]+\s*=\s*)('[^']*'|"[^"]*"|[^\s>]+)/gi, function(match, dataPrefix, onEvent, val) {
                 return (dataPrefix || 'data-') + onEvent + val;
               })
               .replace(/href\s*=\s*(['"]?)javascript:[^>]*\1/gi, 'href=$1#javascript-disabled$1');
  };
  
  
  // copies text to the user's clipboard
  window.CopyText = function (text, caller, callback) {
    if (text) {
      // cache original HTML
      if (!window.CopyTextDefault && caller) {
        window.CopyTextDefault = caller.innerHTML;
      }
      
      // clear text change timeout
      if (window.CopyTextTimeout) {
        clearTimeout(CopyTextTimeout);
      }
      
      // try copying the text
      try {
        navigator.clipboard.writeText(text);
        
        if (caller) {
          caller.innerHTML = '<i class="fa">&#xf00c;</i><span class="en">Copied!</span><span class="ja">コピーした！</span>';
        }
        
        callback && callback(true);

      } catch (err) {
        console.error(err);
                
        if (caller) {
          caller.innerHTML = '<i class="fa">&#xf071;</i><span class="en">Copy Failed</span><span class="ja">コピーが失敗した</span>';
        }
        
        callback && callback(false);
      }
      
      // return text default state
      window.CopyTextTimeout = setTimeout(function () {
        caller.innerHTML = CopyTextDefault;
        delete window.CopyTextTimeout;
        delete window.CopyTextDefault;
      }, 1000);
      
    } else {
      return false;
    }
  };
  
  console.log('%cKan-tan wants you!🫵',
    'color:#39C;'+
    'font-family:Arial;'+
    'font-size:32px;'+
    'font-weight:bold;'+
    'text-shadow:#000 2px 2px 0px;'
  );
  console.log("Kantan Japanese is a free and open source project for learning, practicing, and teaching the Japanese language. So, if you're passionate about the Japanese language or web development, we welcome you to contribute to our mission of making the best free resource for Japanese learners and teachers around the world!\n➡️ https://github.com/SethClydesdale/kantan-japanese")
}(window, document));
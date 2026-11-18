// # MODIFICATIONS FOR ALL PAGES #
// For scripts that can execture before the DOM is completely ready
(function (window, document) {
  'use strict';
  
  // # NAVIGATION AND SOCIAL #
  var header = document.querySelector('header');
  if (header) {
    // navigation
    header.insertAdjacentHTML('afterend',
      '<div id="navbar">'+
        '<div id="navbar-inner">'+
          '<a id="nav-home" href="' + getPaths() + '"' + (getPaths() == '' ? ' class="active-page"' : '') + '><i class="fa">&#xf015;</i><span class="en">Home</span><span class="ja">トップページ</span></a>'+
          '<a id="nav-lessons" href="' + getPaths() + 'lessons/"' + (/\/lessons\/(?:index|$)/.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf19d;</i><span class="en">Lessons</span><span class="ja">レッスン一覧</span></a>'+
          '<a id="nav-reviews" href="' + getPaths() + 'reviews/"' + (/\/reviews\/(?:index|$)/.test(window.location.pathname) ? ' class="active-page"' : '') + ' ' + ((storageOK && localStorage.KN_SRS || 'true') == 'false' ? 'style="display:none;"' : '') + '><i class="fa">&#xf274;</i><span class="en">Reviews</span><span class="ja">復習</span><span id="nav-reviews-due">' + (window.KantanReviews && KantanReviews.due > 0 ? KantanReviews.due : '') + '</span></a>'+
          '<a id="nav-profile" href="#profile"' + (getPaths() == '' ? '' : ' onclick="Kantan.openProfile(); return false;"') + '><i class="fa">&#xf007;</i><span class="en">Profile</span><span class="ja">プロフィール</span></a>'+
          //'<a id="nav-grammar" href="' + getPaths() + 'lessons/references/grammar-index/"' + (/\/grammar-index\//.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf02d;</i><span class="en">Grammar</span><span class="ja">文法</span></a>'+
          '<a id="nav-resources" href="' + getPaths() + 'learning-resources/"' + (/\/learning-resources\//.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf15c;</i><span class="en">Resources</span><span class="ja">学習資料</span></a>'+
          '<a id="nav-help" href="' + getPaths() + 'help/"' + (/\/help\//.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf059;</i>FAQ</a>'+
          //'<a id="nav-download" href="' + getPaths() + 'download/"' + (/\/download\//.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf019;</i><span class="en">Download</span><span class="ja">ダウンロードする</span></a>'+
          '<a id="nav-contribute" href="' + getPaths() + 'contribute/"' + (/\/contribute\//.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf2b5;</i><span class="en">Contribute</span><span class="ja">貢献する</span></a>'+
          '<a id="nav-contact" href="' + getPaths() + 'contact/"' + (/\/contact\//.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf1d8;</i><span class="en">Contact</span><span class="ja">お問い合わせ</span></a>'+
          '<a id="nav-about" href="' + getPaths() + 'about/"' + (/\/about\//.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf0c0;</i><span class="en">About</span><span class="ja">プロジェクトについて</span></a>'+
          '<a id="nav-donate" href="' + getPaths() + 'donate/"' + (/\/donate\//.test(window.location.pathname) ? ' class="active-page"' : '') + '><i class="fa">&#xf004;</i><span class="en">Donate</span><span class="ja">寄付する</span></a>'+
          '<a id="nav-settings" href="#settings" onclick="KantanSettings.manager(); return false;"><i class="fa">&#xf013;</i><span class="en">Settings</span><span class="ja">設定</span></a>'+
        '</div>'+
      '</div>'
    );
    
    // social links
    header.insertAdjacentHTML('beforeend',
      '<div id="social-links" class="social-links">'+
        '<span><a href="https://x.com/KantanJapanese" target="_blank" class="social-twitter" title="Follow us on X (Twitter)"></a></span>'+
        '<span><a href="https://www.reddit.com/r/KantanJapanese/" target="_blank" class="social-reddit" title="Discuss Japanese with us on Reddit"></a></span>'+
      '</div>'
    );
  }
  
  // # ANNOUNCEMENTS #
  var navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.insertAdjacentHTML('afterend',
      '<div id="announcement">'+
        '<div id="announce-inner" class="content-block">'+
          '<h3><i class="fa">&#xf0a1;</i> <span class="en">News and Info</span><span class="ja">ニュースと情報</span></h3>'+
          '<div id="announce-list">'+
            '<div id="announcement-controls" style="display:none;">'+
              '<button class="button announce-controls button-left" onclick="KantanAnn.next(-1, true);"><i class="fa">&#xf060;</i></button>'+
              '<button class="button announce-controls button-right" onclick="KantanAnn.next(+1, true);"><i class="fa">&#xf061;</i></button>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'
    );
    
    window.KantanAnn = {
      rotation : false, // determines if the announcements rotate
      //edition : /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd', // determines current edition

      // announcement messages
      // params:
      // date: [OPTIONAL] adds a date to the announcement, useful for highlighting updates and what not.
      // content: message body for the announcement; write your announcements here!
      // [NOT USED CURRENTLY; GSR remnant] edition: [OPTIONAL] restricts the announcement to a specific edition, possible values are: 3rd || 2nd, announcements are global by default
      msg : [
        {
          date : '10/03/25',
          content : "Welcome to Kantan Japanese! The website is under development, but we still hope that you find what's currently available useful to your Japanese studies!"
        },

        {
          content : 'Want to stay up to date on the latest changes made to Kantan Japanese? You can follow updates via <a href="https://github.com/SethClydesdale/kantan-japanese/commits/main">GitHub</a>, <a href="https://twitter.com/search?q=%23KantanJapanese%20from%3Asethc1995&src=typed_query&f=live">Twitter</a>, or <a href="https://ko-fi.com/sethc95/posts">Ko-fi</a>. Feel free to also contact us on <a href="https://github.com/SethClydesdale/kantan-japanese/issues">GitHub\</a> if you have any questions or feedback.'
        },

        {
          content : 'Have a question about the site? Check out the <a href="' + getPaths() + 'help/">FAQ</a>! If you can\'t find an answer to your question, feel free to contact us via <a href="https://github.com/SethClydesdale/kantan-japanese/issues">GitHub\'s issues</a> and we\'ll try to answer your question in a timely manner.'
        },

        {
          content : 'Find a bug or mistake on the site? Want to submit a suggestion or give us feedback? Check out the <a href="' + getPaths() + 'feedback/">feedback page</a> for more information. We\'d love to hear from you!'
        },

        {
          content : 'Don\'t have a network connection all the time? Kantan Japanese can be used offline as well! Head on over to the <a href="' + getPaths() + 'download/">download page</a> to get the latest release.'
        },

        {
          content : 'If you found this website helpful for studying Japanese, please consider making <a href="' + getPaths() + 'donate/">a donation</a> to help support our work. Thank you!'
        }
      ],

      index : 0,
      list : document.getElementById('announce-list'),


      // shows the next announcement
      next : function (n, manual) {
        // hide old message
        KantanAnn.msg[KantanAnn.index].className += ' announce-hidden';

        // add +1 or -1 depending on the button press
        if (typeof n == 'number') {
          KantanAnn.index += n;

          if (KantanAnn.index == -1) {
            KantanAnn.index = KantanAnn.msg.length - 1;
          }
        } 

        // for automatic rotation increase index by 1
        else {
          KantanAnn.index++;
        }

        // reset index if it exceeds the current announcements
        if (!KantanAnn.msg[KantanAnn.index]) {
          KantanAnn.index = 0;
        }

        // show new message
        KantanAnn.msg[KantanAnn.index].className = KantanAnn.msg[KantanAnn.index].className.replace(' announce-hidden', '');

        // reset rotation if messages were moved manually
        if (KantanAnn.rotation && manual) {
          window.clearInterval(KantanAnn.rotator);
          KantanAnn.rotate();
        }
      },


      // start announcement rotation
      rotate : function () {
        KantanAnn.rotator = window.setInterval(KantanAnn.next, 15000);
      },


      // sets up the announcements
      init : function () {
        // set up if more than 1 announcement
        if (KantanAnn.msg.length > 1) {
          document.getElementById('announcement-controls').style.display = '';

          // parse announcements
          for (var i = 0, j = KantanAnn.msg.length, ann = '', first = true; i < j; i++) {
            if (!KantanAnn.msg[i].edition || KantanAnn.msg[i].edition.toLowerCase() == KantanAnn.edition) {
              ann += '<div class="announcement' + (first ? '' : ' announce-hidden') + '">'+
                (KantanAnn.msg[i].date ? '<span class="date">' + KantanAnn.msg[i].date + '</span>' : '')+
                KantanAnn.msg[i].content+
              '</div>';

              // first announcement is shown, so hide the rest
              first && (first = false);
            }
          }

          // add announcements to the document
          KantanAnn.list.insertAdjacentHTML('beforeend', ann);
          KantanAnn.msg = document.querySelectorAll('.announcement');

          // commence rotation if enabled
          if (KantanAnn.rotation) {
            KantanAnn.rotate();
          }
        }
      }
    };

    // initialize the announcement module
    KantanAnn.init();
  }
  
}(window, document));
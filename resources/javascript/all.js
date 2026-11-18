// # MODIFICATIONS FOR ALL PAGES #
// For scripts that need to execute when the DOM is completely ready
(function (window, document) {
  'use strict';
  
  // # OFFLINE LINK MODIFICATIONS #
  // appends index.html to links if this project is hosted on the local file system
  window.formatLocalLinks = function () {
    if (window.location.protocol == 'file:' || /localhost/.test(window.location.href)) {
      for (var a = document.getElementsByTagName('A'), i = 0, j = a.length; i < j; i++) {
        if (!/http/.test(a[i].href) || /localhost/.test(a[i].href)) {
          if (/\/$/.test(a[i].href)) {
            a[i].href += 'index.html';
          } else if (/\/#.*?$/.test(a[i].href)) {
            a[i].href = a[i].href.replace(/(#.*?)$/, 'index.html$1');
          } else if (/\/\?.*?$/.test(a[i].href)) {
            a[i].href = a[i].href.replace(/(\?.*?)$/, 'index.html$1');
          }
        }
      }
    }
  };
  formatLocalLinks();
  
  
  // # SECTION ANCHORS #
  // adds an anchor link to headings, so students can get the direct link for a section
  window.addSectionAnchors = function () {
    var content = document.getElementById('content');
    
    if (content) {
      for (var h = content.querySelectorAll('h1, h2, h3, h4, h5, h6'), i = 0, j = h.length; i < j; i++) {
        if (h[i].id && !/class="anchor/.test(h[i].innerHTML)) {
          h[i].insertAdjacentHTML('afterbegin', '<a href="#' + h[i].id + '" class="anchor fa"><span class="anchor-icon">&#xf0c1;</span></a>');
        }
      }
    }
  };
  addSectionAnchors();
  
  
  // # IMAGE LIGHTBOX #
  // attach lightbox event to images
  window.bindLightbox = function () {
    for (var img = document.querySelectorAll('.lightbox'), i = 0, j = img.length; i < j; i++) {
      // apply width attribute to max width
      if (img[i].getAttribute('width')) {
        img[i].style.maxWidth = img[i].getAttribute('width') + 'px';
      }

      // add click/key handler for the lightbox
      img[i].onclick = function () {
        Kantan.viewImage(this.src, this.dataset.source);
      };

      img[i].onkeyup = function (e) {
        if (e.key.toLowerCase() == 'enter') {
          Kantan.viewImage(this.src, this.dataset.source);
        }
      };

      // add tooltip so the user knows they can view the full image
      img[i].title = KN_Lang == 'ja' ? '画像の全体を見る' : 'View full image';

      // make image focusable
      img[i].tabIndex = 0;
    }
  };
  bindLightbox();
  
  
  // # DARK MODE AND SETTINGS #
  // Allows the student to switch to a dark version. (Great for late night studying!)
  // Also adds a button to manage global site settings.
  if (storageOK) {
    var footer = document.querySelector('footer'),
        button = document.createElement('LABEL'),
        container = document.createElement('DIV'),
        settings = document.createElement('A'),
        ver = document.createElement('A');
    
    if (footer) {
      // set button params
      button.id = 'light-switch';
      button.tabIndex = 0;
      button.innerHTML = '<input id="light-switch-checkbox" type="checkbox" ' + (localStorage.KN_DarkMode == 'on' ? 'checked="true"' : '') + '/><div></div>';

      // toggle dark mode when the enter key is pressed while focused
      button.onkeyup = function (e) {
        if (e.key == 'Enter') this.firstChild.click();
      };

      // toggles dark mode when the checkbox state changes
      button.firstChild.onchange = function () {
        var root = document.documentElement, css;

        if (this.checked) { // turn dark mode on
          localStorage.KN_DarkMode = 'on';

          // add dark mode css to the head
          css = document.createElement('LINK');
          css.id = 'dark-mode';
          css.rel = 'stylesheet';
          css.href = getPaths() + 'resources/css/stylesheet-dark.css';

          document.head.appendChild(css);
          root.className += ' dark-mode';
          
          // switch codemirror styles
          if (Kantan.notesEditor) Kantan.notesEditor.setOption('theme', 'ayu-dark');
          if (window.cmEditor) cmEditor.setOption('theme', 'ayu-dark');

        } else { // turn dark mode off
          localStorage.KN_DarkMode = 'off';

          // remove dark mode css
          css = document.getElementById('dark-mode');
          css && document.head.removeChild(css);
          root.className = root.className.replace(' dark-mode', '');
          
          // switch codemirror styles
          if (Kantan.notesEditor) Kantan.notesEditor.setOption('theme', 'default');
          if (window.cmEditor) cmEditor.setOption('theme', 'default');
        }

        // change canvas colors
        if (window.KanjiCanvas) {
          KanjiCanvas.darkMode = document.querySelector('.dark-mode') ? true : false;
          KanjiCanvas.quizOver = document.querySelector('.quiz-over') ? true : false;

          for (var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length; i < j; i++) {
            if (KanjiCanvas['canvas_' + a[i].id]) KanjiCanvas.redraw(a[i].id, true, window.Kantan ? Kantan.strokeNumberDisplay : false);
          }
        }
      };

      // set container params
      container.id = 'light-switch-container';
      container.innerHTML = '<label id="light-switch-label" for="light-switch-checkbox"><span class="en">Dark Mode</span><span class="ja">ダークモード</span> </label>';

      // settings button
      settings.id = 'kantan-site-settings';
      settings.innerHTML = '<i class="fa">&#xf013;</i>';
      settings.title = KN_Lang == 'ja' ? 'ウェブサイトの設定' : 'Site Settings';
      settings.href = '#';
      settings.onclick = function () {
        // prevent opening popup when one is already opened
        // mainly for the exercise selector. If using the shortcut you'll be stuck loading if you haven't selected an exercise yet.
        if (document.getElementById('kantan-modal')) return false;

        // open settings manager
        KantanSettings.manager();

        // prevent normal link behavior
        return false;
      };

      // version number
      ver.id = 'kantan-version';
      ver.innerText = 'v' + KantanVersion;
      ver.href = 'https://github.com/SethClydesdale/kantan-japanese/releases/tag/v.' + KantanVersion;
      ver.onclick = function () {
        Kantan.viewVersion();
        return false;
      }

      // add the elements to the document
      container.appendChild(button);
      container.appendChild(settings);
      container.appendChild(ver);
      footer.appendChild(container);
    }
  }
  
  
  // # KEYBOARD SHORTCUTS #
  // various keyboard shortcuts used around the website EXCEPT on our page editors
  !/\/[a-z]+-editor\//.test(location.pathname) && document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.altKey || e.metaKey && e.shiftKey) {
      var button;

      // check what key was pressed
      switch (e.key.toLowerCase()) {
        // previous exercise (ctrl+alt+left)
        case 'left':
        case 'arrowleft':
          button = document.querySelector('.prev-ex');
          break;

        // next exercise (ctrl+alt+right)
        case 'right':
        case 'arrowright':
          button = document.querySelector('.next-ex');
          break;

        // toggle quick nav (ctrl+alt+n)
        case 'n':
          button = document.getElementById('toggle-exercises');
          break;

        // toggle quick jisho (ctrl+alt+q)
        case 'q':
          button = document.getElementById('quick-jisho-toggle');
          break;

        // toggle dark mode (ctrl+alt+d)
        case 'd':
          button = document.getElementById('light-switch');
          break;

        // toggle furigana (ctrl+alt+f)
        case 'f':
          button = document.getElementById('toggle-furigana') || document.getElementById('nav-furigana');
          break;

        // random exercise (ctrl+alt+r)
        case 'r':
          button = document.getElementById('random-exercise');
          break;

        // open site settings (ctrl+alt+m)
        case 'm':
          button = document.getElementById('kantan-site-settings');
          break;
          
        // check answers (ctrl+alt+c)
        case 'c':
          button = document.getElementById('check-answers-button');
          break;
          
        // toggle IME mode (ctrl+alt+k)
        case 'k':
          button = window.Kantan && Kantan.pref.romajiInput == 'true' ? document.getElementById('ime-toggle') : null;
          break;
          
        // toggle language (ctrl+alt+l)
        case 'l':
          KantanSettings.updateLang(null, KN_Lang == 'ja' ? 'en' : 'ja');
          break;

        default:
          break;
      }

      // prevent default behavior and click the button
      if (button) {
        e.preventDefault();
        button.click();
      }
    }
    
    else if (e.key.toLowerCase() == 'escape') {
      if (window.KantanModal && KantanModal.isOpen) {
        var button = document.getElementById('kantan-modal-close');
        if (button) button.click();
      }
    }
    
    // shortcuts for multi-choice options
    // ALT + A/B/C/D/...
    if (Kantan.active.type == 'multi' && e.altKey) {
      // Use the physical keyboard press to ignore the special character produced from the modifier
      var answer = e.code.replace('Key', '').toUpperCase()
      var opt = document.querySelector('#quiz-q' + Kantan.stats.solved + ' div[data-option="' + answer + '"]');

      if (opt) {
        opt.click();
        e.preventDefault();
      }
    }
  });
  
  
  // # VERSION CHECK #
  // check for update if using offline/local version of Kantan Japanese
  if (window.Kantan && Kantan.local && storageOK && (!localStorage.KN_VersionCheck || +new Date > +localStorage.KN_VersionCheck)) {
    Kantan.checkForUpdate(function (status, data) {
      // stops checking for updates for 24hrs
      localStorage.KN_VersionCheck = +new Date + (24*60*60*1000);
      
      if (status == 'new') {
        // TODO:
        // Files offered for download should be based on the install being used. For example, raw = zip, android = apk, etc,
        // Instructions should also reflect the file offered for download
        // use KantanPlatform to achieve this (see head.js for values)
        // remember to apply these changes to viewVersion in kantan.js too
        KantanModal.open({
          title : 'New Version Found',
          content :
            '<p>A new version of Kantan Japanese has been found on GitHub! Click the button below to download the latest version.</p>'+
            '<div class="center">'+
              '<strong>Current Version:</strong> ' + KantanVersion + '<br><br>'+
              '<a class="button green" href="https://github.com/SethClydesdale/kantan-japanese/archive/refs/tags/v.' + data.version + '.zip"><i class="fa">&#xf019;</i>Download Version ' + data.version + '</a><br>'+
              '<a class="button purple" href="https://github.com/SethClydesdale/kantan-japanese/releases/tag/v.' + data.version + '" target="_blank"><i class="fa">&#xf09b;</i>View Release Notes</a><br>'+
            '</div>'+
            '<p>'+
              (data.notes ? data.notes : // show special update instructions from the version-data file, if any
                'Once downloaded, simply unzip the contents and copy them to your current installation folder to update your local copy of Kantan Japanese.'
              )+
            '</p>'
        });
      }
    });
  }
}(window, document));
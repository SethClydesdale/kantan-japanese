// preview specific styles
// used for hiding content unrelated to what is being edited
var previewStyles = '<style>'+
  'header, #navbar, #announcement, .more-exercises, footer, #toggle-exercises, #edit-page { display:none; }'+
  '#content { padding:0; }'+
  '.drag-quiz #content { padding-bottom:150px; }'+
  '.content-block { margin:0; max-width:100% !important; width:100% !important; }'+
  '.editor-highlight { box-shadow:0 0 0 3px rgba(255, 193, 7, 0.5) !important; transition:200ms; }'+
'</style>';

// scripts for modifying the preview content, such as preventing in-frame page navigation
var previewScripts = [
  '    <script>',
  '      document.addEventListener("click", function(e) {',
  '        var link = e.target.closest ? e.target.closest("a") : null;',
  '        if (link && !/^#/.test(link.getAttribute(\'href\')) && !/translation-toggler/.test(link.className)) { window.open(link.href, \'_blank\').focus(); e.preventDefault(); }',
  '      });',
  '      document.addEventListener("submit", function(e) {',
  '        e.preventDefault();',
  '      });',
  '    <\/script>'
].join('\n');

// default buttons for the editors
var EDITOR_BASE_BUTTONS = [ // these buttons are primarily unstyled HTML elements
  { row : 'ROW1', label: '<ruby>', insert: ['<ruby>', '<rt></rt></ruby>'], tooltip : 'CTRL+ALT+T' },
  { label: '<p>', insert: ['<p>', '</p>'], tooltip : 'CTRL+ALT+M' },
  { label: '<br>', insert: '<br>', tooltip : 'CTRL+ALT+N' },
  { label: '<b>', insert: ['<b>', '</b>'], tooltip : 'CTRL+ALT+B' },
  { label: '<em>', insert: ['<em>', '</em>'], tooltip : 'CTRL+ALT+E' },
  { label: '<small>', insert: ['<small>', '</small>'] },
  { label: '<h3>', insert: ['<h3 class="section-title">', '</h3>'] },
  { label: '<h4>', insert: ['<h4 class="sub-title">', '</h4>'] },
  { label: '<h4> 2', insert: ['<h4 class="sub-title-color"><span class="num">1</span>', '</h4>'] },
  { label: '<a>', insert: ['<a href="">', '</a>'], tooltip : 'CTRL+ALT+A' },
  { label: '<a> (lesson)', insert: ['<a href="../../../lessons/lesson-0/">', '</a>'] },
  { label: '<img>', insert: ['<img class="lightbox" src="','" width="" data-source="">'], tooltip : 'CTRL+ALT+I' },
  { label: '<hr>', insert: '<hr>' },
  { label: '<table>', insert: ['<table class="table">\n  <tr class="table-head">\n    <td>', '</td>\n    <td></td>\n    <td></td>\n  </tr>\n  <tr>\n    <td></td>\n    <td></td>\n    <td></td>\n  </tr>\n</table>'] },
  { label: '<ol>', insert: ['<ol>\n  <li>', '</li>\n</ol>'] },
  { label: '<ul>', insert: ['<ul>\n  <li>', '</li>\n</ul>'] },
  { label: '<code>', insert: ['<code>', '</code>'] }
];

var EDITOR_FORMAT_BUTTONS = [ // these buttons are for unique formatting elements, presets, and other things
  { row : 'ROW2', label: 'center', insert: ['<div class="center">', '</div>'], tooltip : 'CTRL+ALT+C' },
  { label: 'emote', action: 'openEmotePicker' },
  { label: 'icon', action: 'openFA' },
  { label: 'highlight', insert: ['<b class="main-color">', '</b>'], tooltip : 'CTRL+ALT+H' },
  { label: 'highlight 2', insert: ['<span class="main-color">', '</span>'] },
  { label: 'underline', insert: ['<span class="ul-color">', '</span>'], tooltip : 'CTRL+ALT+U' },
  { label: 'strike', insert: ['<span class="double-strike">', '</span>'], tooltip : 'CTRL+ALT+S' },
  { label: 'outline', insert: ['<span class="outline-1">', '</span>'], tooltip : 'CTRL+ALT+O' },
  { label: 'outline 2', insert: ['<span class="outline-2">', '</span>'] },
  { label: 'tag', insert: ['<span class="color-tag">', '</span>'] },
  { label: 'spoiler', insert: ['<span class="spoiler">', '</span>'], tooltip : 'CTRL+ALT+Q' },
  { label: 'columns', insert: ['<div class="columns-2 clear">\n  <div>column 1', '</div>\n  <div>column 2</div>\n</div>'] },
  { label: 'text passage', insert: ['<div class="sub-section text-passage">', '</div>'] },
  { label: 'vocab', insert: ['<div class="tango">\n  <span class="kotoba">日本語　Japanese', '</span>\n</div>'] },
  { label: 'note', insert: ['<div class="note">', '</div>'] }
];


// ctrl+s override for quick saving article/exercise files
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key == 's' && !e.altKey) {
    e.preventDefault();
    document.getElementById('download-btn').click();
  }
});

// keyboard shortcuts for the toolbar buttons
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.altKey || e.metaKey && e.shiftKey) {
  var button;

    // check what key was pressed
    switch (e.key.toLowerCase()) {
      // insert bold tag (ctrl+alt+b)
      case 'b':
        button = document.querySelector('.button-b');
        break;
        
      // insert em tag (ctrl+alt+e)
      case 'e':
        button = document.querySelector('.button-em');
        break;
        
      // insert hightlight tag (ctrl+alt+h)
      case 'h':
        button = document.querySelector('.button-highlight');
        break;
        
      // insert underline tag (ctrl+alt+u)
      case 'u':
        button = document.querySelector('.button-underline');
        break;
        
      // insert strike tag (ctrl+alt+s)
      case 's':
        button = document.querySelector('.button-strike');
        break;
        
      // insert outline tag (ctrl+alt+o)
      case 'o':
        button = document.querySelector('.button-outline');
        break;
        
      // insert ruby tag (ctrl+alt+t)
      case 't':
        button = document.querySelector('.button-ruby');
        break;
        
      // insert center tag (ctrl+alt+c)
      case 'c':
        button = document.querySelector('.button-center');
        break;
        
      // insert link tag (ctrl+alt+a)
      case 'a':
        button = document.querySelector('.button-a');
        break;
        
      // insert image tag (ctrl+alt+i)
      case 'i':
        button = document.querySelector('.button-img');
        break;
        
      // insert <br> tag (ctrl+alt+n)
      case 'n':
        button = document.querySelector('.button-br');
        break;
        
      // insert <p> tag (ctrl+alt+m)
      case 'm':
        button = document.querySelector('.button-p');
        break;
        
      // insert spoiler tag (ctrl+alt+q)
      case 'q':
        button = document.querySelector('.button-spoiler');
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
});

/**
 * Helper function to inject custom buttons into a specific position
 * 
 * @param {Array} baseArray - The original array (e.g., EDITOR_BASE_BUTTONS).
 * @param {String} targetLabel - The label of the existing button you want to place this new button next to (e.g., '<p>').
 * @param {Object|Array} newButtons - Your new button object, or an array of button objects.
 * @param {String} position - 'before' or 'after' (defaults to 'after').
 * @returns {Array} A new array with your custom button(s) injected.
 */
function insertEditorButton(baseArray, targetLabel, newButtons, position) {
  var newArray = baseArray.slice(), // Clone the array so we don't modify the global one
      index = newArray.findIndex(function(btn) { return btn.label === targetLabel; }),
      // normalize the input so it's always an array
      buttonsToAdd = Array.isArray(newButtons) ? newButtons : [newButtons],
      insertIndex;
  
  if (index === -1) {
    // if the target label isn't found, just add the new buttons to the end
    newArray = newArray.concat(buttonsToAdd);
  } else {
    // calculate the insertion index based on 'before' or 'after'
    insertIndex = (position === 'before') ? index : index + 1;
    
    // inject the array of new buttons into the copied array
    Array.prototype.splice.apply(newArray, [insertIndex, 0].concat(buttonsToAdd));
  }
  
  return newArray;
};
/*
// EXAMPLE
var customBaseButtons = insertEditorButton(EDITOR_BASE_BUTTONS, '<p>', { 
  label: '<div>', 
  insert: ['<div>', '</div>'] 
}, 'after');

var customFormatButtons = insertEditorButton(EDITOR_FORMAT_BUTTONS, 'outline box', { 
  label: 'new color', 
  insert: ['<span class="new-color">', '</span>'] 
}, 'before');

var buttons = customBaseButtons.concat([
  { label: 'answer', insert: '{ANSWER|HINT}' },
  // other buttons
], customFormatButtons);
*/

// initialize CodeMirror instance
function initCodeMirrorEditor(textareaEl) {
  // duplicates text when ctrl+d is pressed
  var duplicateCommand = function(cm) {
    var doc = cm.getDoc(),
        selections = doc.listSelections();

    if (doc.somethingSelected()) {
      cm.replaceSelections(selections.map(function(range) {
        var selection = doc.getRange(range.from(), range.to());
        return selection + selection;
      }), 'around');
    } else if (selections.length > 1) {
      cm.operation(function() {
        var lineSelections = new Array(selections.length);

        for (var i = selections.length - 1; i >= 0; i--) {
          var range = selections[i],
              pos = range.head,
              lineNumber = pos.line,
              lineText = doc.getLine(lineNumber),
              insertPos = { line: lineNumber + 1, ch: 0 };

          doc.replaceRange(lineText + '\n', insertPos, insertPos, '+input');

          lineSelections[i] = {
            anchor: { line: lineNumber, ch: 0 },
            head: { line: lineNumber + 1, ch: lineText.length }
          };
        }

        doc.setSelections(lineSelections);
      });
    } else {
      var cursor = doc.getCursor(),
          line = doc.getLine(cursor.line);

      doc.replaceRange(line + '\n', { line: cursor.line, ch: 0 });
    }
  },

  // wraps selected text with {} or [] when { or [ is pressed
  wrapSelection = function(left, right) {
    return function(cm) {
      var doc = cm.getDoc(),
          selections = doc.listSelections();

      if (doc.somethingSelected()) {
        cm.operation(function() {
          for (var i = selections.length - 1; i >= 0; i--) {
            var range = selections[i],
                from = range.from(),
                to = range.to(),
                selection = doc.getRange(from, to),
                replacement = left + selection + right,
                newFrom,
                newTo;

            doc.replaceRange(replacement, from, to, '+input');
            newFrom = doc.posFromIndex(doc.indexFromPos(from) + left.length);
            newTo = doc.posFromIndex(doc.indexFromPos(from) + left.length + selection.length);
            selections[i] = { anchor: newFrom, head: newTo };
          }
        });

        doc.setSelections(selections);
      } else {
        return CodeMirror.Pass; // let CodeMirror handle normal insertion if nothing is highlighted
      }
    };
  };

  return CodeMirror.fromTextArea(textareaEl, {
    mode: "htmlmixed",
    lineNumbers: true,
    lineWrapping: true,
    theme: document.querySelector('.dark-mode') ? 'ayu-dark' : 'default',
    inputStyle: "textarea",
    spellcheck: true,
    styleActiveLine: true,
    matchTags: { bothTags: true },
    tabSize : 2,
    autoCloseTags: {
      indentTags: [
        "ul", "ol", "table", "thead", "tbody", "tfoot", "tr"
      ]
    },
    extraKeys: {
      "Ctrl-D": duplicateCommand,
      "Cmd-D": duplicateCommand, // for mac
      "'{'": wrapSelection('{', '}'),
      "'['": wrapSelection('[', ']'),
      "'('": wrapSelection('(', ')'),
      "'\"'": wrapSelection('"', '"'),
      "'\''": wrapSelection("'", "'"),
    }
  });
}

// build the CodeMirror toolbar based on button configurations
function buildCodeMirrorToolbar(toolbarEl, cmEditor, buttons) {
  // used to separate rows
  var row = 'ROW1',
      rows = {
        ROW1 : '',
        ROW2 : ' dark-blue',
        ROW3 : ' purple'
      },
      separate = false;
  
  buttons.forEach(function(btn) {
    var button = document.createElement('button');
    
    if (btn.row && btn.row != row) {
      row = btn.row;
      separate = true;
    }
    
    btn.label = btn.label.replace(/^ROW\d+/, '');
    button.className = 'button' + rows[row] + ' button-' + btn.label.replace(/\s/g, '-').replace(/<|>/g, '').toLowerCase();
    button.textContent = btn.label;
    if (btn.tooltip) button.title = btn.tooltip;
    
    // handler for button clicks
    // install the functions for unique buttons here, such as where openFA is
    button.onclick = function() {
      if (btn.action == 'openFA') {
        openFA();
        return;
      }
      
      if (btn.action == 'openEmotePicker') {
        openEmotePicker();
        return;
      }

      var insertText = '',
          offset = 0,
          isWritten = document.getElementById('pgType') ? document.getElementById('pgType').value === 'written' : true;

      // determine offset/formatting logic based on configuration
      var calculateInsertion = function(selectionText) {
        var text = '', off = 0;
        if (Array.isArray(btn.insert)) {
          text = btn.insert[0] + selectionText + btn.insert[1];
          if (selectionText) {
            var tagIdx = btn.insert[1].indexOf('><'), attrIdx = btn.insert[0].indexOf('=""');
            if (tagIdx !== -1) off = btn.insert[0].length + selectionText.length + tagIdx + 1;
            else if (attrIdx !== -1) off = attrIdx + 2; 
            else off = text.length;
          } else {
            off = btn.insert[0].length;
          }
        } else {
          text = btn.insert;
          off = text.indexOf('><') !== -1 ? text.indexOf('><') + 1 : text.length;
        }
        return { text: text, off: off };
      };

      if (isWritten) {
        var doc = cmEditor.getDoc(),
            selections = doc.listSelections();

        if (selections.length > 1) {
          var newRanges = [];

          cmEditor.operation(function() {
            for (var s = selections.length - 1; s >= 0; s--) {
              var range = selections[s],
                  from = range.from(),
                  to = range.to(),
                  selection = doc.getRange(from, to),
                  res = calculateInsertion(selection),
                  insertedBeforeCursor = res.text.substring(0, res.off),
                  lines = insertedBeforeCursor.split('\n'),
                  cursorPos,
                  endPos;

              doc.replaceRange(res.text, from, to, '+input');

              cursorPos = {
                line: from.line + lines.length - 1,
                ch: lines.length === 1 ? from.ch + lines[0].length : lines[lines.length - 1].length
              };

              endPos = doc.posFromIndex(doc.indexFromPos(from) + res.text.length);
              newRanges.unshift({ anchor: endPos, head: cursorPos });
            }
          });

          doc.setSelections(newRanges);
          cmEditor.focus();
          return;
        }

        var cursor = doc.getCursor('from'),
            selection = doc.getSelection();

        var res = calculateInsertion(selection);
        insertText = res.text; offset = res.off;

        doc.replaceSelection(insertText);

        var lines = insertText.substring(0, offset).split('\n'),
            newLine = cursor.line + lines.length - 1,
            newCh = (lines.length === 1) ? cursor.ch + lines[0].length : lines[lines.length - 1].length;

        doc.setCursor({line: newLine, ch: newCh});
        cmEditor.focus();
      } else if (window.activeEditorInput) {
        var start = window.activeEditorInput.selectionStart,
            end = window.activeEditorInput.selectionEnd,
            val = window.activeEditorInput.value,
            selection = val.substring(start, end);
        
        var res = calculateInsertion(selection);
        insertText = res.text; offset = res.off;

        window.activeEditorInput.value = val.substring(0, start) + insertText + val.substring(end);
        window.activeEditorInput.selectionStart = window.activeEditorInput.selectionEnd = start + offset;
        window.activeEditorInput.focus();
        window.activeEditorInput.dispatchEvent(new Event('input')); // trigger preview refresh
      }
    };
    
    // separate buttons by a break
    if (separate) {
      toolbarEl.insertAdjacentHTML('beforeend', '<br class="row-' + row + '">');
      separate = false;
    }
    
    toolbarEl.appendChild(button);
  });
};

// adds overlays to CodeMirror instance
function setupCodeMirrorOverlays(cmEditor) {
  // matches inline {} variables
  cmEditor.addOverlay({
    token: function(stream) {
      if (stream.match(/^\{([^{}]|\{[^{}]*\})*\}/)) {
        return "inline-var";
      }
      while (stream.next() != null && !stream.match(/^\{/, false)) {}
      return null;
    }
  });

  // matches [alts:...] for our answer braces: {猫が好きです|ねこがすきです|[alts:{猫}が{好}きです|ねこ|す]answer}
  // matches [A] in underline fields for correct answers
  cmEditor.addOverlay({
    token: function(stream) {
      if (stream.match(/^\[alts:[^\]]*\]|^\[A\]|%\(.*?\)/)) {
        return "alts-var";
      }
      while (stream.next() != null && !stream.match(/^\[alts:|^\[A\]|^%\(.*?\)/, false)) {}
      return null;
    }
  });
};

// function to sanitize user input in places where HTML is used
// sanitizes script tags, strips on{EVENT}="", etc.
function sanitizeContent(text) {
  // for developers who want to utilize inline JavaScript events, such as for buttons
  // scripts are still prohibited
  if (/\?devmode/.test(window.location.search)) {
    return text.replace(/<script/gi, '&lt;script')
               .replace(/<\/script>/gi, '&lt;/script&gt;');
    
  } else {
    return text.replace(/<script/gi, '&lt;script')
               .replace(/<\/script>/gi, '&lt;/script&gt;')
               .replace(/(data-)?\b(on[a-z]+\s*=\s*)('[^']*'|"[^"]*"|[^\s>]+)/gi, function(match, dataPrefix, onEvent, val) {
                 return (dataPrefix || 'data-') + onEvent + val;
               })
               .replace(/href\s*=\s*(['"]?)javascript:[^>]*\1/gi, 'href=$1#javascript-disabled$1')
  }
};

// sets up file download and file load button listeners
function setupFileActionButtons(generateHTMLCallback, handleFileLoadCallback) {
  document.getElementById('download-btn').addEventListener('click', function() {
    var htmlContent = generateHTMLCallback(false), 
        blob = new Blob([htmlContent], { type: 'text/html' }),
        url = URL.createObjectURL(blob),
        a = document.createElement('a');
    
    a.href = url;
    a.download = (document.getElementById('pgTitle').value || 'index') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById('load-btn').addEventListener('click', function() {
    document.getElementById('load-file').click();
  });

  document.getElementById('load-file').addEventListener('change', function(e) {
    handleFileLoadCallback(e.target.files[0]);
  });
};

// set up drag and drop file loading for a specific element
function setupDragAndDrop(targetElement, handleFileLoadCallback) {
  targetElement.addEventListener('dragover', function(e) {
    e.preventDefault(); 
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  });

  targetElement.addEventListener('drop', function(e) {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      e.preventDefault(); 
      e.stopPropagation();
      handleFileLoadCallback(e.dataTransfer.files[0]);
    }
  });
};

// sets up events for the fullscreen buttons
function setupFullscreenLogic() {
  document.getElementById('fullscreen-btn').addEventListener('click', function() {
    for (var preview = [document.getElementById('preview'), document.getElementById('chat-preview')], i = 0, j = preview.length; i < j; i++) {
      if (preview[i]) {
        preview[i].classList.add('fullscreen');

        // add padding to the top and bottom of the preview content
        if (preview[i].tagName == 'IFRAME') {
          preview[i] = preview[i].contentDocument || preview[i].contentWindow.document;
          preview[i] = preview[i].getElementById('content');
          preview[i].style.paddingTop = '30px';
          preview[i].style.paddingBottom = '30px';
        }
      }
    }
    
    document.getElementById('exit-fullscreen-btn').style.display = 'block';
  });

  document.getElementById('exit-fullscreen-btn').addEventListener('click', function() {
    for (var preview = [document.getElementById('preview'), document.getElementById('chat-preview')], i = 0, j = preview.length; i < j; i++) {
      if (preview[i]) {
        preview[i].classList.remove('fullscreen');

        // remove padding from preview content
        if (preview[i].tagName == 'IFRAME') {
          preview[i] = preview[i].contentDocument || preview[i].contentWindow.document;
          preview[i] = preview[i].getElementById('content');
          preview[i].style.paddingTop = '0px';
          preview[i].style.paddingBottom = '0px';
        }
      }
    }
    
    this.style.display = 'none';
  });
};

// font awesome icons and functions for the article/exercise editor
var FA_Icons = [
  { icon: "", alias: "glass", entity: "f000" },
  { icon: "", alias: "music", entity: "f001" },
  { icon: "", alias: "search", entity: "f002" },
  { icon: "", alias: "envelope-o", entity: "f003" },
  { icon: "", alias: "heart", entity: "f004" },
  { icon: "", alias: "star", entity: "f005" },
  { icon: "", alias: "star-o", entity: "f006" },
  { icon: "", alias: "user", entity: "f007" },
  { icon: "", alias: "film", entity: "f008" },
  { icon: "", alias: "th-large", entity: "f009" },
  { icon: "", alias: "th", entity: "f00a" },
  { icon: "", alias: "th-list", entity: "f00b" },
  { icon: "", alias: "check", entity: "f00c" },
  { icon: "", alias: "remove close times", entity: "f00d" },
  { icon: "", alias: "search-plus", entity: "f00e" },
  { icon: "", alias: "search-minus", entity: "f010" },
  { icon: "", alias: "power-off", entity: "f011" },
  { icon: "", alias: "signal", entity: "f012" },
  { icon: "", alias: "gear cog", entity: "f013" },
  { icon: "", alias: "trash-o", entity: "f014" },
  { icon: "", alias: "home", entity: "f015" },
  { icon: "", alias: "file-o", entity: "f016" },
  { icon: "", alias: "clock-o", entity: "f017" },
  { icon: "", alias: "road", entity: "f018" },
  { icon: "", alias: "download", entity: "f019" },
  { icon: "", alias: "arrow-circle-o-down", entity: "f01a" },
  { icon: "", alias: "arrow-circle-o-up", entity: "f01b" },
  { icon: "", alias: "inbox", entity: "f01c" },
  { icon: "", alias: "play-circle-o", entity: "f01d" },
  { icon: "", alias: "rotate-right repeat", entity: "f01e" },
  { icon: "", alias: "refresh", entity: "f021" },
  { icon: "", alias: "list-alt", entity: "f022" },
  { icon: "", alias: "lock", entity: "f023" },
  { icon: "", alias: "flag", entity: "f024" },
  { icon: "", alias: "headphones", entity: "f025" },
  { icon: "", alias: "volume-off", entity: "f026" },
  { icon: "", alias: "volume-down", entity: "f027" },
  { icon: "", alias: "volume-up", entity: "f028" },
  { icon: "", alias: "qrcode", entity: "f029" },
  { icon: "", alias: "barcode", entity: "f02a" },
  { icon: "", alias: "tag", entity: "f02b" },
  { icon: "", alias: "tags", entity: "f02c" },
  { icon: "", alias: "book", entity: "f02d" },
  { icon: "", alias: "bookmark", entity: "f02e" },
  { icon: "", alias: "print", entity: "f02f" },
  { icon: "", alias: "camera", entity: "f030" },
  { icon: "", alias: "font", entity: "f031" },
  { icon: "", alias: "bold", entity: "f032" },
  { icon: "", alias: "italic", entity: "f033" },
  { icon: "", alias: "text-height", entity: "f034" },
  { icon: "", alias: "text-width", entity: "f035" },
  { icon: "", alias: "align-left", entity: "f036" },
  { icon: "", alias: "align-center", entity: "f037" },
  { icon: "", alias: "align-right", entity: "f038" },
  { icon: "", alias: "align-justify", entity: "f039" },
  { icon: "", alias: "list", entity: "f03a" },
  { icon: "", alias: "dedent outdent", entity: "f03b" },
  { icon: "", alias: "indent", entity: "f03c" },
  { icon: "", alias: "video-camera", entity: "f03d" },
  { icon: "", alias: "photo image picture-o", entity: "f03e" },
  { icon: "", alias: "pencil", entity: "f040" },
  { icon: "", alias: "map-marker", entity: "f041" },
  { icon: "", alias: "adjust", entity: "f042" },
  { icon: "", alias: "tint", entity: "f043" },
  { icon: "", alias: "edit pencil-square-o", entity: "f044" },
  { icon: "", alias: "share-square-o", entity: "f045" },
  { icon: "", alias: "check-square-o", entity: "f046" },
  { icon: "", alias: "arrows", entity: "f047" },
  { icon: "", alias: "step-backward", entity: "f048" },
  { icon: "", alias: "fast-backward", entity: "f049" },
  { icon: "", alias: "backward", entity: "f04a" },
  { icon: "", alias: "play", entity: "f04b" },
  { icon: "", alias: "pause", entity: "f04c" },
  { icon: "", alias: "stop", entity: "f04d" },
  { icon: "", alias: "forward", entity: "f04e" },
  { icon: "", alias: "fast-forward", entity: "f050" },
  { icon: "", alias: "step-forward", entity: "f051" },
  { icon: "", alias: "eject", entity: "f052" },
  { icon: "", alias: "chevron-left", entity: "f053" },
  { icon: "", alias: "chevron-right", entity: "f054" },
  { icon: "", alias: "plus-circle", entity: "f055" },
  { icon: "", alias: "minus-circle", entity: "f056" },
  { icon: "", alias: "times-circle", entity: "f057" },
  { icon: "", alias: "check-circle", entity: "f058" },
  { icon: "", alias: "question-circle", entity: "f059" },
  { icon: "", alias: "info-circle", entity: "f05a" },
  { icon: "", alias: "crosshairs", entity: "f05b" },
  { icon: "", alias: "times-circle-o", entity: "f05c" },
  { icon: "", alias: "check-circle-o", entity: "f05d" },
  { icon: "", alias: "ban", entity: "f05e" },
  { icon: "", alias: "arrow-left", entity: "f060" },
  { icon: "", alias: "arrow-right", entity: "f061" },
  { icon: "", alias: "arrow-up", entity: "f062" },
  { icon: "", alias: "arrow-down", entity: "f063" },
  { icon: "", alias: "mail-forward share", entity: "f064" },
  { icon: "", alias: "expand", entity: "f065" },
  { icon: "", alias: "compress", entity: "f066" },
  { icon: "", alias: "plus", entity: "f067" },
  { icon: "", alias: "minus", entity: "f068" },
  { icon: "", alias: "asterisk", entity: "f069" },
  { icon: "", alias: "exclamation-circle", entity: "f06a" },
  { icon: "", alias: "gift", entity: "f06b" },
  { icon: "", alias: "leaf", entity: "f06c" },
  { icon: "", alias: "fire", entity: "f06d" },
  { icon: "", alias: "eye", entity: "f06e" },
  { icon: "", alias: "eye-slash", entity: "f070" },
  { icon: "", alias: "warning exclamation-triangle", entity: "f071" },
  { icon: "", alias: "plane", entity: "f072" },
  { icon: "", alias: "calendar", entity: "f073" },
  { icon: "", alias: "random", entity: "f074" },
  { icon: "", alias: "comment", entity: "f075" },
  { icon: "", alias: "magnet", entity: "f076" },
  { icon: "", alias: "chevron-up", entity: "f077" },
  { icon: "", alias: "chevron-down", entity: "f078" },
  { icon: "", alias: "retweet", entity: "f079" },
  { icon: "", alias: "shopping-cart", entity: "f07a" },
  { icon: "", alias: "folder", entity: "f07b" },
  { icon: "", alias: "folder-open", entity: "f07c" },
  { icon: "", alias: "arrows-v", entity: "f07d" },
  { icon: "", alias: "arrows-h", entity: "f07e" },
  { icon: "", alias: "bar-chart-o bar-chart", entity: "f080" },
  { icon: "", alias: "twitter-square", entity: "f081" },
  { icon: "", alias: "facebook-square", entity: "f082" },
  { icon: "", alias: "camera-retro", entity: "f083" },
  { icon: "", alias: "key", entity: "f084" },
  { icon: "", alias: "gears cogs", entity: "f085" },
  { icon: "", alias: "comments", entity: "f086" },
  { icon: "", alias: "thumbs-o-up", entity: "f087" },
  { icon: "", alias: "thumbs-o-down", entity: "f088" },
  { icon: "", alias: "star-half", entity: "f089" },
  { icon: "", alias: "heart-o", entity: "f08a" },
  { icon: "", alias: "sign-out", entity: "f08b" },
  { icon: "", alias: "linkedin-square", entity: "f08c" },
  { icon: "", alias: "thumb-tack", entity: "f08d" },
  { icon: "", alias: "external-link", entity: "f08e" },
  { icon: "", alias: "sign-in", entity: "f090" },
  { icon: "", alias: "trophy", entity: "f091" },
  { icon: "", alias: "github-square", entity: "f092" },
  { icon: "", alias: "upload", entity: "f093" },
  { icon: "", alias: "lemon-o", entity: "f094" },
  { icon: "", alias: "phone", entity: "f095" },
  { icon: "", alias: "square-o", entity: "f096" },
  { icon: "", alias: "bookmark-o", entity: "f097" },
  { icon: "", alias: "phone-square", entity: "f098" },
  { icon: "", alias: "twitter", entity: "f099" },
  { icon: "", alias: "facebook-f facebook", entity: "f09a" },
  { icon: "", alias: "github", entity: "f09b" },
  { icon: "", alias: "unlock", entity: "f09c" },
  { icon: "", alias: "credit-card", entity: "f09d" },
  { icon: "", alias: "feed rss", entity: "f09e" },
  { icon: "", alias: "hdd-o", entity: "f0a0" },
  { icon: "", alias: "bullhorn", entity: "f0a1" },
  { icon: "", alias: "bell", entity: "f0f3" },
  { icon: "", alias: "certificate", entity: "f0a3" },
  { icon: "", alias: "hand-o-right", entity: "f0a4" },
  { icon: "", alias: "hand-o-left", entity: "f0a5" },
  { icon: "", alias: "hand-o-up", entity: "f0a6" },
  { icon: "", alias: "hand-o-down", entity: "f0a7" },
  { icon: "", alias: "arrow-circle-left", entity: "f0a8" },
  { icon: "", alias: "arrow-circle-right", entity: "f0a9" },
  { icon: "", alias: "arrow-circle-up", entity: "f0aa" },
  { icon: "", alias: "arrow-circle-down", entity: "f0ab" },
  { icon: "", alias: "globe", entity: "f0ac" },
  { icon: "", alias: "wrench", entity: "f0ad" },
  { icon: "", alias: "tasks", entity: "f0ae" },
  { icon: "", alias: "filter", entity: "f0b0" },
  { icon: "", alias: "briefcase", entity: "f0b1" },
  { icon: "", alias: "arrows-alt", entity: "f0b2" },
  { icon: "", alias: "group users", entity: "f0c0" },
  { icon: "", alias: "chain link", entity: "f0c1" },
  { icon: "", alias: "cloud", entity: "f0c2" },
  { icon: "", alias: "flask", entity: "f0c3" },
  { icon: "", alias: "cut scissors", entity: "f0c4" },
  { icon: "", alias: "copy files-o", entity: "f0c5" },
  { icon: "", alias: "paperclip", entity: "f0c6" },
  { icon: "", alias: "save floppy-o", entity: "f0c7" },
  { icon: "", alias: "square", entity: "f0c8" },
  { icon: "", alias: "navicon reorder bars", entity: "f0c9" },
  { icon: "", alias: "list-ul", entity: "f0ca" },
  { icon: "", alias: "list-ol", entity: "f0cb" },
  { icon: "", alias: "strikethrough", entity: "f0cc" },
  { icon: "", alias: "underline", entity: "f0cd" },
  { icon: "", alias: "table", entity: "f0ce" },
  { icon: "", alias: "magic", entity: "f0d0" },
  { icon: "", alias: "truck", entity: "f0d1" },
  { icon: "", alias: "pinterest", entity: "f0d2" },
  { icon: "", alias: "pinterest-square", entity: "f0d3" },
  { icon: "", alias: "google-plus-square", entity: "f0d4" },
  { icon: "", alias: "google-plus", entity: "f0d5" },
  { icon: "", alias: "money", entity: "f0d6" },
  { icon: "", alias: "caret-down", entity: "f0d7" },
  { icon: "", alias: "caret-up", entity: "f0d8" },
  { icon: "", alias: "caret-left", entity: "f0d9" },
  { icon: "", alias: "caret-right", entity: "f0da" },
  { icon: "", alias: "columns", entity: "f0db" },
  { icon: "", alias: "unsorted sort", entity: "f0dc" },
  { icon: "", alias: "sort-down sort-desc", entity: "f0dd" },
  { icon: "", alias: "sort-up sort-asc", entity: "f0de" },
  { icon: "", alias: "envelope", entity: "f0e0" },
  { icon: "", alias: "linkedin", entity: "f0e1" },
  { icon: "", alias: "rotate-left undo", entity: "f0e2" },
  { icon: "", alias: "legal gavel", entity: "f0e3" },
  { icon: "", alias: "dashboard tachometer", entity: "f0e4" },
  { icon: "", alias: "comment-o", entity: "f0e5" },
  { icon: "", alias: "comments-o", entity: "f0e6" },
  { icon: "", alias: "flash bolt", entity: "f0e7" },
  { icon: "", alias: "sitemap", entity: "f0e8" },
  { icon: "", alias: "umbrella", entity: "f0e9" },
  { icon: "", alias: "paste clipboard", entity: "f0ea" },
  { icon: "", alias: "lightbulb-o", entity: "f0eb" },
  { icon: "", alias: "exchange", entity: "f0ec" },
  { icon: "", alias: "cloud-download", entity: "f0ed" },
  { icon: "", alias: "cloud-upload", entity: "f0ee" },
  { icon: "", alias: "user-md", entity: "f0f0" },
  { icon: "", alias: "stethoscope", entity: "f0f1" },
  { icon: "", alias: "suitcase", entity: "f0f2" },
  { icon: "", alias: "bell-o", entity: "f0a2" },
  { icon: "", alias: "coffee", entity: "f0f4" },
  { icon: "", alias: "cutlery", entity: "f0f5" },
  { icon: "", alias: "file-text-o", entity: "f0f6" },
  { icon: "", alias: "building-o", entity: "f0f7" },
  { icon: "", alias: "hospital-o", entity: "f0f8" },
  { icon: "", alias: "ambulance", entity: "f0f9" },
  { icon: "", alias: "medkit", entity: "f0fa" },
  { icon: "", alias: "fighter-jet", entity: "f0fb" },
  { icon: "", alias: "beer", entity: "f0fc" },
  { icon: "", alias: "h-square", entity: "f0fd" },
  { icon: "", alias: "plus-square", entity: "f0fe" },
  { icon: "", alias: "angle-double-left", entity: "f100" },
  { icon: "", alias: "angle-double-right", entity: "f101" },
  { icon: "", alias: "angle-double-up", entity: "f102" },
  { icon: "", alias: "angle-double-down", entity: "f103" },
  { icon: "", alias: "angle-left", entity: "f104" },
  { icon: "", alias: "angle-right", entity: "f105" },
  { icon: "", alias: "angle-up", entity: "f106" },
  { icon: "", alias: "angle-down", entity: "f107" },
  { icon: "", alias: "desktop", entity: "f108" },
  { icon: "", alias: "laptop", entity: "f109" },
  { icon: "", alias: "tablet", entity: "f10a" },
  { icon: "", alias: "mobile-phone mobile", entity: "f10b" },
  { icon: "", alias: "circle-o", entity: "f10c" },
  { icon: "", alias: "quote-left", entity: "f10d" },
  { icon: "", alias: "quote-right", entity: "f10e" },
  { icon: "", alias: "spinner", entity: "f110" },
  { icon: "", alias: "circle", entity: "f111" },
  { icon: "", alias: "mail-reply reply", entity: "f112" },
  { icon: "", alias: "github-alt", entity: "f113" },
  { icon: "", alias: "folder-o", entity: "f114" },
  { icon: "", alias: "folder-open-o", entity: "f115" },
  { icon: "", alias: "smile-o", entity: "f118" },
  { icon: "", alias: "frown-o", entity: "f119" },
  { icon: "", alias: "meh-o", entity: "f11a" },
  { icon: "", alias: "gamepad", entity: "f11b" },
  { icon: "", alias: "keyboard-o", entity: "f11c" },
  { icon: "", alias: "flag-o", entity: "f11d" },
  { icon: "", alias: "flag-checkered", entity: "f11e" },
  { icon: "", alias: "terminal", entity: "f120" },
  { icon: "", alias: "code", entity: "f121" },
  { icon: "", alias: "mail-reply-all reply-all", entity: "f122" },
  { icon: "", alias: "star-half-empty star-half-full star-half-o", entity: "f123" },
  { icon: "", alias: "location-arrow", entity: "f124" },
  { icon: "", alias: "crop", entity: "f125" },
  { icon: "", alias: "code-fork", entity: "f126" },
  { icon: "", alias: "unlink chain-broken", entity: "f127" },
  { icon: "", alias: "question", entity: "f128" },
  { icon: "", alias: "info", entity: "f129" },
  { icon: "", alias: "exclamation", entity: "f12a" },
  { icon: "", alias: "superscript", entity: "f12b" },
  { icon: "", alias: "subscript", entity: "f12c" },
  { icon: "", alias: "eraser", entity: "f12d" },
  { icon: "", alias: "puzzle-piece", entity: "f12e" },
  { icon: "", alias: "microphone", entity: "f130" },
  { icon: "", alias: "microphone-slash", entity: "f131" },
  { icon: "", alias: "shield", entity: "f132" },
  { icon: "", alias: "calendar-o", entity: "f133" },
  { icon: "", alias: "fire-extinguisher", entity: "f134" },
  { icon: "", alias: "rocket", entity: "f135" },
  { icon: "", alias: "maxcdn", entity: "f136" },
  { icon: "", alias: "chevron-circle-left", entity: "f137" },
  { icon: "", alias: "chevron-circle-right", entity: "f138" },
  { icon: "", alias: "chevron-circle-up", entity: "f139" },
  { icon: "", alias: "chevron-circle-down", entity: "f13a" },
  { icon: "", alias: "html5", entity: "f13b" },
  { icon: "", alias: "css3", entity: "f13c" },
  { icon: "", alias: "anchor", entity: "f13d" },
  { icon: "", alias: "unlock-alt", entity: "f13e" },
  { icon: "", alias: "bullseye", entity: "f140" },
  { icon: "", alias: "ellipsis-h", entity: "f141" },
  { icon: "", alias: "ellipsis-v", entity: "f142" },
  { icon: "", alias: "rss-square", entity: "f143" },
  { icon: "", alias: "play-circle", entity: "f144" },
  { icon: "", alias: "ticket", entity: "f145" },
  { icon: "", alias: "minus-square", entity: "f146" },
  { icon: "", alias: "minus-square-o", entity: "f147" },
  { icon: "", alias: "level-up", entity: "f148" },
  { icon: "", alias: "level-down", entity: "f149" },
  { icon: "", alias: "check-square", entity: "f14a" },
  { icon: "", alias: "pencil-square", entity: "f14b" },
  { icon: "", alias: "external-link-square", entity: "f14c" },
  { icon: "", alias: "share-square", entity: "f14d" },
  { icon: "", alias: "compass", entity: "f14e" },
  { icon: "", alias: "toggle-down caret-square-o-down", entity: "f150" },
  { icon: "", alias: "toggle-up caret-square-o-up", entity: "f151" },
  { icon: "", alias: "toggle-right caret-square-o-right", entity: "f152" },
  { icon: "", alias: "euro eur", entity: "f153" },
  { icon: "", alias: "gbp", entity: "f154" },
  { icon: "", alias: "dollar usd", entity: "f155" },
  { icon: "", alias: "rupee inr", entity: "f156" },
  { icon: "", alias: "cny rmb yen jpy", entity: "f157" },
  { icon: "", alias: "ruble rouble rub", entity: "f158" },
  { icon: "", alias: "won krw", entity: "f159" },
  { icon: "", alias: "bitcoin btc", entity: "f15a" },
  { icon: "", alias: "file", entity: "f15b" },
  { icon: "", alias: "file-text", entity: "f15c" },
  { icon: "", alias: "sort-alpha-asc", entity: "f15d" },
  { icon: "", alias: "sort-alpha-desc", entity: "f15e" },
  { icon: "", alias: "sort-amount-asc", entity: "f160" },
  { icon: "", alias: "sort-amount-desc", entity: "f161" },
  { icon: "", alias: "sort-numeric-asc", entity: "f162" },
  { icon: "", alias: "sort-numeric-desc", entity: "f163" },
  { icon: "", alias: "thumbs-up", entity: "f164" },
  { icon: "", alias: "thumbs-down", entity: "f165" },
  { icon: "", alias: "youtube-square", entity: "f166" },
  { icon: "", alias: "youtube", entity: "f167" },
  { icon: "", alias: "xing", entity: "f168" },
  { icon: "", alias: "xing-square", entity: "f169" },
  { icon: "", alias: "youtube-play", entity: "f16a" },
  { icon: "", alias: "dropbox", entity: "f16b" },
  { icon: "", alias: "stack-overflow", entity: "f16c" },
  { icon: "", alias: "instagram", entity: "f16d" },
  { icon: "", alias: "flickr", entity: "f16e" },
  { icon: "", alias: "adn", entity: "f170" },
  { icon: "", alias: "bitbucket", entity: "f171" },
  { icon: "", alias: "bitbucket-square", entity: "f172" },
  { icon: "", alias: "tumblr", entity: "f173" },
  { icon: "", alias: "tumblr-square", entity: "f174" },
  { icon: "", alias: "long-arrow-down", entity: "f175" },
  { icon: "", alias: "long-arrow-up", entity: "f176" },
  { icon: "", alias: "long-arrow-left", entity: "f177" },
  { icon: "", alias: "long-arrow-right", entity: "f178" },
  { icon: "", alias: "apple", entity: "f179" },
  { icon: "", alias: "windows", entity: "f17a" },
  { icon: "", alias: "android", entity: "f17b" },
  { icon: "", alias: "linux", entity: "f17c" },
  { icon: "", alias: "dribbble", entity: "f17d" },
  { icon: "", alias: "skype", entity: "f17e" },
  { icon: "", alias: "foursquare", entity: "f180" },
  { icon: "", alias: "trello", entity: "f181" },
  { icon: "", alias: "female", entity: "f182" },
  { icon: "", alias: "male", entity: "f183" },
  { icon: "", alias: "gittip gratipay", entity: "f184" },
  { icon: "", alias: "sun-o", entity: "f185" },
  { icon: "", alias: "moon-o", entity: "f186" },
  { icon: "", alias: "archive", entity: "f187" },
  { icon: "", alias: "bug", entity: "f188" },
  { icon: "", alias: "vk", entity: "f189" },
  { icon: "", alias: "weibo", entity: "f18a" },
  { icon: "", alias: "renren", entity: "f18b" },
  { icon: "", alias: "pagelines", entity: "f18c" },
  { icon: "", alias: "stack-exchange", entity: "f18d" },
  { icon: "", alias: "arrow-circle-o-right", entity: "f18e" },
  { icon: "", alias: "arrow-circle-o-left", entity: "f190" },
  { icon: "", alias: "toggle-left caret-square-o-left", entity: "f191" },
  { icon: "", alias: "dot-circle-o", entity: "f192" },
  { icon: "", alias: "wheelchair", entity: "f193" },
  { icon: "", alias: "vimeo-square", entity: "f194" },
  { icon: "", alias: "turkish-lira try", entity: "f195" },
  { icon: "", alias: "plus-square-o", entity: "f196" },
  { icon: "", alias: "space-shuttle", entity: "f197" },
  { icon: "", alias: "slack", entity: "f198" },
  { icon: "", alias: "envelope-square", entity: "f199" },
  { icon: "", alias: "wordpress", entity: "f19a" },
  { icon: "", alias: "openid", entity: "f19b" },
  { icon: "", alias: "institution bank university", entity: "f19c" },
  { icon: "", alias: "mortar-board graduation-cap", entity: "f19d" },
  { icon: "", alias: "yahoo", entity: "f19e" },
  { icon: "", alias: "google", entity: "f1a0" },
  { icon: "", alias: "reddit", entity: "f1a1" },
  { icon: "", alias: "reddit-square", entity: "f1a2" },
  { icon: "", alias: "stumbleupon-circle", entity: "f1a3" },
  { icon: "", alias: "stumbleupon", entity: "f1a4" },
  { icon: "", alias: "delicious", entity: "f1a5" },
  { icon: "", alias: "digg", entity: "f1a6" },
  { icon: "", alias: "pied-piper-pp", entity: "f1a7" },
  { icon: "", alias: "pied-piper-alt", entity: "f1a8" },
  { icon: "", alias: "drupal", entity: "f1a9" },
  { icon: "", alias: "joomla", entity: "f1aa" },
  { icon: "", alias: "language", entity: "f1ab" },
  { icon: "", alias: "fax", entity: "f1ac" },
  { icon: "", alias: "building", entity: "f1ad" },
  { icon: "", alias: "child", entity: "f1ae" },
  { icon: "", alias: "paw", entity: "f1b0" },
  { icon: "", alias: "spoon", entity: "f1b1" },
  { icon: "", alias: "cube", entity: "f1b2" },
  { icon: "", alias: "cubes", entity: "f1b3" },
  { icon: "", alias: "behance", entity: "f1b4" },
  { icon: "", alias: "behance-square", entity: "f1b5" },
  { icon: "", alias: "steam", entity: "f1b6" },
  { icon: "", alias: "steam-square", entity: "f1b7" },
  { icon: "", alias: "recycle", entity: "f1b8" },
  { icon: "", alias: "automobile car", entity: "f1b9" },
  { icon: "", alias: "cab taxi", entity: "f1ba" },
  { icon: "", alias: "tree", entity: "f1bb" },
  { icon: "", alias: "spotify", entity: "f1bc" },
  { icon: "", alias: "deviantart", entity: "f1bd" },
  { icon: "", alias: "soundcloud", entity: "f1be" },
  { icon: "", alias: "database", entity: "f1c0" },
  { icon: "", alias: "file-pdf-o", entity: "f1c1" },
  { icon: "", alias: "file-word-o", entity: "f1c2" },
  { icon: "", alias: "file-excel-o", entity: "f1c3" },
  { icon: "", alias: "file-powerpoint-o", entity: "f1c4" },
  { icon: "", alias: "file-photo-o file-picture-o file-image-o", entity: "f1c5" },
  { icon: "", alias: "file-zip-o file-archive-o", entity: "f1c6" },
  { icon: "", alias: "file-sound-o file-audio-o", entity: "f1c7" },
  { icon: "", alias: "file-movie-o file-video-o", entity: "f1c8" },
  { icon: "", alias: "file-code-o", entity: "f1c9" },
  { icon: "", alias: "vine", entity: "f1ca" },
  { icon: "", alias: "codepen", entity: "f1cb" },
  { icon: "", alias: "jsfiddle", entity: "f1cc" },
  { icon: "", alias: "life-bouy life-buoy life-saver support life-ring", entity: "f1cd" },
  { icon: "", alias: "circle-o-notch", entity: "f1ce" },
  { icon: "", alias: "ra resistance rebel", entity: "f1d0" },
  { icon: "", alias: "ge empire", entity: "f1d1" },
  { icon: "", alias: "git-square", entity: "f1d2" },
  { icon: "", alias: "git", entity: "f1d3" },
  { icon: "", alias: "y-combinator-square yc-square hacker-news", entity: "f1d4" },
  { icon: "", alias: "tencent-weibo", entity: "f1d5" },
  { icon: "", alias: "qq", entity: "f1d6" },
  { icon: "", alias: "wechat weixin", entity: "f1d7" },
  { icon: "", alias: "send paper-plane", entity: "f1d8" },
  { icon: "", alias: "send-o paper-plane-o", entity: "f1d9" },
  { icon: "", alias: "history", entity: "f1da" },
  { icon: "", alias: "circle-thin", entity: "f1db" },
  { icon: "", alias: "header", entity: "f1dc" },
  { icon: "", alias: "paragraph", entity: "f1dd" },
  { icon: "", alias: "sliders", entity: "f1de" },
  { icon: "", alias: "share-alt", entity: "f1e0" },
  { icon: "", alias: "share-alt-square", entity: "f1e1" },
  { icon: "", alias: "bomb", entity: "f1e2" },
  { icon: "", alias: "soccer-ball-o futbol-o", entity: "f1e3" },
  { icon: "", alias: "tty", entity: "f1e4" },
  { icon: "", alias: "binoculars", entity: "f1e5" },
  { icon: "", alias: "plug", entity: "f1e6" },
  { icon: "", alias: "slideshare", entity: "f1e7" },
  { icon: "", alias: "twitch", entity: "f1e8" },
  { icon: "", alias: "yelp", entity: "f1e9" },
  { icon: "", alias: "newspaper-o", entity: "f1ea" },
  { icon: "", alias: "wifi", entity: "f1eb" },
  { icon: "", alias: "calculator", entity: "f1ec" },
  { icon: "", alias: "paypal", entity: "f1ed" },
  { icon: "", alias: "google-wallet", entity: "f1ee" },
  { icon: "", alias: "cc-visa", entity: "f1f0" },
  { icon: "", alias: "cc-mastercard", entity: "f1f1" },
  { icon: "", alias: "cc-discover", entity: "f1f2" },
  { icon: "", alias: "cc-amex", entity: "f1f3" },
  { icon: "", alias: "cc-paypal", entity: "f1f4" },
  { icon: "", alias: "cc-stripe", entity: "f1f5" },
  { icon: "", alias: "bell-slash", entity: "f1f6" },
  { icon: "", alias: "bell-slash-o", entity: "f1f7" },
  { icon: "", alias: "trash", entity: "f1f8" },
  { icon: "", alias: "copyright", entity: "f1f9" },
  { icon: "", alias: "at", entity: "f1fa" },
  { icon: "", alias: "eyedropper", entity: "f1fb" },
  { icon: "", alias: "paint-brush", entity: "f1fc" },
  { icon: "", alias: "birthday-cake", entity: "f1fd" },
  { icon: "", alias: "area-chart", entity: "f1fe" },
  { icon: "", alias: "pie-chart", entity: "f200" },
  { icon: "", alias: "line-chart", entity: "f201" },
  { icon: "", alias: "lastfm", entity: "f202" },
  { icon: "", alias: "lastfm-square", entity: "f203" },
  { icon: "", alias: "toggle-off", entity: "f204" },
  { icon: "", alias: "toggle-on", entity: "f205" },
  { icon: "", alias: "bicycle", entity: "f206" },
  { icon: "", alias: "bus", entity: "f207" },
  { icon: "", alias: "ioxhost", entity: "f208" },
  { icon: "", alias: "angellist", entity: "f209" },
  { icon: "", alias: "cc", entity: "f20a" },
  { icon: "", alias: "shekel sheqel ils", entity: "f20b" },
  { icon: "", alias: "meanpath", entity: "f20c" },
  { icon: "", alias: "buysellads", entity: "f20d" },
  { icon: "", alias: "connectdevelop", entity: "f20e" },
  { icon: "", alias: "dashcube", entity: "f210" },
  { icon: "", alias: "forumbee", entity: "f211" },
  { icon: "", alias: "leanpub", entity: "f212" },
  { icon: "", alias: "sellsy", entity: "f213" },
  { icon: "", alias: "shirtsinbulk", entity: "f214" },
  { icon: "", alias: "simplybuilt", entity: "f215" },
  { icon: "", alias: "skyatlas", entity: "f216" },
  { icon: "", alias: "cart-plus", entity: "f217" },
  { icon: "", alias: "cart-arrow-down", entity: "f218" },
  { icon: "", alias: "diamond", entity: "f219" },
  { icon: "", alias: "ship", entity: "f21a" },
  { icon: "", alias: "user-secret", entity: "f21b" },
  { icon: "", alias: "motorcycle", entity: "f21c" },
  { icon: "", alias: "street-view", entity: "f21d" },
  { icon: "", alias: "heartbeat", entity: "f21e" },
  { icon: "", alias: "venus", entity: "f221" },
  { icon: "", alias: "mars", entity: "f222" },
  { icon: "", alias: "mercury", entity: "f223" },
  { icon: "", alias: "intersex transgender", entity: "f224" },
  { icon: "", alias: "transgender-alt", entity: "f225" },
  { icon: "", alias: "venus-double", entity: "f226" },
  { icon: "", alias: "mars-double", entity: "f227" },
  { icon: "", alias: "venus-mars", entity: "f228" },
  { icon: "", alias: "mars-stroke", entity: "f229" },
  { icon: "", alias: "mars-stroke-v", entity: "f22a" },
  { icon: "", alias: "mars-stroke-h", entity: "f22b" },
  { icon: "", alias: "neuter", entity: "f22c" },
  { icon: "", alias: "genderless", entity: "f22d" },
  { icon: "", alias: "facebook-official", entity: "f230" },
  { icon: "", alias: "pinterest-p", entity: "f231" },
  { icon: "", alias: "whatsapp", entity: "f232" },
  { icon: "", alias: "server", entity: "f233" },
  { icon: "", alias: "user-plus", entity: "f234" },
  { icon: "", alias: "user-times", entity: "f235" },
  { icon: "", alias: "hotel bed", entity: "f236" },
  { icon: "", alias: "viacoin", entity: "f237" },
  { icon: "", alias: "train", entity: "f238" },
  { icon: "", alias: "subway", entity: "f239" },
  { icon: "", alias: "medium", entity: "f23a" },
  { icon: "", alias: "yc y-combinator", entity: "f23b" },
  { icon: "", alias: "optin-monster", entity: "f23c" },
  { icon: "", alias: "opencart", entity: "f23d" },
  { icon: "", alias: "expeditedssl", entity: "f23e" },
  { icon: "", alias: "battery-4 battery battery-full", entity: "f240" },
  { icon: "", alias: "battery-3 battery-three-quarters", entity: "f241" },
  { icon: "", alias: "battery-2 battery-half", entity: "f242" },
  { icon: "", alias: "battery-1 battery-quarter", entity: "f243" },
  { icon: "", alias: "battery-0 battery-empty", entity: "f244" },
  { icon: "", alias: "mouse-pointer", entity: "f245" },
  { icon: "", alias: "i-cursor", entity: "f246" },
  { icon: "", alias: "object-group", entity: "f247" },
  { icon: "", alias: "object-ungroup", entity: "f248" },
  { icon: "", alias: "sticky-note", entity: "f249" },
  { icon: "", alias: "sticky-note-o", entity: "f24a" },
  { icon: "", alias: "cc-jcb", entity: "f24b" },
  { icon: "", alias: "cc-diners-club", entity: "f24c" },
  { icon: "", alias: "clone", entity: "f24d" },
  { icon: "", alias: "balance-scale", entity: "f24e" },
  { icon: "", alias: "hourglass-o", entity: "f250" },
  { icon: "", alias: "hourglass-1 hourglass-start", entity: "f251" },
  { icon: "", alias: "hourglass-2 hourglass-half", entity: "f252" },
  { icon: "", alias: "hourglass-3 hourglass-end", entity: "f253" },
  { icon: "", alias: "hourglass", entity: "f254" },
  { icon: "", alias: "hand-grab-o hand-rock-o", entity: "f255" },
  { icon: "", alias: "hand-stop-o hand-paper-o", entity: "f256" },
  { icon: "", alias: "hand-scissors-o", entity: "f257" },
  { icon: "", alias: "hand-lizard-o", entity: "f258" },
  { icon: "", alias: "hand-spock-o", entity: "f259" },
  { icon: "", alias: "hand-pointer-o", entity: "f25a" },
  { icon: "", alias: "hand-peace-o", entity: "f25b" },
  { icon: "", alias: "trademark", entity: "f25c" },
  { icon: "", alias: "registered", entity: "f25d" },
  { icon: "", alias: "creative-commons", entity: "f25e" },
  { icon: "", alias: "gg", entity: "f260" },
  { icon: "", alias: "gg-circle", entity: "f261" },
  { icon: "", alias: "tripadvisor", entity: "f262" },
  { icon: "", alias: "odnoklassniki", entity: "f263" },
  { icon: "", alias: "odnoklassniki-square", entity: "f264" },
  { icon: "", alias: "get-pocket", entity: "f265" },
  { icon: "", alias: "wikipedia-w", entity: "f266" },
  { icon: "", alias: "safari", entity: "f267" },
  { icon: "", alias: "chrome", entity: "f268" },
  { icon: "", alias: "firefox", entity: "f269" },
  { icon: "", alias: "opera", entity: "f26a" },
  { icon: "", alias: "internet-explorer", entity: "f26b" },
  { icon: "", alias: "tv television", entity: "f26c" },
  { icon: "", alias: "contao", entity: "f26d" },
  { icon: "", alias: "500px", entity: "f26e" },
  { icon: "", alias: "amazon", entity: "f270" },
  { icon: "", alias: "calendar-plus-o", entity: "f271" },
  { icon: "", alias: "calendar-minus-o", entity: "f272" },
  { icon: "", alias: "calendar-times-o", entity: "f273" },
  { icon: "", alias: "calendar-check-o", entity: "f274" },
  { icon: "", alias: "industry", entity: "f275" },
  { icon: "", alias: "map-pin", entity: "f276" },
  { icon: "", alias: "map-signs", entity: "f277" },
  { icon: "", alias: "map-o", entity: "f278" },
  { icon: "", alias: "map", entity: "f279" },
  { icon: "", alias: "commenting", entity: "f27a" },
  { icon: "", alias: "commenting-o", entity: "f27b" },
  { icon: "", alias: "houzz", entity: "f27c" },
  { icon: "", alias: "vimeo", entity: "f27d" },
  { icon: "", alias: "black-tie", entity: "f27e" },
  { icon: "", alias: "fonticons", entity: "f280" },
  { icon: "", alias: "reddit-alien", entity: "f281" },
  { icon: "", alias: "edge", entity: "f282" },
  { icon: "", alias: "credit-card-alt", entity: "f283" },
  { icon: "", alias: "codiepie", entity: "f284" },
  { icon: "", alias: "modx", entity: "f285" },
  { icon: "", alias: "fort-awesome", entity: "f286" },
  { icon: "", alias: "usb", entity: "f287" },
  { icon: "", alias: "product-hunt", entity: "f288" },
  { icon: "", alias: "mixcloud", entity: "f289" },
  { icon: "", alias: "scribd", entity: "f28a" },
  { icon: "", alias: "pause-circle", entity: "f28b" },
  { icon: "", alias: "pause-circle-o", entity: "f28c" },
  { icon: "", alias: "stop-circle", entity: "f28d" },
  { icon: "", alias: "stop-circle-o", entity: "f28e" },
  { icon: "", alias: "shopping-bag", entity: "f290" },
  { icon: "", alias: "shopping-basket", entity: "f291" },
  { icon: "", alias: "hashtag", entity: "f292" },
  { icon: "", alias: "bluetooth", entity: "f293" },
  { icon: "", alias: "bluetooth-b", entity: "f294" },
  { icon: "", alias: "percent", entity: "f295" },
  { icon: "", alias: "gitlab", entity: "f296" },
  { icon: "", alias: "wpbeginner", entity: "f297" },
  { icon: "", alias: "wpforms", entity: "f298" },
  { icon: "", alias: "envira", entity: "f299" },
  { icon: "", alias: "universal-access", entity: "f29a" },
  { icon: "", alias: "wheelchair-alt", entity: "f29b" },
  { icon: "", alias: "question-circle-o", entity: "f29c" },
  { icon: "", alias: "blind", entity: "f29d" },
  { icon: "", alias: "audio-description", entity: "f29e" },
  { icon: "", alias: "volume-control-phone", entity: "f2a0" },
  { icon: "", alias: "braille", entity: "f2a1" },
  { icon: "", alias: "assistive-listening-systems", entity: "f2a2" },
  { icon: "", alias: "asl-interpreting american-sign-language-interpreting", entity: "f2a3" },
  { icon: "", alias: "deafness hard-of-hearing deaf", entity: "f2a4" },
  { icon: "", alias: "glide", entity: "f2a5" },
  { icon: "", alias: "glide-g", entity: "f2a6" },
  { icon: "", alias: "signing sign-language", entity: "f2a7" },
  { icon: "", alias: "low-vision", entity: "f2a8" },
  { icon: "", alias: "viadeo", entity: "f2a9" },
  { icon: "", alias: "viadeo-square", entity: "f2aa" },
  { icon: "", alias: "snapchat", entity: "f2ab" },
  { icon: "", alias: "snapchat-ghost", entity: "f2ac" },
  { icon: "", alias: "snapchat-square", entity: "f2ad" },
  { icon: "", alias: "pied-piper", entity: "f2ae" },
  { icon: "", alias: "first-order", entity: "f2b0" },
  { icon: "", alias: "yoast", entity: "f2b1" },
  { icon: "", alias: "themeisle", entity: "f2b2" },
  { icon: "", alias: "google-plus-circle google-plus-official", entity: "f2b3" },
  { icon: "", alias: "fa font-awesome", entity: "f2b4" },
  { icon: "", alias: "handshake-o", entity: "f2b5" },
  { icon: "", alias: "envelope-open", entity: "f2b6" },
  { icon: "", alias: "envelope-open-o", entity: "f2b7" },
  { icon: "", alias: "linode", entity: "f2b8" },
  { icon: "", alias: "address-book", entity: "f2b9" },
  { icon: "", alias: "address-book-o", entity: "f2ba" },
  { icon: "", alias: "vcard address-card", entity: "f2bb" },
  { icon: "", alias: "vcard-o address-card-o", entity: "f2bc" },
  { icon: "", alias: "user-circle", entity: "f2bd" },
  { icon: "", alias: "user-circle-o", entity: "f2be" },
  { icon: "", alias: "user-o", entity: "f2c0" },
  { icon: "", alias: "id-badge", entity: "f2c1" },
  { icon: "", alias: "drivers-license id-card", entity: "f2c2" },
  { icon: "", alias: "drivers-license-o id-card-o", entity: "f2c3" },
  { icon: "", alias: "quora", entity: "f2c4" },
  { icon: "", alias: "free-code-camp", entity: "f2c5" },
  { icon: "", alias: "telegram", entity: "f2c6" },
  { icon: "", alias: "thermometer-4 thermometer thermometer-full", entity: "f2c7" },
  { icon: "", alias: "thermometer-3 thermometer-three-quarters", entity: "f2c8" },
  { icon: "", alias: "thermometer-2 thermometer-half", entity: "f2c9" },
  { icon: "", alias: "thermometer-1 thermometer-quarter", entity: "f2ca" },
  { icon: "", alias: "thermometer-0 thermometer-empty", entity: "f2cb" },
  { icon: "", alias: "shower", entity: "f2cc" },
  { icon: "", alias: "bathtub s15 bath", entity: "f2cd" },
  { icon: "", alias: "podcast", entity: "f2ce" },
  { icon: "", alias: "window-maximize", entity: "f2d0" },
  { icon: "", alias: "window-minimize", entity: "f2d1" },
  { icon: "", alias: "window-restore", entity: "f2d2" },
  { icon: "", alias: "times-rectangle window-close", entity: "f2d3" },
  { icon: "", alias: "times-rectangle-o window-close-o", entity: "f2d4" },
  { icon: "", alias: "bandcamp", entity: "f2d5" },
  { icon: "", alias: "grav", entity: "f2d6" },
  { icon: "", alias: "etsy", entity: "f2d7" },
  { icon: "", alias: "imdb", entity: "f2d8" },
  { icon: "", alias: "ravelry", entity: "f2d9" },
  { icon: "", alias: "eercast", entity: "f2da" },
  { icon: "", alias: "microchip", entity: "f2db" },
  { icon: "", alias: "snowflake-o", entity: "f2dc" },
  { icon: "", alias: "superpowers", entity: "f2dd" },
  { icon: "", alias: "wpexplorer", entity: "f2de" },
  { icon: "", alias: "meetup", entity: "f2e0" }
];
/* ICON EXTRACTOR
  fetch('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css')
    .then(res => res.text())
    .then(css => {
      // Split the CSS by closing brackets to evaluate each rule block individually
      const blocks = css.split('}');
      const iconsMap = new Map();

      blocks.forEach(block => {
        // Check if this block contains an icon content rule
        const contentMatch = block.match(/content:\s*"\\([0-9a-fA-F]+)"/);

        if (contentMatch) {
          const hex = contentMatch[1];
          const entity = '&#x' + hex + ';';
          const iconChar = String.fromCharCode(parseInt(hex, 16));

          // Find every single alias class in this specific block
          const classRegex = /\.fa-([a-zA-Z0-9\-]+):before/g;
          let classMatch;

          while ((classMatch = classRegex.exec(block)) !== null) {
            const aliasName = classMatch[1];

            if (!iconsMap.has(entity)) {
              iconsMap.set(entity, {
                icon: iconChar,
                entity: entity,
                aliases: new Set()
              });
            }
            iconsMap.get(entity).aliases.add(aliasName);
          }
        }
      });

      // Format into the exact JavaScript array structure needed
      const iconsArray = Array.from(iconsMap.values());
      const formattedOutput = "var FA = [\n" + iconsArray.map(item => {
        // Join the Set of aliases with a space
        const combinedAliases = Array.from(item.aliases).join(' ');
        return `  { icon: "${item.icon}", alias: "${combinedAliases}", entity: "${item.entity}" }`;
      }).join(",\n") + "\n];";

      console.log(formattedOutput);

      try {
        copy(formattedOutput);
        console.log("%c Successfully extracted " + iconsArray.length + " unique icons with grouped aliases and copied to clipboard!", "color: #4CAF50; font-weight: bold; font-size: 14px;");
      } catch (e) {
        console.log("%c Extraction complete! Right-click the object above and select 'Copy object' or manually copy the text.", "color: #FF9800; font-weight: bold; font-size: 14px;");
      }
    })
    .catch(err => console.error("Error fetching CSS:", err));
*/

// open popup with all of font awesome's icons
var openFA = function () {
  for (var i = 0, j = FA_Icons.length, list = ''; i < j; i++) {
    list += '<button class="button icon-only big" title="' + FA_Icons[i].alias + '" data-alias="' + FA_Icons[i].alias.toLowerCase() + '" onclick="insertIcon(\'' + FA_Icons[i].entity + '\')"><i class="fa">&#x' + FA_Icons[i].entity + ';</i></button>';
  }

  KantanModal.open({
    title : 'Select Icon',
    content : '<div class="center" style="margin-bottom:5px;">' +
      '<input type="text" id="fa-search-box" placeholder="Search for an icon..." style="width:95%;" oninput="filterFA(this.value)">' +
    '</div>' +
    '<div id="fa-icon-list" class="center">' + list + '</div>',
    closeButtonText : 'Cancel',
    focus : '#fa-search-box',
    customSize : {
      top : '10%',
      left : '20%',
      bottom : '10%',
      right : '20%'
    }
  });
};

// search for specific icon in the popup window
function filterFA(query) {
  query = query.toLowerCase();
  for (var buttons = document.querySelectorAll('#fa-icon-list .button'), i = 0, j = buttons.length, alias; i < j; i++) {
    alias = buttons[i].getAttribute('data-alias');
    if (alias.indexOf(query) !== -1) {
      buttons[i].style.display = 'inline-block';
    } else {
      buttons[i].style.display = 'none';
    }
  }
};

// insert icon into the article/exercise editor
function insertIcon(entity) {
  var isWritten = document.getElementById('pgType') ? document.getElementById('pgType').value === 'written' : true;
  var snippet = '<i class="fa">&#x' + entity + ';</i>';

  if (isWritten || !window.activeEditorInput) {
    var doc = cmEditor.getDoc(),
        cursor = doc.getCursor();

    doc.replaceRange(snippet, cursor);

    var lines = snippet.split('\n'),
        newLine = cursor.line + lines.length - 1,
        newCh = (lines.length === 1) ? cursor.ch + lines[0].length : lines[lines.length - 1].length;

    doc.setCursor({line: newLine, ch: newCh});
    cmEditor.focus();
  } else if (window.activeEditorInput) {
    var start = window.activeEditorInput.selectionStart,
        end = window.activeEditorInput.selectionEnd,
        val = window.activeEditorInput.value;

    window.activeEditorInput.value = val.substring(0, start) + snippet + val.substring(end);
    window.activeEditorInput.selectionStart = window.activeEditorInput.selectionEnd = start + snippet.length;
    window.activeEditorInput.focus();
    window.activeEditorInput.dispatchEvent(new Event('input'));
  }

  KantanModal.close();
};

// Emotes for Kantan Chat
var CHAT_EMOTES = [
  ':^^:',
  ':=v=:',
  ':azoos:',
  ':clueless:',
  ':guilty:',
  ':hungry:',
  ':pout:',
  ':sad:',
  ':XD:'
];

function getEmoteFileName(code) {
  return code.replace(/:/g, '').toLowerCase() + '.webp';
}

function getEmoteImagePath(code) {
  return getPaths() + 'resources/images/kanny/emotes/' + getEmoteFileName(code);
}

function openEmotePicker() {
  var list = CHAT_EMOTES.map(function(code) {
    var src = getEmoteImagePath(code);
    return '' +
      '<button class="button emote-button" ' +
        'title="' + code + '" ' +
        'data-code="' + code.toLowerCase() + '" ' +
        'onclick="insertEmote(\'' + code.replace(/'/g, "\\'") + '\')"' +
      '>' +
        '<img src="' + src + '" alt="' + code + '" style="max-width:128px; max-height:128px; vertical-align:middle;"><br>' +
        '<small>' + code + '</small>' +
      '</button>';
  }).join('');

  KantanModal.open({
    title : 'Select Emote',
    content : '<div id="emote-list" class="center">' + list + '</div>',
    closeButtonText : 'Cancel',
    customSize : {
      top : '10%',
      left : '20%',
      bottom : '10%',
      right : '20%'
    }
  });
}

function insertEmote(code) {
  var isWritten = document.getElementById('pgType') ? document.getElementById('pgType').value === 'written' : true;
  var snippet = ' ' + code;

  if (isWritten || !window.activeEditorInput) {
    var doc = cmEditor.getDoc(),
        cursor = doc.getCursor(),
        selection = doc.getSelection();

    if (selection) {
      doc.replaceSelection(snippet);
    } else {
      doc.replaceRange(snippet, cursor);
    }

    var newCursor = doc.getCursor();
    doc.setCursor(newCursor);
    cmEditor.focus();
  } else if (window.activeEditorInput) {
    var start = window.activeEditorInput.selectionStart,
        end = window.activeEditorInput.selectionEnd,
        val = window.activeEditorInput.value;

    window.activeEditorInput.value = val.substring(0, start) + snippet + val.substring(end);
    window.activeEditorInput.selectionStart = window.activeEditorInput.selectionEnd = start + snippet.length;
    window.activeEditorInput.focus();
    window.activeEditorInput.dispatchEvent(new Event('input'));
  }

  KantanModal.close();
}


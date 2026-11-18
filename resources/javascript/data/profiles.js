// List of major contributors and team members for Kantan Japanese
// Primarily used to show extended information on Authors and Team members to curious users
/*
  // SYNTAX
  // NOTE: ALIAS must be lowercase.
  // In the case of authors, names are pulled from the <span id="authors">Seth C, Tio, Mishy</span> tag and converted to a lowercase key for use with ALIAS
  // The keys returned from the example above are: ['seth_c', 'tio', 'mishy'] as you can see, any names with a space must use a underscore in the ALIAS
  ALIAS : {
    name : 'NAME',
    role : 'ROLE',
    about : 'BIO',
    avatar : 'AVATAR_NAME.EXTENSION',
    social : [ // NOTE: prefix a link with "p:" to indicate that a link goes to a portfolio (e.g., 'p:https://sethclydesdale.github.io/')
      'SOCIAL_LINKS'
    ]
  }
  
  // EMPTY
  ALIAS : {
    name : '',
    role : '',
    about : '',
    avatar : '',
    social : [
      
    ]
  },
*/
Kantan.profiles = {
  // Team Members
  seth : {
    name : 'Seth Clydesdale',
    role : 'Founder/Developer',
    about : 'Seth is the founder and creator of Kantan Japanese. He has been studying Japanese on his own since 2018 and has made a number of free and open source Japanese language learning resources, such as Genki Study Resources. He is very passionate about learning and teaching the Japanese language, and hopes to create an accessible platform that Japanese learners and teachers around the world can utilize to learn or teach the language, free of charge.',
    avatar : 'seth-c.webp',
    social : [
      'https://sethclydesdale.github.io/',
      'https://github.com/SethClydesdale',
      'https://x.com/SethC1995',
      'https://www.reddit.com/user/SelentoAnuri/'
    ]
  },
  
  'kan-tan' : {
    name : 'Kan-tan',
    role : 'Mascot/Your Classmate/Sweets Connoisseur',
    about : 'Kan-tan, also known as "Kanny," is the mascot for Kantan Japanese. She\'s a positive, outgoing, girl with a sweet tooth who\'s always looking out for her classmates. She firmly believes that you should never give up, and that a smile (or candy) can make anyone\'s day brighter.',
    avatar : 'kan-tan.webp',
    social : [
      'https://sethclydesdale.github.io/kantan-japanese/',
      'https://x.com/KantanJapanese',
      'https://reddit.com/r/KantanJapanese'
    ]
  },
  
  surimi_paste : {
    name : 'surimi_paste',
    role : 'Illustrator/Mascot Designer',
    about : "surimi_paste is the illustrator who lovingly designed and brought to life Kantan Japanese's mascot, Kan-tan. He also handles other illustrations on the website.",
    avatar : 'surimi_paste.webp',
    social : [
      'mailto:surimi_paste.business@protonmail.com'
    ]
  }
  
  // Major contributors
  // Maybe you...? 👉👈
};

// opens information about a major contributor or team member in a small popup window
Kantan.viewProfile = function (name, title) {
  // format social links
  var social = '';
  if (Kantan.profiles[name].social) {
    for (var i = 0, j = Kantan.profiles[name].social.length, types = {
      github : 'Github',
      twitter : 'X (Twitter)',
      reddit : 'Reddit',
      website : 'Website',
      portfolio : 'Portfolio',
      email : 'Email'
    }, type; i < j; i++) {
      // determine link type by domain or prefixes
      type = /github\.com/.test(Kantan.profiles[name].social[i]) ? 'github' :
             /x\.com/.test(Kantan.profiles[name].social[i]) ? 'twitter' :
             /reddit\.com/.test(Kantan.profiles[name].social[i]) ? 'reddit' :
             /^p:/.test(Kantan.profiles[name].social[i]) ? 'portfolio' :
             /^mailto:/.test(Kantan.profiles[name].social[i]) ? 'email' : 'website';

      social += '<a href="' + (type == 'portfolio' ? Kantan.profiles[name].social[i].replace(/^p:/, '') : Kantan.profiles[name].social[i]) + '" target="_blank" class="social-' + type + '" title="' + types[type] + '"></a>';
    }
  }

  // open popup with author information
  KantanModal.open({
    title : (title || 'Viewing ' + Kantan.profiles[name].name),
    content :
      '<div id="member-profile">'+
        '<div id="member-avatar"><div><img src="' + getPaths() + 'resources/images/avatars/' + Kantan.profiles[name].avatar + '"></div></div>'+
        '<div id="member-name">' + Kantan.profiles[name].name + '</div>'+
        '<div id="member-role">' + Kantan.profiles[name].role + '</div>'+
        (social ? '<div id="member-social" class="profile-links social-links">' + social + '</div>' : '')+
        '<div id="member-bio" class="panel">' + Kantan.profiles[name].about + '</div>'+
      '</div>',
    customSize : {
      top : '5%',
      left : '25%',
      right : '25%',
      bottom : '10%'
    }
  });
};

window.formatAuthorList = function() {
  // parses the author list in read-only pages
  var authors = document.getElementById('author-list');
  
  if (authors) {
    // get authors
    var authorList = authors.innerHTML.replace(/,\s/g, ',').replace(/\s/g, '_').split(','),
        authorKey;

    // build the author list
    for (var list = '', i = 0, j = authorList.length; i < j; i++) {
      authorKey = authorList[i].toLowerCase();
      if (Kantan.profiles[authorKey]) {
        list += '<span class="author-profile">'+
          '<a href="#" onclick="Kantan.viewProfile(\'' + authorKey + '\', \'Viewing Author\'); return false;">'+
            '<img src="' + getPaths() + 'resources/images/avatars/' + Kantan.profiles[authorKey].avatar + '">'+
          '</a>'+
          '<span class="author-name">' + Kantan.profiles[authorKey].name + '</span>'+
        '</span>';
      } else {
        list += '<span class="author-name-placeholder">' + authorList[i] + '</span>';
        console.error('"' + authorKey + '" could not be found in profiles.js. Please contact a developer and show them this message to fix this issue.');
      }
    }

    // add formatted author list to the document
    authors.dataset.originalList = authors.innerHTML;
    authors.innerHTML = list;
  }
};
formatAuthorList();

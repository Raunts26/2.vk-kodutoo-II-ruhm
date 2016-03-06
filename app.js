(function(){
  "use strict";

  var Computer = function() {

    if(Computer.instance) {
      return Computer.instance;
    }

    Computer.instance = this;

    this.routes = Computer.routes;
    this.buildRoutes = Computer.buildRoutes;

    console.log(this);

    this.currentRoute = null; // Hoian meeles, mis lehel olen
    this.interval = null;
    this.currentBuildRoute = "mb-view";

    //Hoian kõiki purke siin
    this.builds = [];

    // Panen rakenduse tööle
    this.init();
    };

    // Kirjeldatud kõik lehed
    Computer.routes = {
      "home-view": {
        render: function() {
          //Käivitan siis kui jõuan lehele
          console.log('JS avalehel');
        }
      },
      "list-view": {
        render: function() {
          console.log('JS loend');
        }
      },
      "build-view": {
        render: function() {
          console.log('JS haldus');
        }
      }
    };

    Computer.buildRoutes = {
      "mb-view": {
        render: function() {
          //Käivitan siis kui jõuan lehele
          console.log('Olen MB');
          document.querySelector('#mb-view').style.display = "block";
          document.querySelector('#cpu-view').style.display = "none";
        }
      },
      "cpu-view": {
        render: function() {
          console.log('Olen CPU');
          document.querySelector('#mb-view').style.display = "none";
          document.querySelector('#cpu-view').style.display = "block";
        }
      }
    };

    //Kõik moosipurgi fn tulevad siia sisse
    Computer.prototype = {
      init: function() {
        console.log('Rakendus OK');
        //Siia tuleb esialgne loogika

        //Vaatan, mis lehel olen, kui ei ole hashi lisan avalehe

        window.addEventListener('hashchange', this.routeChange.bind(this));

        console.log(window.location.hash);
        if(!window.location.hash) {
          window.location.hash = '#home-view';
        } else {
          //hash oli, käivitan routeChange function
          this.routeChange();
        }

        if(window.location.hash === '#build-view') {
          this.viewChange();
        }

        // Saan kätte purgid localStoragest, kui on
        if(localStorage.builds) {
          //Võtan stringi ja teen tagasi objektideks
          this.builds = JSON.parse(localStorage.builds);
          //console.log('laadisin localStoragest massiiivi ' + this.builds.length);

          //Tekitan loendi htmli
          this.builds.forEach(function(jar) {

            var new_jar = new Jar(jar.title, jar.ingredients, jar.date);

            var li = new_jar.createHtmlElement();
            document.querySelector('.list-of-jars').appendChild(li);
          });
        }

        //Hakka kuulama hiireklõpse
        this.bindEvents();
      },
      bindEvents: function() {
        document.querySelector('.add-mb').addEventListener('click', this.addNewClick.bind(this));

        // Kuulan trükkimist otsimisel
        document.querySelector('.search').addEventListener('keyup', this.search.bind(this));
      },

      search: function(event) {
        // otsikasti väärtus
        var needle = document.querySelector('.search').value.toLowerCase();
        console.log(needle);

        var list = document.querySelectorAll('ul.list-of-jars li');
        console.log(list);

        for(var i = 0; i < list.length; i++) {

          var li = list[i];

          //Yhe listitemi sisu tekst
          var stack = li.querySelector('.content').innerHTML.toLowerCase();
          // Kas otsisõna on sisus olemas
          if(stack.indexOf(needle) !== -1) {
            //olemas
            li.style.display = 'list-item';
          } else {
            // Ei ole
            li.style.display = 'none';
          }
        }
      },

      addNewClick: function(event) {
        //Lisa uus purk
        var motherboard = document.querySelector('.motherboard').value;
        var socket = document.querySelector('.socket').value;
        var ram_socket = document.querySelector('.ram-socket').value;
        var max_ram = document.querySelector('.max-ram').value;
        var sata = document.querySelector('.sata').value;
        var sata_amount = document.querySelector('.sata-amount').value;

        if(motherboard === "" || socket === "" || ram_socket === "" || max_ram === "" || sata === "" || sata_amount === "") {
          this.showAnswer(false);
        } else {
          this.currentBuildRoute = "cpu-view";
          this.viewChange();
          this.showAnswer(true);

          /*var new_jar = new Jar(title, ingredients, date);

          //Lisan massiivi purgi
          this.builds.push(new_jar);
          console.log(JSON.stringify(this.builds));
          // JSONI stringina salvestan localStorage'sse
          localStorage.setItem('jars', JSON.stringify(this.builds));

          var li = new_jar.createHtmlElement();
          document.querySelector('.list-of-jars').appendChild(li);*/
        }

      },
      showAnswer: function(bool) {
        if(bool === true) {
          document.querySelector('.answer').innerHTML = "<strong><p style='color: green;'>Salvestatud!</p></strong>";
        } else {
          document.querySelector('.answer').innerHTML = "<strong><p style='color: red;'>Palun täida kõik lahtrid!</p></strong>";
        }
      },

      viewChange: function() {
        if(this.buildRoutes[this.currentBuildRoute]) {
          console.log('ASD>>> ' + this.currentBuildRoute);

          this.buildRoutes[this.currentBuildRoute].render();
        } else {
          // 404
          console.log("404");
          window.location.hash = '#home-view';
        }
      },

      routeChange: function(event) {
        this.currentRoute = window.location.hash.slice(1);

        // kas leht on olemas
        if(this.routes[this.currentRoute]) {

          this.updateMenu();

          console.log('>>> ' + this.currentRoute);
          //Käivitan selle lehe jaoks ettenähtud js
          this.routes[this.currentRoute].render();
        } else {
          // 404
          console.log("404");
          window.location.hash = "#home-view";
        }
      },
      updateMenu: function() {
        // Kui on mingil menüül klass active-menu siis võtame ära
        document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', "");

        // Käesolevale lehele lisan juurde
        document.querySelector('.' + this.currentRoute).className += " active-menu";


      }



    };

    var Jar = function(title, ingredients, date) {
      this.title = title;
      this.ingredients = ingredients;
      this.date = date;
    };

    Jar.prototype = {
      createHtmlElement: function() {
        // Anda tagasi ilus html
        // li
        //  span.letter
        //    M
        //  span.content
        //    title | ingredients

        var li = document.createElement('li');

        var span = document.createElement('span');
        span.className = 'letter';

        var letter = document.createTextNode(this.title.charAt(0));
        span.appendChild(letter);

        li.appendChild(span);

        var content_span = document.createElement('span');
        content_span.className = 'content';

        var content = document.createTextNode(this.title + ' | ' + this.ingredients + ' | ' + this.date);
        content_span.appendChild(content);

        li.appendChild(content_span);

        //console.log(li);

        return li;
      }
    };

    window.onload = function() {
      var app = new Computer();

    };



}) ();

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
    this.id = null;

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
          this.builds.forEach(function(component) {

            var new_component = new Component(guid(), component.mb_name, component.mb_cpu_socket, component.cpu_name, component.cpu_socket);

            var li = new_component.createHtmlElement();
            document.querySelector('.list-of-builds').appendChild(li);
          });
        }

        //Hakka kuulama hiireklõpse
        this.checkCPU();
        this.bindEvents();
      },
      bindEvents: function() {
        document.querySelector('.add-mb').addEventListener('click', this.addNewMB.bind(this));
        document.querySelector('.add-cpu').addEventListener('click', this.addNewCPU.bind(this));

        // Kuulan trükkimist otsimisel
        document.querySelector('.search').addEventListener('keyup', this.search.bind(this));
      },

      search: function(event) {
        // otsikasti väärtus
        var needle = document.querySelector('.search').value.toLowerCase();
        console.log(needle);

        var list = document.querySelectorAll('ul.list-of-builds li');
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

      addNewMB: function(event) {
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
          this.id = guid();
          var new_component = new Component(this.id, motherboard, socket);

          //Lisan massiivi purgi
          this.builds.push(new_component);
          console.log(JSON.stringify(this.builds));
          // JSONI stringina salvestan localStorage'sse
          localStorage.setItem('builds', JSON.stringify(this.builds));

          var li = new_component.createHtmlElement();
          document.querySelector('.list-of-builds').appendChild(li);
        }

      },

      addNewCPU: function(event) {
        //Lisa uus purk
        var name = document.querySelector('.cpu_name').value;
        var socket = document.querySelector('.cpu_socket').value;

        if(name === "" || socket === "") {
          this.showAnswer(false);
        } else {
          this.currentBuildRoute = "mb-view";
          this.viewChange();
          this.showAnswer(true);

          var current_place = 0;

          for(var i = 0; i < this.builds.length; i++) {
            if(this.builds[i].id === this.id) {
              current_place = i;
            }
          }

          var current = this.builds[current_place];

          document.getElementById('build-' + (this.id)).style.display = "none";
          var new_component = new Component(current.id, current.mb_name, current.mb_cpu_socket, name, socket);
          this.builds.splice(current_place, 1, new_component);
          //Lisan massiivi purgi
          //this.builds.push(new_component);
          console.log(JSON.stringify(this.builds));
          // JSONI stringina salvestan localStorage'sse
          localStorage.setItem('builds', JSON.stringify(this.builds));

          var li = new_component.createHtmlElement();
          document.querySelector('.list-of-builds').appendChild(li);
        }

      },

      checkCPU: function(event) {
        var cpu = null;
        var that = this;
        var current = 0;

        document.querySelector('#cpu_socket').addEventListener("keyup", function() {
          cpu = document.getElementById('cpu_socket').value;
          if(localStorage.builds) {

            for(var i = 0; i < that.builds.length; i++) {
              if(that.builds[i].id === that.id) {
                current = i;
              }
            }


            if(cpu != that.builds[current].mb_cpu_socket) {
              document.querySelector('.answer').innerHTML = "<strong><p style='color: red;'>Pesad ei sobi omavahel kokku!</p></strong>";
            } else {
              document.querySelector('.answer').innerHTML = "<strong><p style='color: green;'>Klapib!</p></strong>";
            }
          }
        });

      },

      showAnswer: function(bool) {
        if(bool === true) {
          document.querySelector('.answer').innerHTML = "<strong><p style='color: green;'>Salvestatud!</p></strong>";
        } else {
          document.querySelector('.answer').innerHTML = "<strong><p style='color: red;'>Palun täida kõik lahtrid!</p></strong>";
        }
      },

      deleteBuild: function(event) {

        console.log(event.target);

        //Li
        console.log(event.target.parentNode);

        //UL
        console.log(event.target.parentNode.parentNode);

        //id
        console.log(event.target.dataset);

        
        var c = confirm("Oled kindel?");

        //Ei
        if(!c) {
          return;
        }

        var ul = event.target.parentNode.parentNode;
        var li = event.target.parentNode;

        ul.removeChild(li);

        var delete_id = event.target.dataset.id;

        //Kustutan objekti
        for(var i = 0; i < this.builds.length; i++) {
          if(this.builds[i].id == delete_id) {
            this.builds.splice(i, 1);
            break;
          }
        }

        localStorage.setItem("builds", JSON.stringify(this.builds));
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
          //window.location.hash = "#home-view";
        }
      },
      updateMenu: function() {
        // Kui on mingil menüül klass active-menu siis võtame ära
        document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', "");

        // Käesolevale lehele lisan juurde
        document.querySelector('.' + this.currentRoute).className += " active-menu";


      }



    };

    var Component = function(id, mb_name, mb_cpu_socket, cpu_name, cpu_socket) {
      this.id = id;
      this.mb_name = mb_name;
      this.mb_cpu_socket = mb_cpu_socket;
      this.cpu_name = cpu_name;
      this.cpu_socket = cpu_socket;
    };

    Component.prototype = {
      createHtmlElement: function() {

        var li = document.createElement('li');
        li.id = 'build-' + this.id;

        /*var span = document.createElement('span');
        span.className = 'letter';

        var letter = document.createTextNode(this.mb_name);
        span.appendChild(letter);

        li.appendChild(span);*/

        var content_span = document.createElement('span');
        content_span.className = 'content';

        var content = document.createTextNode('MB: ' + this.mb_name + ', CPU: ' + this.cpu_name);
        content_span.appendChild(content);

        li.appendChild(content_span);

        var span_delete = document.createElement('span');
        span_delete.style.color = "#FF0000";
        span_delete.style.cursor = "pointer";

        span_delete.setAttribute("data-id", this.id);

        span_delete.innerHTML = " Delete";
        li.appendChild(span_delete);

        span_delete.addEventListener("click", Computer.instance.deleteBuild.bind(Computer.instance));


        //console.log(li);

        return li;
      }
    };

    function guid(){
      var d = new Date().getTime();
      if(window.performance && typeof window.performance.now === "function"){
          d += performance.now(); //use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    }

    window.onload = function() {
      var app = new Computer();

    };



}) ();

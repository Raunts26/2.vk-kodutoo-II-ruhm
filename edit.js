(function(){
  "use strict";

  var EditComputer = function(edit_id) {

    if(EditComputer.instance) {
      return EditComputer.instance;
    }

    EditComputer.instance = this;

    console.log(this);

    this.id = edit_id;

    this.init();
    };

    window.EditComputer = EditComputer;





    //Kõik moosipurgi fn tulevad siia sisse
    EditComputer.prototype = {
      init: function() {
        console.log('Rakendus OK');

        // Saan kätte purgid localStoragest, kui on
        if(localStorage.builds) {
          //Võtan stringi ja teen tagasi objektideks
          Computer.instance.builds = JSON.parse(localStorage.builds);
          //console.log('laadisin localStoragest massiiivi ' + this.builds.length);

          //Tekitan loendi htmli
          Computer.instance.builds.forEach(function(component) {

            //var new_component = new Component(component.id, component.mb_name, component.mb_cpu_socket, component.cpu_name, component.cpu_socket);

            //var li = new_component.createHtmlElement();
            //document.querySelector('.list-of-builds').appendChild(li);
          });
        }

        this.bindEvents();


      },
      bindEvents: function() {
        document.querySelector('.edit-mb').addEventListener('click', this.editMB.bind(this));
        //document.querySelector('.add-cpu').addEventListener('click', this.addNewCPU.bind(this));

      },

      editMB: function() {

        var name = document.querySelector(".motherboard-edit").value;
        var socket = document.querySelector('.socket-edit').value;
        console.log(name + '');
        if(name === "" || socket === "") {
          Computer.instance.showAnswer(false);
        } else {
          Computer.instance.currentBuildRoute = "cpu-view";
          Computer.instance.viewChange();
          Computer.instance.showAnswer(true);

          var current_place = 0;

          for(var i = 0; i < Computer.instance.builds.length; i++) {
            if(Computer.instance.builds[i].id === this.id) {
              current_place = i;
            }
          }

          var current = Computer.instance.builds[current_place];
          console.log("current>>>" + current_place);
          document.getElementById('build-' + (this.id)).style.display = "none";
          var new_component = new Component(current.id, name, socket);
          Computer.instance.builds.splice(current_place, 1);
          //Lisan massiivi purgi
          //this.builds.push(new_component);
          console.log(JSON.stringify(Computer.instance.builds));
          // JSONI stringina salvestan localStorage'sse
          localStorage.setItem('builds', JSON.stringify(Computer.instance.builds));

          //var li = new_component.createHtmlElement();
          //document.querySelector('.list-of-builds').appendChild(li);



        }
      }





    };


}) ();

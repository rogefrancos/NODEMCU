
   var config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };



  firebase.initializeApp(config);
  var db = firebase.database();

  var sensor = 'sensorAct';

  var foco1 = firebase.database().ref(sensor).child('foco1');
  var foco2 = firebase.database().ref(sensor).child('foco2');
  var temperatura = firebase.database().ref(sensor).child('temperatura');
  var humedad = firebase.database().ref(sensor).child('humedad');
  
  var temFin;
  var humFin;
  


  
$(document).ready(function(){

  setTimeout(cargaColor, 1000); // carga la paleta de colores depues de 1 segundo

    foco1.on("value", function(snapshot){
          var valor = snapshot.val();
          console.log(valor);

          if(valor != 'on'){
              $('#foco1').prop('checked', false);
          }else{
              $('#foco1').prop('checked', true);
          }

     });


    foco2.on("value", function(snapshot){
          var valor = snapshot.val();
          console.log(valor);

          if(valor != 'on'){
              $('#foco2').prop('checked', false);
          }else{
              $('#foco2').prop('checked', true);
          }

     });







    temperatura.on("value", function(snapshot){
          var tem = snapshot.val();
          temFin = snapshot.val();
          console.log(tem);
          //document.getElementById("DO_val").innerHTML = tem;
          $("#grados").gaugeMeter({percent:tem});
     });


    humedad.on("value", function(snapshot){
          var hum = snapshot.val();
          humFin = snapshot.val();

          $("#humedadMarca").gaugeMeter({percent:hum});

     });



    $("#foco1 , #foco2 ").on( 'change', function() {

        var foco1 = $('#foco1').is(':checked');
        var foco2 = $('#foco2').is(':checked');
        

         if(foco1 == true){
            db.ref('focos').update({ foco1: "on"});
         }else{
            db.ref('focos').update({ foco1: "off"});
         }

         if(foco2 == true){
            db.ref('focos').update({ foco2: "on"});
         }else{
            db.ref('focos').update({ foco2: "off"});
         }

         

    });

    


$(".GaugeMeter").gaugeMeter();

// selector de colores


    function cargaColor(){
          var example = new iro.ColorPicker(".wrapper", {

                    width: 320,
                    height: 320,
                    color: colorRGB,
                    anticlockwise: true,
                    borderWidth: 1,
                    borderColor: "#fff",
                     });


          example.on("color:change", function (color) {

                    //console.log(color.rgbString)
                    rgbFire = color.rgb;
                    db.ref('focos').update({ rgb: rgbFire });

           });





// end selector colores


   /* preloader
    * -------------------------------------------------- */
    var clPreloader = function() {

        $("html").addClass('cl-preload');
        $('#preloader').hide();

    };



    clPreloader();


    }




});

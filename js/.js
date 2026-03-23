
   var config = {
    apiKey: "https://fcbtest-dd0e9.firebaseio.com",
    authDomain: "https://fcbtest-dd0e9.firebaseio.com",
    databaseURL: "https://fcbtest-dd0e9.firebaseio.com",
    projectId: "qwer",
    storageBucket: "qwre",
    messagingSenderId: "2"
  };
  


  firebase.initializeApp(config);
  var db = firebase.database();

  var casa = 'casa1';

  var foco1 = firebase.database().ref(casa).child('foco1');
  var foco2 = firebase.database().ref(casa).child('foco2');
  
  var alarma = firebase.database().ref(casa).child('alarma');
  var movimiento = firebase.database().ref(casa).child('movimiento');
  var temperatura = firebase.database().ref(casa).child('temperatura');
  var humedad = firebase.database().ref(casa).child('humedad');
  var rgbLed = firebase.database().ref(casa).child('rgb');
  var gasSensor = firebase.database().ref(casa).child('gasEstado');
  var dimmer = firebase.database().ref(casa).child('dimmer');

  var tv = firebase.database().ref(casa).child('tv');
  var netflix = firebase.database().ref(casa).child('netflix');
  var youtube = firebase.database().ref(casa).child('youtube');

  var temFin;
  var humFin;
  var gasStatus;
  
  var colorRGB; // color leds
  
  var parpadeo;
  


  function detectaMov(){

       $('.mov').text(' Moviemiento!!');
       $(".mov").fadeTo(500, .1)
                .fadeTo(500, 1);
       $(".movImg").fadeTo(500, .1)
                .fadeTo(500, 1);

  }

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



    alarma.on("value", function(snapshot){
          var valor = snapshot.val(); 
          console.log(valor); 
        
          if(valor != 'on'){
              console.log('sensor activado');
              $('#sensorMovimiento').prop('checked', false);
          }else{
              db.ref('casa1').update({ movimiento: "off"});
              console.log('sensor desactivado');
              $('#sensorMovimiento').prop('checked', true);
          }
                
     });

    movimiento.on("value", function(snapshot){
          var valor = snapshot.val(); 
          console.log(valor); 
        
          if(valor == 'on'){
            console.log('se detecta Moviemiento');
            parpadeo =  setTimeout(detectaMov, 1000); // le damos un delay para que alcance a cargar el ultimo valor en fire
          }else{
            clearInterval(parpadeo); // detenido
            $('.mov').text(' Movimiento');
              
          }                
     });


    

    temperatura.on("value", function(snapshot){
          var tem = snapshot.val(); 
          temFin = snapshot.val(); 

          $("#grados").gaugeMeter({percent:tem});
     });


    humedad.on("value", function(snapshot){
          var hum = snapshot.val(); 
          humFin = snapshot.val(); 

          $("#humedadMarca").gaugeMeter({percent:hum});
                  
     });


    rgbLed.on("value", function(snapshot){
                            
          colorRGB = snapshot.val(); 
          console.log(colorRGB)

     });


    dimmer.on("value", function(snapshot){
                            
          dim = snapshot.val(); 
          $('#dimvalue').val(dim); // acrualiza el slider 

     });



    gasSensor.on("value", function(snapshot){
          var valor = snapshot.val(); 
          console.log(valor)
          gasStatus = valor;
          $(".gasStatus").text("Gas detectado");

          if(valor == 'G' ){
             $(".star").hide();
             $(".gasStatus").text("Gas");
             }
          
          if(valor == 'P'){
            $(".star").show();
            responsiveVoice.speak('Peligro! altos grados de gas detectados', "Spanish Latin American Female");
          }

          if(valor == 'D'){
            $(".star").show();
            responsiveVoice.speak('Cuidado, Gas detectado', "Spanish Latin American Female");
          }
                
     });

    tv.on("value", function(snapshot){
          var valor = snapshot.val(); 
          console.log(valor); 
        
          if(valor != 'on'){
              $('#tv').prop('checked', false);
          }else{
              $('#tv').prop('checked', true);
          }
                
     });



    
      
    $("#foco1 , #foco2 , #sensorMovimiento , #tv ").on( 'change', function() {

        var foco1 = $('#foco1').is(':checked');
        var foco2 = $('#foco2').is(':checked');
        var sensor = $('#sensorMovimiento').is(':checked');
        var tv = $('#tv').is(':checked');
          
         if(foco1 == true){
            db.ref('casa1').update({ foco1: "on"});
         }else{
            db.ref('casa1').update({ foco1: "off"});
         }

         if(foco2 == true){
            db.ref('casa1').update({ foco2: "on"});
         }else{
            db.ref('casa1').update({ foco2: "off"});
         }

         if(sensor == true){
            db.ref('casa1').update({ alarma: "on"});
         }else{
            db.ref('casa1').update({ alarma: "off"});
         }

         if(tv == true){
            db.ref('casa1').update({ tv: "on"});
         }else{
            db.ref('casa1').update({ tv: "off"});
         }

    });


    $('#aromatizante').on('click',function(){

        db.ref('casa1').update({ aromatizante: "on"});

      });


    $('#netflix').on('click',function(){

        db.ref('casa1').update({ netflix: "on"});

      });

    $('#youtube').on('click',function(){

        db.ref('casa1').update({ youtube: "on"});

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
                    db.ref('casa1').update({ rgb: rgbFire });

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


// asistente    


  $('#dimvalue').on("input", function(e) {
          //console.log($("#dimvalue").val());
          valor = $("#dimvalue").val();
          db.ref('casa1').update({ dimmer: parseInt(valor) });
          
          
  })
//valores
//$('#focoEntrada').prop('checked', true);
//$('#focoEntrada').prop('checked', false);

});

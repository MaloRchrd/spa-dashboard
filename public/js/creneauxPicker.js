
(function() {

  // creation creneaux picker.

var timeNow = new Date;
var firstTimeAvailable = (timeNow.getHours()+1);
var creneaux = [ 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]

var creneauxArea = document.getElementById('creneauxArea')
var selectTime = document.createElement("select");
selectTime.id = "creneau";
selectTime.setAttribute('name', 'creneau');
selectTime.className = "form-control"
creneauxArea.appendChild(selectTime);

for (var i = 0; i < creneaux.length; i++) {
  if (creneaux[i]<firstTimeAvailable){
    }else {
    if (creneaux[i+1]){
      var option = document.createElement("option");
      option.value = creneaux[i]+'h - '+ creneaux[i+1]+'h';
      option.text = creneaux[i]+'h - '+ creneaux[i+1]+'h';
      selectTime.appendChild(option);
    }
  }
}


})();
// les créneaux disponibles sont toutes les heures pleines entre 9h et 21h sachant qu'un créneau peut être réservé uniquement pour l'heure suivant le signalement ou après

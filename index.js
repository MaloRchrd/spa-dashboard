const express = require('express');
const mongo = require('mongodb');
const nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const db = require('./db');
const pug = require('pug');
var app = express();

// Mongo
var URL = 'mongodb://localhost:27017/spadashboard';
var connectDB;

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// static folder
app.use("/public", express.static(__dirname + '/public'));


// Init pug
app.set('view engine', 'pug')
app.set('views',__dirname + '/views');

// init nodemailer
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dashboard.spa@gmail.com',
        pass: 'HelloSPA!'
    }
});

// dashboard
app.get('/',function (req,res) {
    db.get().collection('spadashboard').find({}).toArray(function(error, data) {
    // console.log(data);

      res.render('dashboard', {animaux: data}) // render  index using pug
    });
  });

// recieve post from /addanimal
app.post('/',function(req,res) {
    var date = new Date();
    date = date.toLocaleDateString()
    console.log(req.body);
    db.get().collection('spadashboard').insertOne({
      animal : req.body.Animal,
      adresse : req.body.Address,
      creneau : req.body.creneau,
      collier: req.body.collier,
      couleur : req.body.couleur,
      etat : req.body.etat,
      alerteur: req.body.email,
      date : date,
      statuts: 'Signalé',
      brigade: ''
   }, function(err, result) {
     if (err) {
       console.log(err);
     }else {

       // define email
       let mailOptions = {
         from: '"SPA 🐱 🐶 🐰 🐦" <dashboard.spa@gmail.com>', // email sender
         to: 'malo.rchrd@gmail.com', // Admin email
         subject: 'Nouveau Signalement 🐱', // Subjet
        //  text: 'Hello world ?', // plain text body
         html: '<b>Bonjour Admin</b> <br> <p>un nouveau '+req.body.Animal+' a été signalé. </p> <p>Il se trouve @ '+req.body.Address+'. </p>' // html body
       };
       // send mail to Admin
       transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
           return console.log(error);
         }
         console.log('Message %s sent: %s', info.messageId, info.response);
       });
       console.log("Inserted a new articles in spadashboard collection.");
       res.redirect('/'); // render using pug
     }
  });
});

// add annimal
app.get('/addanimal',function (req,res) {
  // console.log(req.body);
  res.render('form-spa');
});

//edit annimal
app.get('/edit/:id',function (req,res) {
  var id = new mongo.ObjectID(req.params.id);
  console.log(id);
  db.get().collection('spadashboard').findOne({'_id' :id },function(error,data) {
    console.log(data);

  res.render('edit', {animaux: data}) // render  index using pug
  });
});



// recieve post /edit and update mongo data
app.post('/update/:id',function(req,res) {
    var id = new mongo.ObjectID(req.params.id);
    var date = new Date();
    date = date.toLocaleDateString()
    var statut;
    if (req.body.brigade) {
    statut = 'Assigné';
    }
    db.get().collection('spadashboard').updateOne(
      { "_id" : id },
      { $set:
        { animal : req.body.Animal,
        adresse : req.body.Address,
        collier: req.body.collier,
        couleur : req.body.couleur,
        etat : req.body.etat,
        alerteur: req.body.email,
        date : date,
        statuts: statut,
        brigade: req.body.brigade
     }}, function(err, result) {
     if (err) {
       console.log(err);
      //  res.redirect('/addanimal');
     }else {
       console.log(" update animal "+id+" in spadashboard collection.");
       res.redirect('/'); // render using pug
     }
  });
});

// result of brigade intervention
app.get('/result/:id',function (req,res) {
  var id = new mongo.ObjectID(req.params.id);
  console.log(id);
  db.get().collection('spadashboard').findOne({'_id' :id },function(error,data) {
    console.log(data);

  res.render('result', {animaux: data}) // render  index using pug
  });
});

// recieve post /result and update statuts
app.post('/finish/:id',function(req,res) {
    var id = new mongo.ObjectID(req.params.id);

    db.get().collection('spadashboard').updateOne(
      { "_id" : id },
      { $set:{ statuts: req.body.statuts}}, function(err, result) {
        if (err) {
       console.log(err);
     }else {

       var data = db.get().collection('spadashboard').findOne({"_id" : id},function(error,data) {
         console.log(data.alerteur);

         // define email
         let mailOptions = {
           from: '"SPA 🐱 🐶 🐰 🐦" <dashboard.spa@gmail.com>', // email sender
           to: data.alerteur, // Admin email
           subject: 'Votre signalement 🐱', // Subjet
          //  text: 'Hello world ?', // plain text body
           html: '<b>Bonjour,</b> <br> <p>Votre signalement a été pris en charge. </p> <p>Le résultat de la brigade est : '+data.statuts+'. </p><p>Encore merci pour votre signalement.</p>' // html body
         };
         // send mail to alerteur
         transporter.sendMail(mailOptions, (error, info) => {
           if (error) {
             return console.log(error);
           }
           console.log('Message %s sent: %s', info.messageId, info.response);
         });
       });
       console.log("status updated to "+req.body.statuts+".");
       res.redirect('/');
     }
  });
});


//connect Mongo and start serveur
db.connect(URL, function(err, db) {
  if (err) {
    return;
  }
  var server = app.listen(8888,function(){
    console.log('Mongo started and serveur running port 8888');
  });
});

const express = require('express');
const app = express();
const db = require('./db');
//to handle incoming files

const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');

const s3 = require('./s3.js')


app.use(express.static('public'));


const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152 //limits the size of files
    }
});


app.get('/cards', (req, res) => {
    db.getImages().then(results => {
        //console.log(results.rows);
        const cards = results.rows;
        res.json(cards);
    }).catch(err => {
        console.log('err: ', err);
    });

});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    //console.log('all worked well')
    //console.log('file:', req.file)
    //console.log('req.body', req.body.title)
    //let { title, description, username, } = req.body;
    let title = req.body.title;
    let description = req.body.description;
    let username = req.body.username;
    let filename = req.file.filename;
    let url = `https://s3.amazonaws.com/spicedling/${filename}`;
    console.log('title:::', title)
    if (req.file) {
        db.addImages(title, description, username, url).then(results => {
            //console.log('results from addImages: ', results.rows[0])
            res.json(results.rows[0])
        }).catch(err => {
            console.log('err: ', err)
        });
    } else {
        res.json({ success: false })
    }
})

app.get('/image/:id', (req, res) => {
    console.log('req.params.id:::', req.params.id)
    db.getSelectedImage(req.params.id).then(results => {
        //console.log('results.rows in getSelectedImage: ', results.rows[0]);
        res.json(results.rows[0])
    }).catch(err => {
        console.log('error: ', err);
        res.json([]);
    });
})

app.use(express.json())

app.post('/comment', (req, res) => {
    console.log('comment working well')
    console.log('req.body: ', req.body)
    let comment = req.body.comment;
    let username = req.body.userName;
    let imageId = req.body.imageId;
    db.addComment(comment, username, imageId).then(results => {
        console.log('comments in post:::::::::', results.rows)
        res.json(results.rows[0])
    }).catch(err => {
        console.log('error:', err);
    })
})

app.get('/comment/:id', (req, res) => {
    console.log('req.params.id in COMMENT:::', req.params.id);
    db.getComment(req.params.id).then(results => {
        console.log('results of the get/comment: ', results.rows);
        res.json(results.rows);
    }).catch(err => {
        console.log('error :', err);
    });
})

app.get('/more/:id', (req, res) => {
    console.log('req.params.id in more:::', req.params.id);
    db.getMoreImages(req.params.id).then(results => {
        console.log('results', results);
        res.json(results);
    }).catch(err => {
        console.log('error: ', err);
        res.json([]);
    })
})



app.listen(8080, () => console.log('server 8080 running'));
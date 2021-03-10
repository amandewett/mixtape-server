var express = require('express');
var router = express.Router();
let fileModel = require('../models/file');
let fs = require("fs");
let async = require('async');
let path = require("path");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Mixtape Server'
  });
});

//callback API
router.get('/callback', (req, res) => {
  let code = req.query.code;
  res.json({
    status: true,
    result: code
  });
});

//Add new track to the server
router.post('/add', async (req, res) => {
  try {
    let trackFile = req.files.track;
    let trackDir = "./public/tracks/";

    if (!fs.existsSync(trackDir)) {
      fs.mkdirSync(
        trackDir, {
          recursive: true,
        },
        (err) => {
          if (err) throw err;
        }
      );
    }
    if (trackFile) {
      let ext = path.extname(trackFile.name);

      if (ext === '.mp3') {
        let fileLocation = `./tracks/myTrack${ext}`;
        let filePath = `${trackDir}myTrack${ext}`;
        await trackFile.mv(filePath);

        const trackObject = new fileModel({
          fileName: trackFile.name,
          filePath: fileLocation,
          ext: ext,
          fileSize: trackFile.size,
          fileMimetype: trackFile.mimetype,
          fileMd5: trackFile.md5,
          hits: 0
        });
        await trackObject.save();

        res.json({
          status: true,
          result: `${process.env.MY_HOST}${fileLocation}`
        });
      } else {
        res.json({
          status: false,
          message: 'Only MP3 files are allowed.'
        });
      }
    } else {
      res.json({
        status: false,
        message: 'File not found'
      });
    }
  } catch (e) {
    console.log(e);
    res.json({
      status: false,
      error: 'error'
    });
  }
});

//get number of hits on latest track
router.get('/getHits', async (req, res) => {
  try {
    let isExist = await fileModel.find().lean().sort({
      "createdAt": -1
    });
    if (isExist.length != 0) {
      res.json({
        status: true,
        result: isExist[0].hits
      });
    } else {
      res.json({
        status: false,
        message: 'Database empty'
      });
    }

  } catch (e) {
    console.log(e);
    res.json({
      status: false,
      error: 'error'
    });
  }
});

//increasing track played counter
router.get('/hit', async (req, res) => {
  try {
    let isExist = await fileModel.find().lean().sort({
      createdAt: -1
    });
    if (isExist.length != 0) {
      await fileModel.updateOne({
        _id: isExist[0]._id
      }, {
        $set: {
          hits: isExist[0].hits + 1
        }
      });
      res.json({
        status: true,
        message: 'Success'
      });
    } else {
      res.json({
        status: false,
        message: 'Database empty'
      });
    }
  } catch (e) {
    console.log(e);
    res.json({
      status: false,
      error: 'error'
    });
  }
});

module.exports = router;
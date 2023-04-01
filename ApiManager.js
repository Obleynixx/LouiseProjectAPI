var port = process.env.PORT || 8000;
const express = require('express');
const app = express();
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');

const KEY_AUTHORIZATION = 'FaceTheWrathOfThor';
var takeDownAPI = 0;
//run only once
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://apilouise.azurewebsites.net');
  next();
});
app.use(bodyParser.json()); // for parsing JSON data
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded data

// Define storage for uploaded files
const storage = multer.memoryStorage();

// Define file filter to only allow audio files
const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('File must be an audio file.'), false);
  }
};

// Initialize multer middleware with the storage and file filter options
const upload = multer({ storage: storage, fileFilter: fileFilter });
// Define route that requires an audio file
//Save audio file
function saveAudioFile(audioFile) {
  return new Promise((resolve, reject) => {
    const dir = 'Audios';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const ext = path.extname(audioFile.originalname).toLowerCase();
    if (ext === '.m4a' || ext === '.webm') {
      const filename = 'audio' + ext;
      fs.writeFile(`Audios/${filename}`, audioFile.buffer, { flag: 'w', encoding: 'binary' }, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`Saved ${filename}!`);
          resolve(filename);
        }
      });
    } else {
      reject(new Error('Invalid file format'));
    }
  });
}
function saveAudioFileNightcore(audioFile) {
  return new Promise((resolve, reject) => {
    const dir = 'LouiseNightcore/Audio';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const ext = path.extname(audioFile.originalname).toLowerCase();
    if (ext === '.mp3' || ext === '.mp3') {
      const filename = 'audio' + ext;
      fs.writeFile(`LouiseNightcore/Audio/${filename}`, audioFile.buffer, { flag: 'w', encoding: 'binary' }, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`Saved ${filename}!`);
          resolve(filename);
        }
      });
    } else {
      reject(new Error('Invalid file format'));
    }
  });
}
function deleteAudioFiles(dirr) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirr, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const unlinkPromises = [];
        for (const file of files) {
          if (file.toLowerCase() === 'readme.txt') {
            continue;
          }
          const filePath = path.join(dirr, file);
          unlinkPromises.push(fs.promises.unlink(filePath));
        }
        Promise.all(unlinkPromises)
          .then(() => {
            console.log('All audio files deleted');
            resolve();
          })
          .catch((err) => {
            console.error(`Error deleting audio files: ${err.message}`);
            reject(err);
          });
      }
    });
  });
}
//Python app.js(send to openai Whisper api)
const runPythonScript = (args) => {
  return spawn('python3', args); //LEMBRAR DE MUDAR PARA PYTHON3 QUANDO NÃO ESTIVER TESTANDO
};
app.use(express.static(path.join(__dirname, '/')));
app.post('/RunLouiseAudio', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'json', maxCount: 1 }]), async (req, res) => {
  // Handle the uploaded file here
  if (takeDownAPI > 4) {
    console.log('Too many wrong authentications stopping the process');
    res.status(500).send('Authentication Failed Try Later!');
    process.exit();
  }
  console.log(req.body);
  const audioFile = req.files['audio'][0];

  const extension = path.extname(audioFile.originalname).toLowerCase();

  if (extension !== '.m4a' && extension !== '.webm') {
    console.log('FileType wrong');
    res.status(500).send('FileType Wrong!');
    return;
  }

  const json = JSON.parse(req.body['json']); // parse the JSON data from the request body
  const authorization = json.authorization;
  if (authorization == 'stop') {
    console.log('Stopping process');
    res.status(500).send('Authentication Failed Try Later!');
    process.exit();
  }
  const mood = json.mood;
  const voice_mode = json.voiceGender;
  if (authorization != KEY_AUTHORIZATION) {
    res.status(500).send('Authentication Failed!');
    console.log('Authentication failed ' + authorization);
    takeDownAPI += 1;
    return;
  }
  await deleteAudioFiles('Audios');

  await saveAudioFile(audioFile);
  // Code that needs to wait for the file to be saved

  const pythonProcess = runPythonScript(['app.py']);
  //python script ran and created an result.txt that i will now modify
  pythonProcess.on('close', async (code) => {
    try {

      if (code === 0) {
        let result = null;
        let retries = 0;
        while (!fs.existsSync('result.txt') && retries < 10) {
          console.log('Retrying...')
          retries++;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait for 2 seconds before retrying
        if (fs.existsSync('result.txt')) {
          console.log('Transcription Done ');
          result = fs.readFileSync('result.txt', 'utf-8');
          const transcript = JSON.parse(result);
          var textContent = transcript['text']['text'];
          textContent += '&' + mood + '&' + voice_mode;
          console.log('user input: ' + textContent);
          //Send and receive data from ChatGPT
          const child2 = spawn('node', ['ChatBot.js']);
          console.log('Sending text to ChatGPT');
          child2.stdin.setEncoding('utf-8');
          child2.stdin.write(textContent);
          child2.stdin.end();
          child2.stdout.on('data', (data) => {
            //Logs ChatGPT Message
            console.log(`ChatBot stdout:\n${data}`);
            //Send data to Microsoft Azure Cognition Service and receives a new file called YourAudioFile.mp3
            const child = spawn('node', ['SynthetizeText.js']);
            child.stdin.setEncoding('utf-8');
            textContent = data + '&' + 'none' + '&' + voice_mode;
            child.stdin.write(textContent);
            child.stdin.end();
            child.on('close', async (code) => {
              console.log(`Synthetize process exited with code ${code}`);
              fs.readFile('YourAudioFile.mp3', (err, data) => {
                if (err) {
                  console.error(err);
                  res.status(500).send('Error reading audio file');
                } else {
                  //unlink the result
                  fs.unlink('result.txt', (err) => {
                    if (err) throw err;
                    console.log('File deleted');
                  });

                  // Set the Content-Type header to the appropriate MIME type
                  res.set('Content-Type', 'audio/mp3');

                  // Send the audio data as the response body
                  res.send(data);
                  deleteAudioFiles('Audios');
                }
              });
            });
            child2.on('close', async (code) => {
              console.log(`ChatBot process exited with code ${code}`);
            });
          });
        }


      }
      else {
        res.status(500).send('Something went wroooong! python exited with ' + code);
        console.error(`Python script exited with code ${code}`);
      }
    } catch (error) {
      res.status(500).send('Something went Wrong ' + error);
      console.error(error);
    }
  });


});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'newIndex.html'));
});
app.get('/study', (req, res) => {
  res.sendFile(path.join(__dirname, 'studyMode.html'));
});
app.get('/MixSongs', (req, res) => {
  res.sendFile(path.join(__dirname, 'studyMode.html'));
});
app.get('/IosMode', (req, res) => {
  res.sendFile(path.join(__dirname, 'IosMode.html'));
});
app.get('/hello', function (req, res) {
  console.log('user said hello');
  res.json("Hello World!");
});
//Mix audio
const mixAudioJs = require('./MixAudio/mixAudioGPT4.js');
app.post('/RunLouiseSongBeats', upload.fields([{ name: 'audio', maxCount: 2 }, { name: 'json', maxCount: 1 }]), function (req, res) {
  if (takeDownAPI > 4) {
    console.log('Too many wrong authentications stopping the process');
    res.status(500).send('Authentication Failed Try Later!');
    process.exit();
  }
  console.log(req.body);
  const { id } = req.body;
  const audioFiles = req.files['audio'];
  const jsonFile = req.files['json'][0];

  const audio1 = audioFiles[0];
  const audio2 = audioFiles[1];
  // Handle the uploaded file here



});
app.post('/NightcoreIT', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'json', maxCount: 1 }]), async (req, res) => {
  if (takeDownAPI > 4) {
    console.log('Too many wrong authentications stopping the process');
    res.status(500).send('Authentication Failed Try Later!');
    process.exit();
  }
  const json = JSON.parse(req.body['json']);
  const authorization = json.authorization;
  if (authorization == 'stop') {
    console.log('Stopping process');
    res.status(500).send('Authentication Failed Try Later!');
    process.exit();
  }
  if (authorization != KEY_AUTHORIZATION) {
    res.status(500).send('Authentication Failed!');
    console.log('Authentication failed ' + authorization);
    takeDownAPI += 1;
    return;
  }
  console.log(req.body);
  const audioFile = req.files['audio'][0];

  // Handle the uploaded file here
  const extension = path.extname(audioFile.originalname).toLowerCase();

  if (extension !== '.mp3') {
    console.log('FileType wrong');
    res.status(500).send('FileType Wrong!');
    return;
  }



  const speed = json.speed;
  const pitch = json.pitch;

  const textContent = speed + '&' + pitch;
  await deleteAudioFiles('LouiseNightcore/Audio');
  await saveAudioFileNightcore(audioFile);
  console.log('Saved audio to LouiseNightcore/Audio');
  const child2 = spawn('node', ['LouiseNightcore/nightcore.js']);
  console.log('Sending text to nightcore.js');
  child2.stdin.setEncoding('utf-8');
  child2.stdin.write(textContent);
  child2.stdin.end();
  child2.stderr.on('data', (data) => {
    console.error(`nightcore stderr: ${data}`);
  });
  child2.on('close', async (code,signal) => {
    console.error(`nightcore process exited with code ${code} and signal ${signal}`);
    fs.readFile('LouiseNightcore/Output/nightcore.mp3', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error reading audio file');
      } else {
        // Set the Content-Type header to the appropriate MIME type
        res.set('Content-Type', 'audio/mp3');

        // Send the audio data as the response body
        res.send(data);
        deleteAudioFiles('LouiseNightcore/Audio');
        deleteAudioFiles('LouiseNightcore/Output');
      }
    });
  });

});
app.get('/nightcore', (req, res) => {
  res.sendFile(path.join(__dirname, 'nightcoreIndex.html'));
});




app.listen(port, () => {
  console.log('Server listening on port: ' + port);
});
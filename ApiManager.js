const express = require('express');
const app = express();
const { spawn } = require('child_process');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const KEY_AUTHORIZATION = 'FaceTheWrathOfThor';
var takeDownAPI = 0;

app.use(cors({
    origin: 'http://localhost' // replace with the domain of your frontend
  }));
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
    fs.writeFile('Audios/audio.webm', audioFile.buffer, { flag: 'w', encoding: 'binary' }, function (err) {
      if (err) {
        reject(err);
      } else {
        console.log('Saved!');
        resolve();
      }
    });
  });
}
//Python app.js(send to openai Whisper api)
const runPythonScript = (args) => {
    return spawn('python', args);
  };
app.post('/RunLouiseAudio', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'json', maxCount: 1 }]), (req, res) => {
    // Handle the uploaded file here
    if (authorization == 'stop'){
      console.log('Stopping process');
      res.status(500).send('Authentication Failed Try Later!');
      process.exit();
    }
    if (takeDownAPI >1){
      console.log('Too many wrong authentications stopping the process');
      res.status(500).send('Authentication Failed Try Later!');
      process.exit();
    }
    console.log(req.body);
    const audioFile = req.files['audio'][0];
    const json = JSON.parse(req.body['json']); // parse the JSON data from the request body
    const authorization = json.authorization;
    const mood = json.mood;
    const voice_mode = json.voiceGender;
    if (authorization != KEY_AUTHORIZATION){
      res.status(500).send('Authentication Failed!');
      console.log('Authentication failed ' + authorization);
      takeDownAPI += 1;
      return;
    }
    
    saveAudioFile(audioFile)
  .then(() => {
    // Code that needs to wait for the file to be saved
  
    const pythonProcess = runPythonScript(['app.py']);
    //python script ran and created an result.txt that i will now modify
    pythonProcess.on('close', async (code) => {
    try{
      
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
                textContent+= '&'+mood+'&'+voice_mode;
                console.log('user input: '+textContent);
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
                    child.stdin.write(data);
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
                          fs.unlink('Audios/audio.webm', (err) => {
                            if (err) throw err;
                            console.log('File deleted');
                          });
                        }
                      });
                    });
                  child2.on('close', async (code) => {
                    console.log(`ChatBot process exited with code ${code}`);
                  });
                  });
              }
              
            
        }
        else 
        {
            console.error(`Python script exited with code ${code}`);
        }
    }catch (error){
        console.error(error);
    }
    });
  })
  .catch((err) => {
    console.error(err);
  });
    
});





app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
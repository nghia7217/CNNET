const express = require('express')
const ffmpeg = require('ffmpeg');
const bodyParser = require('body-parser')
const ffmpegfl = require('fluent-ffmpeg')
const fs = require('fs')
const expressFileUpload = require('express-fileupload')
const app = express();


app.use(express.static(__dirname));
//lien ket toi file index.html
app.get('/', (req, res) => {
    res.sendfile(__dirname + '/image.html')
})

// Define the static file path


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
    expressFileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

ffmpegfl.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpegfl.setFfprobePath("C:/ffmpeg/bin");

ffmpegfl.setFlvtoolPath("C:/flvtool");

console.log(ffmpegfl)

app.post('/convert', (req, res) => {
    let to = req.body.to
    let file = req.files.file
    let fileName = `output.${to}`
    console.log(to)
    console.log(file)

    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    //Sua dinh dang
    ffmpegfl("tmp/" + file.name)
        .withOutputFormat(to)
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi")
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})

app.post('/cutframe', (req, res) => {
    let frame = req.body.frame
    let file = req.files.file
    //let fileName = `output.${to}`
    console.log(frame)
    console.log(file)

    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
        try {
            var process = new ffmpeg("tmp/" + file.name);
            process.then(function (video) {
                // Callback mode
                video.fnExtractFrameToJPG("tmp/", {
                    frame_rate: frame,
                    number: 999,
                    file_name: 'my_frame',
                }, function (error, files) {
                    if (!error)
                        console.log('Frames: ' + files);
                    
                    try {
                        app.use(express.static(__dirname));
                        app.get('/', function (req, res) {
                            res.sendFile(__dirname + '/test.html');
                        })
                    }
                    catch{
                        console.log("Loi")
                    }

                });

            }, function (err) {
                console.log('Error: ' + err);
            });
        } catch (e) {
            console.log(e.code);
            console.log(e.msg);
        }
    });
})

//tao port 4000
app.listen(4000, () => {
    console.log("Dung port 4444")
})
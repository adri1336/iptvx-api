require("dotenv").config();
const express = require('express');
const cors = require("cors");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('node-ffprobe-installer').path;
const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();
app.use(cors());

app.get('/metadata', async (req, res) => {
    try {
        const { url } = req.query;
    
        const conversion = ffmpeg(url).outputOptions('-movflags frag_keyframe+empty_moov').outputFormat('mp4')
        const metadata = await new Promise((resolve, reject) => {
            conversion.ffprobe((err, metadata) => {
                if (err) reject(err);
                else resolve(metadata);
            });
        });

        res.json(metadata);
    }
    catch (err) {
        res.status(400).json(err.message);
    }
});

app.get('/convert', async (req, res) => {
    try {
        const { url, seekTo } = req.query;
        const seekInput = seekTo ? parseInt(seekTo) : 0;
        
        const metadata = await new Promise((resolve, reject) => {
            ffmpeg(url).seekInput(seekTo).outputOptions('-movflags frag_keyframe+empty_moov').outputFormat('mp4').ffprobe((err, metadata) => {
                if (err) reject(err);
                else resolve(metadata);
            });
        });

        //set conversion options
        const args = [
            '-ss',
            `${seekInput}`,
          
            '-i',
            `${url}`,
            
            '-vcodec',
            'libx264',
            
            '-acodec',
            'aac',

            '-movflags',
            'frag_keyframe+empty_moov',

            '-f',
            'mp4',
          
            'pipe:1'
        ];

        //set headers
        res.set({ 'Content-Type': 'application/x-mpegurl' });
        res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
        res.set({ 'Content-Length': metadata.format.size });
        

        //start conversion
        console.log('Spawned Ffmpeg with command: ' + ffmpegPath + ' ' + args.join(' '));
        const conversion = spawn(ffmpegPath, args);
        /*conversion.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });*/
        conversion.stdout.pipe(res);
    }
    catch (err) {
        res.status(400).json(err.message);
    }
});

app.listen(process.env.APP_PORT || 3042, () => {
    console.log('IPTVX API iniciado en el puerto ' + process.env.APP_PORT + '');
});
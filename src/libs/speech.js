//Loads and initiates required modules
const path = require('path'),
	spawnSync = require('child_process').spawnSync,
	fs = require('fs'),
	sdk = require("microsoft-cognitiveservices-speech-sdk");

module.exports = {
	getRequestedSong: async () => {
		const audioFile = recordAudio();
		const audioStream = await getAudioStream(audioFile);
		const results = await recognize(audioStream);
		const song = search(results);

		deleteAudioFile(audioFile);

		return song;
	}
};

//Records the user's voice
const recordAudio = () => {
	const filename = "audio.wav";
	const soxPath = path.join(__dirname, '../../bin/SoX');
	process.chdir(soxPath);

	// Starts recording
	spawnSync('sox.exe', ['-b', '16', '-c', '1', '-r', '16000', '-t', 'waveaudio',
		'0', filename, 'trim', '0', '5']);

	return filename;
}

const getAudioStream = audioFile => {
	return new Promise(resolve => {
		const audioStream = sdk.AudioInputStream.createPushStream();

		fs.createReadStream(audioFile).on('data', arrayBuffer => {
			audioStream.write(arrayBuffer.buffer);
		}).on('end', () => {
			audioStream.close();

			resolve(audioStream);
		});
	});
}

const recognize = audioStream => {
	return new Promise(resolve => {
		process.chdir(path.join(__dirname, '../../'));

		const subscriptionKey = fs.readFileSync('API_KEY.txt').toString();
		const serviceRegion = "westus";
		const audioConfig = sdk.AudioConfig.fromStreamInput(audioStream);
		const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);

		speechConfig.speechRecognitionLanguage = "en-GB";

		const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

		recognizer.recognizeOnceAsync(
			results => {
				recognizer.close();

				resolve(results.privText.substring(0, results.privText.length - 1));
			},
			err => {
				console.error(err);
				recognizer.close();
			});
	});
}

//Searches the requested song in the songs array
const search = str => {
	const scores = songs.map(song => {
		const _song = song.Title.toLowerCase().replace(/ /g, "");
		const words = str.toLowerCase().split(" ");
		let score = 0;

		words.forEach(word => {
			if (_song.includes(word))
				score++;
		});

		console.log(words, score, _song)

		return score;
	});

	return maxIndex(scores);
}

const maxIndex = arr => {
    if (arr.length === 0) {
        return -1;
    }

    let max = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

const deleteAudioFile = audioFile => {
	//Removes the created audio file
	fs.unlink(audioFile, error => {
		if (error)
			throw error;
	});
}
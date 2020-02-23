const path = require('path');
const spawn = require('child_process').spawn;
const fs = require('fs');
const parserPath = path.join(__dirname, '../../bin/EXIFTool/exiftool.exe');
const destination = path.join(__dirname, '../../Artworks');

module.exports = {
    /**
    * Extracts the music metadata of the files placed in a directory.
    * @param {string} dir - Directory of the files to be parsed.
    * @returns {Array} - Array that contains the metadata information of the files placed in the directory.
    */
    parseDir(dir) {
        return new Promise((resolve, reject) => {
            const parameters = ['-JSON', '-s', '-n', '-charset', 'filename=Latin', '-charset', 'ID3=Latin', '-ID3:Title', '-ID3:Album', '-ID3:Artist', '-VORBIS:Title', '-VORBIS:Album', '-VORBIS:Artist', '-charset', 'RIFF=Latin', '-RIFF:Title', '-RIFF:Artist', '-Duration', dir.replace("\\", "/")];
            const parser = spawn(parserPath, parameters);
            let output = '';

            parser.stdout.on('data', chunk => output += chunk);
            parser.on('close', () => {
                if (output == '')
                    reject("ERROR")
                else {
                    let tags = JSON.parse(output);
                    const keys = ['Title', 'Album', 'Artist'];

                    tags = tags.map(songTags => {
                        keys.forEach(key => {
                            if (songTags[key] === undefined || songTags[key] == '-' || songTags[key] == '') {
                                if (key == 'Title')
                                    songTags[key] = path.basename(songTags.SourceFile, path.extname(songTags.SourceFile));
                                else
                                    songTags[key] = `Unknown ${key}`;
                            }
                        });

                        if (typeof songTags.Artist == 'string')
                            songTags.Artist = songTags.Artist.split(/\, |\,| & |; |;/);

                        return songTags;
                    });

                    resolve(tags);
                }
            });
        });
    },
    parseFile(file) {
        return new Promise(resolve => {
            const fileExt = path.extname(file).substring(1).toUpperCase();
            let spec = '';

            if (fileExt == 'MP3')
                spec = 'ID3';
            else if (fileExt == 'WAV')
                spec = 'RIFF';
            else if (fileExt == 'FLAC' || fileExt == 'OGG')
                spec = 'VORBIS';

            const parameters = ['-JSON', '-s', '-n', '-f', '-charset filename=Latin', `-charset ${spec}=Latin`, `-${spec}:Title`, `-${spec}:Album`, `-${spec}:Artist`, '-Duration', file.replace('\\', '/')];

            const parser = spawn(parserPath, parameters);
            let output = '';

            parser.stdout.on('data', chunk => output += chunk);
            parser.on('close', () => {
                if (output == '')
                    resolve({
                        'Title': 'Unknown Title',
                        'Album': 'Unknown Album',
                        'Artists': 'Unknown Artists',
                        'Duration': NaN
                    });
                else {
                    const tags = JSON.parse(output.toString().replace(/\[|\]/g, '').trim());
                    const keys = ['Title', 'Album', 'Artist'];

                    keys.forEach(key => {
                        if (tags[key] === undefined || tags[key] == '-' || tags[key] == '') {
                            if (key == 'Title')
                                tags[key] = path.basename(tags.SourceFile, path.extname(tags.SourceFile));
                            else
                                tags[key] = `Unknown ${key}`;
                        }
                    });

                    if (typeof tags.Artist == 'string')
                        tags.Artist = tags.Artist.split(/\, |\,| & |; |;/);

                    tags.SourceFile = file;

                    resolve(tags);
                }
            });
        });
    },
    extractPicture(file) {
        return new Promise(resolve => {
            const picturePath = `${destination}\\${path.basename(file, path.extname(file))}.jpg`;

            fs.exists(picturePath, exists => {
                if (exists)
                    resolve(picturePath);
                else {
                    const parameters = ['-charset filename=Latin', '-L', '-fast2', '-Picture', '-b', file];
                    const parser = spawn(parserPath, parameters);

                    fs.exists(destination, exists => {
                        if (!exists)
                            fs.mkdirSync(destination);

                        const picture = fs.createWriteStream(picturePath);  //TODO: Add MIME-TYPE

                        picture.on('finish', () => {
                            resolve(picturePath);
                        });

                        let output = '';
                        parser.stdout.pipe(picture);
                        parser.stdout.on('data', chunk => output += chunk);
                    });
                }
            });
        });
    }
}
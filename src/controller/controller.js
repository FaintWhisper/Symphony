const model = require('../models/model.js');
const parser = require('../libs/parser.js');
const Playback = require('../libs/playback.js');
const fs = require('fs');
const { globalShortcut } = require('electron').remote;

global.paths = model.getPaths();
global.songs = model.getSongs();
global.albums = model.getAlbums();
global.artists = model.getArtists();
global.colorThief = new ColorThief();
global.playback = new Playback();
global.autoplay = false;

const songsView = require('../views/songs.js');
const albumsView = require('../views/albums.js');

globalShortcut.register('MediaPlayPause', () => {
    const currentSong = playback.getCurrentSong();
    
    songsView.playSong(currentSong);
});

globalShortcut.register('MediaNextTrack', () => {
    songsView.playNextSong();
});

globalShortcut.register('MediaPreviousTrack', () => {
    songsView.playPreviousSong();
});

//Views

const defaultSection = 'songs';
let currentSection = 'songs';   //Default sectionElement is 'songs'

const loadSection = (section = defaultSection) => {
    const sectionElement = document.querySelector('.section');
    const content = document.querySelector('#content');

    Array.from(content.children).forEach(child => {
        child.style.display = 'none';
    });

    document.querySelectorAll('.menu-buttons').forEach(element => {
        element.style.borderLeftColor = '';
        element.style.color = '#717171';
    });

    switch (section) {
        case 'songs':
            document.querySelectorAll('.menu-buttons')[1].style.borderLeftColor = '#4c85de';
            document.querySelectorAll('.menu-buttons')[1].style.color = '#4c85de';
            document.querySelectorAll('.labels')[0].style.color = '#4c85de';
            document.querySelector('.go-back').style.display = 'inline';
            sectionElement.textContent = 'Songs';

            document.querySelector('.sort-songs').style.display = 'flex';
            document.querySelector('.songs-container').style.display = 'flex';

            break;
        case 'albums':
            document.querySelectorAll('.menu-buttons')[2].style.borderLeftColor = '#4c85de';
            document.querySelectorAll('.menu-buttons')[2].style.color = '#4c85de';
            sectionElement.textContent = 'Albums';

            document.querySelector('.sort-songs').style.display = 'none';
            document.querySelector('.albums-container').style.display = 'flex';

            setTimeout(() => {
                albumsView.loadCovers();
            }, 1500);

            break;
        case 'favorites':
            document.querySelectorAll('.menu-buttons')[3].style.borderLeftColor = '#4c85de';
            document.querySelectorAll('.menu-buttons')[3].style.color = '#4c85de';
            sectionElement.textContent = 'Favorites';

            break;
        case 'playlists':
            document.querySelectorAll('.menu-buttons')[4].style.borderLeftColor = '#4c85de';
            document.querySelectorAll('.menu-buttons')[4].style.color = '#4c85de';
            sectionElement.textContent = 'Playlists';

            break;
        case 'now_playing':
            document.querySelectorAll('.menu-buttons')[5].style.borderLeftColor = '#2897a5';
            document.querySelectorAll('.menu-buttons')[5].style.color = '#4c85de';
            sectionElement.textContent = 'Now Playing';

            break;
    }
    content.style.display = 'block';
}

const changeSection = section => {
    const content = document.querySelector('#content');

    if (section != currentSection) {
        currentSection = section;

        content.childNodes.forEach(currentNode => {
            if (currentNode.nodeType == 1 && currentNode.style.display != 'none')
                currentNode.style.display = 'none';
        });

        loadSection(section);
    }
}

const getTags = () => {
    createComponents(songs, albums, artists);

    paths.forEach(path => {
        fs.exists(path.location, exists => {
            if (exists && !path.alreadyRead)
                getTagsFromDir(path);
            else if (exists && path.alreadyRead)
                getTagsFromFile(path);
        });
    });

    removeDeleted();
}

const getTagsFromDir = async path => {
    path.alreadyRead = true;
    model.updatePath(path);

    try {
        tags = await parser.parseDir(path.location);

        const supportedAudio = song => {
            fileExt = require("path").extname(song.SourceFile).substring(1).toUpperCase();

            return (fileExt == 'MP3' || fileExt == 'OGG' || fileExt == 'WAV' || fileExt == 'FLAC');
        }

        tags = tags.filter(supportedAudio);

        tags.sort((a, b) => {
            return fs.statSync(a.SourceFile).mtime.getTime() > fs.statSync(b.SourceFile).mtime.getTime();
        });

        addSongs(tags);
    } catch (err) {
        getTagsFromFile(path);
    }
}

const getTagsFromFile = path => {
    const pathSongs = model.readPath(path);
    const tags = [];
    const promises = [];

    newSongs = pathSongs.filter(song => {
        let index = 0;
        let found = false;

        while (index < songs.length && !found) {
            if (songs[index].SourceFile == song.SourceFile)
                found = true;
            index++;
        }

        return found;
    });

    newSongs.forEach(song => {
        promises.push(
            new Promise(async resolve => {
                const songTags = await parser.parseFile(`${path.location}/${song}`)
                tags.push(songTags);

                resolve();
            })
        );
    });

    Promise.all(promises).then(() => {
        addNewSongs(tags);
    });
}

const addSongs = tags => {
    songs = songs.concat(tags);
    albums = albums.concat(getAlbums(songs));
    artists = artists.concat(getArtists(songs));

    sortData(songs, albums, artists);
    createComponents(songs, albums, artists);

    model.setSongs(songs);
    model.setAlbums(albums);
    model.setArtists(artists);
}

const addNewSongs = tags => {
    const newSongs = [];
    let newAlbums = [];
    let newArtists = [];

    tags.forEach((songTags, songIndex) => {
        const lastModified = fs.statSync(songTags.SourceFile).mtime.getTime();

        if (songs[songIndex] == undefined || songs[songIndex].SourceFile != songTags.SourceFile)
            newSongs.push(songTags);
        else if (lastModified > new Date(songs[songIndex].lastModified).getTime()) {
            songs[songIndex] = songTags;
            songsView.updateComponent(songIndex);
        }
    });

    songs.concat(newSongs);

    if (newSongs.length > 0) {
        newAlbums = getAlbums(songs);
        albums.concat(newAlbums);

        newArtists = getArtists(songs);
        artists.concat(newArtists);

        sortData(newSongs, newAlbums, newArtists);
        createComponents(newSongs, newAlbums, newArtists);

        model.setSongs(songs);
        model.setAlbums(albums);
        model.setArtists(artists);
    }

}

const getAlbums = songs => {
    const _albums = [];

    for (let i = 0; i < songs.length; i++) {
        let albumIndex = _albums.findIndex(album => {
            return album.title == songs[i].Album;
        });

        if (albumIndex == -1) {
            _albums.push({
                'title': songs[i].Album,
                'songs': [i]
            }) - 1;
        }
        else
            _albums[albumIndex].songs.push(i);
    }

    return _albums;
}

const getArtists = songs => {
    const _artists = [];

    for (let i = 0; i < songs.length; i++) {
        let artistIndex = _artists.findIndex(artist => {
            return artist.name == songs[i].Artist;
        });

        if (artistIndex == -1)
            _artists.push({
                'name': songs[i].Artist,
                'songs': [i]
            }) - 1;
        else
            _artists[i].songs.push(i);
    }

    return _artists;
}

const sortData = (songs, albums, artists) => {
    songs.sort((a, b) => {
        return fs.statSync(a.SourceFile).mtime.getTime() > fs.statSync(b.SourceFile).mtime.getTime();
    });

    albums.sort((a, b) => {
        return a.title > b.title;
    });

    artists.sort((a, b) => {
        return a.name > b.name;
    });
}

const createComponents = (songs, albums, artists) => {
    songs.forEach((_, index) => {
        songsView.createComponent(index);
    });

    albums.forEach((_, index) => {
        albumsView.createComponent(index);
    });

    /* artists.forEach((_, index) => {
        artistsView.createComponent(index);
    }); */
}

const removeDeleted = () => {
    songs.forEach((song, songIndex) => {
        fs.exists(song.SourceFile, exists => {
            if (!exists) {
                //Removes the deleted songs
                songs.splice(songIndex, 1);

                //Removes the song from the album / removes the album
                let found = false;

                while (!found) {
                    let albumIndex = 0;
                    let index = 0;
                    const album = albums[albumIndex];

                    while (album[index] != songIndex) {
                        index++;
                    }

                    if (index <= album.length) {
                        found = true;
                        album.splice(index, 1);

                        if (album.length == 0)
                            albums.splice(albumIndex);
                    }

                    albumIndex++;
                }

                //Removes the song from the artist / removes the artist
                found = false;

                while (!found) {
                    let artistIndex = 0;
                    let index = 0;

                    while (artists[artistIndex].songs[index] != songIndex) {
                        index++;
                    }

                    if (index <= artists.length) {
                        found = true;
                        artists.splice(index, 1);

                        if (artists.length == 0)
                            artists.splice(artistIndex);
                    }

                    artistIndex++;
                }
            }
        });

    });
}

(() => {
    const playingSong = model.getPlaying();
    const time = model.getTime();
    const queue = model.getQueue();

    if (paths.length == 0)
        document.querySelector('.add-music-library-wrapper').style.display = 'block';
    else
        getTags();

    if (playingSong != null) {
        autoplay = false;
        songsView.playSong(playingSong);
        playback.setCurrentTime(time);
    }

    if (queue != null)
        playback.setQueue(queue);

    document.querySelectorAll('.menu-button-row').forEach((element) => {
        element.addEventListener('click', e => {
            changeSection(e.target.getAttribute('data-section'));
        });
    });

    document.querySelector('.go-back').addEventListener('click', () => {
        if (document.querySelector('.section').textContent == 'Songs')
            loadSection('albums');
        else
            loadSection('songs');
    });
})();

module.exports = {
    loadSection,
    getTags
};
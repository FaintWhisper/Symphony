const fs = require('fs');
const parser = require('../libs/parser.js');
const model = require('../models/model.js');

const searchBox = document.querySelector('.search-box');
const sortByTitle = document.querySelector('.sort-by-title');
const sortByArtist = document.querySelector('.sort-by-artist');
const sortByAlbum = document.querySelector('.sort-by-album');
const songsContainer = document.querySelector('.songs-container');
const controlButtons = document.querySelector('.control-buttons').querySelectorAll('button');

const components = [];
let titleSort = 0;
let artistSort = 0;
let albumSort = 0;
let timeUpdate = undefined;

const play = async index => {
    const playingSong = document.querySelector('.playing-song');
    const songTitle = document.querySelector('.playing-song-title');
    const songArtist = document.querySelector('.playing-song-artist');
    const defaultPicture = document.querySelector('.playing-song-default-picture');
    const picture = document.querySelector('.playing-song-picture');
    const currentTime = document.querySelector('.playing-song-current-time');
    const songDuration = document.querySelector('.playing-song-duration');
    const buttons = document.querySelector('.buttons');
    const progressBar = document.querySelector('.progress-bar');

    const updateCurrentTime = () => {
        if (!playback.isChangingTime()) {
            const value = Math.ceil((playback.getCurrentTime() * 100) / songs[index].Duration);

            document.querySelector('.progress-bar_range').value = value;
            document.querySelector('.progress-bar_fill').style.width = `calc(${value * 0.9}%)`;
            currentTime.textContent = playback.getFormattedCurrentTime();
            model.setTime(playback.getCurrentTime());
        }
    }

    if (timeUpdate !== undefined)
        clearInterval(timeUpdate);

    playback.play(index);

    updateCurrentTime();

    //Updates the song's progress bar
    timeUpdate = setInterval(updateCurrentTime, 1000);

    if (index != playback.getLastPlayed()) {
        defaultPicture.style.display = 'flex';
        picture.style.display = 'none';

        songTitle.textContent = songs[index].Title;
        songArtist.textContent = songs[index].Artist.join(', ');

        playingSong.style.visibility = 'visible';

        if (playback.getLastPlayed() != -1) {
            components[playback.getLastPlayed()].querySelector('.song').style.color = '#333333';
            components[playback.getLastPlayed()].querySelector('.play').textContent = 'play_arrow';
        }

        components[index].querySelector('.song').style.color = '#2f5e99';

        if (autoplay)
            components[index].querySelector('.play').textContent = 'pause';

        songDuration.textContent = playback.getFormattedDuration(songs[index].Duration);

        buttons.style.top = '-16px';
        progressBar.style.position = 'relative';
        progressBar.style.visibility = 'visible';

        try {
            picture.src = await parser.extractPicture(songs[index].SourceFile);
            picture.onload = () => {
                defaultPicture.style.display = 'none';
                picture.style.display = 'inline';

                dominantColor = colorThief.getColor(picture);

                if ((dominantColor[0] + dominantColor[1] + dominantColor[1]) / 3 <= 125)
                    rgb = [dominantColor[0] + 60, dominantColor[1] + 60, dominantColor[2] + 60];
                else
                    rgb = [dominantColor[0] - 60, dominantColor[1] - 60, dominantColor[2] - 60];

                document.querySelector('.control-panel').style.backgroundColor = `rgb(${rgb})`;

                let sliderBacks = Array.from(document.styleSheets[0].cssRules).map((rule, index) => {
                    if (rule.selectorText && rule.selectorText == '.slider_range_back')
                        return index;
                    else return '';
                }).filter(String);

                let sliderValues = Array.from(document.styleSheets[0].cssRules).map((rule, index) => {
                    if (rule.selectorText && rule.selectorText.includes('.slider_value'))
                        return index;
                    else return '';
                }).filter(String);

                sliderBacks.forEach(index => {
                    document.styleSheets[0].cssRules[index].style.background = `rgb(${rgb[0] - 36}, ${rgb[1] - 36}, ${rgb[2] - 36})`;
                });

                sliderValues.forEach(index => {
                    if (document.styleSheets[0].cssRules[index].style.borderRight != '')
                        document.styleSheets[0].cssRules[index].style.borderRight = `6px solid rgb(${rgb[0] - 36}, ${rgb[1] - 36}, ${rgb[2] - 36})`;
                    else
                        document.styleSheets[0].cssRules[index].style.background = `rgb(${rgb[0] - 36}, ${rgb[1] - 36}, ${rgb[2] - 36})`;
                });
            }
        } catch (err) {
            document.querySelector('.control-panel').style.backgroundColor = '#113881';

            let sliderBacks = Array.from(document.styleSheets[0].cssRules).map((rule, index) => {
                if (rule.selectorText && rule.selectorText == '.slider_range_back')
                    return index;
                else return '';
            }).filter(String);

            let sliderValues = Array.from(document.styleSheets[0].cssRules).map((rule, index) => {
                if (rule.selectorText && rule.selectorText.includes('.slider_value'))
                    return index;
                else return '';
            }).filter(String);

            sliderBacks.forEach(index => {
                document.styleSheets[0].cssRules[index].style.background = '#5890c2';
            });

            sliderValues.forEach(index => {
                if (document.styleSheets[0].cssRules[index].style.borderRight != '')
                    document.styleSheets[0].cssRules[index].style.borderRight = '6px solid #79a2fb';
                else
                    document.styleSheets[0].cssRules[index].style.background = '#79a2fb';
            });
        }
    }
}

const playPreviousSong = () => {
    if (playback.getCurrentTime() <= 5)
        play(playback.getPreviousSong());

    playback.setCurrentTime(0);
    playback.resume();

    controlButtons[2].style.display = 'none';
    controlButtons[3].style.display = 'inline';
}

const playNextSong = () => {
    playback.setCurrentTime(0);
    play(playback.getNextSong());

    controlButtons[2].style.display = 'none';
    controlButtons[3].style.display = 'inline';
}

const playSong = index => {
    const playButtons = document.querySelectorAll('.play-button');

    if (playButtons[index].querySelector('.play').textContent == 'play_arrow') {
        if (playback.getCurrentSong() == -1 || (songs[playback.getCurrentSong()].SourceFile != songs[index].SourceFile)) {
            if (playback.getCurrentSong() == -1) {
                controlButtons[1].style.color = 'rgba(255, 255, 255, 1)';
                controlButtons[2].style.color = 'rgba(255, 255, 255, 1)';
                controlButtons[3].style.color = 'rgba(255, 255, 255, 1)';
                controlButtons[4].style.color = 'rgba(255, 255, 255, 1)';
            } else {
                components[playback.getCurrentSong()].querySelector('.song').style.color = '#333333';
                components[playback.getCurrentSong()].querySelector('.play').textContent = 'play_arrow';
            }

            play(index);
            playback.setLastUserPlayed(index);
        } else {
            playback.resume();
            components[index].querySelector('.song').style.color = '#2f5e99';
            components[index].querySelector('.play').textContent = 'pause';
        }

        if (autoplay) {
            controlButtons[2].style.display = 'none';
            controlButtons[3].style.display = 'inline';
        }
    } else {
        if (songs[playback.getCurrentSong()].SourceFile == songs[index].SourceFile) {
            playback.pause();
            playButtons[index].querySelector('.play').textContent = 'play_arrow';
            controlButtons[2].style.display = 'inline';
            controlButtons[3].style.display = 'none';
        } else
            play(index);
    }

    autoplay = true;
}

const isInViewport = element => {
    let hidden = false;

    if (element.style.display == 'none') {
        element.style.visibility == 'hidden';
        element.style.display = 'block';
        hidden = true;
    }

    const rect = element.getBoundingClientRect();
    const html = document.documentElement;
    const controlPanel = document.querySelector('.control-panel').getBoundingClientRect();

    if (hidden) {
        element.style.visibility == 'visible';
        element.style.display = 'none';
    }

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || html.clientHeight) - controlPanel.height &&
        rect.right <= (window.innerWidth || html.clientWidth)
    );
}

const songMenuListener = (element, index) => {
    Array.from(document.querySelectorAll('.song-menu')).forEach((currentNode, currentIndex) => {
        if (currentIndex == index) {
            if (currentNode.style.display == 'none') {
                if (!isInViewport(currentNode)) {
                    currentNode.style.top = '-38vh';
                    if (currentNode.firstChild.classList.contains('song-menu-top-arrow'))
                        currentNode.firstChild.classList.remove('song-menu-top-arrow');
                    currentNode.firstChild.classList.add('song-menu-bottom-arrow');
                } else if (currentNode.firstChild.classList.contains('song-menu-bottom-arrow')) {
                    currentNode.firstChild.classList.remove('.song-menu-bottom-arrow');
                    currentNode.firstChild.classList.add('.song-menu-top-arrow');
                }
                currentNode.style.display = 'block';
            } else {
                currentNode.style.display = 'none';
                currentNode.style.top = '0px';
            }
        } else
            currentNode.style.display = 'none';

        Array.from(document.querySelectorAll('.song-more-button')).forEach(currentNode => {
            if (currentNode.style.display == 'inline' && currentNode != element)
                currentNode.style.display = 'none';
        });
    });

}

const searchSongs = (query) => {
    let results = [];
    let i = 0;
    let numResults = 0;
    let cont = true;

    const songsFileNames = songs.map(currentValue => {
        return `${currentValue.Title || currentValue.SourceFile};${currentValue.Artist.join(', ')};${currentValue.Album}`.toLowerCase();
    });

    while (i < songsFileNames.length) {
        if (songsFileNames[i].indexOf(query) != -1) {
            results[numResults] = i;
            numResults++;
        }
        i++;
    }

    for (let i = 0; i < results.length; i++) {
        const fields = songsFileNames[results[i]].split(';');
        if (fields[1].indexOf(query) != 0) {
            results.push(results[i]);
            results = results.slice(0, i).concat(results.slice(i + 1));
        }
    }
    return results;
}

// Gets the song's title from the song's file name
const getFileName = (str) => {
    const arr = str.split('.');
    arr.pop();
    return arr.join(' ');
}

const createComponent = (songIndex) => {
    const songWrapper = document.createElement('div');
    const song = document.createElement('div');
    const playButton = document.createElement('button');
    const play = document.createElement('i');
    const favorite = document.createElement('i');
    const title = document.createElement('div');
    const artists = document.createElement('div');
    const album = document.createElement('div');
    const duration = document.createElement('div');
    const moreBtn = document.createElement('button');
    const songMenu = document.createElement('div');
    const songMenuArrow = document.createElement('div');
    const songMenuTop = document.createElement('div');
    const songMenuDefaultPicture = document.createElement('div');
    const musicNote = document.createElement('i');
    const songMenuPicture = document.createElement('img');
    const songMenuDetails = document.createElement('div');
    const songMenuTitle = document.createElement('div');
    const songMenuArtist = document.createElement('div');
    const songMenuSeparator = document.createElement('div');
    const songMenuAddToQueue = document.createElement('div');
    const songMenuAddToQueueIcon = document.createElement('i');
    const songMenuListenNext = document.createElement('div');
    const songMenuListenNextIcon = document.createElement('i');
    const songMenuAddToPlaylist = document.createElement('div');
    const songMenuAddToPlaylistIcon = document.createElement('i');
    const songMenuAddToFavorites = document.createElement('div');
    const songMenuAddToFavoritesIcon = document.createElement('i');
    const songMenuGoToArtist = document.createElement('div');
    const songMenuGoToArtistIcon = document.createElement('i');
    const songMenuGoToAlbum = document.createElement('div');
    const songMenuGoToAlbumIcon = document.createElement('i');

    song.classList.add('song');

    favorite.classList.add('material-icons', 'favorite');
    favorite.textContent = 'favorite_border'
	
    title.classList.add('song-title');
    artists.classList.add('song-artists');
    album.classList.add('song-album');
    duration.classList.add('song-duration');


    moreBtn.classList.add('material-icons', 'song-more-button');
    moreBtn.textContent = 'more_horiz';

    songMenuPicture.classList.add('song-menu-picture');
    songMenuTitle.classList.add('song-menu-title');
    songMenuArtist.classList.add('song-menu-artist');

    songMenuDetails.classList.add('song-menu-details');
    songMenuDetails.appendChild(songMenuTitle);
    songMenuDetails.appendChild(songMenuArtist);

    musicNote.textContent = 'music_note';
    musicNote.classList.add('material-icons', 'music-note');

    songMenuDefaultPicture.classList.add('song-menu-default-picture');
    songMenuDefaultPicture.appendChild(musicNote);

    songMenuTop.classList.add('song-menu-top');
    songMenuTop.appendChild(songMenuDefaultPicture);
    songMenuTop.appendChild(songMenuPicture);
    songMenuTop.appendChild(songMenuDetails);

    songMenuArrow.classList.add('song-menu-top-arrow');
    songMenuSeparator.classList.add('song-menu-separator');

    songMenuAddToQueueIcon.classList.add('material-icons', 'song-menu-option-icon');
    songMenuAddToQueueIcon.textContent = 'queue_music';
    songMenuAddToQueue.appendChild(songMenuAddToQueueIcon);
    songMenuAddToQueue.classList.add('song-menu-option');
    songMenuAddToQueue.innerHTML += 'Add to queue';

    songMenuListenNextIcon.classList.add('material-icons', 'song-menu-option-icon');
    songMenuListenNextIcon.textContent = 'redo';
    songMenuListenNext.appendChild(songMenuListenNextIcon);
    songMenuListenNext.classList.add('song-menu-option');
    songMenuListenNext.innerHTML += 'Listen next';

    songMenuAddToPlaylistIcon.classList.add('material-icons', 'song-menu-option-icon');
    songMenuAddToPlaylistIcon.textContent = 'playlist_add';
    songMenuAddToPlaylist.appendChild(songMenuAddToPlaylistIcon);
    songMenuAddToPlaylist.classList.add('song-menu-option');
    songMenuAddToPlaylist.innerHTML += 'Add to playlist';

    songMenuAddToFavoritesIcon.classList.add('material-icons', 'song-menu-option-icon');
    songMenuAddToFavoritesIcon.textContent = 'favorite_border';
    songMenuAddToFavorites.appendChild(songMenuAddToFavoritesIcon);
    songMenuAddToFavorites.classList.add('song-menu-option');
    songMenuAddToFavorites.innerHTML += 'Add to favorites';

    songMenuGoToArtistIcon.classList.add('material-icons', 'song-menu-option-icon');
    songMenuGoToArtistIcon.textContent = 'people';
    songMenuGoToArtist.appendChild(songMenuGoToArtistIcon);
    songMenuGoToArtist.classList.add('song-menu-option');
    songMenuGoToArtist.innerHTML += 'Go to artist';

    songMenuGoToAlbumIcon.classList.add('material-icons', 'song-menu-option-icon');
    songMenuGoToAlbumIcon.textContent = 'album';
    songMenuGoToAlbum.appendChild(songMenuGoToAlbumIcon);
    songMenuGoToAlbum.classList.add('song-menu-option');
    songMenuGoToAlbum.innerHTML += 'Go to album';

    songMenu.classList.add('song-menu');
    songMenu.style.display = 'none';
    songMenu.appendChild(songMenuArrow);
    songMenu.appendChild(songMenuTop);
    songMenu.appendChild(songMenuSeparator);
    songMenu.appendChild(songMenuAddToQueue);
    songMenu.appendChild(songMenuListenNext);
    songMenu.appendChild(songMenuAddToPlaylist);
    songMenu.appendChild(songMenuAddToFavorites);
    songMenu.appendChild(songMenuGoToArtist);
    songMenu.appendChild(songMenuGoToAlbum);
	
	//Hides unused options
	songMenuAddToPlaylist.style.display = "none";
	songMenuAddToFavorites.style.display = "none";
	songMenuGoToArtist.style.display = "none";
	songMenuGoToAlbum.style.display = "none";

    song.appendChild(favorite);
    song.appendChild(title);
    song.appendChild(artists);
    song.appendChild(album);
    song.appendChild(duration);
    song.appendChild(moreBtn);
    song.appendChild(songMenu);

    songWrapper.addEventListener('mouseover', () => {
        playButton.style.display = 'inline';
        moreBtn.style.display = 'inline';
    });

    songWrapper.addEventListener('mouseout', () => {
        playButton.style.display = 'none';
		
        if (song.querySelector('.song-menu').style.display != 'block')
            moreBtn.style.display = 'none';
    });

    play.classList.add('material-icons', 'play');
    play.textContent = 'play_arrow';

    playButton.classList.add('play-button');
    playButton.appendChild(play);

    songWrapper.classList.add('song-container');
    songWrapper.appendChild(playButton);
    songWrapper.appendChild(song);

    songsContainer.insertBefore(songWrapper, songsContainer.children[songIndex + 1]);
    components.splice(songIndex, 0, songWrapper);

    updateComponent(songIndex);
}

const updateComponent = index => {
    const title = components[index].querySelector('.song-title');
    const artists = components[index].querySelector('.song-artists');
    const album = components[index].querySelector('.song-album');
    const duration = components[index].querySelector('.song-duration');
    const favorite = components[index].querySelector('.favorite');
    const songMenuPicture = components[index].querySelector('.song-menu-picture');
    const songMenuDefaultPicture = components[index].querySelector('.song-menu-default-picture');
    const songMenuArtist = components[index].querySelector('.song-menu-artist');
    const songMenuTitle = components[index].querySelector('.song-menu-title');
    const playButton = components[index].querySelector('.play-button');
    const moreBtn = components[index].querySelector('.song-more-button');
    const songMenuAddToQueue = components[index].querySelectorAll('.song-menu-option')[0];
    const songMenuListenNext = components[index].querySelectorAll('.song-menu-option')[1];
    const songMenuAddToPlaylist = components[index].querySelectorAll('.song-menu-option')[2];
    const songMenuAddToFavorites = components[index].querySelectorAll('.song-menu-option')[3];
    const songMenuGoToArtist = components[index].querySelectorAll('.song-menu-option')[4];
    const songMenuGoToAlbum = components[index].querySelectorAll('.song-menu-option')[5];

    title.textContent = songs[index].Title;
    songs[index].Artist.forEach((currentValue, currentIndex) => {
        const artist = document.createElement("div");

        artist.classList.add("song-artist")
        artist.textContent = currentValue;

        artists.appendChild(artist);

        if (currentIndex < songs[index].Artist.length - 1)
            artists.innerHTML += ",&nbsp";
    });

    album.textContent = songs[index].Album;
    duration.textContent = playback.getFormattedDuration(songs[index].Duration);
    songMenuArtist.textContent = songs[index].Artist.join(', ');
    songMenuTitle.textContent = songs[index].Title;

    favorite.addEventListener('click', () => {
        songs[index].favorite = true;
    });

    playButton.addEventListener('click', () => {
        autoplay = true;
        playSong(index);
    });

    moreBtn.addEventListener('click', async e => {
        songMenuListener(e.target, index);
        try {
            songMenuPicture.src = await parser.extractPicture(songs[index].SourceFile);
            songMenuPicture.onload = () => {
                songMenuDefaultPicture.style.display = 'none';
                songMenuPicture.style.display = 'inline';
            }
        } catch (err) { }
    });

    songMenuAddToQueue.addEventListener('click', () => {
        playback.enqueue(index);
    });

    songMenuListenNext.addEventListener('click', () => {
        playback.insert(index, 0);
    });

    songMenuAddToFavorites.addEventListener('click', () => {
        songs[index].favorite = true;
    });

    /* TODO: Implement 'Add to playlist', 'Go to Artist' and 'Go to Album' */

    components[index].style.display = 'flex';
}

const updateComponents = playing => {
    if (playback.isPlaying()) {
        const currentSong = songs.findIndex(song => {
            return song.SourceFile == playing;
        });

        components[playback.getCurrentSong()].querySelector('.song').style.color = '#333333';
        components[playback.getCurrentSong()].querySelector('.play').textContent = 'play_arrow';

        components[currentSong].querySelector('.song').style.color = '#2897a5';
        components[currentSong].querySelector('.play').textContent = 'pause';

        playback.setCurrentSong(currentSong);
    }

    for (let i = 0; i < songs.length; i++)
        updateComponent(i);
}

searchBox.addEventListener('keyup', (e) => {
    const resultsContainer = document.querySelector('.results-container');
    const query = searchBox.value.toLowerCase();
    const resultsLimit = 4;
    const results = searchSongs(query);

    resultsContainer.innerHTML = '';

    if (results.length > 0) {
        let i = 0;

        if (results.length > resultsLimit) {
            var viewMore = document.createElement('div');
            viewMore.classList.add('material-icons', 'view-more');
            viewMore.textContent = 'keyboard_arrow_down';
            resultsContainer.appendChild(viewMore);
        }

        while (i < results.length && i < resultsLimit) {
            const result = document.createElement('div');
            const resultTitle = document.createElement('div');
            const resultArtist = document.createElement('div');

            result.classList.add('result');
            resultTitle.classList.add('result-title');
            resultArtist.classList.add('result-artist');
            resultTitle.textContent = songs[results[i]].Title;
            resultArtist.textContent = songs[results[i]].Artist.join(', ');
            result.appendChild(resultTitle);
            result.appendChild(resultArtist);
            resultsContainer.appendChild(result);
            i++;
        }

        if (e.keyCode == 8 && query.length == 0) {
            resultsContainer.style.display = 'none';
            searchBox.style.borderBottom = '1px solid #ebebeb';
        } else if (e.keyCode >= 65 && e.keyCode <= 90) {
            resultsContainer.style.display = 'inline';
            searchBox.style.border = '1px solid rgba(0, 0, 0, 0.08)';
            searchBox.style.borderBottom = '1px solid rgba(235, 235, 235, 0.5)';
        }

        if (results.length > resultsLimit) {
            resultsContainer.lastChild.style.height = '60px';
            resultsContainer.lastChild.firstChild.style.opacity = '0.6';
            resultsContainer.lastChild.lastChild.style.opacity = '0.5';
            viewMore.style.display = 'flex';
        }

        resultsContainer.childNodes.forEach((currentNode, index) => {
            if (currentNode.className == 'result') {
                currentNode.addEventListener('click', () => {
                    if (results.length > resultsLimit)
                        --index;

                    autoplay = true;
                    playSong(results[index]);
                });

                currentNode.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    if (results.length > resultsLimit)
                        --index;

                    autoplay = true;
                    playback.enqueue(results[index]);
                });
            }
        });
    }
});

sortByTitle.addEventListener('click', () => {
    const currentSong = -1;

    if (playback.getCurrentSong() != -1)
        songs[playback.getCurrentSong()].SourceFile;

    if (titleSort == 0) {
        arrow1.classList.add('arrow-down');

        songs.sort((a, b) => {
            return a.Title > b.Title ? 1 : -1;
        });
    } else if (titleSort == 1) {
        arrow1.classList.remove('arrow-down');
        arrow1.classList.add('arrow-up');

        songs.sort((a, b) => {
            return a.Title < b.Title ? 1 : -1;
        });
    } else {
        arrow1.classList.remove('arrow-up');
        titleSort = -1;

        songs.sort((a, b) => {
            return fs.statSync(b.SourceFile).mtime - fs.statSync(a.SourceFile).mtime;
        });
    }

    titleSort++;
    artistSort = 0;
    albumSort = 0;

    arrow2.className = '';
    arrow3.className = '';

    updateComponents(currentSong);
});

sortByArtist.addEventListener('click', () => {
    const currentSong = -1;

    if (playback.getCurrentSong() != -1)
        songs[playback.getCurrentSong()].SourceFile;

    if (artistSort == 0) {
        arrow2.classList.add('arrow-down');

        songs.sort((a, b) => {
            return a.Artist.join(', ') > b.Artist.join(', ') ? 1 : -1;
        });
    }
    else if (artistSort == 1) {
        arrow2.classList.remove('arrow-down');
        arrow2.classList.add('arrow-up');

        songs.sort((a, b) => {
            return a.Artist.join(', ') < b.Artist.join(', ') ? 1 : -1;
        });
    } else {
        arrow2.classList.remove('arrow-up');
        artistSort = -1;

        songs.sort((a, b) => {
            return fs.statSync(b.SourceFile).mtime - fs.statSync(a.SourceFile).mtime;
        });
    }

    artistSort++;
    titleSort = 0;
    albumSort = 0;

    arrow1.className = '';
    arrow3.className = '';

    updateComponents(currentSong);
});

sortByAlbum.addEventListener('click', () => {
    const currentSong = -1;

    if (playback.getCurrentSong() != -1)
        songs[playback.getCurrentSong()].SourceFile;

    if (albumSort == 0) {
        arrow3.classList.add('arrow-down');

        songs.sort((a, b) => {
            return a.Album > b.Album ? 1 : -1;
        });
    }
    else if (albumSort == 1) {
        arrow3.classList.remove('arrow-down');
        arrow3.classList.add('arrow-up');

        songs.sort((a, b) => {
            return a.Album < b.Album ? 1 : -1;
        });
    } else {
        arrow3.classList.remove('arrow-up');
        albumSort = -1;

        songs.sort((a, b) => {
            return fs.statSync(b.SourceFile).mtime - fs.statSync(a.SourceFile).mtime;
        });
    }

    albumSort++;
    titleSort = 0;
    artistSort = 0;

    arrow1.className = '';
    arrow2.className = '';

    updateComponents(currentSong);
});

controlButtons[0].addEventListener('click', () => {
    if (!playback.isShuffleMode()) {
        controlButtons[0].querySelector('i').style.color = 'rgba(255, 255, 255, 1)';
        playback.setShuffleMode(true);
    } else {
        controlButtons[0].querySelector('i').style.color = 'rgba(255, 255, 255, 0.6)';
        playback.setShuffleMode(false);
    }
});

controlButtons[1].addEventListener('click', () => {
    if (playback.getCurrentSong() != -1)
        playPreviousSong();
});

controlButtons[2].addEventListener('click', () => {
    if (playback.getCurrentSong() != -1) {
        playback.resume();
        components[playback.getCurrentSong()].querySelector('.play').textContent = 'pause';
        controlButtons[2].style.display = 'none';
        controlButtons[3].style.display = 'inline';
    }
});

controlButtons[3].addEventListener('click', () => {
    playback.pause();
    components[playback.getCurrentSong()].querySelector('.play').textContent = 'play_arrow';
    controlButtons[3].style.display = 'none';
    controlButtons[2].style.display = 'inline';
});

controlButtons[4].addEventListener('click', () => {
    if (playback.getCurrentSong() != -1)
        playNextSong();
});

controlButtons[5].addEventListener('click', () => {
    if (!playback.isRepeatMode()) {
        controlButtons[5].querySelector('i').style.color = 'rgba(255, 255, 255, 1)';
        playback.setRepeatMode(true);
    } else {
        controlButtons[5].querySelector('i').style.color = 'rgba(255, 255, 255, 0.6)';
        playback.setRepeatMode(false);
    }
});

controlButtons[6].addEventListener('click', () => {
    if (!playback.isMuted()) {
        controlButtons[6].querySelector('.volume-button').textContent = 'volume_mute';
        playback.setVolume(0);
        playback.setMuted(true);
    } else {
        if (playback.getVolume() <= 33)
            controlButtons[6].querySelector('.volume-button').textContent = 'volume_down';
        else if (playback.getVolume() > 33)
            controlButtons[6].querySelector('.volume-button').textContent = 'volume_up';

        playback.setVolume(playback.getVolume() / 100);
        playback.setMuted(false);
    }
});

playback.getSong().addEventListener('ended', () => {
    if (!playback.isRepeatMode())
        play(playback.getNextSong());
    else
        play(playback.getCurrentSong());
});

module.exports = {
    createComponent,
    updateComponent,
    updateComponents,
    playSong,
    playPreviousSong,
    playNextSong
}
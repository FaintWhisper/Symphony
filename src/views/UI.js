const controller = require('./controller/controller.js');
const model = require('./models/model.js');
const speech = require('./libs/speech.js');
const songsView = require('./views/songs.js');

const topBar = document.querySelector('.top-bar');
const menu = document.querySelector('.menu');
const controlPanel = document.querySelector('.control-panel');
const volume = document.querySelector('#volume');

document.querySelector('.add-button').addEventListener('click', () => {
    const pathLocation = document.querySelector('.add-path').value.replace(/\\/g, '/');

    if (pathLocation != '') {
        document.querySelector('.add-music-library-wrapper').style.display = 'none';
        const path = {
            'location': pathLocation,
            'alreadyRead': false
        };
        paths.push(path);
        model.addPath(path);
        controller.getTags();
    }
});

const menuHandler = (() => {
    let menuState = 'closed';

    return {
        setState: (state) => {
            menuState = state;
        },
        getState: () => {
            return menuState;
        }
    }
})();

const openMenu = () => {
    let menu = document.querySelector('#menu');
    menu.classList.remove('menu');
    menu.classList.add('menu-open');
    menu.addEventListener('transitionend', showLabels);
    menuHandler.setState('opened');
}

const showLabels = () => {
    const menu = document.querySelector('#menu');
    const labels = document.querySelectorAll('.labels');

    labels.forEach((_, index) => {
        labels[index].style.display = 'inline';
    });

    menu.removeEventListener('transitionend', showLabels);
}

const closeMenu = () => {
    const menu = document.querySelector('#menu');
    const labels = document.querySelectorAll('.labels');

    menu.classList.remove('menu-open');
    menu.classList.add('menu');

    Array.from(labels).forEach((_, index) => {
        labels[index].style.display = 'none';
    });

    menuHandler.setState('closed');
}

document.querySelector('.menu-button').addEventListener('click', () => {
    const menuState = menuHandler.getState();

    if (menuState == 'closed')
        openMenu();
    else
        closeMenu();
});

document.querySelector('.container').addEventListener('click', e => {
    if (!e.target.classList.contains('search-box')) {
        const searchBox = document.querySelector('.search-box');
        const resultsContainer = document.querySelector('.results-container');

        resultsContainer.style.display = 'none';
        searchBox.style.borderBottom = '1px solid #ebebeb';
    }

    if ((!e.target.classList[0].includes('song-menu') && !e.target.classList.contains('song-more-button')) || e.target.classList.contains('song-menu-option')) {
        Array.from(document.querySelectorAll('.song-menu')).forEach(currentNode => {
            if (currentNode.style.display != 'none') {
                const song = currentNode.parentNode.parentNode;

                currentNode.style.display = 'none';
                if (!song.contains(e.target))
                    song.querySelector('.song-more-button').style.display = 'none';
            }
        });
    }

    e.stopPropagation();
});

document.querySelector('.search-box').addEventListener('click', () => {
    const searchBox = document.querySelector('.search-box');
    const resultsContainer = document.querySelector('.results-container');

    if (resultsContainer.style.display == 'none' && searchBox.value != '') {
        resultsContainer.style.display = 'inline';
        searchBox.style.border = '1px solid rgba(0, 0, 0, 0.08)';
        searchBox.style.borderBottom = '1px solid rgba(235, 235, 235, 0.5)';
    }
});

document.querySelector('.search-box').addEventListener('mouseover', () => {
    const searchBox = document.querySelector('.search-box');
    const resultsContainer = document.querySelector('.results-container');

    if (resultsContainer.style.display != 'inline')
        searchBox.style.borderColor = '#d1d1d1';
});

document.querySelector('.search-box').addEventListener('mouseout', () => {
    const searchBox = document.querySelector('.search-box');
    const resultsContainer = document.querySelector('.results-container');

    searchBox.style.borderColor = '#ebebeb';
});

document.querySelector('.mic').addEventListener('click', async e => {
    if (playback.isPlaying()) {
        const song = playback.getCurrentSong();
        const playButtons = document.querySelectorAll('.play-button');
        const controlButtons = document.querySelector('.control-buttons').querySelectorAll('button');

        playButtons[song].querySelector('.play').textContent = 'pause';
        controlButtons[2].style.display = 'inline';
        controlButtons[3].style.display = 'none';

        songsView.playSong(song);
    }

    const requestedSong = await speech.getRequestedSong();

    autoplay = true;
    songsView.playSong(requestedSong);
});

document.querySelector('.progress-bar_range').addEventListener('input', () => {
    if (playback.isChangingTime() == false)
        playback.setChangingTime(true);
});

document.querySelector('.progress-bar_range').addEventListener('change', () => {
    const sliderValue = document.querySelector('.progress-bar_range').value;
    const currentTime = Math.ceil((sliderValue * playback.getDuration()) / 100)
    playback.setCurrentTime(currentTime);
    document.querySelector('.progress-bar_fill').style.width = `calc(${sliderValue * 0.9}%)`;
    document.querySelector('.playing-song-current-time').textContent = playback.getFormattedCurrentTime();
    playback.setChangingTime(false);
    model.setTime(currentTime);
});

const setVolume = volume => {
    if (volume == 0)
        document.querySelector('.volume-button').textContent = 'volume_mute';
    else if (volume <= 33)
        document.querySelector('.volume-button').textContent = 'volume_down';
    else if (playback.getVolume() <= 33 && volume > 33)
        document.querySelector('.volume-button').textContent = 'volume_up';

    playback.setVolume(volume);
    model.setVolume(volume);
}

topBar.style.visibility = 'visible';
menu.style.visibility = 'visible';
volume.style.visibility = 'visible';
controlPanel.style.visibility = 'visible';

//Restores the volume value of the last session
const volumeValue = model.getVolume();
playback.setVolume(volumeValue);

document.querySelector("#volume").querySelector('.slider_range_fill').style.width = `${volumeValue * 0.7}%`;
document.querySelector("#volume").querySelector('.slider_range').value = volumeValue;
document.querySelector("#volume").querySelector('.slider_value').textContent = volumeValue;

controller.loadSection();
const parser = require('../libs/parser.js');
const songsView = require('./songs.js');

const createComponent = albumIndex => {
    const albumsContainer = document.querySelector('.albums-container');
    const albumContainer = document.createElement('div');
    const albumCoverContainer = document.createElement('div');
    const fadeAlbumCover = document.createElement('div');
    const defaultAlbumCover = document.createElement('div');
    const musicNote = document.createElement('i');
    const picture = document.createElement('img');
    const albumTitle = document.createElement('p');
    const playBtn = document.createElement('button');
    const playIcon = document.createElement('i');

    albumContainer.classList.add('album');
    albumCoverContainer.classList.add('picture-wrap');
    fadeAlbumCover.classList.add('album-cover-fade', 'fade-hidden');
    defaultAlbumCover.classList.add('default-album-cover');
    musicNote.classList.add('material-icons', 'album-icon');
    picture.classList.add('album-cover');
    albumTitle.classList.add('album-title');
    playBtn.classList.add('play-album');
    playIcon.classList.add('material-icons', 'play-album-icon');

    musicNote.textContent = 'album';
    playIcon.textContent = 'play_arrow';

    defaultAlbumCover.appendChild(musicNote);
    playBtn.appendChild(playIcon);

    albumCoverContainer.appendChild(playBtn);
    albumCoverContainer.appendChild(fadeAlbumCover);
    albumCoverContainer.appendChild(defaultAlbumCover);
    albumCoverContainer.appendChild(picture);

    albumContainer.appendChild(albumCoverContainer);
    albumContainer.appendChild(albumTitle);

    albumsContainer.appendChild(albumContainer);

    updateComponent(albumIndex);
}

const updateComponent = async albumIndex => {
    const album = albums[albumIndex];
    const albumsContainer = document.querySelector('.albums-container');
    const albumContainer = albumsContainer.children[albumIndex];
    const albumTitle = albumContainer.querySelector('.album-title');

    albumTitle.textContent = album.title;

    albumContainer.addEventListener("click", () => {
        autoplay = true;
		let playFrom = 1;
		
		if (!playback.isPlaying())
			songsView.playSong(albums[albumIndex].songs[0]);	
		else
			playFrom = 0;
		
        for (let i = playFrom; i < albums[albumIndex].songs.length; i++)
            playback.enqueue(albums[albumIndex].songs[i]);
    });
}

const isInViewport = element => {
    let hidden = false;
    let orgElement = element;

    if (element.style.display == '') {
        element.style.visibility == 'hidden';
        element.style.display = 'inline';
        hidden = true;
    }

    let top = element.offsetTop;
    let left = element.offsetLeft;
    let width = element.offsetWidth;
    let height = element.offsetHeight;

    while (element.offsetParent) {
        element = element.offsetParent;
        top += element.offsetTop;
        left += element.offsetLeft;
    }

    if (hidden) {
        orgElement.style.visibility == 'visible';
        orgElement.style.display = 'none';
    }

    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    );
}

const loadCovers = () => {
    const pictures = [...document.querySelectorAll('.album-cover')];

    pictures.forEach(async (picture, albumIndex) => {
        const albumsContainer = document.querySelector('.albums-container');
        const albumContainer = albumsContainer.children[albumIndex];
        const fadeAlbumCover = albumContainer.querySelector('.album-cover-fade');
        const defaultAlbumCover = albumContainer.querySelector('.default-album-cover');
        const albumTitle = albumContainer.querySelector('.album-title');
        const playBtn = albumContainer.querySelector('.play-album');

        try {
            picture.src = await parser.extractPicture(songs[albums[albumIndex].songs[0]].SourceFile);

            picture.onload = () => {
                const dominantColor = colorThief.getColor(picture);
                let rgb = '';

                defaultAlbumCover.style.display = 'none';
                picture.style.display = 'inline';

                if ((dominantColor[0] + dominantColor[1] + dominantColor[1]) / 3 <= 155)
                    rgb = `${dominantColor[0] + 80}, ${dominantColor[1] + 80}, ${dominantColor[2] + 80}`;
                else
                    rgb = `${dominantColor[0] - 60}, ${dominantColor[1] - 60}, ${dominantColor[2] - 60}`;
            }
        } catch (err) {
            console.error(err);
        }

        albumContainer.addEventListener('mouseover', () => {
            playBtn.style.visibility = 'visible';
            defaultAlbumCover.style.borderStyle = 'none';
            fadeAlbumCover.classList.remove('fade-hidden');
            fadeAlbumCover.style.background = 'linear-gradient(to bottom, #6fabe6, rgba(200, 200, 240, 0.7)';
            picture.style.transform = 'scale(1.2)';
            albumTitle.style.color = '#000000';
        });

        albumContainer.addEventListener('mouseout', () => {
            playBtn.style.visibility = 'hidden';
            defaultAlbumCover.style.borderStyle = 'solid';
            fadeAlbumCover.classList.add('fade-hidden');
            picture.style.transform = 'scale(1)';
            albumTitle.style.color = '#656565';
        });
    });
}

module.exports = {
    createComponent,
    loadCovers
}
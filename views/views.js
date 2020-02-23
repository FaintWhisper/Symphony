let views = {
    loadSongsSection: (paths, songs, contentAlreadyLoaded, updateSong, wasPlaying) => {
        let searchBox = document.querySelector(".search-box"),
            loading = document.querySelector(".loading"),
            sortSongs = document.querySelector(".sort-songs"),
            sortByTitle = document.querySelector(".sort-by-title"),
            sortByArtist = document.querySelector(".sort-by-artist"),
            sortByAlbum = document.querySelector(".sort-by-album"),
            songsContainer = document.querySelector(".songs-container"),
            controlButtons = document.querySelector(".control-buttons").querySelectorAll("button"),
            progressBarContainer = document.querySelector(".progress-bar-container"),
            progressBar = document.querySelector("#progressBar");

        playback = new Playback(songs);

        let playSong = (index) => {
            let playingSong = document.querySelector(".playing-song"),
                songTitle = document.querySelector(".playing-song-title"),
                songArtist = document.querySelector(".playing-song-artist"),
                img = document.querySelector(".playing-song-image"),
                currentTime = document.querySelector(".playing-song-current-time"),
                songDuration = document.querySelector(".playing-song-duration");

            mm.parseFile(`${paths[0]}/${songs[index].filename}`)
                .then(tags => {
                    if (tags.common.picture.length > 0) {
                        let albumCover = tags.common.picture[0];
                        let url = URL.createObjectURL(new Blob([albumCover.data], {
                            "type": "image" + "/" + albumCover.format
                        }));
                        img.src = url;
                        img.style.display = "inline";
                        img.onload = () => {
                            dominantColor = colorThief.getColor(img);
                            if ((dominantColor[0] + dominantColor[1] + dominantColor[1]) / 3 <= 125)
                                rgb = `${dominantColor[0] + 60}, ${dominantColor[1] + 60}, ${dominantColor[2] + 60}`;
                            else
                                rgb = `${dominantColor[0] - 60}, ${dominantColor[1] - 60}, ${dominantColor[2] - 60}`;
                            document.querySelector(".control-panel").style.background = `rgb(${rgb})`;
                        };
                    }
                })
                .catch(error => {
                    throw error;
                });

            songTitle.textContent = songs[index].title;
            songArtist.textContent = songs[index].artist;
            playingSong.style.visibility = "visible";
            playback.setCurrentSong(index);
            playback.play();

            sArr[index].querySelector(".song").style.color = "#2897a5";
            sArr[index].querySelector(".play").textContent = "pause";
            setInterval(() => {
                if (playback.isPlaying())
                    currentTime.textContent = playback.getFormattedCurrentTime();
            }, 1000);
            setTimeout(() => {
                songDuration.textContent = playback.getFormattedDuration();
                progressBarContainer.style.position = "relative";
                progressBarContainer.style.visibility = "visible";
                if (progressBarUpdate !== undefined)
                    clearInterval(progressBarUpdate);

                //Updates the song's progress bar
                progressBarUpdate = setInterval(() => {
                    if (!changingTime) {
                        let value = Math.ceil((playback.getCurrentTime() * 100) / playback.getDuration());
                        if (value < 1)
                            value = 1;
                        progressBar.MaterialSlider.change(value);
                    }
                }, 500);
            }, 1000);
        }

        let playSong = (index) => {
            if (playback.getCurrentSong() == -1 || (songs[playback.getCurrentSong()].filename != songs[index].filename)) {
                if (playback.getCurrentSong() == -1) {
                    controlButtons[1].style.color = "rgba(255, 255, 255, 1)";
                    controlButtons[2].style.color = "rgba(255, 255, 255, 1)";
                    controlButtons[3].style.color = "rgba(255, 255, 255, 1)";
                    controlButtons[4].style.color = "rgba(255, 255, 255, 1)";
                } else {
                    sArr[playback.getCurrentSong()].querySelector(".song").style.color = "#333333";
                    sArr[playback.getCurrentSong()].querySelector(".play").textContent = "play_arrow";
                }
                playSong(index);
            } else
                playback.resume();
            sArr[index].querySelector(".play").textContent = "pause";
            controlButtons[2].style.display = "none";
            controlButtons[3].style.display = "flex";
            pArr[index].removeEventListener("click", playSong);
            pArr[index].addEventListener("click", () => {
                pauseListener(event, index);
            });
        }

        let pauseListener = (event, index) => {
            if (songs[playback.getCurrentSong()].filename == songs[index].filename) {
                playback.pause();
                pArr[index].querySelector(".play").textContent = "play_arrow";
                pArr[index].removeEventListener("click", pauseListener);
                pArr[index].addEventListener("click", () => {
                    playSong(event, index);
                });
                controlButtons[2].style.display = "flex";
                controlButtons[3].style.display = "none";
            } else
                playSong(index);
        }

        var isInViewport = (element) => {
            let hidden = false;
            if (element.style.display == "none") {
                element.style.visibility == "hidden";
                element.style.display = "block";
                hidden = true;
            }
            const rect = element.getBoundingClientRect();
            const html = document.documentElement;
            const controlPanel = document.querySelector('.control-panel').getBoundingClientRect();

            if (hidden) {
                element.style.visibility == "visible";
                element.style.display = "none";
            }

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || html.clientHeight) - controlPanel.height &&
                rect.right <= (window.innerWidth || html.clientWidth)
            );
        }

        let songMenuListener = (element, index) => {
            Array.from(document.querySelectorAll(".song-menu")).forEach((currentNode, currentIndex) => {
                if (currentIndex == index) {
                    if (currentNode.style.display == "none") {
                        if (!isInViewport(currentNode)) {
                            currentNode.style.top = "-38vh";
                            if (currentNode.firstChild.classList.contains("song-menu-top-arrow"))
                                currentNode.firstChild.classList.remove("song-menu-top-arrow");
                            currentNode.firstChild.classList.add("song-menu-bottom-arrow");
                        } else if (currentNode.firstChild.classList.contains("song-menu-bottom-arrow")) {
                            currentNode.firstChild.classList.remove(".song-menu-bottom-arrow");
                            currentNode.firstChild.classList.add(".song-menu-top-arrow");
                        }
                        currentNode.style.display = "block";
                    } else {
                        currentNode.style.display = "none";
                        currentNode.style.top = "0px";
                    }
                } else
                    currentNode.style.display = "none";
                Array.from(document.querySelectorAll(".song-more-button")).forEach(currentNode => {
                    if (currentNode.style.display == "inline" && currentNode != element)
                        currentNode.style.display = "none";
                });
            });

        }

        let searchSongs = (query) => {
            let i = 0,
                numResults = 0,
                results = [],
                cont = true;

            let songsFileNames = songs.map((currentValue) => {
                return `${currentValue.title || currentValue.filename};${currentValue.artist};${currentValue.album}`.toLowerCase();
            });

            while (i < songsFileNames.length) {
                if (songsFileNames[i].indexOf(query) != -1) {
                    results[numResults] = i;
                    numResults++;
                }
                i++;
            }

            for (let i = 0; i < results.length; i++) {
                let fields = songsFileNames[results[i]].split(";");
                if (fields[1].indexOf(query) != 0) {
                    results.push(results[i]);
                    results = results.slice(0, i).concat(results.slice(i + 1));
                }
            }
            return results;
        }

        // Gets the song"s title from the song's file name
        let getFileName = (str) => {
            var arr = str.split(".");
            arr.pop();
            return arr.join(" ");
        }

        songsContainer.style.display = "none";
        loading.style.display = "table";

        if (updateSong) {
            playback.setCurrentSong(songs.findIndex((currentValue) => {
                return currentValue.filename == wasPlaying;
            }));
            sArr[playback.getCurrentSong()].querySelector(".song").style.color = "#2897a5";
            sArr[playback.getCurrentSong()].querySelector(".play").textContent = "pause";
        }

        if (!contentAlreadyLoaded) {
            for (let i = 0; i < songs.length; i++) {
                let songContainer = document.createElement("div"),
                    song = document.createElement("div"),
                    playBtn = document.createElement("button"),
                    play = document.createElement("i"),
                    fav = document.createElement("i"),
                    title = document.createElement("div"),
                    artist = document.createElement("div"),
                    album = document.createElement("div"),
                    duration = document.createElement("div"),
                    songMenu = document.createElement("div"),
                    songMenuArrow = document.createElement("div"),
                    songMenuTop = document.createElement("div"),
                    songMenuPicture = document.createElement("img"),
                    songMenuDetails = document.createElement("div"),
                    songMenuTitle = document.createElement("div"),
                    songMenuArtist = document.createElement("div"),
                    songMenuSeparator = document.createElement("div"),
                    moreBtn = document.createElement("button");

                song.classList.add("song");

                fav.classList.add("material-icons", "fav");
                fav.textContent = "favorite_border"

                title.classList.add("song-title");
                artist.classList.add("song-artist");
                album.classList.add("song-album");
                duration.classList.add("song-duration");

                moreBtn.classList.add("song-more-button", "material-icons");
                moreBtn.textContent = "more_horiz";

                moreBtn.addEventListener("click", e => {
                    songMenuListener(e.target, i);
                });

                songMenuPicture.classList.add("song-menu-picture");
                mm.parseFile(`${paths[0]}/${songs[i].filename}`)
                    .then(tags => {
                        if (tags.common.picture != undefined) {
                            let albumCover = tags.common.picture[0];
                            let url = URL.createObjectURL(new Blob([albumCover.data], {
                                "type": "image" + "/" + albumCover.format
                            }));
                            songMenuPicture.src = url;
                        }
                    })
                    .catch(error => {
                        throw error;
                    });

                songMenuTitle.classList.add("song-menu-title");
                songMenuTitle.textContent = songs[i].title;

                songMenuArtist.classList.add("song-menu-artist");
                songMenuArtist.textContent = songs[i].artist;

                songMenuDetails.classList.add("song-menu-details");
                songMenuDetails.appendChild(songMenuTitle);
                songMenuDetails.appendChild(songMenuArtist);

                songMenuTop.classList.add("song-menu-top");
                songMenuTop.appendChild(songMenuPicture);
                songMenuTop.appendChild(songMenuDetails);

                songMenuArrow.classList.add("song-menu-top-arrow");
                songMenuSeparator.classList.add("song-menu-separator");

                songMenu.classList.add("song-menu");
                songMenu.style.display = "none";
                songMenu.appendChild(songMenuArrow);
                songMenu.appendChild(songMenuTop);
                songMenu.appendChild(songMenuSeparator);

                song.appendChild(fav);
                song.appendChild(title);
                song.appendChild(artist);
                song.appendChild(album);
                song.appendChild(duration);
                song.appendChild(moreBtn);
                song.appendChild(songMenu);

                songContainer.addEventListener("mouseover", () => {
                    playBtn.style.display = "inline";
                    moreBtn.style.display = "inline";
                });
                songContainer.addEventListener("mouseout", () => {
                    playBtn.style.display = "none";
                    if (song.querySelector(".song-menu").style.display != "block")
                        moreBtn.style.display = "none";
                });

                play.classList.add("material-icons", "play");
                play.textContent = "play_arrow";

                playBtn.classList.add("play-button");
                playBtn.appendChild(play);
                playBtn.addEventListener("click", () => {
                    playSong(i);
                });

                songContainer.classList.add("song-container");
                songContainer.appendChild(playBtn);
                songContainer.appendChild(song);
                songsContainer.appendChild(songContainer);
                sArr.push(songContainer);
            }

            var pArr = document.querySelectorAll(".play-button");

            searchBox.addEventListener("keyup", (e) => {
                let resultsContainer = document.querySelector(".results-container"),
                    query = searchBox.value.toLowerCase(),
                    threshold = 4,
                    results = searchSongs(query);
                resultsContainer.innerHTML = "";
                if (results.length > 0) {
                    let i = 0;
                    if (results.length > threshold) {
                        var viewMore = document.createElement("div");
                        viewMore.classList.add("material-icons", "view-more");
                        viewMore.textContent = "keyboard_arrow_down";
                        resultsContainer.appendChild(viewMore);
                    }

                    while (i < results.length && i < threshold) {
                        let result = document.createElement("div"),
                            resultTitle = document.createElement("div"),
                            resultArtist = document.createElement("div");
                        result.classList.add("result");
                        resultTitle.classList.add("result-title");
                        resultArtist.classList.add("result-artist");
                        resultTitle.textContent = songs[results[i]].title;
                        resultArtist.textContent = songs[results[i]].artist;
                        result.appendChild(resultTitle);
                        result.appendChild(resultArtist);
                        resultsContainer.appendChild(result);
                        i++;
                    }

                    if (e.keyCode == 8 && query.length == 0) {
                        resultsContainer.style.display = "none";
                        searchBox.style.borderBottom = "1px solid #ebebeb";
                    } else if (e.keyCode >= 65 && e.keyCode <= 90) {
                        resultsContainer.style.display = "inline";
                        searchBox.style.border = "1px solid rgba(0, 0, 0, 0.08)";
                        searchBox.style.borderBottom = "1px solid rgba(235, 235, 235, 0.5)";
                    }

                    if (results.length > threshold) {
                        resultsContainer.lastChild.style.height = "60px";
                        resultsContainer.lastChild.firstChild.style.opacity = "0.6";
                        resultsContainer.lastChild.lastChild.style.opacity = "0.5";
                        viewMore.style.display = "flex";
                    }

                    resultsContainer.childNodes.forEach((currentNode, index) => {
                        if (currentNode.className == "result")
                            currentNode.addEventListener("click", () => {
                                playSong(results[--index]);
                            });
                    });
                }
            });

            document.querySelector(".mic").addEventListener("click", () => {
                let mic = document.querySelector(".mic");
                mic.textContent = "mic";
                speech.getRequestedSong(songs);
                mic.textContent = "mic_none";
            });

            sortByTitle.addEventListener("click", () => {
                let info = [];
                if (playback.isPlaying()) {
                    sArr[playback.getCurrentSong()].querySelector(".song").style.color = "#333333";
                    sArr[playback.getCurrentSong()].querySelector(".play").textContent = "play_arrow";
                    info = [true, songs[playback.getCurrentSong()].filename];
                } else
                    info = [false];
                if (titleSort == 0) {
                    arrow1.classList.add("arrow-down");
                    songs.sort((a, b) => {
                        return a.title > b.title ? 1 : -1;
                    });
                } else if (titleSort == 1) {
                    arrow1.classList.remove("arrow-down");
                    arrow1.classList.add("arrow-up");
                    songs.sort((a, b) => {
                        return a.title < b.title ? 1 : -1;
                    });

                } else {
                    arrow1.classList.remove("arrow-up");
                    titleSort = -1;
                    songs.sort((a, b) => {
                        return fs.statSync(paths[0] + "/" + b.filename).mtime.getTime() - fs.statSync(paths[0] + "/" + a.filename).mtime.getTime();
                    });
                }
                titleSort++;
                return views.loadSongsSection(paths, songs, true, ...info);
            });

            sortByArtist.addEventListener("click", () => {
                let info = [];
                if (artistSort == 0)
                    arrow2.classList.add("arrow-down");
                else if (artistSort == 1) {
                    arrow2.classList.remove("arrow-down");
                    arrow2.classList.add("arrow-up");
                } else {
                    arrow2.classList.remove("arrow-up");
                    artistSort = -1;
                }
                artistSort++;
                if (playback.isPlaying()) {
                    sArr[playback.getCurrentSong()].querySelector(".song").style.color = "#333333";
                    sArr[playback.getCurrentSong()].querySelector(".play").textContent = "play_arrow";
                    info = [true, songs[playback.getCurrentSong()].filename];
                } else
                    info = [false];
                return views.loadSongsSection(paths, songs, true, ...info);
            });

            sortByAlbum.addEventListener("click", () => {
                let info = [];
                if (albumSort == 0)
                    arrow3.classList.add("arrow-down");
                else if (albumSort == 1) {
                    arrow3.classList.remove("arrow-down");
                    arrow3.classList.add("arrow-up");
                } else {
                    arrow3.classList.remove("arrow-up");
                    albumSort = -1;
                }
                albumSort++;
                if (playback.isPlaying()) {
                    sArr[playback.getCurrentSong()].querySelector(".song").style.color = "#333333";
                    sArr[playback.getCurrentSong()].querySelector(".play").textContent = "play_arrow";
                    info = [true, songs[playback.getCurrentSong()].filename];
                } else
                    info = [false];
                return views.loadSongsSection(paths, songs, true, ...info);
            });

            controlButtons[0].addEventListener("click", () => {
                if (!playback.isShuffleMode()) {
                    controlButtons[0].querySelector("i").style.color = "rgba(255, 255, 255, 1)";
                    playback.setShuffleMode(true);
                } else {
                    controlButtons[0].querySelector("i").style.color = "rgba(255, 255, 255, 0.6)";
                    playback.setShuffleMode(false);
                }
            });

            controlButtons[1].addEventListener("click", () => {
                if (playback.getCurrentSong() != -1) {
                    if (playback.getCurrentTime() < 3) {
                        playback.pause();
                        sArr[playback.getCurrentSong()].querySelector(".song").style.color = "#333333";
                        sArr[playback.getCurrentSong()].querySelector(".play").textContent = "play_arrow";
                        playSong(playback.getCurrentSong() - 1);
                    } else
                        playback.setCurrentTime(0);
                }
            });

            controlButtons[2].addEventListener("click", () => {
                if (playback.getCurrentSong() != -1) {
                    playback.resume();
                    controlButtons[2].style.display = "none";
                    controlButtons[3].style.display = "flex";
                }
            });

            controlButtons[3].addEventListener("click", () => {
                playback.pause();
                controlButtons[3].style.display = "none";
                controlButtons[2].style.display = "flex";
            });

            controlButtons[4].addEventListener("click", () => {
                if (playback.getCurrentSong() != -1) {
                    playback.pause();
                    sArr[playback.getCurrentSong()].querySelector(".song").style.color = "#333333";
                    sArr[playback.getCurrentSong()].querySelector(".play").textContent = "play_arrow";
                    playSong(playback.getCurrentSong() + 1);
                }
            });

            controlButtons[5].addEventListener("click", () => {
                if (!playback.isRepeatMode()) {
                    controlButtons[5].querySelector("i").style.color = "rgba(255, 255, 255, 1)";
                    playback.setRepeatMode(true);
                } else {
                    controlButtons[5].querySelector("i").style.color = "rgba(255, 255, 255, 0.6)";
                    playback.setRepeatMode(false);
                }
            });

            controlButtons[6].addEventListener("click", () => {
                if (!playback.isMuted()) {
                    controlButtons[6].querySelector(".volume-button").textContent = "volume_mute";
                    playback.setVolume(0);
                    playback.setMuted(true);
                } else {
                    if (playback.getVolume() <= 33)
                        controlButtons[6].querySelector(".volume-button").textContent = "volume_down";
                    else if (playback.getVolume() > 33)
                        controlButtons[6].querySelector(".volume-button").textContent = "volume_up";
                    playback.setVolume(playback.getVolume() / 100);
                    playback.setMuted(false);
                }
            });

            playback.getSong().addEventListener("ended", () => {
                clearInterval();
                if (!playback.isRepeatMode()) {
                    sArr[playback.getCurrentSong()].querySelector(".song").style.color = "#333333";
                    sArr[playback.getCurrentSong()].querySelector(".play").textContent = "play_arrow";
                    playSong(playback.getNextSong());
                } else
                    playSong(playback.getCurrentSong());
            });
        }

        for (let i = 0; i < songs.length; i++) {
            let title = sArr[i].querySelector(".song-title"),
                artist = sArr[i].querySelector(".song-artist"),
                album = sArr[i].querySelector(".song-album"),
                duration = sArr[i].querySelector(".song-duration");
            title.textContent = songs[i].title;
            artist.textContent = songs[i].artist;
            album.textContent = songs[i].album;
            let minutes = Math.floor(songs[i].duration / 60);
            let seconds = Math.floor(songs[i].duration % 60);
            if (seconds < 10)
                seconds = `0${seconds}`;
            duration.textContent = `${minutes}:${seconds}`;
        }

        setTimeout(() => {
            loading.style.display = "none";
            songsContainer.style.display = "flex";
            songsContainer.style.flexDirection = "column";
            sortSongs.style.visibility = "visible";
        }, 500);
    },

    loadAlbumsSection: (paths, songs) => {
        let albumsContainer = document.querySelector(".albums-container"),
            loading = document.querySelector(".loading");

        loading.style.display = "table";

        let albums = [];
        for (let i = 0; i < songs.length; i++) {
            let album = [];
            album.push(songs[i]);
            for (let j = 0; j < songs.length; j++) {
                if (i != j && (songs[i].album == songs[j].album))
                    album.push(songs[j]);
            }
            albums.push(album);
        }

        for (let i = 0; i < albums.length; i++) {
            let album = document.createElement("div"),
                imgWrap = document.createElement("div"),
                fadeImg = document.createElement("div"),
                img = document.createElement("img"),
                span = document.createElement("span"),
                playBtn = document.createElement("button"),
                play = document.createElement("i");

            album.classList.add("album");
            imgWrap.classList.add("img-wrap");
            playBtn.classList.add("play-album");
            play.classList.add("material-icons", "play-album-icon");
            fadeImg.classList.add("album-cover-fade");
            img.classList.add("album-cover");
            span.classList.add("album-title");

            play.textContent = "play_arrow";
            span.textContent = albums[i][0].album;

            playBtn.appendChild(play);
            imgWrap.appendChild(playBtn);
            imgWrap.appendChild(fadeImg);
            imgWrap.appendChild(img);

            album.appendChild(imgWrap);
            album.appendChild(span);

            albumsContainer.appendChild(album);

            mm.parseFile(`${paths}/${albums[i][0].filename}`)
                .then(tags => {
                    let albumCover = tags.common.picture[0];
                    let url = URL.createObjectURL(new Blob([albumCover.data], {
                        "type": "image" + "/" + albumCover.format
                    }));
                    img.src = url;
                    img.onload = () => {
                        let dominantColor = colorThief.getColor(img),
                            rgb = "";

                        if ((dominantColor[0] + dominantColor[1] + dominantColor[1]) / 3 <= 155)
                            rgb = `${dominantColor[0] + 60}, ${dominantColor[1] + 60}, ${dominantColor[2] + 60}`;
                        else
                            rgb = `${dominantColor[0] - 60}, ${dominantColor[1] - 60}, ${dominantColor[2] - 60}`;

                        fadeImg.style.background = "none";
                        album.addEventListener("mouseover", () => {
                            playBtn.style.visibility = "visible";
                            fadeImg.style.backgroundColor = `rgba(${rgb}, 0.84)`;
                            img.style.transform = "scale(1.2)";
                            span.style.color = "#000000";
                        });
                        album.addEventListener("mouseout", () => {
                            playBtn.style.visibility = "hidden";
                            fadeImg.style.backgroundColor = "transparent";
                            img.style.transform = "scale(1)";
                            span.style.color = "#656565";
                        });
                    }
                });
        }

        setTimeout(() => {
            albumsContainer.style.display = "flex";
            loading.style.display = "none";
        }, albums.length * 2);
    }
}

module.exports = views;
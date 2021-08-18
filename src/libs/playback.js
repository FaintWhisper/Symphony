const Queue = require("./queue.js");
const model = require("../models/model.js")

class Playback {
    constructor(volume = 33, muted = false) {
        this._song = new Audio();
        this._currentSong = -1;
        this._history = [];
        this._lastUserPlayed = -1;
        this._queue = new Queue([]);
        this._shuffledPlaylist = [];
        this._changingTime = false;
        this._song.volume = volume / 150;
        this._muted = false;
        this._shuffleMode = false;
        this._repeatMode = false;
    }

    getSong() {
        return this._song;
    }

    setSong(song) {
        this._song = song;
    }

    getCurrentSong() {
        return this._currentSong;
    }

    setCurrentSong(currentSong) {
        this._currentSong = currentSong;
    }

    getLastPlayed() {
        return this._lastPlayed;
    }

    setLastPlayed(song) {
        this._lastPlayed = song;
    }

    getLastUserPlayed() {
        return this._lastUserPlayed;
    }

    setLastUserPlayed(lastUserPlayed) {
        this._lastUserPlayed = lastUserPlayed;
    }

    enqueue(song) {
        this._queue.enqueue(song);
        model.setQueue(this._queue._queue);
    }

    dequeue(queue) {
        const song = this._queue.dequeue();
        model.setQueue(this._queue._queue);

        this._history.push(song);

        return song;
    }

    getQueue() {
        return this._queue._queue;
    }

    setQueue(queue) {
        return this._queue._queue = queue;
    }

    insert(song, position) {
        this._queue.insert(song, position);
    }

    resume() {
        this._song.play();
    }

    pause() {
        this._song.pause();
    }

    play(index) {
        this._song.src = `${songs[index].SourceFile}`;
        this._lastPlayed = this._currentSong;
        this._currentSong = index;
        
        if (autoplay)
            this.resume();

        model.setPlaying(index);
    }

    isPlaying() {
        return this._song.src !== "" && !this._song.ended && !this._song.paused;
    }

    getPreviousSong() {
        let song = this._lastUserPlayed - 1;

        if (this._history.length > 0) {
            this._history.pop();
            song = this._history[this._history.length - 1];

            if (this._history.length == 0)
                song = this._lastUserPlayed;
        } else
            this._lastUserPlayed--;

        if (song < 0) {
            this._lastUserPlayed = 0;
            song = 0;
        }

        return song;
    }

    getNextSong() {
        let song = this._lastUserPlayed + 1;

        if (this._queue.size() > 0)
            song = this.dequeue();
        else {
            this._history = [];
            this._lastUserPlayed++;
        }

        if (song > songs.length - 1) {
            this._lastUserPlayed = songs.length - 1;
            song = songs.length - 1;
        }

        return song;
    }

    getPlaylist() {
        return this._playlist;
    }

    setPlaylist(playlist) {
        this._playlist = playlist;
    }

    _shuffle(length) {
        const shuffledSongs = Array(length).fill().map((_, index) => {
            return index;
        });
        let l = shuffledSongs.length;

        while (l) {
            let i = Math.floor(Math.random() * l--);
            [shuffledSongs[l], shuffledSongs[i]] = [shuffledSongs[i], shuffledSongs[l]];
        }

        shuffledSongs.splice(shuffledSongs.findIndex(value => {
            return value == this._currentSong;
        }), 1);

        return shuffledSongs;
    }

    getCurrentTime() {
        return this._song.currentTime;
    }

    setCurrentTime(currentTime) {
        this._song.currentTime = currentTime;
    }

    getFormattedCurrentTime() {
        let minutes = Math.floor(this._song.currentTime / 60);
        let seconds = Math.floor(this._song.currentTime % 60);
        if (seconds < 10)
            seconds = `0${seconds}`;
        return `${minutes}:${seconds}`;
    }

    getDuration() {
        return this._song.duration;
    }

    getFormattedDuration(duration) {
        let minutes = Math.floor(duration / 60);
        let seconds = Math.floor(duration % 60);

        if (seconds < 10)
            seconds = `0${seconds}`;

        return `${minutes}:${seconds}`;
    }

    getVolume() {
        return this._song.volume;
    }

    setVolume(volume) {
        this._song.volume = volume / 150;
    }

    isMuted() {
        return this._muted;
    }

    setMuted(muted) {
        this._muted = muted;
    }

    isShuffleMode() {
        return this._shuffleMode;
    }

    setShuffleMode(shuffleMode) {
        this._shuffleMode = shuffleMode;
        this._playlist = this._shuffle(songs);
    }

    isRepeatMode() {
        return this._repeatMode;
    }

    setRepeatMode(repeatMode) {
        this._repeatMode = repeatMode;
    }

    isChangingTime() {
        return this._changingTime;
    }

    setChangingTime(changingTime) {
        this._changingTime = changingTime;
    }
}

module.exports = Playback;
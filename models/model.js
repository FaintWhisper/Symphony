const fs = require('fs');

module.exports = {
    readPath(path) {
        const supportedAudio = file => {
            fileExt = require('path').extname(file).substring(1).toUpperCase();
            
            return (fileExt == 'MP3' || fileExt == 'OGG' || fileExt == 'WAV' || fileExt == 'FLAC');
        }
        
        return fs.readdirSync(path.location).filter(supportedAudio);
    },
    addPath(path) {
        const paths = this.getPaths();

        paths.push(path);
        this.setPaths(paths);
    },
    getPaths() {
        return JSON.parse(localStorage.getItem('paths')) || [];
    },
    getSongs() {
        return JSON.parse(localStorage.getItem('songs')) || [];
    },
    getAlbums() {
        return JSON.parse(localStorage.getItem('albums')) || [];
    },
    getArtists() {
        return JSON.parse(localStorage.getItem('artists')) || [];
    },
    getPlaying() {
        return JSON.parse(localStorage.getItem('playing'));
    },
    getTime() {
        return JSON.parse(localStorage.getItem('time'));
    },
    getQueue() {
        return JSON.parse(localStorage.getItem('queue'));
    },
    getVolume() {
        return JSON.parse(localStorage.getItem('volume')) || 50;
    },
    updatePath(path) {
		const paths = this.getPaths();
		
		paths[paths.findIndex(_path => {
            return path.location == _path.location;
        })] = path;

        localStorage.setItem('paths', JSON.stringify(paths));
    },
    setSong(song) {
		const songs = this.getSongs();
		
		songs.push(song);
        localStorage.setItem('songs', JSON.stringify(songs));
    },
    setAlbum(album) {
		const albums = this.getAlbums();
		
		albums.push(album);
        localStorage.setItem('albums', JSON.stringify(albums));
    },
    setArtist(artist) {
		const artists = this.getArtists();
		
		artists.push(artist);
        localStorage.setItem('artists', JSON.stringify(artists));
    },
    setPaths(paths) {
        localStorage.setItem('paths', JSON.stringify(paths));
    },
    setSongs(songs) {
        localStorage.setItem('songs', JSON.stringify(songs));
    },
    setAlbums(albums) {
        localStorage.setItem('albums', JSON.stringify(albums));
    },
    setArtists(artists) {
        localStorage.setItem('artists', JSON.stringify(artists));
    },
    setPlaying(index) {
        localStorage.setItem('playing', JSON.stringify(index));
    },
    setQueue(queue) {
        localStorage.setItem('queue', JSON.stringify(queue));
    },
    setTime(time) {
        localStorage.setItem('time', JSON.stringify(time));
    },
    setVolume(volume) {
        localStorage.setItem('volume', JSON.stringify(volume));
    }
}
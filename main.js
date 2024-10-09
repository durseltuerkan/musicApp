"use strict";
//Globale Variablen
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let playlist;
let isPlaying = false;
let isShuffling = false;
const audioPlayer = document.getElementById("audioPlayer");
const playlistElement = document.getElementById("playlist");
const songTitleElement = document.getElementById("infoTitle");
const songArtistElement = document.getElementById("infoArtist");
const menuBtn = document.getElementById("menuBtn");
const container = document.getElementById("container");
const searchBtn = document.getElementById("searchBtn");
const searchbar = document.getElementById("searchbar");
const prevBtn = document.getElementById("prev");
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");
const shuffleBtn = document.getElementById("shuffle");
const filteredSongsContainer = document.getElementById("filteredSongs");
const albumImg = document.getElementById("coverImg");
// functions
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("./data/songs.json");
        const jsonData = yield response.json();
        return jsonData;
    }
    catch (err) {
        console.log(err);
        return [];
    }
});
const renderPlaylist = () => __awaiter(void 0, void 0, void 0, function* () {
    playlist = yield fetchData();
    if (playlistElement) {
        const playlistHTML = playlist
            .map((song, index) => {
            return `
        <div class="playlistItem" data-audio="./music/music-${song.number}.mp3" data-title="${song.title}" data-artist="${song.artist}" onclick="togglePlay(${index})">
          <div class="number">${song.number}</div>
          <div class="title">${song.title}</div>
          <div class="artist">${song.artist}</div>
          <div class="length">${song.length}</div>
          <i class="fas fa-heart"></i>
        </div>
        `;
        })
            .join("");
        playlistElement.innerHTML = playlistHTML;
        songTitleElement.textContent = playlist[0].title;
        songArtistElement.textContent = playlist[0].artist;
    }
});
const updatePlayBtnIcon = () => {
    isPlaying
        ? playBtn.classList.replace("fa-play", "fa-pause")
        : playBtn.classList.replace("fa-pause", "fa-play");
};
const updateAlbumImg = (index) => {
    albumImg.src = `./images/music-${index + 1}.jpg`;
};
const togglePlay = (index) => {
    searchbar.value = "";
    if (searchbar === null || searchbar === void 0 ? void 0 : searchbar.classList.contains("showSearchbar"))
        toggleSearchbar();
    const prevSrc = audioPlayer.src;
    const { number, title, artist } = playlist[index];
    audioPlayer.src = `./music/music-${number}.mp3`;
    if (isPlaying && prevSrc === audioPlayer.src) {
        audioPlayer.pause();
        isPlaying = false;
    }
    else {
        audioPlayer.play().catch((err) => {
            console.error("Fehler beim Abspielen der Musik:", err);
        });
        isPlaying = true;
    }
    songTitleElement.textContent = title;
    songArtistElement.textContent = artist;
    updatePlayBtnIcon();
    updateAlbumImg(index);
};
const toggleSearchbar = () => {
    if (!(searchbar === null || searchbar === void 0 ? void 0 : searchbar.classList.contains("showSearchbar")) &&
        !(searchbar === null || searchbar === void 0 ? void 0 : searchbar.classList.contains("hideSearchbar"))) {
        searchbar === null || searchbar === void 0 ? void 0 : searchbar.classList.add("showSearchbar");
    }
    else {
        searchbar === null || searchbar === void 0 ? void 0 : searchbar.classList.toggle("showSearchbar");
        searchbar === null || searchbar === void 0 ? void 0 : searchbar.classList.toggle("hideSearchbar");
    }
};
const resetFilteredSongsContainer = () => {
    filteredSongsContainer.innerHTML = "";
    filteredSongsContainer.style.display = "none";
};
const searchSong = () => {
    resetFilteredSongsContainer();
    const searchStr = searchbar.value.toLowerCase();
    if (searchStr.length) {
        const filteredSongs = playlist.filter((song) => song.title.toLowerCase().includes(searchStr) ||
            song.artist.toLowerCase().includes(searchStr));
        filteredSongsContainer &&
            filteredSongs.forEach((song) => (filteredSongsContainer.innerHTML += `<p class="filteredSong" id="filteredSong-${song.number}" onclick="togglePlay(${song.number - 1})">${song.title} by ${song.artist}</p>`));
        if (filteredSongs.length)
            filteredSongsContainer.style.display = "block";
    }
};
const handleKeydown = (e) => {
    if (e.key === "Enter" && searchbar.value) {
        searchSong();
    }
    else if (e.key === "Enter" && !searchbar.value) {
        alert("Please enter title/ artist to search!");
    }
};
const playPreviousSong = () => __awaiter(void 0, void 0, void 0, function* () {
    audioPlayer.pause();
    isPlaying = false;
    playlist = yield fetchData();
    let index = Number(audioPlayer.src.split("").slice(-5, -4).join("")) - 2;
    index < 0 ? (index += playlist.length) : null;
    togglePlay(index);
    console.log(isPlaying);
});
const playNextSong = () => __awaiter(void 0, void 0, void 0, function* () {
    audioPlayer.pause();
    isPlaying = false;
    playlist = yield fetchData();
    let index = Number(audioPlayer.src.split("").slice(-5, -4).join(""));
    index >= playlist.length ? (index -= playlist.length) : null;
    togglePlay(index);
});
const play = () => {
    if (!audioPlayer.src) {
        togglePlay(0);
    }
    else {
        let index = Number(audioPlayer.src.split("").slice(-5, -4).join("")) - 1;
        togglePlay(index);
    }
};
const shuffle = (e) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isShuffling) {
        e.target.style.color = "slateblue";
        const randomIndex = Math.floor(Math.random() * playlist.length);
        audioPlayer.src = `./music/music-${randomIndex + 1}.mp3`;
        audioPlayer.play();
        audioPlayer.autoplay = true;
        isPlaying = true;
        isShuffling = true;
        updatePlayBtnIcon();
        songTitleElement.textContent = playlist[randomIndex].title;
        songArtistElement.textContent = playlist[randomIndex].artist;
    }
    else {
        e.target.style.color = "white";
        audioPlayer.pause();
        audioPlayer.autoplay = false;
        isPlaying = false;
        isShuffling = false;
        updatePlayBtnIcon();
    }
});
const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};
const setCurrentTime = () => {
    const newTime = (parseFloat(progressBar.value) / 100) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
};
const updateTime = () => {
    if (!isNaN(audioPlayer.duration) && !isNaN(audioPlayer.currentTime)) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress.toFixed(1).toString();
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    }
};
// call the funktions
document.addEventListener("DOMContentLoaded", () => renderPlaylist());
document.addEventListener("click", resetFilteredSongsContainer);
menuBtn === null || menuBtn === void 0 ? void 0 : menuBtn.addEventListener("click", () => container === null || container === void 0 ? void 0 : container.classList.toggle("active"));
searchBtn === null || searchBtn === void 0 ? void 0 : searchBtn.addEventListener("click", toggleSearchbar);
searchbar === null || searchbar === void 0 ? void 0 : searchbar.addEventListener("input", searchSong);
searchbar === null || searchbar === void 0 ? void 0 : searchbar.addEventListener("focus", resetFilteredSongsContainer);
playBtn === null || playBtn === void 0 ? void 0 : playBtn.addEventListener("click", play);
prevBtn === null || prevBtn === void 0 ? void 0 : prevBtn.addEventListener("click", playPreviousSong);
nextBtn === null || nextBtn === void 0 ? void 0 : nextBtn.addEventListener("click", playNextSong);
shuffleBtn === null || shuffleBtn === void 0 ? void 0 : shuffleBtn.addEventListener("click", shuffle);
audioPlayer === null || audioPlayer === void 0 ? void 0 : audioPlayer.addEventListener("timeupdate", updateTime);
progressBar === null || progressBar === void 0 ? void 0 : progressBar.addEventListener("input", setCurrentTime);

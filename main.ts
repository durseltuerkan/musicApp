// body container
const container = document.getElementById("container") as HTMLElement;

// header btn and container
const menuBtn = document.getElementById("menu") as HTMLElement;
const searchbar = document.getElementById("searchbar") as HTMLInputElement;
const searchBtn = document.getElementById("search") as HTMLElement;
const filteredSongsContainer = document.getElementById(
  "filteredSongs"
) as HTMLElement;

// main - current song info
const coverImg = document.getElementById("coverImg") as HTMLImageElement;
const currentTitle = document.getElementById("currentTitle") as HTMLElement;
const currentArtist = document.getElementById("currentArtist") as HTMLElement;

// main - control btn
const prevBtn = document.getElementById("prev") as HTMLElement;
const playBtn = document.getElementById("play") as HTMLElement;
const nextBtn = document.getElementById("next") as HTMLElement;

// main - audio player
const audioPlayer = document.getElementById("audioPlayer") as HTMLAudioElement;
const progressBar = document.getElementById("progress-bar") as HTMLInputElement;
const currentTimeDisplay = document.getElementById(
  "currentTime"
) as HTMLElement;
const durationDisplay = document.getElementById("duration") as HTMLElement;

// container.active: playlist
const playlistContainer = document.getElementById("playlist") as HTMLElement;
const playlistItemLikeBtns = document.getElementsByClassName(
  ".playlistItemLikeBtn"
);

// footer btn
const likeBtn = document.getElementById("like") as HTMLElement;
const shuffleBtn = document.getElementById("shuffle") as HTMLElement;
const repeatOneBtn = document.getElementById("repeatOne") as HTMLElement;
const settingsBtn = document.getElementById("settings") as HTMLElement;

// sleep timer
const sleepTimer = document.getElementById("sleepTimer") as HTMLElement;
const timerInput = document.getElementById("timerInput") as HTMLInputElement;
const timerBtn = document.getElementById("timerBtn") as HTMLElement;
const countDown = document.getElementById("countDown") as HTMLElement;
const minutes = document.getElementById("minutes") as HTMLSpanElement;
const seconds = document.getElementById("seconds") as HTMLSpanElement;
const letterS = document.getElementById("letterS") as HTMLSpanElement;

// global variables
interface Song {
  number: number;
  title: string;
  artist: string;
  length: string;
  isFavorite: boolean;
}

let playlist: Song[] = JSON.parse(localStorage.getItem("data") as string) || [];
let playlistCurrentSong: HTMLParagraphElement | null;
let playlistCurrentSongLikeBtn: HTMLElement | null;
let isShuffling: boolean = false;
let isRepeating: boolean = false;
let currentSongIndex: number =
  Number(audioPlayer.src.split("").slice(-5, -4).join("")) || 0;
let timer: number = 0;

// FUNCTIONS

const fetchData = async (): Promise<Song[]> => {
  try {
    const response = await fetch("./data/songs.json");
    const jsonData: Song[] = await response.json();
    localStorage.setItem("data", JSON.stringify(jsonData));
    return jsonData;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// functions - for searchbar
const toggleSearchbar = () => {
  if (
    !searchbar.classList.contains("showSearchbar") &&
    !searchbar.classList.contains("hideSearchbar")
  )
    searchbar.classList.add("showSearchbar");
  else {
    searchbar.value = "";
    searchbar.classList.toggle("hideSearchbar");
  }
};

const searchSong = () => {
  resetFilteredSongsContainer();
  const searchStr = searchbar.value.toLowerCase();
  if (searchStr.length) {
    const filteredSongs = playlist.filter(
      (song) =>
        song.title.toLowerCase().includes(searchStr) ||
        song.artist.toLowerCase().includes(searchStr)
    );
    filteredSongsContainer &&
      filteredSongs.forEach(
        (song) =>
          (filteredSongsContainer.innerHTML += `<p class="filteredSong" id="filteredSong-${song.number}" onclick="playPlaylist(${song.number})">${song.title} by ${song.artist}</p>`)
      );
    if (filteredSongs.length) filteredSongsContainer.style.display = "block";
  }
};

// functions - render/update
const renderPlaylist = async (): Promise<void> => {
  playlist =
    JSON.parse(localStorage.getItem("data") as string) || (await fetchData());
  playlistContainer.innerHTML = playlist
    .map((song) => {
      const src = `/music/music-${song.number}.mp3`;
      return `
        <div id="${
          song.number
        }" class="playlistItem" data-audio="./music/music-${
        song.number
      }.mp3" data-title="${song.title}" data-artist="${
        song.artist
      }" onclick="playPlaylist(${song.number})">

          <p class="number" id="playlistItem-${song.number}">${
        currentSongIndex === song.number && !audioPlayer.paused
          ? "<i class='fa fa-pause'></i>"
          : song.number + 1
      }</p>

          <p class="title">${song.title}</p>

          <p class="artist">${song.artist}</p>

          <p class="length">${song.length}</p>

          <svg
          class="playlistItemLikeBtn"
          id="playlistItemLikeBtn-${song.number}"
          onclick="toggleFavorite(${song.number})"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          >
            <path
              fill=${song.isFavorite ? "red" : "white"}
              d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"
            />
          </svg>

        </div>
        `;
    })
    .join("");
};

const renderCurrentSongInfo = async () => {
  playlist =
    JSON.parse(localStorage.getItem("data") as string) || (await fetchData());
  // update album image
  coverImg.src = `./images/music-${currentSongIndex}.jpg`;
  // update song title & artist
  currentTitle.textContent = playlist.filter(
    (song) => song.number === currentSongIndex
  )[0].title;
  currentArtist.textContent = playlist.filter(
    (song) => song.number === currentSongIndex
  )[0].artist;
  // update play btn
  !audioPlayer.paused
    ? (playBtn.innerHTML = `<path d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>`)
    : (playBtn.innerHTML = `<path
    id="playBtnPath"
    d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"
  />`);
  // update like btn
  playlist.filter((song) => song.number === currentSongIndex)[0].isFavorite
    ? (likeBtn.style.fill = "red")
    : (likeBtn.style.fill = "white");
};

const toggleFavorite = async (num: number) => {
  event?.stopPropagation();
  playlist =
    JSON.parse(localStorage.getItem("data") as string) || (await fetchData());
  playlist = playlist.map((song) =>
    song.number === num ? { ...song, isFavorite: !song.isFavorite } : song
  );
  localStorage.setItem("data", JSON.stringify(playlist));
  renderPlaylist();
  renderCurrentSongInfo();
};

const resetFilteredSongsContainer = () => {
  filteredSongsContainer.innerHTML = "";
  filteredSongsContainer.style.display = "none";
};

const updateAudioPlayerSrc = (num: number = currentSongIndex) => {
  audioPlayer.pause();
  audioPlayer.src =
    audioPlayer.src.slice(0, -5) + num + audioPlayer.src.slice(-4);
  currentSongIndex = num;
};

// functions - play/shuffle
const togglePlay = () => {
  setTimeout(
    () =>
      searchbar.classList.contains("showSearchbar") &&
      !searchbar.classList.contains("hideSearchbar")
        ? toggleSearchbar()
        : null,
    1500
  );
  !audioPlayer.paused ? audioPlayer.pause() : audioPlayer.play();
  renderCurrentSongInfo();
  renderPlaylist();
};

const playPreviousSong = async () => {
  audioPlayer.pause();
  let index: number = 0;
  let nextIndex: number = 0;
  playlist.forEach((song) =>
    song.number !== currentSongIndex
      ? index++
      : index - 1 < 0
      ? (nextIndex = index - 1 + playlist.length)
      : (nextIndex = index - 1)
  );
  currentSongIndex = playlist[nextIndex].number;
  updateAudioPlayerSrc();
  togglePlay();
  renderPlaylist();
};

const playNextSong = async () => {
  audioPlayer.pause();
  let index: number = 0;
  let nextIndex: number = 0;
  playlist.forEach((song) =>
    song.number !== currentSongIndex
      ? index++
      : index + 1 >= playlist.length
      ? (nextIndex = index + 1 - playlist.length)
      : (nextIndex = index + 1)
  );
  currentSongIndex = playlist[nextIndex].number;
  updateAudioPlayerSrc();
  togglePlay();
};

const playPlaylist = (num: number) => {
  if (currentSongIndex !== num) updateAudioPlayerSrc(num);
  togglePlay();
  renderPlaylist();
};

const toggleShuffle = async () => {
  isShuffling = !isShuffling;

  if (isShuffling) {
    playlist = playlist.sort((a, b) => 0.5 - Math.random());
    localStorage.setItem("data", JSON.stringify(playlist));
    await renderPlaylist();
    shuffleBtn.style.fill = "slateblue";
    updateAudioPlayerSrc(Number(playlist[0].number));
    togglePlay();
  } else {
    playlist = playlist.sort((a, b) => a.number - b.number);
    localStorage.setItem("data", JSON.stringify(playlist));
    renderPlaylist();
    shuffleBtn.style.fill = "white";
    togglePlay();
  }
};

const toggleRepeat = () => {
  if (!isRepeating) {
    audioPlayer.loop = true;
    repeatOneBtn.style.fill = "slateblue";
    audioPlayer.paused && togglePlay();
  } else {
    audioPlayer.loop = false;
    repeatOneBtn.style.fill = "white";
  }
  isRepeating = !isRepeating;
};

// functions - others
const formatTime = (timeInSeconds: number) => {
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

const handleMenuBtnKlick = () => {
  container?.classList.toggle("active");
  // updateLikeBtn();
};

const startMusicApp = async () => {
  await renderPlaylist();
  renderCurrentSongInfo();
};

const toggleSleepTimer = () => {
  sleepTimer.style.display =
    sleepTimer.style.display === "block" ? "none" : "block";
};

const setSleepTimer = async () => {
  const timeout = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const timerInputValue: number = Number(timerInput.value);
  timer = timerInputValue * 1000 * 60;
  if (timer === 60000) {
    letterS.style.display = "none";
  }
  settingsBtn.style.fill = timer ? "slateblue" : "white";

  while (timer > 0) {
    timer -= 1000;
    const minutesStr = Math.floor(timer / 60000).toString();
    const secondsStr = ((timer / 1000) % 60).toString();
    minutes.textContent =
      minutesStr.length === 1 ? "0" + minutesStr : minutesStr;
    seconds.textContent =
      secondsStr.length === 1 ? "0" + secondsStr : secondsStr;
    await timeout(1000);
  }
  if (timer === 0) {
    audioPlayer.pause();
    renderCurrentSongInfo();
    settingsBtn.style.fill = "white";
    minutes.textContent = "00";
    seconds.textContent = "00";
  }
};

// call the funktions
document.addEventListener("DOMContentLoaded", startMusicApp);
document.addEventListener("click", resetFilteredSongsContainer);
menuBtn.addEventListener("click", handleMenuBtnKlick);
searchBtn.addEventListener("click", toggleSearchbar);
searchbar.addEventListener("input", searchSong);
searchbar.addEventListener("focus", resetFilteredSongsContainer);

playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", playPreviousSong);
nextBtn.addEventListener("click", playNextSong);
audioPlayer.addEventListener("timeupdate", updateTime);
audioPlayer.addEventListener("ended", playNextSong);
progressBar.addEventListener("input", setCurrentTime);

likeBtn.addEventListener("click", () => toggleFavorite(currentSongIndex));
shuffleBtn.addEventListener("click", toggleShuffle);
repeatOneBtn.addEventListener("click", toggleRepeat);
settingsBtn.addEventListener("click", toggleSleepTimer);
timerBtn.addEventListener("click", setSleepTimer);
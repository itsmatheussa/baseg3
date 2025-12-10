var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player; // YouTube Player Instance
let progressInterval;
let isDragging = false;

// Global Player Elements
const playerContainer = document.getElementById('spotify-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerArt = document.getElementById('player-art');

const artistElements = document.querySelectorAll('.artist');
let currentArtistIndex = -1;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'rel': 0,
            'showinfo': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // Initial Volume
    const vol = volumeBar.value;
    event.target.setVolume(vol);

    // Setup UI Listeners
    setupPlayerListeners();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        updatePlayPauseIcon(true);
        startProgressLoop();
    } else if (event.data === YT.PlayerState.PAUSED) {
        updatePlayPauseIcon(false);
        stopProgressLoop();
    } else if (event.data === YT.PlayerState.ENDED) {
        updatePlayPauseIcon(false);
        stopProgressLoop();
        // Auto play next
        playNextTrack();
    }
}

function setupPlayerListeners() {
    // Artist List Clicks
    artistElements.forEach((el, index) => {
        el.addEventListener('click', () => {
            loadTrack(index);
        });
    });

    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlay);

    // Navigation
    prevBtn.addEventListener('click', playPrevTrack);
    nextBtn.addEventListener('click', playNextTrack);

    // Progress Bar
    progressBar.addEventListener('input', () => {
        isDragging = true;
        const seekTo = (progressBar.value / 100) * player.getDuration();
        currentTimeEl.textContent = formatTime(seekTo);
    });

    progressBar.addEventListener('change', () => {
        isDragging = false;
        const seekTo = (progressBar.value / 100) * player.getDuration();
        player.seekTo(seekTo, true);
    });

    // Volume
    volumeBar.addEventListener('input', (e) => {
        if (player && player.setVolume) {
            player.setVolume(e.target.value);
        }
    });
}

function loadTrack(index) {
    if (index < 0 || index >= artistElements.length) return;

    currentArtistIndex = index;
    const artistEl = artistElements[index];
    const videoId = artistEl.getAttribute('data-video-id');
    const title = artistEl.getAttribute('data-title');
    const artistName = artistEl.getAttribute('data-artist');
    const imageSrc = artistEl.getAttribute('data-image');

    // Update active state in UI
    updateActiveArtistUI(index);

    // Update Player UI
    playerTitle.textContent = title;
    playerArtist.textContent = artistName;
    playerArt.src = imageSrc;
    playerContainer.classList.remove('hidden');

    // Load and Play Video
    if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
    }
}

function updateActiveArtistUI(activeIndex) {
    artistElements.forEach((el, index) => {
        const btn = el.querySelector('.play-btn');
        if (index === activeIndex) {
            el.classList.add('active');
            btn.textContent = '⏸';
        } else {
            el.classList.remove('active');
            btn.textContent = '▶';
        }
    });
}

function togglePlay() {
    if (!player) return;
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function playPrevTrack() {
    let newIndex = currentArtistIndex - 1;
    if (newIndex < 0) newIndex = artistElements.length - 1;
    loadTrack(newIndex);
}

function playNextTrack() {
    let newIndex = currentArtistIndex + 1;
    if (newIndex >= artistElements.length) newIndex = 0;
    loadTrack(newIndex);
}

function updatePlayPauseIcon(isPlaying) {
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';

    // Update list icon if valid index
    if (currentArtistIndex !== -1 && artistElements[currentArtistIndex]) {
        const btn = artistElements[currentArtistIndex].querySelector('.play-btn');
        if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
    }
}

function startProgressLoop() {
    stopProgressLoop();
    progressInterval = setInterval(() => {
        if (!player || isDragging) return;
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();

        if (duration > 0) {
            const percent = (currentTime / duration) * 100;
            progressBar.value = percent;
            progressBar.style.background = `linear-gradient(to right, #1DB954 ${percent}%, #4f4f4f ${percent}%)`;

            currentTimeEl.textContent = formatTime(currentTime);
            totalTimeEl.textContent = formatTime(duration);
        }
    }, 500);
}

function stopProgressLoop() {
    clearInterval(progressInterval);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// --- Previous Site Scripts Below (Sticky Header, etc) ---

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');

    // Sticky Header with blur effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for Staggered Fade In
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.story-card, .portfolio-item, .contact-wrapper, .section-header');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        // Add slight delay for grid items
        if (el.classList.contains('portfolio-item')) {
            el.style.transitionDelay = `${index % 3 * 100}ms`;
        }
        observer.observe(el);
    });

    // Parallax Effect for Background Blobs (if any exist)
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translate(${mouseX * -20}px, ${mouseY * -20}px)`;
        }
    });

    // Play Buttons initialization for hover effects ONLY (logic handled by YT API)
    // We basically just want to prevent default if needed, but the main logic is attached in setupPlayerListeners
    // The "click" listener is separate.
});

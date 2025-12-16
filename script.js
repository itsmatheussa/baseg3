
// --- Previous Site Scripts (Sticky Header, etc) ---

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const desktopNav = document.querySelector('.desktop-nav'); // reusing this class for the menu list

    // Mobile Menu Toggle
    if (mobileMenuToggle && desktopNav) {
        mobileMenuToggle.addEventListener('click', () => {
            desktopNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('open');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.desktop-nav a').forEach(link => {
            link.addEventListener('click', () => {
                desktopNav.classList.remove('active');
                mobileMenuToggle.classList.remove('open');
            });
        });
    }

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
            el.style.transitionDelay = `${index % 3 * 100} ms`;
        }

        observer.observe(el);
    });

    // Parallax Effect for Background Blobs (if any exist)
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translate(${mouseX * - 20}px, ${mouseY * - 20}px)`;
        }
    });

    // --- Global Spotify-like Player Logic (Local Audio) ---

    // Elements
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
    const closePlayerBtn = document.getElementById('close-player-btn');

    // Audio Object
    const audio = new Audio();

    // State
    const artistElements = document.querySelectorAll('.artist');
    let currentArtistIndex = -1;
    let isDragging = false;

    // 1. Load Track on Artist Click
    artistElements.forEach((el, index) => {
        el.addEventListener('click', () => {
            loadTrack(index);
        });
    });

    function loadTrack(index) {
        if (index < 0 || index >= artistElements.length) return;

        currentArtistIndex = index;
        const artistEl = artistElements[index];
        const audioSrc = artistEl.getAttribute('data-audio');
        const title = artistEl.getAttribute('data-title');
        const artistName = artistEl.getAttribute('data-artist');
        const imageSrc = artistEl.getAttribute('data-image');

        // Update active state in list
        updateActiveArtistUI(index);

        // Update Player UI
        playerTitle.textContent = title;
        playerArtist.textContent = artistName;
        playerArt.src = imageSrc;
        playerContainer.classList.remove('hidden');

        // Setup Audio
        audio.src = audioSrc;
        audio.load();
        audio.play().then(() => {
            updatePlayPauseIcon(true);
        }).catch(err => console.log('Audio play error:', err));
    }

    function updateActiveArtistUI(activeIndex) {
        artistElements.forEach((el, index) => {
            const btn = el.querySelector('.play-btn');
            if (index === activeIndex) {
                el.classList.add('active');
                btn.textContent = '⏸'; // Keep text backup but icon hidden if SVG used
            } else {
                el.classList.remove('active');
                btn.textContent = '▶';
            }
        });
    }

    // 2. Play/Pause Toggle
    playPauseBtn.addEventListener('click', togglePlay);

    function togglePlay() {
        if (audio.paused) {
            audio.play();
            updatePlayPauseIcon(true);
        } else {
            audio.pause();
            updatePlayPauseIcon(false);
        }
    }

    function updatePlayPauseIcon(isPlaying) {
        // Switch between SVG icons
        const iconPath = playPauseBtn.querySelector('path');
        if (iconPath) {
            // If we are using SVGs (which we will add in HTML updates)
            // Pause Icon Path
            const pauseD = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";
            // Play Icon Path
            const playD = "M8 5v14l11-7z";

            iconPath.setAttribute('d', isPlaying ? pauseD : playD);
        } else {
            // Fallback text
            playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
        }

        // Update list icon if active
        if (currentArtistIndex !== -1 && artistElements[currentArtistIndex]) {
            const btn = artistElements[currentArtistIndex].querySelector('.play-btn');
            btn.textContent = isPlaying ? '⏸' : '▶';
        }
    }

    // 3. Navigation
    prevBtn.addEventListener('click', () => {
        let newIndex = currentArtistIndex - 1;
        if (newIndex < 0) newIndex = artistElements.length - 1;
        loadTrack(newIndex);
    });

    nextBtn.addEventListener('click', () => {
        playNextTrack();
    });

    function playNextTrack() {
        let newIndex = currentArtistIndex + 1;
        if (newIndex >= artistElements.length) newIndex = 0;
        loadTrack(newIndex);
    }

    // 4. Progress Bar & Time
    audio.addEventListener('timeupdate', () => {
        if (isDragging) return;

        const { currentTime, duration } = audio;

        if (duration) {
            const percent = (currentTime / duration) * 100;
            progressBar.value = percent;
            // Update gradient background
            progressBar.style.background = `linear - gradient(to right, #1DB954 ${percent} %, #4f4f4f ${percent} %)`;

            currentTimeEl.textContent = formatTime(currentTime);
            totalTimeEl.textContent = formatTime(duration);
        }
    });

    audio.addEventListener('ended', () => {
        playNextTrack();
    });

    // Seek functionality
    progressBar.addEventListener('input', () => {
        isDragging = true;
        const seekTo = (progressBar.value / 100) * audio.duration;
        currentTimeEl.textContent = formatTime(seekTo);
    });

    progressBar.addEventListener('change', () => {
        isDragging = false;
        const seekTo = (progressBar.value / 100) * audio.duration;
        audio.currentTime = seekTo;
    });

    // 5. Volume Control
    volumeBar.addEventListener('input', (e) => {
        const val = e.target.value;
        audio.volume = val / 100;
    });

    // 6. Close Player
    if (closePlayerBtn) {
        closePlayerBtn.addEventListener('click', () => {
            audio.pause();
            audio.currentTime = 0;
            updatePlayPauseIcon(false);
            playerContainer.classList.add('hidden');
            // Remove active status from list
            if (currentArtistIndex !== -1) {
                artistElements[currentArtistIndex].classList.remove('active');
                artistElements[currentArtistIndex].querySelector('.play-btn').textContent = '▶';
            }
            currentArtistIndex = -1;
        });
    }

    // Helper: Format Time
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs} `;
    }
});

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

        const blobs = document.querySelectorAll('.about-section::before, .portfolio-section::before');
        // Note: Pseudo-elements can't be manipulated directly via JS easily without CSS variables.
        // Instead, we'll apply a subtle parallax to the hero content

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translate(${mouseX * -20}px, ${mouseY * -20}px)`;
        }
    });
    // --- Spotify-Like Player Logic ---
    const player = document.getElementById('spotify-player');
    const audio = document.getElementById('global-audio');
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

    // Initialize Artists
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

        // Update active state in UI
        artistElements.forEach(el => {
            el.classList.remove('active');
            el.querySelector('.play-btn').textContent = '▶';
        });
        artistEl.classList.add('active');
        artistEl.querySelector('.play-btn').textContent = '⏸';

        // Update Player UI
        playerTitle.textContent = title;
        playerArtist.textContent = artistName;
        playerArt.src = imageSrc;
        player.classList.remove('hidden');

        // Play Audio
        audio.src = audioSrc;
        audio.play().then(() => {
            updatePlayPauseIcon(true);
        }).catch(err => console.log('Audio play error:', err));
    }

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
        playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
        // Also update the list icon if we know the current track
        if (currentArtistIndex !== -1) {
            const btn = artistElements[currentArtistIndex].querySelector('.play-btn');
            if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
        }
    }

    playPauseBtn.addEventListener('click', togglePlay);

    // Navigation
    prevBtn.addEventListener('click', () => {
        let newIndex = currentArtistIndex - 1;
        if (newIndex < 0) newIndex = artistElements.length - 1; // Looping
        loadTrack(newIndex);
    });

    nextBtn.addEventListener('click', () => {
        let newIndex = currentArtistIndex + 1;
        if (newIndex >= artistElements.length) newIndex = 0; // Looping
        loadTrack(newIndex);
    });

    // Progress Bar
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = percent || 0;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);

        // Update background gradient for progress
        progressBar.style.background = `linear-gradient(to right, #1DB954 ${percent}%, #4f4f4f ${percent}%)`;
    });

    progressBar.addEventListener('input', () => {
        const time = (progressBar.value / 100) * audio.duration;
        audio.currentTime = time;
    });

    // Volume
    volumeBar.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });

    // Auto Play Next
    audio.addEventListener('ended', () => {
        nextBtn.click();
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
});

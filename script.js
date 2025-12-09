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
});

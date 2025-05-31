document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Interaction Code START ---
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let clickSoundBuffer = null;
    let hoverSoundBuffer = null;

    async function loadSound(url) {
        if (!audioContext) return null;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${url}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading sound: ${url}`, error);
            return null;
        }
    }

    async function initSounds() {
        clickSoundBuffer = await loadSound('/ui_click.mp3'); 
        hoverSoundBuffer = await loadSound('/ui_hover.mp3'); 
    }

    function playSound(buffer) {
        if (!buffer || !audioContext) return;
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(err => console.error("Error resuming audio context:", err));
        }
        if (audioContext.state === 'running') {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        } else {
            console.warn("AudioContext not running, cannot play sound.");
        }
    }

    initSounds().then(() => {
        if (!clickSoundBuffer && !hoverSoundBuffer) {
            console.warn("Sounds could not be loaded. Interactive sounds will be disabled.");
        }
        const interactiveElements = document.querySelectorAll(
            'button, a.cta-button, .nav-links a, .nav-logo a, .rules-category-header, .tab-button, a.form-link, footer .social-links a'
        );

        interactiveElements.forEach(element => {
            element.addEventListener('click', () => {
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                         if (clickSoundBuffer) playSound(clickSoundBuffer);
                    }).catch(err => console.error("Error resuming audio context on click:", err));
                } else if (clickSoundBuffer) {
                    playSound(clickSoundBuffer);
                }
            });

            element.addEventListener('mouseenter', () => {
                if (hoverSoundBuffer && audioContext && audioContext.state === 'running') {
                    playSound(hoverSoundBuffer);
                }
            });
        });
    }).catch(error => {
        console.error("Error initializing sounds:", error);
    });
    // --- Audio Interaction Code END ---

    // --- Mobile menu toggle (Dropdown behavior) ---
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuButton && navLinks) {
        const icon = mobileMenuButton.querySelector('i');

        mobileMenuButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            navLinks.classList.toggle('active'); 

            if (navLinks.classList.contains('active')) {
                if (icon) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            } else {
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });
        
        document.addEventListener('click', (event) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(event.target) && 
                !mobileMenuButton.contains(event.target)) {
                
                navLinks.classList.remove('active');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Add resize listener to reset mobile menu state if window becomes desktop-sized
        window.addEventListener('resize', () => {
            // 769px is the breakpoint used in style.css for desktop view
            if (window.innerWidth >= 769) { 
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active'); // Close mobile menu
                    if (icon) {
                        icon.classList.remove('fa-times'); // Reset icon
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });

    }
    // --- End of Mobile menu toggle ---


    // Active navigation link styling
    const currentLocation = window.location.pathname.split('/').pop() || 'index.html';
    const allNavLinks = document.querySelectorAll('.nav-links a');
    allNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentLocation) {
            link.classList.add('active');
        }
        if (currentLocation === '' && linkPage === 'index.html') {
            link.classList.add('active');
        }
    });

    // Rules page: Expandable categories
    const ruleCategoryHeaders = document.querySelectorAll('.rules-category-header');
    ruleCategoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');
            
            if (content.style.display === 'block') {
                content.style.display = 'none';
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.display = 'block';
                if (icon) icon.style.transform = 'rotate(90deg)';
            }
        });
    });

    // Basic form submission handler (prevents default and logs for now)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Form submitted:', form.id);
            if (form.id === 'supportForm') {
                const confirmationMessage = document.getElementById('supportConfirmation');
                if (confirmationMessage) {
                    confirmationMessage.style.display = 'block';
                    confirmationMessage.textContent = 'Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.';
                    form.reset();
                    setTimeout(() => {
                        confirmationMessage.style.display = 'none';
                    }, 5000);
                } else {
                    alert('Mensagem enviada (simulação).');
                }
            } 
        });
    });

});
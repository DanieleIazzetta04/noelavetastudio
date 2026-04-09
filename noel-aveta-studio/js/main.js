// Disable browser scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Forza scroll in cima sia all'avvio sia dopo il caricamento completo
window.scrollTo(0, 0);
window.onload = function() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

// Prima di lasciare la pagina, reset posizione così al ritorno parte dall'alto
window.addEventListener('beforeunload', function() {
    window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================================
       1. Custom Cursor
       ========================================================================= */
    const cursor = document.getElementById('custom-cursor');
    const hoverElements = document.querySelectorAll('a, button, input, select, textarea, .service-row, .gallery-item');
    
    // Controlla se il dispositivo è touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursor) {
        // Segue il mouse
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });

        // Hover effect sugli elementi interattivi
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    /* =========================================================================
       2. Navbar & Mobile Menu
       ========================================================================= */
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navWrapper = document.getElementById('nav-wrapper');
    const navLinksList = document.querySelectorAll('.nav-links a');

    // Cambia navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Toggle menu mobile
    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        navWrapper.classList.toggle('active');
        navbar.classList.toggle('force-dark');
    });

    // Chiudi menu al click sui link
    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn.classList.remove('active');
            navWrapper.classList.remove('active');
            navbar.classList.remove('force-dark');
        });
    });

    /* =========================================================================
       3. Parallax Nativo (Cinematic Scroll)
       ========================================================================= */
    const heroBg = document.getElementById('hero-bg');
    const heroContent = document.getElementById('hero-content');
    const aboutImg = document.getElementById('about-img');

    // Variabile per ottimizzare le performance con RequestAnimationFrame
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                
                // Parallax Hero 
                if (scrollY < window.innerHeight) {
                    if (heroBg) {
                        // Lo sfondo scala leggermente e scende piano
                        heroBg.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0005})`;
                    }
                    if (heroContent) {
                        // Il testo scende più rapidamente e sfuma
                        heroContent.style.transform = `translateY(${scrollY * 0.5}px)`;
                        heroContent.style.opacity = 1 - (scrollY / (window.innerHeight * 0.7));
                    }
                }
                
                // Parallax Immagine "Chi Sono"
                if (aboutImg) {
                    const rect = aboutImg.parentElement.getBoundingClientRect();
                    // Calcola solo se nel viewport
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const distance = window.innerHeight - rect.top;
                        // Sposta leggermente verso il basso mentre si scrolla
                        aboutImg.style.transform = `translateY(${distance * 0.15 - 50}px)`;
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    /* =========================================================================
       4. Fade-in con Intersection Observer API
       ========================================================================= */
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Anima solo la prima volta
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => fadeObserver.observe(el));

    /* =========================================================================
       5. CMS Data Fetching & Populating (Dynamic Content)
       ========================================================================= */
    const fetchCMSData = async () => {
        try {
            // Decap CMS salva i dati qui secondo config.yml
            const response = await fetch('data/content.json');
            if (!response.ok) return; // Fallback al contenuto dell'HTML
            const data = await response.json();
            
            // Helper function per risoluzione "seo.title" etc.
            const resolvePath = (obj, path) => path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);

            // 1. Update Testi normali
            document.querySelectorAll('[data-cms]').forEach(el => {
                const configPath = el.getAttribute('data-cms');
                const contentType = el.getAttribute('data-type');
                const value = resolvePath(data, configPath);
                
                if (value) {
                    if (contentType === 'text-multiline') {
                        el.innerHTML = value.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');
                    } else if (el.tagName === 'A' && el.classList.contains('contact-link')) {
                        el.textContent = value;
                        if(configPath === 'contact.email') el.href = `mailto:${value}`;
                        if(configPath === 'contact.phone') el.href = `tel:${value.replace(/\s/g, '')}`;
                        if(configPath === 'contact.instagram') el.href = `https://instagram.com/${value.replace('@', '')}`;
                    } else {
                        el.textContent = value;
                    }
                }
            });

            document.querySelectorAll('[data-cms-mailto]').forEach(el => {
                 const value = resolvePath(data, el.getAttribute('data-cms-mailto'));
                 if(value) el.href = `mailto:${value}`;
            });

            // 2. Update Immagine Profilo "Chi Sono"
            if (data.about && data.about.image && data.about.image.trim() !== '') {
                const aboutImgEl = document.getElementById('about-img');
                if (aboutImgEl) {
                    // Gestione path assoluti/relativi
                    const imgSrc = data.about.image.replace(/^\/?images/, 'images');
                    aboutImgEl.style.backgroundImage = `url('${imgSrc}')`;
                }
            }

            // 3. Update Servizi
            if (data.services && data.services.length > 0) {
                const servicesContainer = document.getElementById('services-container');
                servicesContainer.innerHTML = ''; // Svuota placeholder
                data.services.forEach((service, index) => {
                    const delay = index * 100;
                    const numStr = (index + 1).toString().padStart(2, '0');
                    // We escape single quotes in title to prevent JS errors in onclick
                    const safeTitle = service.title.replace(/'/g, "\\'");
                    
                    servicesContainer.innerHTML += `
                        <div class="service-row fade-in" style="transition-delay: ${delay}ms; cursor: pointer;" onclick="document.getElementById('service').value = '${safeTitle}'; window.location.href='#contact';">
                            <div class="service-number">${numStr}</div>
                            <div class="service-content">
                                <h3 class="service-title">${service.title}</h3>
                                <p class="service-desc">${service.description}</p>
                            </div>
                            <div class="service-price">${service.price}</div>
                        </div>
                    `;
                });
                servicesContainer.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
            }

            // 4. Update Galleria Masonry
            if (data.gallery && data.gallery.length > 0) {
                const galleryContainer = document.getElementById('gallery-container');
                galleryContainer.innerHTML = ''; // Svuota placeholder
                data.gallery.forEach((item, index) => {
                    const delay = index * 100;
                    // Alterna aspect ratio nei fallback grigi (stile masonry)
                    const aspect = index % 2 === 0 ? 'aspect-vertical' : 'aspect-square';
                    const hasImage = item.image && item.image.trim() !== '';
                    
                    const imgSrc = hasImage ? item.image.replace(/^\/?images/, 'images') : '';
                    const imageHTML = hasImage 
                        ? `<img src="${imgSrc}" alt="${item.title}" style="aspect-ratio: ${index%2===0 ? '2/3' : '1/1'}; object-fit: cover; width: 100%;">`
                        : `<div class="img-placeholder bg-gray ${aspect}"></div>`;

                    galleryContainer.innerHTML += `
                        <div class="gallery-item fade-in" style="transition-delay: ${delay}ms; cursor: pointer;">
                            ${imageHTML}
                            <div class="gallery-overlay">
                                <h3 class="gallery-title">${item.title}</h3>
                            </div>
                        </div>
                    `;
                });
                // Ricollega observer e aggiungi logica Lightbox
                galleryContainer.querySelectorAll('.gallery-item').forEach((el, idx) => {
                    const itemData = data.gallery[idx];
                    
                    // Fade-in observer
                    if(el.classList.contains('fade-in')) fadeObserver.observe(el);
                    
                    // Click to open lightbox
                    el.addEventListener('click', () => {
                        const lightbox = document.getElementById('lightbox');
                        const lightboxImg = document.getElementById('lightbox-img');
                        const lightboxCaption = document.getElementById('lightbox-caption');
                        
                        if (lightbox && itemData.image) {
                            lightboxImg.src = itemData.image.replace(/^\/?images/, 'images');
                            lightboxCaption.textContent = itemData.title;
                            lightbox.classList.add('active');
                            document.body.style.overflow = 'hidden'; // blocca lo scroll
                        }
                    });
                });
                
                // Opzionale: update cursor bindings sui nuovi elementi
                if (!isTouchDevice && cursor) {
                    const newInteractive = galleryContainer.querySelectorAll('.gallery-item');
                    newInteractive.forEach(el => {
                        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
                    });
                }
            }

            // 5. Aggiornamento Titoli SEO
            if (data.seo) {
                if(data.seo.title) document.title = data.seo.title;
                if(data.seo.description) {
                    const metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) metaDesc.setAttribute('content', data.seo.description);
                }
            }

        } catch (error) {
            console.warn('CMS data.json fetch fallito. Caricamento contenuti HTML di default.', error);
        }
    };

    fetchCMSData();

    /* =========================================================================
       6. Auto-Update Anno Footer
       ========================================================================= */
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* =========================================================================
       7. Lightbox Close Logic
       ========================================================================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');

    if (lightbox && lightboxClose) {
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // ripristina scroll
        };

        lightboxClose.addEventListener('click', closeLightbox);
        
        // Chiudi cliccando fuori dall'immagine
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Chiudi con Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
    /* =========================================================================
       8. Netlify Form — JS Submit per redirect affidabile a success.html
       ========================================================================= */
    const bookingForm = document.querySelector('form[name="booking"]');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Blocca il submit nativo

            const formData = new FormData(bookingForm);

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString(),
            })
            .then(() => {
                // Redirect manuale alla pagina di successo
                window.location.href = '/success.html';
            })
            .catch((error) => {
                console.error('Errore nell\'invio del form:', error);
                // Anche in caso di errore di rete, redirect (Netlify ha probabilmente ricevuto i dati)
                window.location.href = '/success.html';
            });
        });
    }
});

// Disable browser scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Forza scroll in cima sia all'avvio sia dopo il caricamento completo
window.scrollTo(0, 0);
window.onload = function() {
    try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (e) {
        // Fallback per browser vecchi che non supportano ScrollToOptions
        window.scrollTo(0, 0);
    }
};

// Prima di lasciare la pagina, reset posizione così al ritorno parte dall'alto
window.addEventListener('beforeunload', function() {
    window.scrollTo(0, 0);
});

// Helper compatibile per padStart (non supportato in IE11 / Chrome <57)
function padLeft2(num) {
    var s = num.toString();
    return s.length < 2 ? '0' + s : s;
}

// Helper HTML-escape per evitare XSS da contenuti CMS
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', function() {
    /* =========================================================================
       1. Custom Cursor
       ========================================================================= */
    var cursor = document.getElementById('custom-cursor');
    var hoverElements = document.querySelectorAll('a, button, input, select, textarea, .service-row, .gallery-item');

    // Controlla se il dispositivo è touch
    var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursor) {
        // Segue il mouse
        document.addEventListener('mousemove', function(e) {
            cursor.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
        });

        // Hover effect sugli elementi interattivi
        hoverElements.forEach(function(el) {
            el.addEventListener('mouseenter', function() { cursor.classList.add('hover'); });
            el.addEventListener('mouseleave', function() { cursor.classList.remove('hover'); });
        });
    }

    /* =========================================================================
       2. Navbar & Mobile Menu
       ========================================================================= */
    var navbar = document.getElementById('navbar');
    var mobileBtn = document.getElementById('mobile-menu-btn');
    var navWrapper = document.getElementById('nav-wrapper');
    var navLinksList = document.querySelectorAll('.nav-links a');

    // Cambia navbar on scroll
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Toggle menu mobile
    if (mobileBtn && navWrapper && navbar) {
        mobileBtn.addEventListener('click', function() {
            mobileBtn.classList.toggle('active');
            navWrapper.classList.toggle('active');
            navbar.classList.toggle('force-dark');
        });
    }

    // Chiudi menu al click sui link
    navLinksList.forEach(function(link) {
        link.addEventListener('click', function() {
            if (mobileBtn) mobileBtn.classList.remove('active');
            if (navWrapper) navWrapper.classList.remove('active');
            if (navbar) navbar.classList.remove('force-dark');
        });
    });

    /* =========================================================================
       3. Parallax Nativo (Cinematic Scroll)
       ========================================================================= */
    var heroBg = document.getElementById('hero-bg');
    var heroContent = document.getElementById('hero-content');
    var aboutImg = document.getElementById('about-img');

    // Variabile per ottimizzare le performance con RequestAnimationFrame
    var ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                var scrollY = window.scrollY;

                // Parallax Hero
                if (scrollY < window.innerHeight) {
                    if (heroBg) {
                        // Lo sfondo scala leggermente e scende piano
                        heroBg.style.transform = 'translateY(' + (scrollY * 0.3) + 'px) scale(' + (1 + scrollY * 0.0005) + ')';
                    }
                    if (heroContent) {
                        // Il testo scende più rapidamente e sfuma
                        heroContent.style.transform = 'translateY(' + (scrollY * 0.5) + 'px)';
                        heroContent.style.opacity = 1 - (scrollY / (window.innerHeight * 0.7));
                    }
                }

                // Parallax Immagine "Chi Sono"
                if (aboutImg) {
                    var rect = aboutImg.parentElement.getBoundingClientRect();
                    // Calcola solo se nel viewport
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        var distance = window.innerHeight - rect.top;
                        // Sposta leggermente verso il basso mentre si scrolla
                        aboutImg.style.transform = 'translateY(' + (distance * 0.15 - 50) + 'px)';
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
    var fadeElements = document.querySelectorAll('.fade-in');

    var observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    var fadeObserver = null;
    if (typeof IntersectionObserver !== 'undefined') {
        fadeObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Anima solo la prima volta
                }
            });
        }, observerOptions);

        fadeElements.forEach(function(el) { fadeObserver.observe(el); });
    } else {
        // Fallback per browser senza IntersectionObserver: mostra tutto subito
        fadeElements.forEach(function(el) { el.classList.add('visible'); });
    }

    /* =========================================================================
       5. CMS Data Fetching & Populating (Dynamic Content)
       ========================================================================= */
    function fetchCMSData() {
        if (typeof fetch === 'undefined') return; // Browser troppo vecchio, mantieni HTML statico

        fetch('data/content.json')
            .then(function(response) {
                if (!response.ok) throw new Error('not ok');
                return response.json();
            })
            .then(function(data) {
                // Helper function per risoluzione "seo.title" etc.
                function resolvePath(obj, path) {
                    return path.split('.').reduce(function(o, i) { return (o ? o[i] : undefined); }, obj);
                }

                // 1. Update Testi normali
                document.querySelectorAll('[data-cms]').forEach(function(el) {
                    var configPath = el.getAttribute('data-cms');
                    var contentType = el.getAttribute('data-type');
                    var value = resolvePath(data, configPath);

                    if (value) {
                        if (contentType === 'text-multiline') {
                            el.innerHTML = String(value).split('\n')
                                .filter(function(p) { return p.trim() !== ''; })
                                .map(function(p) { return '<p>' + escapeHtml(p) + '</p>'; })
                                .join('');
                        } else if (el.tagName === 'A' && el.classList.contains('contact-link')) {
                            el.textContent = value;
                            if (configPath === 'contact.email') el.href = 'mailto:' + value;
                            if (configPath === 'contact.phone') el.href = 'tel:' + String(value).replace(/\s/g, '');
                            if (configPath === 'contact.instagram') el.href = 'https://instagram.com/' + String(value).replace('@', '');
                        } else {
                            el.textContent = value;
                        }
                    }
                });

                document.querySelectorAll('[data-cms-mailto]').forEach(function(el) {
                    var value = resolvePath(data, el.getAttribute('data-cms-mailto'));
                    if (value) el.href = 'mailto:' + value;
                });

                // 2. Update Immagine Profilo "Chi Sono"
                if (data.about && data.about.image && data.about.image.trim() !== '') {
                    var aboutImgEl = document.getElementById('about-img');
                    if (aboutImgEl) {
                        // Gestione path assoluti/relativi
                        var imgSrc = data.about.image.replace(/^\/?images/, 'images');
                        aboutImgEl.style.backgroundImage = "url('" + imgSrc + "')";
                    }
                }

                // 3. Update Servizi
                if (data.services && data.services.length > 0) {
                    var servicesContainer = document.getElementById('services-container');
                    if (servicesContainer) {
                        servicesContainer.innerHTML = ''; // Svuota placeholder
                        data.services.forEach(function(service, index) {
                            var delay = index * 100;
                            var numStr = padLeft2(index + 1);
                            // Escape per evitare problemi in onclick/HTML
                            var safeTitleAttr = String(service.title || '').replace(/'/g, "\\'");
                            var title = escapeHtml(service.title);
                            var description = escapeHtml(service.description);
                            var price = escapeHtml(service.price);

                            servicesContainer.innerHTML +=
                                '<div class="service-row fade-in" style="transition-delay: ' + delay + 'ms; cursor: pointer;" onclick="var s=document.getElementById(\'service\'); if(s){s.value=\'' + safeTitleAttr + '\';} window.location.href=\'#contact\';">' +
                                    '<div class="service-number">' + numStr + '</div>' +
                                    '<div class="service-content">' +
                                        '<h3 class="service-title">' + title + '</h3>' +
                                        '<p class="service-desc">' + description + '</p>' +
                                    '</div>' +
                                    '<div class="service-price">' + price + '</div>' +
                                '</div>';
                        });
                        if (fadeObserver) {
                            servicesContainer.querySelectorAll('.fade-in').forEach(function(el) { fadeObserver.observe(el); });
                        } else {
                            servicesContainer.querySelectorAll('.fade-in').forEach(function(el) { el.classList.add('visible'); });
                        }
                    }
                }

                // 4. Update Galleria Masonry
                if (data.gallery && data.gallery.length > 0) {
                    var galleryContainer = document.getElementById('gallery-container');
                    if (galleryContainer) {
                        galleryContainer.innerHTML = ''; // Svuota placeholder
                        data.gallery.forEach(function(item, index) {
                            var delay = index * 100;
                            // Alterna aspect ratio nei fallback grigi (stile masonry)
                            var aspect = index % 2 === 0 ? 'aspect-vertical' : 'aspect-square';
                            var hasImage = item.image && item.image.trim() !== '';

                            var imgSrc = hasImage ? item.image.replace(/^\/?images/, 'images') : '';
                            var aspectRatio = index % 2 === 0 ? '2/3' : '1/1';
                            var safeTitle = escapeHtml(item.title);
                            var imageHTML = hasImage
                                ? '<img src="' + imgSrc + '" alt="' + safeTitle + '" style="aspect-ratio: ' + aspectRatio + '; object-fit: cover; width: 100%;">'
                                : '<div class="img-placeholder bg-gray ' + aspect + '"></div>';

                            galleryContainer.innerHTML +=
                                '<div class="gallery-item fade-in" style="transition-delay: ' + delay + 'ms; cursor: pointer;">' +
                                    imageHTML +
                                    '<div class="gallery-overlay">' +
                                        '<h3 class="gallery-title">' + safeTitle + '</h3>' +
                                    '</div>' +
                                '</div>';
                        });
                        // Ricollega observer e aggiungi logica Lightbox
                        galleryContainer.querySelectorAll('.gallery-item').forEach(function(el, idx) {
                            var itemData = data.gallery[idx];

                            // Fade-in observer
                            if (el.classList.contains('fade-in')) {
                                if (fadeObserver) {
                                    fadeObserver.observe(el);
                                } else {
                                    el.classList.add('visible');
                                }
                            }

                            // Click to open lightbox
                            el.addEventListener('click', function() {
                                var lb = document.getElementById('lightbox');
                                var lbImg = document.getElementById('lightbox-img');
                                var lbCaption = document.getElementById('lightbox-caption');

                                if (lb && itemData && itemData.image) {
                                    if (lbImg) lbImg.src = itemData.image.replace(/^\/?images/, 'images');
                                    if (lbCaption) lbCaption.textContent = itemData.title;
                                    lb.classList.add('active');
                                    document.body.style.overflow = 'hidden'; // blocca lo scroll
                                }
                            });
                        });

                        // Opzionale: update cursor bindings sui nuovi elementi
                        if (!isTouchDevice && cursor) {
                            var newInteractive = galleryContainer.querySelectorAll('.gallery-item');
                            newInteractive.forEach(function(el) {
                                el.addEventListener('mouseenter', function() { cursor.classList.add('hover'); });
                                el.addEventListener('mouseleave', function() { cursor.classList.remove('hover'); });
                            });
                        }
                    }
                }

                // 5. Aggiornamento Titoli SEO
                if (data.seo) {
                    if (data.seo.title) document.title = data.seo.title;
                    if (data.seo.description) {
                        var metaDesc = document.querySelector('meta[name="description"]');
                        if (metaDesc) metaDesc.setAttribute('content', data.seo.description);
                    }
                }
            })
            .catch(function(error) {
                console.warn('CMS data.json fetch fallito. Caricamento contenuti HTML di default.', error);
            });
    }

    fetchCMSData();

    /* =========================================================================
       6. Auto-Update Anno Footer
       ========================================================================= */
    var yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* =========================================================================
       7. Lightbox Close Logic
       ========================================================================= */
    var lightbox = document.getElementById('lightbox');
    var lightboxClose = document.getElementById('lightbox-close');

    if (lightbox && lightboxClose) {
        var closeLightbox = function() {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // ripristina scroll
        };

        lightboxClose.addEventListener('click', closeLightbox);

        // Chiudi cliccando fuori dall'immagine
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Chiudi con Esc
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    /* =========================================================================
       8. Netlify Form — JS Submit per redirect affidabile a success.html
       ========================================================================= */
    var bookingForm = document.querySelector('form[name="booking"]');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Blocca il submit nativo

            var formData = new FormData(bookingForm);

            if (typeof fetch === 'undefined') {
                // Fallback per browser senza fetch: submit nativo
                bookingForm.submit();
                return;
            }

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function() {
                window.location.href = '/success.html';
            })
            .catch(function(error) {
                console.error('Errore nell\'invio del form:', error);
                window.location.href = '/success.html';
            });
        });
    }
});

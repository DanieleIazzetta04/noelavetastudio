// 1. Carica lo stile del sito nel pannello di anteprima
CMS.registerPreviewStyle("/css/style.css");

// Helper function to create HTML lines for text-multiline
function renderMultilineText(text) {
  if (!text) return '';
  return text.split('\n').filter(function(p) { return p.trim() !== ''; }).map(function(p) { return '<p>' + p + '</p>'; }).join('');
}

// 2. Crea un layout visuale personalizzato per la "Homepage Edit"
var HomepagePreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var getAsset = this.props.getAsset; // Funzione essenziale per risolvere le immagini caricate
    var data = entry.getIn(['data']).toJS();
    
    // Per forzare la visibilità degli elementi CSS che usano IntersectionObserver
    var visibleClass = 'fade-in visible';

    return h('div', { className: 'content-wrapper', style: { overflowX: 'hidden' } },
      
      // HERO SECTION
      h('section', { className: 'hero-section', id: 'hero', style: { position: 'relative'} },
        h('div', { className: 'hero-bg', id: 'hero-bg' }),
        h('div', { className: 'hero-content ' + visibleClass, id: 'hero-content' },
          h('h1', { className: 'hero-title' }, "NOEL AVETA", h('br'), "STUDIO"),
          h('p', { style: { marginTop: '1rem', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '12px', color: '#fff', opacity: '0.8'} }, data.hero ? data.hero.subtitle : '')
        )
      ),

      // ABOUT SECTION
      h('section', { className: 'about-section', id: 'about' },
        h('div', { className: 'container about-grid' },
          h('div', { className: 'about-image-wrapper ' + visibleClass },
            h('div', { 
              className: 'about-image', 
              style: data.about && data.about.image ? { backgroundImage: 'url(' + getAsset(data.about.image).toString() + ')' } : {}
            })
          ),
          h('div', { className: 'about-text-wrapper ' + visibleClass },
            h('h2', { className: 'section-title' }, data.about ? data.about.title : ''),
            h('div', { 
              className: 'section-text', 
              dangerouslySetInnerHTML: { __html: renderMultilineText(data.about ? data.about.text : '') } 
            })
          )
        )
      ),

      // SERVICES SECTION
      h('section', { className: 'services-section', id: 'services' },
        h('div', { className: 'container' },
          h('div', { className: 'services-header ' + visibleClass },
            h('h2', { className: 'section-title' }, "Servizi"),
            h('div', { className: 'services-line' })
          ),
          h('div', { className: 'services-list' },
            (data.services || []).map(function(service, index) {
              var n = (index + 1).toString();
              var numStr = n.length < 2 ? '0' + n : n;
              return h('div', { className: 'service-row ' + visibleClass, key: index },
                h('div', { className: 'service-number' }, numStr),
                h('div', { className: 'service-content' },
                  h('h3', { className: 'service-title' }, service.title),
                  h('p', { className: 'service-desc' }, service.description)
                ),
                h('div', { className: 'service-price' }, service.price)
              );
            })
          )
        )
      ),

      // GALLERY SECTION
      h('section', { className: 'gallery-section', id: 'gallery' },
        h('div', { className: 'container-fluid' },
          h('h2', { className: 'section-title text-center light-text ' + visibleClass }, "Galleria"),
          h('div', { className: 'gallery-masonry' },
            (data.gallery || []).map(function(item, index) {
              var isVertical = index % 2 === 0;
              var hasImage = !!item.image;
              var imgSrc = hasImage ? getAsset(item.image).toString() : '';

              return h('div', { className: 'gallery-item ' + visibleClass, key: index },
                hasImage 
                  ? h('img', { 
                      src: imgSrc, 
                      alt: item.title, 
                      style: { aspectRatio: isVertical ? '2/3' : '1/1', objectFit: 'cover', width: '100%', display: 'block' } 
                    })
                  : h('div', { className: 'img-placeholder bg-gray ' + (isVertical ? 'aspect-vertical' : 'aspect-square') }),
                h('div', { className: 'gallery-overlay' },
                  h('h3', { className: 'gallery-title' }, item.title)
                )
              );
            })
          )
        )
      ),

      // CONTACT SECTION
      h('section', { className: 'contact-section', id: 'contact' },
        h('div', { className: 'container contact-grid' },
          h('div', { className: 'contact-text ' + visibleClass },
            h('h2', { className: 'section-title' }, "Prenota", h('br'), "una sessione"),
            h('p', { className: 'contact-subtitle' }, "Invia una richiesta per discutere il tuo progetto fotografico."),
            h('div', { className: 'contact-info-list' },
              h('a', { className: 'contact-link' }, data.contact ? data.contact.email : ''),
              h('a', { className: 'contact-link' }, data.contact ? data.contact.phone : ''),
              h('a', { className: 'contact-link' }, data.contact ? data.contact.instagram : '')
            )
          ),
          h('div', { className: 'contact-form-wrapper ' + visibleClass },
            h('form', { className: 'editorial-form' },
              h('div', { className: 'form-group' }, h('input', { type: 'text', placeholder: 'Nome Completo', readOnly: true })),
              h('div', { className: 'form-group' }, h('input', { type: 'email', placeholder: 'Email', readOnly: true })),
              h('div', { className: 'form-group' }, 
                h('select', { readOnly: true }, h('option', null, 'Servizio di interesse'))
              ),
              h('div', { className: 'form-group' }, h('textarea', { rows: 4, placeholder: 'Parlami della tua idea...', readOnly: true })),
              h('button', { className: 'btn-primary', type: 'button' }, "Invia Richiesta")
            )
          )
        )
      )
    );
  }
});

// Registra il template per la collection 'homepage'
CMS.registerPreviewTemplate("homepage", HomepagePreview);

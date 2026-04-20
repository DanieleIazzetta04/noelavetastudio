// 1. Carica lo stile del sito nel pannello di anteprima
CMS.registerPreviewStyle("/css/style.css");

// NOTA: Il preview template custom è stato rimosso temporaneamente perché
// incompatibile con Decap CMS 3.x quando si caricano nuove immagini
// (errore: "Cannot read properties of undefined"). Verrà usato il preview
// default di Decap, più semplice ma stabile. L'importante è che l'upload
// e il salvataggio delle entry funzionino correttamente.

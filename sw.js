const CACHE_NAME = 'lojaexpress-cache-v1';
const RECURSOS_ESSENCIAIS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/3081/3081840.png'
];

// 1. Instalação: grava arquivos estáticos essenciais no Cache Storage
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [PWA] Armazenando arquivos vitais no cache...');
      return cache.addAll(RECURSOS_ESSENCIAIS);
    })
  );
  self.skipWaiting();
});

// 2. Ativação: limpa versões antigas de caches se o app atualizar
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) => {
      return Promise.all(
        chaves.map((chave) => {
          if (chave !== CACHE_NAME) {
            console.log('🧹 [PWA] Removendo cache obsoleto:', chave);
            return caches.delete(chave);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Interceptação de Rede (Fetch): se não houver internet, responde do cache
self.addEventListener('fetch', (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((respostaCache) => {
      // Retorna o cache se existir; senão tenta buscar na internet
      return respostaCache || fetch(evento.request).catch(() => {
        // Fallback defensivo para quando estiver 100% offline
        if (evento.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
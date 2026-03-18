// Cache ka naam aur version
const CACHE_NAME = 'sam-voice-assistant-v1';

// Wo files jo offline use ke liye save (cache) karni hain
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    // Dhyan rahe: Agar aapne assets folder mein logo.png nahi dala hai, toh app install nahi hoga.
    // './assets/logo.png' // Agar logo.png hai toh is line ke aage se '//' hata dena
];

// 1. Install Event (Files ko cache me save karna)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Activate Event (Purane cache ko delete karna agar version change ho)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. Fetch Event (Offline hone par cache se files dikhana)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Agar file cache me mil gayi toh wo return karo, warna internet se fetch karo
                return response || fetch(event.request);
            })
    );
});

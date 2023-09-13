
'use strict';
//const cacheName = 'kaleidos-v773';
//const startPage = 'https://kaleidoscope24.com/';


/*  if (e.request.mode === 'navigate') {

 	} else{
	e.respondWith(caches.open(cacheName).then((cache) => {
	  return cache.match(e.request).then((cachedResponse) => {
		const fetchedResponse = fetch(e.request).then((networkResponse) => {
		  cache.put(e.request, networkResponse.clone());
		  return networkResponse;
		}).catch(()=>{return});
		return cachedResponse || fetchedResponse;
	  });
	}));
} */

const CACHE_VERSION = 777;
const startPage = '/';
const BASE_CACHE_FILES = [
	startPage+'index.html',
	startPage+'kaleidoscope.css',
	startPage+'forage.gif.hermite.min.js',
	startPage+'gif.worker1.js',
	startPage+'kaleidoscope.js',
	startPage+'manifest.json',
	startPage+'contact.html',
	startPage+'contact.png',
	startPage+'sprt5.png',
	startPage+'favicon-32x32.png',
	startPage+'maus-kl64.png',
	startPage+'android-chrome-192x192.png',
	startPage+'android-chrome-512x512.png',
	startPage+'favicon.ico',
];
const noCacheUrl= [/\/formik/,/\/formmail/];
const OFFLINE_CACHE_FILES = [
    '/offline.html',
];

const NOT_FOUND_CACHE_FILES = [
    '/404.html',
];

const OFFLINE_PAGE = '/offline.html';
const NOT_FOUND_PAGE = '/404.html';

const CACHE_VERSIONS = {
    assets: 'assets-v' + CACHE_VERSION,
    content: 'content-v' + CACHE_VERSION,
    offline: 'offline-v' + CACHE_VERSION,
    notFound: '404-v' + CACHE_VERSION,
};

// Define MAX_TTL's in SECONDS for specific file extensions
const MAX_TTL = {
    '/': 3600,
    html: 3600,
    json: 86400,
    js: 86400,
    css: 86400,
};

const CACHE_BLACKLIST = [
    //(str) => {
    //    return !str.startsWith('http://localhost') && !str.startsWith('https://gohugohq.com');
    //},
];

const SUPPORTED_METHODS = [
    'GET',
];


function isBlacklisted(url) {
    return (CACHE_BLACKLIST.length > 0) ? !CACHE_BLACKLIST.filter((rule) => {
        if(typeof rule === 'function') {
            return !rule(url);
        } else {return false}
    }).length : false
}

function getFileExtension(url) {
    let extension = url.split('.').reverse()[0].split('?')[0];
    return (extension.endsWith('/')) ? '/' : extension;
}

function getTTL(url) {
    if (typeof url === 'string') {
        let extension = getFileExtension(url);
        if (typeof MAX_TTL[extension] === 'number') {
            return MAX_TTL[extension];
        } else {return null;}
    } else {return null;}
}


function installServiceWorker() {
    return Promise.all(
        [caches.open(CACHE_VERSIONS.assets)
            .then((cache) => {return cache.addAll(BASE_CACHE_FILES)}),
        caches.open(CACHE_VERSIONS.offline)
            .then((cache) => {return cache.addAll(OFFLINE_CACHE_FILES)}),
        caches.open(CACHE_VERSIONS.notFound)
			.then((cache) => {return cache.addAll(NOT_FOUND_CACHE_FILES)})
        ]
    )
        .then(() => {return self.skipWaiting();});
}

function cleanupLegacyCache() {
    let currentCaches = Object.keys(CACHE_VERSIONS)
        .map((key) => {return CACHE_VERSIONS[key];});
    return new Promise((resolve, reject) => {
        caches.keys().then((keys) => {
                    return legacyKeys = keys.filter(
                        (key) => {return !~currentCaches.indexOf(key)});})
            .then((legacy) => {
                if (legacy.length) {
                    Promise.all(legacy.map(
                        (legacyKey) => {return caches.delete(legacyKey)}))
                        .then(() => {resolve()})
                         .catch((err) => {reject(err);});
                } else {resolve();}
            }).catch(() => {reject();});
        });
}

function precacheUrl(url) {
    if(!isBlacklisted(url)) {caches.open(CACHE_VERSIONS.content)
            .then((cache) => {cache.match(url)
                    .then((response) => {
                        if(!response) {return fetch(url)
                        } else {return null}
                    })
                    .then((response) => {
                        if(response) {return cache.put(url, response.clone());
                        } else {return null;}
                    });
            })
    }
}



self.addEventListener('install', e => {
        e.waitUntil(Promise.all([
                installServiceWorker(),self.skipWaiting()]));
});

// The activate handler takes care of cleaning up old caches.
/* self.addEventListener('activate', e => {
        e.waitUntil(Promise.all(
                [cleanupLegacyCache(),
                self.clients.claim(),
                self.skipWaiting()]
            ).catch((err) => {//e.skipWaiting()
			})
        );
}); */

function cleanupCache(e) {
    const cacheKeeplist = [
		'assets-v' + CACHE_VERSION,
		'content-v' + CACHE_VERSION,
		'offline-v' + CACHE_VERSION,
		'404-v' + CACHE_VERSION,
		'media'];
    e.waitUntil(
        caches.keys().then( keyList => {console.log(keyList.length);
            return Promise.all(keyList.map( key => {
                if (cacheKeeplist.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
.then(self.clients.claim()));
}

self.addEventListener('activate', e => {cleanupCache(e)});

self.addEventListener('fetch', e => {
	if(!noCacheUrl.every(checknoCache,e.request.url))return;
	if(!e.request.url.match(/^(http|https):\/\//i))return;
	if(new URL(e.request.url).origin!==location.origin)return;
	if(e.request.url.endsWith('/receive-shares')&&e.request.method==='POST'){
		return e.respondWith((async ()=>{
			const formData=await e.request.formData();
			const mediaFiles = formData.getAll('file');
			caches.open('media').then(function(cache) {
			for(var i=0;i<mediaFiles.length;i++){cache.put('shared-image'+i,new Response(mediaFiles[i], {
			headers:{'content-length':mediaFiles[i].size,'content-type':mediaFiles[i].type,'name':mediaFiles[i].name}}))}
			});
			return Response.redirect('./?share', 303);
		  })(),
		);
	} 

	if(e.request.url.endsWith('php')&&e.request.method==='POST'){return;}
	
	e.respondWith(caches.open(CACHE_VERSIONS.content)
	.then((cache) => {return cache.match(e.request)
		.then((response) => {
			if (response) {
				let headers = response.headers.entries();
				let date = null;
				for (let pair of headers) {
					if (pair[0]==='date'){date = new Date(pair[1]);}}
				if (date) {
					let age = parseInt((new Date().getTime() - date.getTime()) / 1000);
					let ttl = getTTL(e.request.url);
					if (ttl && age > ttl) {
						return new Promise((resolve) => {
							return fetch(e.request.clone())
								.then((updatedResponse) => {
									if (updatedResponse) {
									cache.put(e.request, updatedResponse.clone());
									resolve(updatedResponse);
									} else {resolve(response)}
								}).catch(() => {resolve(response);});
						}).catch((err) => {return response;});
					} else {return response;}
				} else {return response;}
			} else {return null}
		}).then((response) => {
			if (response) {return response;
			} else {return fetch(e.request.clone())
				.then((response) => {
				if (response.status < 400) {
					if (~SUPPORTED_METHODS.indexOf(e.request.method) && !isBlacklisted(e.request.url)) {cache.put(e.request, response.clone());}
					return response;
				} else {return caches.open(CACHE_VERSIONS.notFound)
					.then((cache) => {return cache.match(NOT_FOUND_PAGE);})
				}}).then((response) => {
					if (response) {return response;}
					}).catch(() => {return caches.open(CACHE_VERSIONS.offline)
						.then((offlineCache) => {
							return offlineCache.match(OFFLINE_PAGE)})
					});}}).catch((error) => {
							console.error('  Error in fetch handler:', error);
									throw error;
								});
				}));
	if (e.request.mode === 'navigate') {cleanupCache(e)}
});


self.addEventListener('message', (e) => {
	if(typeof e.data==='object'&&typeof e.data.action==='string'){
	switch (e.data.action){
			case 'cache':precacheUrl(e.data.url);break;
			default:console.log('Unknown action: ' + e.data.action);break}
	}
});

function checknoCache(url){
	if(this.match(url)){return false}
	return true;
}

/* self.addEventListener('fetch', (evt) => {
	evt.respondWith(
		caches.match(evt.request).then(function (r) {
			return (
				r ||
				fetch(evt.request).catch(function () {
					return caches.match('/mobile/offline.html');
				})
			);
		})
	);
}); */

/* self.addEventListener('push', (evt) => {
	const data = evt.data.json();
	const title = data.title;
	const options = {
		icon: 'images/icons/logo-1024.png',
		body: data.message,
		badge: 'images/icons/badge-icon.png',
	};

	evt.waitUntil(self.registration.showNotification(title, options));
}); */

/* self.addEventListener('notificationclick', (evt) => {
	const urlToOpen = new URL('/mobile/home.html#notifications', self.location.origin).href;

	const promiseChain = clients
		.matchAll({
			type: 'window',
			includeUncontrolled: true,
		})
		.then((windowClients) => {
			let matchingClient = null;

			for (let i = 0; i < windowClients.length; i++) {
				const windowClient = windowClients[i];
				if (windowClient.url === urlToOpen) {
					matchingClient = windowClient;
					break;
				}
			}
			if (matchingClient) {
				return matchingClient.focus();
			} else {
				return clients.openWindow(urlToOpen);
			}
		});

	evt.waitUntil(promiseChain);
}); */
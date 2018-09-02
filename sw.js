/* 
*To implement the basics of SW I used this tutorial - https://www.youtube.com/watch?v=BfL3pprhnms
*/

//to set cache version
let cacheVersion = 'v1';

// array with files we want to be cached

let cacheFiles = ['/index.html',
'/restaurant.html',
'/css/styles.css',
'/css/responsive.css',
'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
'/js/main.js',
'/js/dbhelper.js',
'/js/restaurant_info.js',
'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
];

//setting up sw

self.addEventListener('install', function(e){
console.log("[ServiceWorker] Installed")

// to start caching files

e.waitUntil (
caches.open(cacheVersion).then(function(caching){
	console.log("[ServiceWorker] Caching Files");
	return caching.addAll(cacheFiles);
})

)
})

self.addEventListener('activate', function(e){
console.log("[ServiceWorker] Activated")

// in case we changed cacheVersion, to delete the previous cache
 e.waitUntil (
    caches.keys().then(function(cacheVersions) {
	    return Promise.all(cacheVersions.map(function(thisCacheVersion){
		   if(thisCacheVersion !== cacheVersion) {
			console.log("[ServiceWorker] Removing Cached Files from ", thisCacheVersion);
			return caches.delete(thisCacheVersion);
		   }
		}))
	})
	)
})
			
// fetching sw 

self.addEventListener('fetch', function(e){
console.log("[ServiceWorker] Fetching", e.request.url);

// if the cache match the url - > console.log it

e.respondWith(
caches.match(e.request).then(function(response){
	// if files are in the cache
	if(response){
		console.log("[ServiceWorker] Found in Cache", e.request.url);
		return response;
	}
	//   when we fetch and it's not in the cache - add it there; to clone the request to use it again
	let requestClone = e.request.clone();
	fetch(requestClone).then(function(response){
		if(!response){
			console.log("[ServiceWorker] No Response from Fetch");
			return response;
		} 
	// if we have response - cache it
		let responseClone = response.clone();
		caches.open(cacheVersion).then(function(cache){
			cache.put(e.request, responseClone);
			return response;
		});
	})
	// if it doesn't work -> error
	caches.catch(function(error) {
		console.log("[ServiceWorker] Error Fetching and Caching new Files");
	})
})
)
})
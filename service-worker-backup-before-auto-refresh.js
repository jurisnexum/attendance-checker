const CACHE_NAME = "jnx-attendance-v4";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./student-management.html",
    "./style.css",
    "./app.js",
    "./student-management.js",
    "./data/students.js",
    "./data/attendance-db.js",
    "./manifest.json"
];


/* INSTALL */

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(function(cache) {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

        self.skipWaiting();

    }
);


/* ACTIVATE */

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches
                .keys()
                .then(function(keys) {

                    return Promise.all(

                        keys.map(function(key) {

                            if (
                                key !== CACHE_NAME
                            ) {

                                return caches.delete(
                                    key
                                );

                            }

                        })

                    );

                })

        );

        self.clients.claim();

    }
);


/* FETCH */

self.addEventListener(
    "fetch",
    function(event) {

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(event.request)
                .then(function(cachedResponse) {

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    return fetch(
                        event.request
                    )
                    .then(function(response) {

                        if (
                            !response ||
                            response.status !== 200 ||
                            response.type === "opaque"
                        ) {

                            return response;

                        }


                        const responseClone =
                            response.clone();


                        caches
                            .open(CACHE_NAME)
                            .then(function(cache) {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });


                        return response;

                    });

                })

        );

    }
);

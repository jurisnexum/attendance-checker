const CACHE_NAME = "jnx-attendance-v4";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./attendance.html",
    "./student-management.html",

    "./style.css",

    "./app.js",
    "./student-management.js",

    "./data/students.js",
    "./data/subjects.js",
    "./data/attendance-db.js",

    "./manifest.json"
];


/* INSTALL */

self.addEventListener(
    "install",
    function(event) {

        self.skipWaiting();

        event.waitUntil(

            caches.open(CACHE_NAME)
                .then(function(cache) {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

    }
);


/* ACTIVATE */

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches.keys()
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
                .then(function() {

                    return self.clients.claim();

                })

        );

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

            fetch(event.request)
                .then(function(response) {

                    if (
                        response &&
                        response.status === 200
                    ) {

                        const copy =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {

                                cache.put(
                                    event.request,
                                    copy
                                );

                            });

                    }

                    return response;

                })
                .catch(function() {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);

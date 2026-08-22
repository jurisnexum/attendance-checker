const DEFAULT_SUBJECTS = [];




const SUBJECT_STORAGE_KEY =
    "jnx_subjects";


function normalizeSubjects(subjects) {

    if (!Array.isArray(subjects)) {
        return [];
    }

    return subjects
        .filter(function(subject) {

            return (
                subject &&
                subject.id &&
                subject.name &&
                subject.code
            );

        })
        .map(function(subject) {

            return {

                id:
                    String(subject.id),

                name:
                    String(subject.name),

                code:
                    String(subject.code),

                icon:
                    subject.icon ||
                    "📚"

            };

        });

}


function loadSubjects() {

    try {

        const saved =
            localStorage.getItem(
                SUBJECT_STORAGE_KEY
            );

        if (!saved) {

            const defaults =
                DEFAULT_SUBJECTS.map(function(subject) {

                    return {
                        ...subject
                    };

                });

            localStorage.setItem(
                SUBJECT_STORAGE_KEY,
                JSON.stringify(defaults)
            );

            return defaults;

        }


        const savedSubjects =
            normalizeSubjects(
                JSON.parse(saved)
            );


        /*
         * Keep original subjects that may have
         * disappeared from localStorage.
         */

        const merged =
            [...savedSubjects];


        DEFAULT_SUBJECTS.forEach(
            function(defaultSubject) {

                const exists =
                    merged.some(
                        function(subject) {

                            return (
                                subject.id ===
                                defaultSubject.id
                            );

                        }
                    );


                if (!exists) {

                    merged.push({
                        ...defaultSubject
                    });

                }

            }
        );


        localStorage.setItem(
            SUBJECT_STORAGE_KEY,
            JSON.stringify(merged)
        );


        return merged;

    } catch (error) {

        console.error(
            "Could not load subjects:",
            error
        );

        return DEFAULT_SUBJECTS.map(
            function(subject) {

                return {
                    ...subject
                };

            }
        );

    }

}


function saveSubjects(subjects) {

    const normalized =
        normalizeSubjects(subjects);

    localStorage.setItem(
        SUBJECT_STORAGE_KEY,
        JSON.stringify(normalized)
    );

}


const SUBJECTS =
    loadSubjects();

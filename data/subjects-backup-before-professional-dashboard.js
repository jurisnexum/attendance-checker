const DEFAULT_SUBJECTS = [

    {
        id: "ggsr",
        name: "GGSR",
        code: "GGSR",
        icon: "⚖️"
    },

    {
        id: "hbo",
        name: "HBO",
        code: "HBO",
        icon: "📘"
    },

    {
        id: "rph",
        name: "RPH",
        code: "RPH",
        icon: "📚"
    },

    {
        id: "contemporary-world",
        name: "Contemporary World",
        code: "CW",
        icon: "🌐"
    },

    {
        id: "art-appreciation",
        name: "Art Appreciation",
        code: "ART",
        icon: "🎨"
    },

    {
        id: "cmbe2",
        name: "CMBE2",
        code: "CMBE2",
        icon: "📊"
    },

    {
        id: "mcc-101",
        name: "MCC 101",
        code: "MCC101",
        icon: "🏫"
    }

];


function loadSubjects() {

    try {

        const saved =
            localStorage.getItem(
                "jnx_subjects"
            );

        if (!saved) {

            localStorage.setItem(
                "jnx_subjects",
                JSON.stringify(
                    DEFAULT_SUBJECTS
                )
            );

            return DEFAULT_SUBJECTS.slice();
        }

        const parsed =
            JSON.parse(saved);

        if (
            !Array.isArray(parsed)
        ) {
            throw new Error(
                "Invalid subject data."
            );
        }

        return parsed;

    } catch (error) {

        console.error(
            "Could not load subjects:",
            error
        );

        return DEFAULT_SUBJECTS.slice();
    }
}


function saveSubjects(subjects) {

    localStorage.setItem(
        "jnx_subjects",
        JSON.stringify(subjects)
    );

}


const SUBJECTS =
    loadSubjects();

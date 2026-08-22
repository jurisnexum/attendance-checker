/*
 * JNX OFFLINE ATTENDANCE
 *
 * STUDENT MANAGEMENT
 *
 * Students are stored in the same
 * mayor/class-specific database used
 * by the Attendance Checker.
 */


/* ============================================================
   ORIGINAL MAYOR DATABASE
   ============================================================ */

function getStudentDatabaseKey() {

    /*
     * Student Management belongs to the
     * original Mayor account.
     */

    return "jnx_student_database";

}


/* ============================================================
   DATABASE
   ============================================================ */

const STUDENT_DATABASE_KEY =
    getStudentDatabaseKey();


let students = [];

let editingStudentId = null;


/* ============================================================
   LOAD STUDENTS
   ============================================================ */

function loadStudents() {

    try {

        const saved =
            localStorage.getItem(
                STUDENT_DATABASE_KEY
            );


        if (!saved) {

            students = [];

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (!Array.isArray(parsed)) {

            students = [];

            return;

        }


        /*
         * Normalize the database so the
         * Attendance Checker can use it.
         */

        students =
            parsed
                .map(function(student) {

                    return {

                        id:
                            String(
                                student.id ||
                                Date.now() +
                                Math.random()
                            ),

                        studentNumber:
                            String(
                                student.studentNumber ||
                                student.number ||
                                ""
                            ).trim(),

                        name:
                            String(
                                student.name ||
                                ""
                            ).trim(),

                        year:
                            String(
                                student.year ||
                                ""
                            ).trim(),

                        section:
                            String(
                                student.section ||
                                ""
                            ).trim()

                    };

                })
                .filter(function(student) {

                    return (
                        student.studentNumber &&
                        student.name
                    );

                });


    }

    catch (error) {

        console.error(
            "Unable to load students:",
            error
        );

        students = [];

    }

}


/* ============================================================
   SAVE
   ============================================================ */

function saveStudents() {

    localStorage.setItem(
        STUDENT_DATABASE_KEY,
        JSON.stringify(students)
    );

}


/* ============================================================
   RENDER
   ============================================================ */

function renderStudents() {

    const list =
        document.getElementById(
            "studentList"
        );

    const count =
        document.getElementById(
            "studentCount"
        );

    const search =
        document.getElementById(
            "studentSearch"
        );


    const query =
        search.value
            .trim()
            .toLowerCase();


    const filtered =
        students.filter(
            function(student) {

                return (
                    student.studentNumber
                        .toLowerCase()
                        .includes(query)
                    ||
                    student.name
                        .toLowerCase()
                        .includes(query)
                );

            }
        );


    count.textContent =
        students.length +
        (
            students.length === 1
                ? " student"
                : " students"
        );


    if (filtered.length === 0) {

        list.innerHTML =
            students.length === 0
                ? "<p>No students added yet.</p>"
                : "<p>No matching students found.</p>";

        return;

    }


    list.innerHTML = "";


    filtered.forEach(
        function(student) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "student-management-item";


            const information =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                student.name;


            const number =
                document.createElement(
                    "small"
                );


            number.textContent =
                student.studentNumber;


            information.appendChild(
                name
            );

            information.appendChild(
                number
            );


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "student-management-item-actions";


            const editButton =
                document.createElement(
                    "button"
                );


            editButton.type =
                "button";


            editButton.textContent =
                "Edit";


            editButton.onclick =
                function() {

                    editStudent(
                        student.id
                    );

                };


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.textContent =
                "Delete";


            deleteButton.onclick =
                function() {

                    deleteStudent(
                        student.id
                    );

                };


            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );


            item.appendChild(
                information
            );

            item.appendChild(
                actions
            );


            list.appendChild(
                item
            );

        }
    );

}


/* ============================================================
   ADD / EDIT STUDENT
   ============================================================ */

function handleStudentSubmit(event) {

    event.preventDefault();


    const numberInput =
        document.getElementById(
            "studentNumber"
        );


    const nameInput =
        document.getElementById(
            "studentName"
        );


    const number =
        numberInput.value.trim();


    const name =
        nameInput.value.trim();


    if (
        !number ||
        !name
    ) {

        return;

    }


    /*
     * Prevent duplicate student numbers.
     */

    const duplicate =
        students.find(
            function(student) {

                return (
                    student.studentNumber
                        .toLowerCase() ===
                    number.toLowerCase()
                    &&
                    student.id !==
                    editingStudentId
                );

            }
        );


    if (duplicate) {

        alert(
            "That student number already exists."
        );

        return;

    }


    if (editingStudentId) {

        const student =
            students.find(
                function(item) {

                    return (
                        item.id ===
                        editingStudentId
                    );

                }
            );


        if (student) {

            student.studentNumber =
                number;

            student.name =
                name;

        }

    }

    else {

        students.push({

            id:
                Date.now().toString(),

            studentNumber:
                number,

            name:
                name,

            year:
                "",

            section:
                ""

        });

    }


    saveStudents();

    resetStudentForm();

    renderStudents();

}


/* ============================================================
   EDIT
   ============================================================ */

function editStudent(id) {

    const student =
        students.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!student) {

        return;

    }


    editingStudentId =
        id;


    document.getElementById(
        "studentNumber"
    ).value =
        student.studentNumber;


    document.getElementById(
        "studentName"
    ).value =
        student.name;


    document.getElementById(
        "saveStudentButton"
    ).textContent =
        "Save Changes";


    document.getElementById(
        "cancelStudentButton"
    ).hidden =
        false;


    document.getElementById(
        "studentNumber"
    ).focus();

}


/* ============================================================
   DELETE
   ============================================================ */

function deleteStudent(id) {

    const student =
        students.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!student) {

        return;

    }


    const confirmed =
        confirm(
            "Remove " +
            student.name +
            " from the class list?"
        );


    if (!confirmed) {

        return;

    }


    students =
        students.filter(
            function(item) {

                return item.id !== id;

            }
        );


    saveStudents();

    renderStudents();

}


/* ============================================================
   RESET FORM
   ============================================================ */

function resetStudentForm() {

    editingStudentId =
        null;


    document.getElementById(
        "studentForm"
    ).reset();


    document.getElementById(
        "saveStudentButton"
    ).textContent =
        "Add Student";


    document.getElementById(
        "cancelStudentButton"
    ).hidden =
        true;

}


/* ============================================================
   EVENTS
   ============================================================ */

document
    .getElementById(
        "studentForm"
    )
    .addEventListener(
        "submit",
        handleStudentSubmit
    );


document
    .getElementById(
        "cancelStudentButton"
    )
    .addEventListener(
        "click",
        resetStudentForm
    );


document
    .getElementById(
        "studentSearch"
    )
    .addEventListener(
        "input",
        renderStudents
    );


/* ============================================================
   START
   ============================================================ */

loadStudents();

renderStudents();

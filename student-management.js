/* ============================================================
   JNX STUDENT MANAGEMENT DASHBOARD
   ============================================================ */

const STUDENT_DATABASE_KEY =
    "jnx_student_database";


let students = [];

let editingStudentNumber = null;


/* ============================================================
   LOAD STUDENTS
   ============================================================ */

function loadStudents() {

    const saved =
        localStorage.getItem(
            STUDENT_DATABASE_KEY
        );


    if (saved) {

        try {

            const parsed =
                JSON.parse(saved);

            if (Array.isArray(parsed)) {

                students = parsed;

                return;

            }

        } catch (error) {

            console.error(
                "Saved student database error:",
                error
            );

        }

    }


    if (
        typeof STUDENTS !== "undefined" &&
        Array.isArray(STUDENTS)
    ) {

        students =
            STUDENTS.map(function(student) {

                return {

                    studentNumber:
                        String(
                            student.studentNumber
                        ).trim(),

                    name:
                        String(
                            student.name || ""
                        ).trim(),

                    year:
                        String(
                            student.year || ""
                        ).trim(),

                    section:
                        String(
                            student.section || ""
                        ).trim()

                };

            });


        saveStudents();

    }

}


/* ============================================================
   SAVE STUDENTS
   ============================================================ */

function saveStudents() {

    localStorage.setItem(
        STUDENT_DATABASE_KEY,
        JSON.stringify(students)
    );

}


/* ============================================================
   MESSAGE
   ============================================================ */

function showManagementResult(
    message,
    success
) {

    const result =
        document.getElementById(
            "studentManagementResult"
        );


    if (!result) {
        return;
    }


    result.textContent =
        message;


    result.className =
        success
            ? "result success"
            : "result error";

}


/* ============================================================
   CLEAR FORM
   ============================================================ */

function clearStudentForm() {

    document.getElementById(
        "manageStudentNumber"
    ).value = "";


    document.getElementById(
        "manageStudentName"
    ).value = "";


    document.getElementById(
        "manageStudentYear"
    ).value = "";


    document.getElementById(
        "manageStudentSection"
    ).value = "";


    editingStudentNumber =
        null;

}


/* ============================================================
   ADD
   ============================================================ */

function addStudent() {

    const studentNumber =
        document.getElementById(
            "manageStudentNumber"
        ).value.trim();


    const name =
        document.getElementById(
            "manageStudentName"
        ).value.trim();


    const year =
        document.getElementById(
            "manageStudentYear"
        ).value.trim();


    const section =
        document.getElementById(
            "manageStudentSection"
        ).value.trim();


    if (
        !studentNumber ||
        !name ||
        !year ||
        !section
    ) {

        showManagementResult(
            "Please complete all student fields.",
            false
        );

        return;

    }


    const duplicate =
        students.some(function(student) {

            return (
                String(
                    student.studentNumber
                ).trim() ===
                studentNumber
            );

        });


    if (duplicate) {

        showManagementResult(
            "That student number already exists.",
            false
        );

        return;

    }


    students.push({

        studentNumber:
            studentNumber,

        name:
            name,

        year:
            year,

        section:
            section

    });


    saveStudents();

    renderStudents();

    clearStudentForm();


    showManagementResult(
        name +
        " was added successfully.",
        true
    );

}


/* ============================================================
   EDIT
   ============================================================ */

function editStudent(
    studentNumber
) {

    const student =
        students.find(function(item) {

            return (
                String(
                    item.studentNumber
                ) ===
                String(studentNumber)
            );

        });


    if (!student) {
        return;
    }


    document.getElementById(
        "manageStudentNumber"
    ).value =
        student.studentNumber;


    document.getElementById(
        "manageStudentName"
    ).value =
        student.name;


    document.getElementById(
        "manageStudentYear"
    ).value =
        student.year;


    document.getElementById(
        "manageStudentSection"
    ).value =
        student.section;


    editingStudentNumber =
        student.studentNumber;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    showManagementResult(
        "Editing " +
        student.name +
        ".",
        true
    );

}


/* ============================================================
   UPDATE
   ============================================================ */

function updateStudent() {

    if (!editingStudentNumber) {

        showManagementResult(
            "Select a student to edit first.",
            false
        );

        return;

    }


    const studentNumber =
        document.getElementById(
            "manageStudentNumber"
        ).value.trim();


    const name =
        document.getElementById(
            "manageStudentName"
        ).value.trim();


    const year =
        document.getElementById(
            "manageStudentYear"
        ).value.trim();


    const section =
        document.getElementById(
            "manageStudentSection"
        ).value.trim();


    if (
        !studentNumber ||
        !name ||
        !year ||
        !section
    ) {

        showManagementResult(
            "Please complete all student fields.",
            false
        );

        return;

    }


    const duplicate =
        students.some(function(student) {

            return (
                String(
                    student.studentNumber
                ) ===
                studentNumber &&

                String(
                    student.studentNumber
                ) !==
                String(editingStudentNumber)
            );

        });


    if (duplicate) {

        showManagementResult(
            "That student number already exists.",
            false
        );

        return;

    }


    const index =
        students.findIndex(function(student) {

            return (
                String(
                    student.studentNumber
                ) ===
                String(editingStudentNumber)
            );

        });


    if (index === -1) {

        showManagementResult(
            "Student could not be found.",
            false
        );

        return;

    }


    students[index] = {

        studentNumber:
            studentNumber,

        name:
            name,

        year:
            year,

        section:
            section

    };


    saveStudents();

    renderStudents();

    clearStudentForm();


    showManagementResult(
        name +
        " was updated successfully.",
        true
    );

}


/* ============================================================
   DELETE
   ============================================================ */

function deleteStudent(
    studentNumber
) {

    const student =
        students.find(function(item) {

            return (
                String(
                    item.studentNumber
                ) ===
                String(studentNumber)
            );

        });


    if (!student) {
        return;
    }


    const confirmed =
        confirm(
            "Delete " +
            student.name +
            " (" +
            student.studentNumber +
            ")?"
        );


    if (!confirmed) {
        return;
    }


    students =
        students.filter(function(item) {

            return (
                String(
                    item.studentNumber
                ) !==
                String(studentNumber)
            );

        });


    saveStudents();

    renderStudents();

    clearStudentForm();


    showManagementResult(
        student.name +
        " was deleted.",
        true
    );

}


/* ============================================================
   RENDER
   ============================================================ */

function renderStudents() {

    const list =
        document.getElementById(
            "studentManagementList"
        );


    const count =
        document.getElementById(
            "studentManagementCount"
        );


    const search =
        document.getElementById(
            "studentManagementSearch"
        )
            .value
            .trim()
            .toLowerCase();


    const filtered =
        students
            .filter(function(student) {

                if (!search) {
                    return true;
                }


                return (

                    String(
                        student.studentNumber
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.name
                    )
                    .toLowerCase()
                    .includes(search)

                );

            })
            .slice()
            .sort(function(a, b) {

                return a.name.localeCompare(
                    b.name
                );

            });


    count.textContent =
        students.length +
        (
            students.length === 1
                ? " student"
                : " students"
        );


    list.innerHTML = "";


    if (filtered.length === 0) {

        list.innerHTML =
            '<p class="empty">' +
            'No students found.' +
            '</p>';

        return;

    }


    filtered.forEach(
        function(student) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
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


            const details =
                document.createElement(
                    "div"
                );


            details.textContent =
                student.studentNumber +
                " · " +
                student.year +
                " · " +
                student.section;


            information.appendChild(
                name
            );


            information.appendChild(
                details
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


            editButton.addEventListener(
                "click",
                function() {

                    editStudent(
                        student.studentNumber
                    );

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                function() {

                    deleteStudent(
                        student.studentNumber
                    );

                }
            );


            actions.appendChild(
                editButton
            );


            actions.appendChild(
                deleteButton
            );


            card.appendChild(
                information
            );


            card.appendChild(
                actions
            );


            list.appendChild(
                card
            );

        }
    );

}


/* ============================================================
   EVENTS
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadStudents();

        renderStudents();


        document
            .getElementById(
                "addStudentButton"
            )
            .addEventListener(
                "click",
                addStudent
            );


        document
            .getElementById(
                "updateStudentButton"
            )
            .addEventListener(
                "click",
                updateStudent
            );


        document
            .getElementById(
                "cancelStudentEditButton"
            )
            .addEventListener(
                "click",
                function() {

                    clearStudentForm();

                    showManagementResult(
                        "",
                        true
                    );

                }
            );


        document
            .getElementById(
                "studentManagementSearch"
            )
            .addEventListener(
                "input",
                renderStudents
            );


        document
            .getElementById(
                "backToAttendanceButton"
            )
            .addEventListener(
                "click",
                function() {

                    window.location.href =
                        "index.html";

                }
            );

    }
);

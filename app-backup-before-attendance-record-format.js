const ATTENDANCE_KEY = "offline_attendance_records";

function getSelectedSubject() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const subjectId =
        params.get("subject");

    /*
     * SUBJECTS comes from:
     *
     * data/subjects.js
     *
     * This means the attendance page uses
     * the same editable subjects as the
     * Home page.
     */

    if (
        subjectId &&
        typeof SUBJECTS !== "undefined" &&
        Array.isArray(SUBJECTS)
    ) {

        const subject =
            SUBJECTS.find(function(item) {

                return String(item.id) ===
                    String(subjectId);

            });


        if (subject) {

            return {

                id:
                    subject.id,

                name:
                    subject.name,

                code:
                    subject.code,

                icon:
                    subject.icon || "📚"

            };

        }

    }


    /*
     * NO VALID SUBJECT
     *
     * Never silently use "Attendance".
     * A missing subject is an error.
     */

    console.error(
        "No valid subject was selected."
    );

    return null;

}


const CURRENT_SUBJECT =
    getSelectedSubject();

function displayCurrentSubject() {

    const subjectName =
        document.getElementById(
            "currentSubjectName"
        );

    if (subjectName) {

        subjectName.textContent =
            CURRENT_SUBJECT.name;

    }

}





/* GOOGLE SHEETS */

const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbyqXobLts8lxeWDeD5uos6YIDSbnc3Y14PeGZnD3pJ39HoVIV37AjLo7TZ4JhVbg2fH7w/exec";


let students = [];


/* LOAD STUDENTS */

async function loadStudents() {

    const STUDENT_DATABASE_KEY =
        "jnx_student_database";


    /*
     * PRIMARY DATABASE
     *
     * Attendance Checker uses the same
     * local database as Student Management.
     *
     * This allows student records added,
     * edited, or deleted by the Mayor
     * to immediately become available
     * to the attendance system.
     */

    try {

        const saved =
            localStorage.getItem(
                STUDENT_DATABASE_KEY
            );


        if (saved) {

            const parsed =
                JSON.parse(saved);


            if (Array.isArray(parsed)) {

                students =
                    parsed.map(function(student) {

                        return {

                            studentNumber:
                                String(
                                    student.studentNumber || ""
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

                    }).filter(function(student) {

                        return (
                            student.studentNumber &&
                            student.name
                        );

                    });


                console.log(
                    students.length +
                    " students loaded from local student database."
                );

                return;

            }

        }

    } catch (error) {

        console.error(
            "Could not read local student database:",
            error
        );

    }


    /*
     * FIRST-RUN FALLBACK
     *
     * If the local database does not exist yet,
     * initialize it from data/students.js.
     */

    if (
        typeof STUDENTS !== "undefined" &&
        Array.isArray(STUDENTS)
    ) {

        students =
            STUDENTS.map(function(student) {

                return {

                    studentNumber:
                        String(
                            student.studentNumber || ""
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


        localStorage.setItem(
            STUDENT_DATABASE_KEY,
            JSON.stringify(students)
        );


        console.log(
            students.length +
            " students initialized into local student database."
        );

        return;

    }


    console.error(
        "Local student database was not loaded."
    );


    showResult(
        "Student database could not be loaded.",
        false
    );

}


/* CSV PARSER */

function parseCSV(csv) {

    const lines =
        csv.trim().split("\n");

    if (lines.length < 2) {
        return [];
    }

    const result = [];

    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const columns =
            lines[i]
                .split(",")
                .map(function(value) {
                    return value.trim();
                });

        if (!columns[0]) {
            continue;
        }

        result.push({

            studentNumber:
                columns[0],

            name:
                columns[1] || "",

            year:
                columns[2] || "",

            section:
                columns[3] || ""

        });
    }

    return result;
}


/* DATE */

function getToday() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* TIME */

function getCurrentTime() {

    return new Date()
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

}


/* LOAD ATTENDANCE */

function getAttendance() {

    return getAttendanceDatabase();

}


/* SAVE ATTENDANCE */

function saveAttendance(records) {

    saveAttendanceDatabase(records);

}


/* FIND STUDENTS */

function findStudents(searchTerm) {

    const search =
        String(searchTerm || "").trim().toLowerCase();

    if (!search) {
        return [];
    }

    return students.filter(function(student) {

        const number =
            String(student.studentNumber || "")
                .trim()
                .toLowerCase();

        const name =
            String(student.name || "")
                .trim()
                .toLowerCase();

        const parts = name.split(/\s+/);

        const surname =
            parts.length > 1
                ? parts[parts.length - 1]
                : name;

        return (
            number === search ||
            surname === search
        );

    });

}


/* MARK ATTENDANCE */

async function markAttendance(selectedStudent) {

    if (students.length === 0) {
        await loadStudents();
    }

    const input =
        document.getElementById("studentNumber");

    const searchTerm =
        input.value.trim();

    if (!searchTerm && !selectedStudent) {

        showResult(
            "Please enter a student number or surname.",
            false
        );

        input.focus();

        return;
    }

    let student = selectedStudent;

    if (!student) {

        const matches =
            findStudents(searchTerm);

        if (matches.length === 0) {

            showResult(
                "Student number or surname not found.",
                false
            );

            input.select();

            return;
        }

        if (matches.length > 1) {

            showStudentChoices(matches);

            showResult(
                "Multiple students found. Select the correct student.",
                false
            );

            return;
        }

        student = matches[0];
    }

    recordStudentAttendance(student);

}


/* SHOW STUDENT OPTIONS */

function showStudentChoices(matches) {

    const container =
        document.getElementById("studentChoices");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const heading =
        document.createElement("div");

    heading.className =
        "choices-heading";

    heading.textContent =
        "Select the correct student:";

    container.appendChild(heading);


    matches.forEach(function(student) {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "student-choice";


        const fullName =
            document.createElement("div");

        fullName.className =
            "choice-name";

        fullName.textContent =
            student.name;


        const details =
            document.createElement("div");

        details.className =
            "choice-details";

        details.textContent =
            student.studentNumber +
            " · " +
            student.year +
            " · " +
            student.section;


        button.appendChild(fullName);

        button.appendChild(details);


        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                container.innerHTML = "";

                recordStudentAttendance(student);

            }
        );


        container.appendChild(button);

    });

}


/* RECORD ATTENDANCE */

function recordStudentAttendance(student) {

    const input =
        document.getElementById("studentNumber");

    const attendance =
        getAttendance();

    const today =
        getToday();

    /*
     * DUPLICATE CHECK
     *
     * A student may attend multiple subjects
     * on the same day.
     *
     * Therefore the unique attendance record is:
     *
     * SUBJECT + STUDENT NUMBER + DATE
     */

    const existing =
        attendance.find(function(record) {

            return (

                String(record.subject) ===
                String(CURRENT_SUBJECT.id) &&

                String(record.studentNumber) ===
                String(student.studentNumber) &&

                String(record.date) ===
                String(today)

            );

        });


    if (existing) {

        showResult(
            student.name +
            " is already PRESENT in " +
            CURRENT_SUBJECT.name +
            " today at " +
            existing.time,
            false
        );

        input.select();

        return;
    }


    const record = {

        subject:
            CURRENT_SUBJECT.id,

        subjectName:
            CURRENT_SUBJECT.name,

        studentNumber:
            student.studentNumber,

        name:
            student.name,

        year:
            student.year,

        section:
            student.section,

        date:
            today,

        time:
            getCurrentTime(),

        status:
            "PRESENT"

    };


    attendance.push(record);

    saveAttendance(attendance);

    /*
     * SAVE TO GOOGLE SHEETS
     *
     * The local database is saved first.
     * Google Sheets synchronization happens separately.
     */

    syncAttendanceRecord(record);


    showResult(
        student.name +
        " marked PRESENT.",
        true
    );


    input.value = "";

    input.focus();


    const choices =
        document.getElementById(
            "studentChoices"
        );

    choices.innerHTML = "";


    renderAttendance();

}


/* MESSAGE */

function showResult(
    message,
    success
) {

    const result =
        document.getElementById(
            "result"
        );


    result.textContent =
        message;


    result.className =
        success
            ? "result success"
            : "result error";

}


/* DISPLAY ATTENDANCE */

function renderAttendance() {

    const list =
        document.getElementById("attendanceList");

    const count =
        document.getElementById("attendanceCount");

    if (!list || !count) {
        return;
    }

    const attendance =
        getAttendance();

    const today =
        getToday();

    const todayRecords =
        attendance.filter(function(record) {

            return (
                String(record.date) ===
                String(today) &&

                String(record.subject) ===
                String(CURRENT_SUBJECT.id)
            );

        });


    count.textContent =
        String(todayRecords.length);


    if (todayRecords.length === 0) {

        list.innerHTML =
            '<p class="empty">' +
            'No attendance recorded yet.' +
            '</p>';

        return;
    }


    list.innerHTML = "";


    todayRecords
        .slice()
        .reverse()
        .forEach(function(record) {

            const div =
                document.createElement("div");

            div.className =
                "attendance-record";


            const name =
                document.createElement("div");

            name.className =
                "student-name";

            name.textContent =
                record.name;


            const information =
                document.createElement("div");

            information.textContent =
                record.studentNumber +
                " · " +
                record.year +
                " · " +
                record.section;


            const time =
                document.createElement("div");

            time.className =
                "student-time";

            time.textContent =
                record.date +
                " · " +
                record.time +
                " · " +
                record.status;


            div.appendChild(name);

            div.appendChild(information);

            div.appendChild(time);

            list.appendChild(div);

        });

}


function clearTodayAttendance() {

    const today =
        getToday();

    const attendance =
        getAttendance();

    const remaining =
        attendance.filter(function(record) {

            return record.date !== today;

        });

    saveAttendance(remaining);

    showResult(
        "Today's attendance has been cleared.",
        true
    );

    renderAttendance();

}


/* EXPORT ATTENDANCE */

function exportAttendance() {

    const attendance =
        getAttendance();

    if (attendance.length === 0) {

        showResult(
            "There are no attendance records to export.",
            false
        );

        return;
    }


    const headers = [
        "Student Number",
        "Name",
        "Year",
        "Section",
        "Date",
        "Time",
        "Status"
    ];


    const rows = attendance.map(
        function(record) {

            return [
                record.studentNumber,
                record.name,
                record.year,
                record.section,
                record.date,
                record.time,
                record.status
            ];

        }
    );


    const csv = [
        headers,
        ...rows
    ]
        .map(function(row) {

            return row
                .map(function(value) {

                    const text =
                        String(value ?? "");

                    return '"' +
                        text.replace(
                            /"/g,
                            '""'
                        ) +
                        '"';

                })
                .join(",");

        })
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;


    const today =
        getToday();

    link.download =
        "attendance-" +
        today +
        ".csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    showResult(
        "Attendance exported successfully.",
        true
    );

}


/* ATTENDANCE BUTTON */

document
    .getElementById("attendanceButton")
    .addEventListener(
        "click",
        function() {
            markAttendance();
        }
    );


/* CLEAR ATTENDANCE BUTTON */

document
    .getElementById("clearAttendanceButton")
    .addEventListener(
        "click",
        function() {

            if (
                confirm(
                    "Clear all attendance records for today?"
                )
            ) {

                clearTodayAttendance();

            }

        }
    );


/* EXPORT BUTTON */

const exportAttendanceButton =
    document.getElementById(
        "exportAttendanceButton"
    );

if (exportAttendanceButton) {

    exportAttendanceButton.addEventListener(
        "click",
        exportAttendance
    );

}


/* ENTER KEY */

const studentInput =
    document.getElementById("studentNumber");

if (studentInput) {

    studentInput.addEventListener(
        "keydown",
        async function(event) {

            if (event.key === "Enter") {

                event.preventDefault();
                event.stopPropagation();

                await markAttendance();

            }

        }
    );

}


/* START */



loadStudents();

renderAttendance();

/* ============================================================
   GOOGLE SHEETS SYNC
   ============================================================ */

const GOOGLE_SYNC_KEY =
    "jnx_google_sheets_pending";


function getPendingGoogleRecords() {

    const saved =
        localStorage.getItem(
            GOOGLE_SYNC_KEY
        );

    if (!saved) {
        return [];
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        return [];

    }
}


function savePendingGoogleRecords(records) {

    localStorage.setItem(
        GOOGLE_SYNC_KEY,
        JSON.stringify(records)
    );

}


/*
 * SEND ONE ATTENDANCE RECORD TO GOOGLE SHEETS
 */

async function sendAttendanceToGoogle(record) {

    if (!navigator.onLine) {

        throw new Error(
            "Device is offline."
        );

    }


    await fetch(
        GOOGLE_SHEETS_URL,
        {
            method: "POST",

            mode: "no-cors",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify({

                subject:
                    record.subject,

                subjectName:
                    record.subjectName,

                studentNumber:
                    record.studentNumber,

                name:
                    record.name,

                year:
                    record.year,

                section:
                    record.section,

                date:
                    record.date,

                time:
                    record.time

            })
        }
    );

}


/*
 * ADD RECORD TO GOOGLE SYNC QUEUE
 */

function queueGoogleRecord(record) {

    const pending =
        getPendingGoogleRecords();


    const alreadyQueued =
        pending.some(function(item) {

            return (
                String(item.subject) ===
                String(record.subject) &&

                String(item.studentNumber) ===
                String(record.studentNumber) &&

                item.date ===
                record.date
            );

        });


    if (!alreadyQueued) {

        pending.push(record);

        savePendingGoogleRecords(
            pending
        );

    }

}


/*
 * TRY TO SEND A RECORD
 */

async function syncAttendanceRecord(record) {

    try {

        await sendAttendanceToGoogle(
            record
        );

        console.log(
            "Attendance sent to Google Sheets:",
            record.name
        );

        return true;

    } catch (error) {

        console.log(
            "Google Sheets unavailable. Attendance kept offline."
        );

        queueGoogleRecord(
            record
        );

        return false;

    }

}


/*
 * RETRY RECORDS THAT WERE SAVED OFFLINE
 */

async function syncPendingGoogleRecords() {

    if (!navigator.onLine) {
        return;
    }


    const pending =
        getPendingGoogleRecords();


    if (pending.length === 0) {
        return;
    }


    const remaining = [];


    for (
        const record of pending
    ) {

        try {

            await sendAttendanceToGoogle(
                record
            );

            console.log(
                "Offline attendance synchronized:",
                record.name
            );

        } catch (error) {

            remaining.push(
                record
            );

        }

    }


    savePendingGoogleRecords(
        remaining
    );

}


/*
 * AUTOMATIC INTERNET RECOVERY
 */

window.addEventListener(
    "online",
    function() {

        console.log(
            "Internet connection restored."
        );

        syncPendingGoogleRecords();

    }
);


/*
 * TRY PENDING RECORDS WHEN APP STARTS
 */

window.addEventListener(
    "load",
    function() {

        syncPendingGoogleRecords();

    }
);



/* ============================================================
   STUDENT MANAGEMENT
   ============================================================ */

const STUDENT_DATABASE_KEY =
    "jnx_student_database";


let editingStudentNumber = null;


/* LOAD EDITABLE STUDENT DATABASE */

function loadEditableStudents() {

    const saved =
        localStorage.getItem(
            STUDENT_DATABASE_KEY
        );

    if (!saved) {

        /*
         * First installation:
         * copy the original STUDENTS database
         * into the editable local database.
         */

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

            saveEditableStudents();

        }

        return;
    }


    try {

        const parsed =
            JSON.parse(saved);

        if (Array.isArray(parsed)) {

            students = parsed;

        }

    } catch (error) {

        console.error(
            "Student database error:",
            error
        );

    }

}


/* SAVE STUDENT DATABASE */

function saveEditableStudents() {

    localStorage.setItem(
        STUDENT_DATABASE_KEY,
        JSON.stringify(students)
    );

}


/* SHOW MANAGEMENT MESSAGE */

function showStudentManagementResult(
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


/* CLEAR STUDENT FORM */

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


/* ADD STUDENT */

function addManagedStudent() {

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

        showStudentManagementResult(
            "Please complete all student fields.",
            false
        );

        return;
    }


    const exists =
        students.some(function(student) {

            return (
                String(
                    student.studentNumber
                ).trim() ===
                studentNumber
            );

        });


    if (exists) {

        showStudentManagementResult(
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


    saveEditableStudents();

    renderStudentManagement();

    clearStudentForm();


    showStudentManagementResult(
        name +
        " has been added successfully.",
        true
    );

}


/* EDIT STUDENT */

function editManagedStudent(
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


    showStudentManagementResult(
        "Editing " +
        student.name +
        ".",
        true
    );

}


/* UPDATE STUDENT */

function updateManagedStudent() {

    if (!editingStudentNumber) {

        showStudentManagementResult(
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

        showStudentManagementResult(
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

        showStudentManagementResult(
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

        showStudentManagementResult(
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


    saveEditableStudents();

    renderStudentManagement();

    clearStudentForm();


    showStudentManagementResult(
        name +
        " has been updated successfully.",
        true
    );

}


/* DELETE STUDENT */

function deleteManagedStudent(
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


    saveEditableStudents();

    renderStudentManagement();

    clearStudentForm();


    showStudentManagementResult(
        student.name +
        " has been deleted.",
        true
    );

}


/* RENDER STUDENT MANAGEMENT */

function renderStudentManagement() {

    const list =
        document.getElementById(
            "studentManagementList"
        );

    const count =
        document.getElementById(
            "studentManagementCount"
        );

    const searchInput =
        document.getElementById(
            "studentManagementSearch"
        );


    if (
        !list ||
        !count ||
        !searchInput
    ) {

        return;

    }


    const search =
        searchInput.value
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

                    editManagedStudent(
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

                    deleteManagedStudent(
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


/* STUDENT MANAGEMENT EVENTS */

function initializeStudentManagement() {

    loadEditableStudents();


    const addButton =
        document.getElementById(
            "addStudentButton"
        );

    const updateButton =
        document.getElementById(
            "updateStudentButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelStudentEditButton"
        );

    const searchInput =
        document.getElementById(
            "studentManagementSearch"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            addManagedStudent
        );

    }


    if (updateButton) {

        updateButton.addEventListener(
            "click",
            updateManagedStudent
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function() {

                clearStudentForm();

                showStudentManagementResult(
                    "",
                    true
                );

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderStudentManagement
        );

    }


    renderStudentManagement();

}


/* START STUDENT MANAGEMENT */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeStudentManagement
    );

} else {

    initializeStudentManagement();

}



displayCurrentSubject();

const ATTENDANCE_KEY = "offline_attendance_records";

/* GOOGLE SHEETS */

const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbyqXobLts8lxeWDeD5uos6YIDSbnc3Y14PeGZnD3pJ39HoVIV37AjLo7TZ4JhVbg2fH7w/exec";


let students = [];


/* LOAD STUDENTS */

async function loadStudents() {

    if (
        typeof STUDENTS !== "undefined" &&
        Array.isArray(STUDENTS)
    ) {

        students = STUDENTS.slice();

        console.log(
            students.length +
            " students loaded from local database."
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

    const existing =
        attendance.find(function(record) {

            return (
                String(record.studentNumber) ===
                String(student.studentNumber) &&

                record.date ===
                today
            );

        });


    if (existing) {

        showResult(
            student.name +
            " is already PRESENT today at " +
            existing.time,
            false
        );

        input.select();

        return;
    }


    const record = {

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

            return String(record.date) ===
                   String(today);

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


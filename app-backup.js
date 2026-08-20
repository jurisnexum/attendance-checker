const students = {
    "250001": {
        name: "Keith Soriano",
        year: "4th Year",
        section: "A"
    },
    "250002": {
        name: "Juan Dela Cruz",
        year: "4th Year",
        section: "A"
    },
    "250003": {
        name: "Maria Santos",
        year: "3rd Year",
        section: "B"
    }
};

const ATTENDANCE_KEY = "jnx_offline_attendance";

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getAttendance() {
    const saved = localStorage.getItem(ATTENDANCE_KEY);

    if (!saved) {
        return [];
    }

    return JSON.parse(saved);
}

function saveAttendance(records) {
    localStorage.setItem(
        ATTENDANCE_KEY,
        JSON.stringify(records)
    );
}

function markAttendance() {

    const input =
        document.getElementById("studentNumber");

    const studentNumber =
        input.value.trim();

    if (!studentNumber) {
        showResult(
            "Please enter a student number.",
            false
        );
        return;
    }

    const student =
        students[studentNumber];

    if (!student) {
        showResult(
            "Student number not found.",
            false
        );
        return;
    }

    const attendance =
        getAttendance();

    const today =
        getToday();

    const existing =
        attendance.find(function(record) {

            return (
                record.studentNumber === studentNumber &&
                record.date === today
            );

        });

    if (existing) {

        showResult(
            student.name +
            " is already PRESENT today at " +
            existing.time +
            ".",
            false
        );

        return;
    }

    const record = {
        studentNumber: studentNumber,
        name: student.name,
        year: student.year,
        section: student.section,
        date: today,
        time: getCurrentTime(),
        status: "PRESENT"
    };

    attendance.push(record);

    saveAttendance(attendance);

    showResult(
        student.name +
        " marked PRESENT.",
        true
    );

    input.value = "";

    renderAttendance();
}

function showResult(message, success) {

    const result =
        document.getElementById("result");

    result.textContent =
        message;

    if (success) {
        result.className =
            "result success";
    } else {
        result.className =
            "result error";
    }
}

function renderAttendance() {

    const list =
        document.getElementById(
            "attendanceList"
        );

    const count =
        document.getElementById(
            "attendanceCount"
        );

    const attendance =
        getAttendance();

    const today =
        getToday();

    const todayRecords =
        attendance.filter(function(record) {

            return record.date === today;

        });

    count.textContent =
        todayRecords.length;

    if (todayRecords.length === 0) {

        list.innerHTML =
            '<p class="empty">No attendance recorded yet.</p>';

        return;
    }

    list.innerHTML = "";

    todayRecords.reverse();

    todayRecords.forEach(function(record) {

        const div =
            document.createElement("div");

        div.className =
            "attendance-record";

        div.innerHTML =
            '<div class="student-name">' +
            record.name +
            '</div>' +

            '<div>' +
            record.studentNumber +
            ' · ' +
            record.year +
            ' · ' +
            record.section +
            '</div>' +

            '<div class="student-time">' +
            record.time +
            ' · PRESENT' +
            '</div>';

        list.appendChild(div);
    });
}

document
    .getElementById("attendanceButton")
    .addEventListener(
        "click",
        markAttendance
    );

document
    .getElementById("studentNumber")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {
                markAttendance();
            }

        }
    );

renderAttendance();
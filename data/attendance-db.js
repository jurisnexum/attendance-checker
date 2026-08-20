const JNX_ATTENDANCE_DB = "jnx_offline_attendance_v1";

function getAttendanceDatabase() {

    const saved =
        localStorage.getItem(JNX_ATTENDANCE_DB);

    if (!saved) {
        return [];
    }

    try {

        const records = JSON.parse(saved);

        return Array.isArray(records)
            ? records
            : [];

    } catch (error) {

        console.error(
            "Attendance database error:",
            error
        );

        return [];
    }
}


function saveAttendanceDatabase(records) {

    localStorage.setItem(
        JNX_ATTENDANCE_DB,
        JSON.stringify(records)
    );

}


function addAttendanceRecord(record) {

    const records =
        getAttendanceDatabase();

    records.push(record);

    saveAttendanceDatabase(records);

    return records;
}

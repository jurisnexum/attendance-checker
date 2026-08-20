const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const EXCEL_FOLDER = path.join(__dirname);
const EXCEL_FILE = path.join(
    EXCEL_FOLDER,
    "JNX-Attendance.xlsx"
);


/*
 * CREATE OR OPEN THE ATTENDANCE EXCEL FILE
 */

async function openAttendanceWorkbook() {

    const workbook = new ExcelJS.Workbook();

    if (fs.existsSync(EXCEL_FILE)) {

        await workbook.xlsx.readFile(
            EXCEL_FILE
        );

    } else {

        const worksheet =
            workbook.addWorksheet(
                "Attendance"
            );

        worksheet.columns = [

            {
                header: "Student Number",
                key: "studentNumber",
                width: 18
            },

            {
                header: "Name",
                key: "name",
                width: 30
            },

            {
                header: "Year",
                key: "year",
                width: 15
            },

            {
                header: "Section",
                key: "section",
                width: 12
            },

            {
                header: "Date",
                key: "date",
                width: 15
            },

            {
                header: "Time",
                key: "time",
                width: 15
            },

            {
                header: "Status",
                key: "status",
                width: 15
            }

        ];

        worksheet.getRow(1).font = {
            bold: true
        };

        await workbook.xlsx.writeFile(
            EXCEL_FILE
        );
    }

    return workbook;
}


/*
 * SAVE ONE ATTENDANCE RECORD
 */

async function saveAttendanceToExcel(record) {

    const workbook =
        await openAttendanceWorkbook();

    let worksheet =
        workbook.getWorksheet(
            "Attendance"
        );

    if (!worksheet) {

        worksheet =
            workbook.addWorksheet(
                "Attendance"
            );
    }

    worksheet.addRow({

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
            record.time,

        status:
            record.status

    });

    await workbook.xlsx.writeFile(
        EXCEL_FILE
    );

    return EXCEL_FILE;
}


module.exports = {
    saveAttendanceToExcel,
    openAttendanceWorkbook,
    EXCEL_FILE
};

/**
 * نظام إدارة وتحليل نتائج الطلاب - ملف التشغيل الرئيسي (main.js)
 */

class Student {
    #grades;
    #attendance;

    constructor(name, grades, attendance) {
        this.name = name;
        this.setGrades(grades);
        this.setAttendance(attendance);
    }

    setGrades(gradesArray) {
        if (!Array.isArray(gradesArray) || gradesArray.length === 0) {
            throw new Error("يجب إدخال مصفوفة صحيحة للدرجات.");
        }
        for (let grade of gradesArray) {
            if (grade === "" || grade === null || isNaN(grade) || grade < 0 || grade > 100) {
                throw new Error("خطأ في الأمان: يجب أن تكون جميع درجات المواد أرقاماً بين 0 و 100 ولا يمكن تركها فارغة!");
            }
        }
        this.#grades = gradesArray.map(Number);
    }

    setAttendance(value) {
        if (value === "" || value === null || isNaN(value) || value < 0 || value > 100) {
            throw new Error("خطأ في الأمان: نسبة الحضور يجب أن تكون رقماً بين 0 و 100 حصراً!");
        }
        this.#attendance = Number(value);
    }

    get grades() { return this.#grades; }
    get attendance() { return this.#attendance; }

    calculateAverage() {
        const sum = this.#grades.reduce((total, grade) => total + grade, 0);
        return Number((sum / this.#grades.length).toFixed(2));
    }

    getFinalStatus() {
        const avg = this.calculateAverage();
        return (avg >= 50 && this.#attendance >= 75) ? "ناجح" : "يحتاج مراجعة";
    }
}

const studentsList = [];

const nameInput = document.getElementById("student-name");
const grade1Input = document.getElementById("grade-1");
const grade2Input = document.getElementById("grade-2");
const grade3Input = document.getElementById("grade-3");
const attendanceInput = document.getElementById("attendance");
const addBtn = document.getElementById("add-student-btn");
const clemencyBtn = document.getElementById("clemency-btn");
const errorBox = document.getElementById("error-box");
const studentsContainer = document.getElementById("students-list-container");
const clemencyContainer = document.getElementById("clemency-report-container");

function renderStudentsTable() {
    if (studentsList.length === 0) {
        studentsContainer.innerHTML = `<p class="text-muted">لم يتم تسجيل أي طلاب حتى الآن.</p>`;
        return;
    }

    let html = `
        <table class="table table-dark table-striped table-bordered text-center align-middle">
            <thead>
                <tr>
                    <th>اسم الطالب</th>
                    <th>المتوسط</th>
                    <th>الحضور</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
    `;

    studentsList.forEach(student => {
        const avg = student.calculateAverage();
        const status = student.getFinalStatus();
        const statusBadge = status === "ناجح" ? '<span class="badge bg-success">ناجح</span>' : '<span class="badge bg-danger">يحتاج مراجعة</span>';

        html += `
            <tr>
                <td>${student.name}</td>
                <td>${avg}%</td>
                <td>${student.attendance}%</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    studentsContainer.innerHTML = html;
}

addBtn.addEventListener("click", () => {
    errorBox.classList.add("d-none");
    errorBox.innerText = "";

    try {
        const name = nameInput.value.trim();
        if (name === "") {
            throw new Error("يجب كتابة اسم الطالب ولا يمكن ترك الحقل فارغاً.");
        }

        const g1 = grade1Input.value;
        const g2 = grade2Input.value;
        const g3 = grade3Input.value;
        const att = attendanceInput.value;

        const newStudent = new Student(name, [g1, g2, g3], att);
        studentsList.push(newStudent);
        renderStudentsTable();

        nameInput.value = "";
        grade1Input.value = "";
        grade2Input.value = "";
        grade3Input.value = "";
        attendanceInput.value = "";

    } catch (error) {
        errorBox.classList.remove("d-none");
        errorBox.innerText = error.message;
    }
});

clemencyBtn.addEventListener("click", () => {
    const strugglingStudents = studentsList.filter(student => {
        const avg = student.calculateAverage();
        return avg >= 40 && avg < 49.99;
    });

    if (strugglingStudents.length === 0) {
        clemencyContainer.innerHTML = `<div class="alert alert-warning">لا توجد حالات متعثرة تنطبق عليها شروط لجنة الرأفة (المتوسط بين 40 و 49).</div>`;
        return;
    }

    const bolsteredStudents = strugglingStudents.map(student => {
        const oldAvg = student.calculateAverage();
        let newAvg = oldAvg + 5;
        if (newAvg > 100) newAvg = 100;
        return {
            name: student.name,
            oldAvg: oldAvg,
            newAvg: Number(newAvg.toFixed(2)),
            status: newAvg >= 50 ? "ناجح بالرأفة" : "يحتاج مراجعة"
        };
    });

    const totalNewAverages = bolsteredStudents.reduce((sum, item) => sum + item.newAvg, 0);
    const overallClemencyAverage = bolsteredStudents.length > 0 ? (totalNewAverages / bolsteredStudents.length).toFixed(2) : 0;

    let reportHtml = `
        <div class="alert alert-info">
            <h5>📈 المتوسط العام للطلاب المتعثرين بعد الرأفة: <b>${overallClemencyAverage}%</b></h5>
            <p class="mb-0">عدد الطلاب المستفيدين من لجنة الرأفة: <b>${bolsteredStudents.length}</b></p>
        </div>
        <table class="table table-sm table-dark text-center align-middle">
            <thead>
                <tr>
                    <th>اسم الطالب</th>
                    <th>المتوسط السابق</th>
                    <th>المتوسط بعد الرأفة</th>
                    <th>الحالة الجديدة</th>
                </tr>
            </thead>
            <tbody>
    `;

    bolsteredStudents.forEach(item => {
        reportHtml += `
            <tr>
                <td>${item.name}</td>
                <td class="text-danger">${item.oldAvg}%</td>
                <td class="text-success fw-bold">${item.newAvg}%</td>
                <td><span class="badge bg-warning text-dark">${item.status}</span></td>
            </tr>
        `;
    });

    reportHtml += `</tbody></table>`;
    clemencyContainer.innerHTML = reportHtml;
});

const API_URL =
    "https://jkxiiaup3b.execute-api.us-east-1.amazonaws.com/dev";

// Submit student data
document.getElementById("studentForm")
.addEventListener("submit", async function(event) {

    event.preventDefault();

    const student = {
        studentId: document.getElementById("studentId").value.trim(),
        name: document.getElementById("name").value.trim(),
        course: document.getElementById("course").value.trim(),
        city: document.getElementById("city").value.trim()
    };

    const message = document.getElementById("message");

    try {

        const response = await fetch(
            API_URL + "/students-resource",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Submission failed");
        }

        message.innerText = result.message;
        message.style.color = "green";

        document.getElementById("studentForm").reset();

        loadStudents();

    } catch (error) {

        message.innerText = error.message;
        message.style.color = "red";

    }

});

// Get all student records
async function loadStudents() {

    const list = document.getElementById("studentList");

    try {

        const response = await fetch(
            API_URL + "/students-resource"
        );

        if (!response.ok) {
            throw new Error("Unable to load students");
        }

        const students = await response.json();

        list.replaceChildren();

        students.forEach(student => {

            const row = document.createElement("tr");

            [
                student.studentId,
                student.name,
                student.course,
                student.city
            ].forEach(value => {

                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);

            });

            list.appendChild(row);

        });

    } catch (error) {

        list.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = error.message;

        row.appendChild(cell);
        list.appendChild(row);

    }

}

// Load students when page opens
loadStudents();

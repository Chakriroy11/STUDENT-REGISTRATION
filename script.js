document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selections ---
    const studentForm = document.getElementById('student-form');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const studentIdInput = document.getElementById('student-id');
    const studentNameInput = document.getElementById('student-name');
    const studentUidInput = document.getElementById('student-uid');
    const emailIdInput = document.getElementById('email-id');
    const contactNoInput = document.getElementById('contact-no');
    const studentList = document.getElementById('student-list');
    const noRecordsMsg = document.getElementById('no-records-msg');
    const tableContainer = document.getElementById('table-container');

    // --- State Management ---
    let students = JSON.parse(localStorage.getItem('students')) || [];
    
    // --- Utility Functions ---

    /**
     * Displays a notification message.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' or 'error'.
     */
    const showMessage = (message, type) => {
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;
        document.body.appendChild(messageBox);

        setTimeout(() => {
            messageBox.classList.add('show');
        }, 10);

        setTimeout(() => {
            messageBox.classList.remove('show');
            messageBox.addEventListener('transitionend', () => messageBox.remove());
        }, 3000);
    };

    /**
     * Saves the students array to local storage.
     */
    const saveToLocalStorage = () => {
        localStorage.setItem('students', JSON.stringify(students));
    };
    
    /**
     * Manages the vertical scrollbar on the table container.
     */
    const manageScrollbar = () => {
        if (tableContainer.scrollHeight > tableContainer.clientHeight) {
            tableContainer.style.justifyContent = 'flex-start';
        } else {
            tableContainer.style.justifyContent = 'center';
        }
    };

    /**
     * Renders the student data into the table.
     */
    const renderStudents = () => {
        studentList.innerHTML = '';

        if (students.length === 0) {
            noRecordsMsg.style.display = 'block';
        } else {
            noRecordsMsg.style.display = 'none';
            students.forEach(student => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.uid}</td>
                    <td>${student.email}</td>
                    <td>${student.contact}</td>
                    <td class="action-btns">
                        <button class="edit-btn" data-id="${student.id}">Edit</button>
                        <button class="delete-btn" data-id="${student.id}">Delete</button>
                    </td>
                `;
                studentList.appendChild(tr);
            });
        }
        manageScrollbar();
    };

    // --- Input Validation ---
    
    /**
     * Validates an input field.
     * @param {HTMLInputElement} input - The input element.
     * @param {RegExp} regex - The regular expression to test against.
     * @returns {boolean} - True if valid, false otherwise.
     */
    const validateInput = (input, regex) => {
        if (regex.test(input.value)) {
            input.classList.remove('invalid');
            return true;
        } else {
            input.classList.add('invalid');
            return false;
        }
    };

    const nameRegex = /^[a-zA-Z\s]+$/;
    const numberRegex = /^\d+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const contactRegex = /^\d{10,}$/;

    studentNameInput.addEventListener('input', () => validateInput(studentNameInput, nameRegex));
    studentUidInput.addEventListener('input', () => validateInput(studentUidInput, numberRegex));
    emailIdInput.addEventListener('input', () => validateInput(emailIdInput, emailRegex));
    contactNoInput.addEventListener('input', () => validateInput(contactNoInput, contactRegex));

    /**
     * Checks all form fields for validity.
     * @returns {boolean} - True if all fields are valid, false otherwise.
     */
    const validateForm = () => {
        return validateInput(studentNameInput, nameRegex) &&
               validateInput(studentUidInput, numberRegex) &&
               validateInput(emailIdInput, emailRegex) &&
               validateInput(contactNoInput, contactRegex);
    };

    // --- Form Handling ---

    /**
     * Resets the form to its initial state.
     */
    const resetForm = () => {
        studentForm.reset();
        studentIdInput.value = '';
        formTitle.textContent = 'Add New Student';
        submitBtn.textContent = 'Add Student';
        [studentNameInput, studentUidInput, emailIdInput, contactNoInput].forEach(input => {
            input.classList.remove('invalid');
        });
    };

    /**
     * Handles the form submission.
     * @param {Event} e - The form submission event.
     */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showMessage('Please fix the errors before submitting.', 'error');
            return;
        }
        const studentData = {
            name: studentNameInput.value.trim(),
            uid: studentUidInput.value.trim(),
            email: emailIdInput.value.trim(),
            contact: contactNoInput.value.trim()
        };
        const existingId = studentIdInput.value;
        if (existingId) {
            const studentIndex = students.findIndex(s => s.id == existingId);
            if (studentIndex > -1) {
                students[studentIndex] = { id: existingId, ...studentData };
                showMessage('Student record updated successfully!', 'success');
            }
        } else {
            const newStudent = { id: Date.now(), ...studentData };
            students.push(newStudent);
            showMessage('Student added successfully!', 'success');
        }
        saveToLocalStorage();
        renderStudents();
        resetForm();
    };

    // --- Table Action Handling ---

    /**
     * Prepares the form for editing a student's details.
     * @param {string} id - The ID of the student to edit.
     */
    const startEditStudent = (id) => {
        const student = students.find(s => s.id == id);
        if (student) {
            studentIdInput.value = student.id;
            studentNameInput.value = student.name;
            studentUidInput.value = student.uid;
            emailIdInput.value = student.email;
            contactNoInput.value = student.contact;
            formTitle.textContent = 'Edit Student Details';
            submitBtn.textContent = 'Update Student';
            formTitle.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /**
     * Deletes a student record.
     * @param {string} id - The ID of the student to delete.
     */
    const deleteStudent = (id) => {
        if (confirm('Are you sure you want to delete this record?')) {
            students = students.filter(s => s.id != id);
            saveToLocalStorage();
            renderStudents();
            showMessage('Student record deleted.', 'success');
            if (studentIdInput.value == id) {
                resetForm();
            }
        }
    };

    /**
     * Handles clicks within the student list table.
     * @param {Event} e - The click event.
     */
    const handleTableClick = (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (target.classList.contains('edit-btn')) {
            startEditStudent(id);
        } else if (target.classList.contains('delete-btn')) {
            deleteStudent(id);
        }
    };

    // --- Event Listeners ---
    studentForm.addEventListener('submit', handleFormSubmit);
    studentList.addEventListener('click', handleTableClick);

    // --- Initial Render ---
    renderStudents();
});

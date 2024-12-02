

document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("add-task-main").addEventListener('click', createAndEditTaskModule.create);
    InitDomModule.initCategoryOptions();
    InitDomModule.InitPriorityOptions();
    document.querySelector('button[type="submit"]').addEventListener('click', createAndEditTaskModule.submit);
    document.getElementById('cancelBtn').addEventListener('click', createAndEditTaskModule.cancel);

    // Set interval to update all tasks' remaining time every 60 seconds
    setInterval(UiModule.updateRemainingTimes, 60000); // Update every 60 seconds
});

// ----------------------- const ---------------------------------------
const form = document.getElementById("form-row");
const taskNameFeedback = "Task name must contain only letters, numbers, and spaces"
const uniqueTaskNameFeedback = "Task name must be unique"

// ---------------------------------------------------------------------

const InitDomModule = (function(){

    /**
     *
     */
    const InitPriorityOptions = () => {
        const priorityContainer = document.getElementById("priority");
        const priorities = ["Low","Medium","High"];
        priorityContainer.innerHTML = "" ; //  ? clear existing options ?
        let radioPriorityHTML =``;

        priorities.forEach(priority => {

            radioPriorityHTML += `
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="priority" id="priority${priority}" value="${priority}">
                <label class="form-check-label" for="priority${priority}">${priority}</label>
            </div> `;
        });

        priorityContainer.insertAdjacentHTML("beforeend", radioPriorityHTML);
    };

    /**
     *
     */
    const initCategoryOptions = () => {
        const filterCategoryContainer = document.getElementById("categoryFilter");
        const formCategoryContainer = document.getElementById("category");

        const categories = ["Work", "Personal", "Shopping", "Health", "Other"];

        [filterCategoryContainer, formCategoryContainer].forEach((dropdown) => {
            categories.forEach((category) => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                dropdown.appendChild(option);
            });
        });
    };


    return{
        InitPriorityOptions,
        initCategoryOptions
    };

})();


const UiModule = (function() {

    /**
     *
     * @param showForm = bool to control form visibility
     */
    const toggleFormVisibility = (showForm) => {
        const mainPage= document.getElementsByClassName("main-page-section")[0];
        //const form = document.getElementById("form-row");

        if(showForm) {
            mainPage.classList.add("d-none");
            form.classList.remove("d-none");
        }
        else{
            mainPage.classList.remove("d-none");
            form.classList.add("d-none");
        }
    };


    /**
     *
     *
     */
    const toggleErrors = () => {
        const validationResults= validationTaskModule.getFieldsValid();
        Object.entries(validationResults).forEach(([field, isValid]) => {

            let fieldElement = document.getElementById(field);
            if (!isValid) {
                fieldElement.classList.add("is-invalid");
            }
            else{
                fieldElement.classList.remove("is-invalid");
            }
        });
    };

    /**
     * ascending is default? or we need to move event
     * @param isAscending
     */
    const toggleSortOptions = (isAscending) => {

    };


    /**
     *
     * @param task
     * @param taskIndex
     */
    const renderTask = (task, taskIndex) => {
        const taskListContainer = document.getElementById("taskListContainer");

        // If the task list was empty, clear the "empty" message
        const emptyMessage = taskListContainer.querySelector(".empty-message");
        if (emptyMessage) {
            emptyMessage.remove();
        }



        // Generate the HTML for the new task
        const taskHTML = `
        <li class="list-group-item w-75"> 
            <div class="d-flex justify-content-between align-items-center " >
                <div>
                    <strong>${task.taskName}</strong> (${task.category}) - ${task.priority} Priority - ${task.description || ""}
                    <span id="remaining-time-${taskIndex}">${calculateTimeRemaining(task.dueDateTime)}</span>
                </div>
                <div>
                    <button class="btn btn-warning btn-sm me-2" onclick="createAndEditTaskModule.edit(${taskIndex})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="createAndEditTaskModule.delete(${taskIndex})">Delete</button>
                </div>
            </div>
        </li> `;

        // Append the new task to the container
        taskListContainer.insertAdjacentHTML("beforeend", taskHTML);

    };

    const removeTask = (taskIndex) => {


    };

    const editTask = (task, taskIndex) => {

    };

   // Function to update the remaining time for all tasks in the DOM
    function updateRemainingTimes() {
        const remainingTimeElements = document.querySelectorAll('[id^="remaining-time-"]');

        remainingTimeElements.forEach(element => {
            const taskIndex = element.id.split('-')[2]; // Extract taskIndex from the ID
            const task = taskDataModule.getTask(taskIndex); // Assuming tasks are stored globally or accessible here

            element.textContent = calculateTimeRemaining(task.dueDateTime);
        });
    }

    function calculateTimeRemaining(dueDateTime) {
        const now = new Date();
        const dueDate = new Date(dueDateTime);
        const timeDiff = dueDate - now + 5 * 1000; // Add a 30-second grace buffer

        // If the due date is in the past
        if (timeDiff < 1) {
            return "Overdue";
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.round((timeDiff % (1000 * 60 * 60)) / (1000 * 60)); // Use rounding

        let timeRemaining = "";

        if (days > 0) timeRemaining += `${days}d `;
        if (hours > 0) timeRemaining += `${hours}h `;
        if (minutes > 0 || timeRemaining === "") timeRemaining += `${minutes}m`;

        return timeRemaining.trim();
    }


    return {
        toggleFormVisibility,
        renderTask,
        toggleErrors,
        removeTask,
        editTask,
        updateRemainingTimes,
        calculateTimeRemaining
    }
})();


const taskDataModule = (function (){

    let taskList = [];      // inside the module without access to the outside

    /**
     * This function adds the task into the task list
     * @param task
     */
    const addTask = (task) => {
        taskList.push(task);

    // Get the correct index of the new task (last element in the array)
    const taskIndex = taskList.length - 1;

    // Render the new task
    UiModule.renderTask(task, taskIndex);
    };

    /**
     * This function receives a task index and deletes that task from the list
     * @param index
     */
    const deleteTask = (index) => {
        taskList.splice(index, 1);
        UiModule.removeTask(index);
    };

    /**
     * This function receives a task index and sends it back
     * @param index
     * @returns taskList[index]
     */
    const getTask = (index) => {
        return taskList[index];
    };

    /**
     * This function retrieves the task list
     * @returns *[]
     */
    const getTasks = () => {
        return [...taskList];    // return a copy to avoid direct change
    };

    return {
        addTask,
        deleteTask,
        getTasks,
        getTask
    }
})();


const createAndEditTaskModule = ( function () {

    /**
     * use activate form
     * @param event
     */
    const createTask = function (event) {
        UiModule.toggleFormVisibility(true);
    }

    /**
     * This function is responsible for submitting a task.
     * First, it extracts the form's data, then it calls on a function that checks if the fields are valid.
     * If the inputs are valid it adds the task to the list and resets the form, else it'll show the errors.
     */
    const submitTask = function (event) {

        // Prevent the default form submission behavior
        event.preventDefault();

        const formData = formModule.getFormData();

        if (validationTaskModule.isValid(formData)) {
            taskDataModule.addTask(formData);
            formModule.clearForm();
            UiModule.toggleFormVisibility(false);
            validationTaskModule.resetFieldsValid(true);
            UiModule.toggleErrors(); // this function is relevant only if I had errors and changed them
        }
        else {
            UiModule.toggleErrors();
            //UiModule.toggleFormVisibility(true);
        }
    };

    /**
     *
     * @param taskIndex
     */
    const editTask = function (taskIndex) {

        // uiModuel.editTask(task,taskIndex);
    }

    /**
     *
     * @param taskIndex
     */
    const deleteTask = function (taskIndex) {

    }

    /**
     *
     * @param taskIndex
     */
    const cancelTask = function (taskIndex) {
        formModule.clearForm();
        validationTaskModule.resetFieldsValid();
        UiModule.toggleErrors();
        UiModule.toggleFormVisibility(false);
    }

    return {
        create: createTask,
        submit: submitTask,
        cancel: cancelTask,
        edit: editTask,
        delete: deleteTask
    }
})();


const formModule = (function () {

    /**
     *
     */
    const getFormData = () => {
        return {taskName: document.getElementById("taskName").value,
                category: document.getElementById("category").value,
                priority: document.querySelector('input[name="priority"]:checked')?.value || '',
                dueDateTime: document.getElementById("dueDateTime").value,
                description: document.getElementById("description").value};
    };

    /**
     *
     */
    const clearForm = () => {
        document.getElementById('taskForm').reset();

    };

    return {
        clearForm,
        getFormData
    }
})();


const validationTaskModule = ( function () {

    // list for keeping up with the valid and not valid inputs in the form
    let fieldsValid = {
        taskName: true,
        category: true,
        priority: true,
        dueDateTime: true,
        description: true
    };

    /**
     *
     */
    const resetFieldsValid = function () {
        Object.keys(fieldsValid).forEach(key => {
            fieldsValid[key] = true;
        });
    }

    /**
     *
     *
     */

    const getFieldsValid = function () {
        return fieldsValid;
    }


    /**
     *
     * @param element

    const validTaskName = function ( element ) {
        const nameRegex = /^[A-Za-z0-9\s]+$/;

        // Ensure the name is not empty and follows the regex
        if (!element || element.trim() === "" || !nameRegex.test(element)) {
            return false;
        }

        // checking if the name is unique
        const listOfLists =taskDataModule.getTasks();

        // Check if any task already has the same name
        const exists = listOfLists.some(task => {
            console.log(task);  // Log each task object to see its structure
            return task.taskName === element;  // Compare taskName of each task with the element
        });
        return !exists;
    }*/
    /**
     *
     * @param element
     */
    const validTaskName = function ( element ) {
        const nameRegex = /^[A-Za-z0-9\s]+$/;
        const feedback = document.getElementById("validationTaskNameFeedback");

        // Ensure the name is not empty and follows the regex
        if (!element || element.trim() === "" || !nameRegex.test(element)) {
            feedback.textContent = taskNameFeedback; // Default feedback for invalid format
            return false;
        }

        // checking if the name is unique
        const listOfLists =taskDataModule.getTasks();
        const exists = listOfLists.some(task => task.taskName === element);

        if (exists) {
            feedback.textContent = uniqueTaskNameFeedback; // Feedback for duplicate names
            return false;
        }

        return true;
    }



    /**
     *
     * @param element
     */
    const validCategory = function ( element ) {
        // Ensure category is selected and not "Select Category"
        return element && element !== 'Select Category';
    }

    /**
     *
     * @param element
     */
    const validPriority = function ( element ) {
        // Ensure priority is selected (should not be empty)
        return !!element;
    }

    /**
     *
     * @param element
     */
    const validDueDateTime = function ( element ) {
        // Ensure Due Date and Time is selected (should not be empty)
        return !!element;
    }

    /**
     *
     * @param element
     */
    const validDescription = function ( element ) {
        const descriptionRegex = /^[A-Za-z0-9 .,!?'"-]*$/;

        // Allow the description to be empty, but if it's not, it must follow the regex
        return element === "" || descriptionRegex.test(element);
    }

    // Map form field to their validator functions
    const fieldValidators = {
        taskName: validTaskName,
        category: validCategory,
        priority: validPriority,
        dueDateTime: validDueDateTime,
        description: validDescription
    };

    /**
     * This function receives the data that's been filled in the form.
     * It goes over all the fields and check if the input is valid by calling the
     * appropriate validator function
     *
     * @param taskData
     */
    const isValid = (taskData) => {

        let valid = true;

        // Go through each field and validate
        for (const [field, value] of Object.entries(taskData)) {
            const validator = fieldValidators[field];
            if (validator && !validator(value)) {
                valid = false;
                fieldsValid[field] = false;
            } else {
                fieldsValid[field] = true; // Reset field to valid if no issues
            }
        }
        return valid;
    };


    return {
        isValid,
        validTaskName,
        validCategory,
        validPriority,
        validDueDateTime,
        validDescription,
        getFieldsValid,
        resetFieldsValid
    }
})();


const FilterSortModule = ( function () {


    return {

    }
})();



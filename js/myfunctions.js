

document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("add-task-main").addEventListener('click', manageTaskList.create);
    initDomModule.initCategoryOptions();
    initDomModule.initPriorityOptions();
    UiModule.renderTaskList();   // for showing empty list message
    document.querySelector('button[type="submit"]').addEventListener('click', manageTaskList.submit);
    document.getElementById('cancelBtn').addEventListener('click', manageTaskList.cancel);
    document.getElementById('sortByDueTime').addEventListener('click', filterSortModule.sortTasks);
    document.getElementById('categoryFilter').addEventListener('change', filterSortModule.filterList);

    // Set interval to update all tasks' remaining time every 60 seconds
    setInterval(UiModule.updateRemainingTimes, 60000); // Update every 60 seconds
});

// ----------------------- const ---------------------------------------
const form = document.getElementById("form-row");
const taskNameFeedback = "Task name must contain only letters, numbers, and spaces"
const uniqueTaskNameFeedback = "Task name must be unique"

// ---------------------------------------------------------------------

const initDomModule = (function(){

    /**
     *
     */
    const initPriorityOptions = () => {
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
        initPriorityOptions,
        initCategoryOptions
    };

})();


const UiModule = (function() {

    let taskListContainer = document.getElementById("taskListContainer");

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
     *
     * Toggle the button text between Ascending and Descending
     */
    const toggleSortOptions = () => {

        const sortButton = document.getElementById("sortByDueTime");

        // Toggle text based on current content
        const isAscending = sortButton.textContent.includes("Ascending");
        sortButton.textContent = isAscending ? "Sort by Due Time: Descending" : "Sort by Due Time: Ascending";
    };


    /**
     *
     *
     */
    const renderTaskList = () => {

        // Clear the existing task list before adding the new tasks
        taskListContainer.innerHTML = '';  // This removes all existing tasks

        const taskList = taskDataModule.getTasks();


        // Check if there are no tasks
        if (taskList.length === 0) {
            renderEmptyList();
        }
        else {
            // Generate the HTML for each task and append it to the container
            taskList.forEach((task, taskIndex) => {
                const taskElement = document.createElement("li");
                taskElement.classList.add("list-group-item", "task-item");
                taskElement.dataset.category = task.category;  // Add category to the data attribute

                // Build the task's HTML structure
                taskElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${task.taskName}</strong> (${task.category}) - ${task.priority} Priority - ${task.description || ""}
                            <span class="remaining-time">${calculateTimeRemaining(task.dueDateTime)}</span>
                        </div>
                        <div>
                            <button class="btn btn-warning btn-sm me-2 edit-btn">Edit</button>
                            <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                        </div>
                    </div>
                `;

                // Append the task element
                taskListContainer.appendChild(taskElement);

                // Add listeners (non-inline) for edit and delete buttons
                taskElement.querySelector('.edit-btn').addEventListener('click', () => manageTaskList.edit(taskIndex));
                taskElement.querySelector('.delete-btn').addEventListener('click', () => manageTaskList.delete(taskIndex));

                updateTaskColor(taskElement, task.dueDateTime);
            });
        }

    };

    /**
     *
     * @param taskIndex
     */
    const removeTask = (taskIndex) => {
        const taskListContainer = document.getElementById("taskListContainer");

        // Get all task items in the list
        const taskItems = taskListContainer.querySelectorAll('.task-item');

        // Check if the task at the given index exists
        if (taskItems[taskIndex]) {
            // Remove the specific task item
            taskListContainer.removeChild(taskItems[taskIndex]);

            // after removing task check if the list is empty
            if (taskDataModule.getTasks().length === 0) renderTaskList() ;
        }
    };


    const editTask = (task) => {
        const { taskName, category, priority, dueDateTime, description } = task;

        // Populate form fields with task data
        document.getElementById("taskName").value = taskName;
        document.getElementById("category").value = category;
        document.querySelector(`input[name="priority"][value="${priority}"]`).checked = true;
        document.getElementById("dueDateTime").value = dueDateTime;
        document.getElementById("description").value = description;

    };

    function updateTaskColor(taskElement, dueDateTime) {
        const dueDate = new Date(dueDateTime);
        const now = new Date();

        if (dueDate < now)
        {
            taskElement.classList.add("list-group-item-danger"); // Mark task as overdue
        }
    }



    /**
     * // Function to update the remaining time for all tasks in the DOM
     */
    function updateRemainingTimes() {
        const remainingTimeElements = document.querySelectorAll('.remaining-time');

        remainingTimeElements.forEach(element => {
            // Find the parent task element to get the task index
            const taskElement = element.closest('.task-item'); // Ensure a unique identifier exists per task
            const taskIndex = Array.from(taskElement.parentNode.children).indexOf(taskElement); // Index of task in DOM
            const task = taskDataModule.getTask(taskIndex); // Retrieve task data

            // Update the text content with the calculated remaining time
            element.textContent = calculateTimeRemaining(task.dueDateTime);

            // Update the task's color based on whether it's overdue
            updateTaskColor(taskElement, task.dueDateTime);
        });
    }

    function calculateTimeRemaining(dueDateTime) {
        const now = new Date();
        const dueDate = new Date(dueDateTime);
        const timeDiff = dueDate - now ;

        // If the due date is in the past
        if (timeDiff < 1) {
            return "Overdue";
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.ceil((timeDiff % (1000 * 60 * 60)) / (1000 * 60)); // Use rounding

        let timeRemaining = "";

        if (days > 0) timeRemaining += `${days}d `;
        if (hours > 0) timeRemaining += `${hours}h `;
        if (minutes > 0 || timeRemaining === "") timeRemaining += `${minutes}m`;

        return timeRemaining.trim();
    }

    function renderEmptyList(){
        const noTasksMessage = document.createElement("li");
        noTasksMessage.classList.add("list-group-item", "text-center", "text-muted" ,"empty-message");
        noTasksMessage.textContent = "Your task list is empty!";
        taskListContainer.appendChild(noTasksMessage);
    }


    return {
        toggleFormVisibility,
        renderTaskList,
        toggleErrors,
        removeTask,
        editTask,
        updateRemainingTimes,
        calculateTimeRemaining,
        toggleSortOptions,
        renderEmptyList
    }
})();


const taskDataModule = (function (){

    let taskList = [];      // inside the module without access to the outside
    let isAscending = true;

    /**
     * This function adds the task into the task list based on the sorting order (ascending or descending)
     * @param task
     */
    const addTask = (task) => {

        // Convert the task's due date to a Date object for accurate comparison
        const taskDueDate = new Date(task.dueDateTime);

        // Find the correct index where the task should be inserted based on the sorting order
        let insertIndex = taskList.findIndex(existingTask => {
            const existingTaskDueDate = new Date(existingTask.dueDateTime);

            // Compare the due dates based on the sort order
            return isAscending ? existingTaskDueDate > taskDueDate: existingTaskDueDate < taskDueDate;
        });

        // If no such index is found, the task should be added to the end
        if (insertIndex === -1) {
            taskList.push(task);
        } else {
            // Insert the task at the found index
            taskList.splice(insertIndex, 0, task);
        }
    };

    /**
     * This function receives a task index and deletes that task from the list
     * @param index
     */
    const deleteTask = (index) => {
        taskList.splice(index, 1);
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

    const reverseTaskList = () =>{
        taskList.reverse();
        isAscending = !isAscending;
    };


    return {
        addTask,
        deleteTask,
        getTasks,
        getTask,
        reverseTaskList,
    }
})();


const manageTaskList = ( function () {

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
            UiModule.renderTaskList();
            filterSortModule.filterList( { target: { value: filterSortModule.getCategory() } });
            UiModule.updateRemainingTimes(); // Immediately update the remaining time
            validationTaskModule.resetFieldsValid(true);
            UiModule.toggleErrors(); // this function is relevant only if I had errors and changed them
        }
        else {
            UiModule.toggleErrors();
        }
    };

    /**
     *
     * @param taskIndex
     */
    const editTask = function (taskIndex) {

        const taskToEdit = taskDataModule.getTask(taskIndex);

        UiModule.toggleFormVisibility(true);
        UiModule.editTask(taskToEdit);
    }

    /**
     *
     * @param taskIndex
     */
    const deleteTask = function (taskIndex) {
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

        // Show the modal
        deleteModal.show();

        // Attach a one-time click listener to the confirm delete button
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        confirmDeleteBtn.onclick = function () {
            // Proceed with deletion
            taskDataModule.deleteTask(taskIndex);   //delete the task from the list
            UiModule.removeTask(taskIndex);         //delete the task from the DOM

            // Hide the modal
            deleteModal.hide();
        };
    };


    /**
     *
     * @param taskIndex
     */
    const cancelTask = function (taskIndex) {
        formModule.clearForm();
        validationTaskModule.resetFieldsValid();
        UiModule.toggleErrors();  //Remove error highlights
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


const filterSortModule = ( function () {

    let currentFilter = 'All'; // Variable to store the current filter state

    /**
     *
     * @param e
     */
    const sortTasks = (e) => {

        taskDataModule.reverseTaskList();

        UiModule.toggleSortOptions();

        // Call the Ui module to render the updated task list
        UiModule.renderTaskList();

        filterList( { target: { value: currentFilter } });

    };


    /**
     * This function is responsible for filtering the tasks by their category
     * @param element
     */
    const filterList = function ( element ) {

        const filterBy = element.target.value; //getting the selected value
        const taskListContainer = document.getElementById("taskListContainer");
        const taskItems = taskListContainer.querySelectorAll('.task-item');

        currentFilter = filterBy; // Store the selected filter value

        if (filterBy !== 'All') {

            // A forEach loop that goes over that tasks and checks if the category equals to filterBy.
            // If so, the task will appear, else d-none will be added
            taskItems.forEach((task) => {
                if (filterBy !== task.dataset.category) {
                    task.classList.add("d-none");
                }
                else{
                    task.classList.remove("d-none");
                }
            });
        }
        else {
            taskItems.forEach((task) => {
                    task.classList.remove("d-none");
            });
        }

        const hiddenTasks = taskListContainer.querySelectorAll('.d-none').length;
        hiddenTasks === taskDataModule.getTasks().length ? UiModule.renderEmptyList() : null;
    }

    const getCategory = function () {
        return currentFilter;
    }

    return {
        sortTasks,
        filterList,
        getCategory
    }
})();



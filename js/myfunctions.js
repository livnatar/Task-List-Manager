
document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("add-task-main").addEventListener('click', manageTaskListModule.create);
    initDomModule.initCategoryOptions();
    initDomModule.initPriorityOptions();
    UiModule.renderTaskList();   // for showing empty list message
    document.querySelector('button[type="submit"]').addEventListener('click', manageTaskListModule.submit);
    document.getElementById('cancelBtn').addEventListener('click', manageTaskListModule.cancel);
    document.getElementById('sortByDueTime').addEventListener('click', filterSortModule.sortTasks);
    document.getElementById('categoryFilter').addEventListener('change', filterSortModule.filterList);

    // Attach a single listener to the delete confirmation button
    //const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    //confirmDeleteBtn.addEventListener('click', manageTaskListModule.attachDeleteListener);

    // Set interval to update all tasks' remaining time every 60 seconds
    setInterval(UiModule.updateRemainingTimes, 60000); // Update every 60 seconds
});

// ----------------------- const ---------------------------------------

const form = document.getElementById("form-row");
const taskNameFeedback = "Task name must contain only letters, numbers, and spaces"
const uniqueTaskNameFeedback = "Task name must be unique"

// ---------------------------------------------------------------------

/**
 * This module provides functionality to initialize category and priority options in the DOM.
 * It contains two functions:
 *
 * 1. `initPriorityOptions`: Renders priority options (Low, Medium, High) as radio buttons inside
 *     the element with id "priority".
 * 2. `initCategoryOptions`: Renders category options (Work, Personal, Shopping, Health, Other)
 *     in two dropdowns with ids "categoryFilter" and "category".
 *
 * @type {{initCategoryOptions, initPriorityOptions}}
 */
const initDomModule = (function(){

    /**
     * Renders priority options (Low, Medium, High) as radio buttons inside the element with id "priority".
     * Clears existing options before adding new ones.
     *
     * @returns {void}
     */
    const initPriorityOptions = function(){
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
     * Renders category options (Work, Personal, Shopping, Health, Other) in two dropdowns
     * with ids "categoryFilter" and "category".
     *
     * @returns {void}
     */
    const initCategoryOptions = function(){
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

/**
 * This module provides UI-related functionalities to manage tasks, including rendering task lists,
 * editing tasks, toggling form visibility, and handling errors. It also manages the task sorting
 * and updates the remaining time for tasks.
 *
 * @type {{editTask, toggleErrors, removeTask, renderEmptyList, toggleFormVisibility, updateRemainingTimes,
 *        toggleSortOptions, renderTaskList, calculateTimeRemaining: ((function(*): string)|*)}}
 */
const UiModule = (function() {

    /**
     * Toggles visibility of the form and main page section based on the showForm parameter.
     *
     * @param {boolean} showForm - If true, hides the main page and shows the form; otherwise, reverses it.
     * @returns {void}
     */
    const toggleFormVisibility = function(showForm){
        const mainPage= document.getElementsByClassName("main-page-section")[0];

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
     * Toggles error styling on form fields based on their validity.
     *
     * Checks the validity of each field using the validationTaskModule.getFieldsValid() method
     * and adds/removes the "is-invalid" class accordingly.
     *
     * @returns {void}
     */
    const toggleErrors = function(){
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
     * Toggles the button text between "Sort by Due Time: Ascending" and "Sort by Due Time: Descending".
     *
     * @returns {void}
     */
    const toggleSortOptions = function(){

        const sortButton = document.getElementById("sortByDueTime");

        // Toggle text based on current content
        const isAscending = sortButton.textContent.includes("Ascending");
        sortButton.textContent = isAscending ? "Sort by Due Time: Descending" : "Sort by Due Time: Ascending";
    };

    /**
     * Renders the task list by clearing the existing tasks and adding the updated ones.
     * If no tasks are available, it calls renderEmptyList.
     * For each task, generates an HTML structure, appends it to the container,
     * and attaches event listeners for editing and deleting tasks.
     *
     * @returns {void}
     */
    const renderTaskList = function(){

        const taskListContainer = document.getElementById("taskListContainer");
        // Clear the existing task list before adding the new tasks
        taskListContainer.innerHTML = '';  // This removes all existing tasks

        const taskList = taskDataModule.getTasks();

        // Check if there are no tasks
        if (taskList.length === 0) {
            renderEmptyList();
        }
        else {
            // Generate the HTML for each task and append it to the container
            taskList.forEach((task) => {
                const taskElement = document.createElement("li");
                taskElement.classList.add("list-group-item", "task-item");
                taskElement.dataset.category = task.category;  // Add category to the data attribute
                taskElement.dataset.taskName = task.taskName;  // Assign task name as data attribute

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
                taskElement.querySelector('.edit-btn').addEventListener('click', () => manageTaskListModule.edit(task.taskName));
                taskElement.querySelector('.delete-btn').addEventListener('click', () => manageTaskListModule.delete(task.taskName));

                updateTaskColor(taskElement, task.dueDateTime);
            });
        }

    };

    // /**
    //  * Removes a task from the task list based on the given index.
    //  * If the list becomes empty after removal, it calls renderEmptyList.
    //  *
    //  * @param taskIndex - The index of the task to be removed from the list.
    //  * @returns {void}
    //  */
    // const removeTask = function(taskIndex){
    //     const taskListContainer = document.getElementById("taskListContainer");
    //
    //     // Get all task items in the list
    //     const taskItems = taskListContainer.querySelectorAll('.task-item');
    //
    //     // Check if the task at the given index exists
    //     if (taskItems[taskIndex]) {
    //         // Remove the specific task item
    //         taskListContainer.removeChild(taskItems[taskIndex]);
    //
    //         // attach listeners according to new index
    //
    //
    //
    //
    //
    //         // check if after removing tasks filtered don`t need to display
    //         filterSortModule.filterList( { target: { value: filterSortModule.getCategory() } });
    //
    //         // // after removing task check if the list is empty
    //         // if (taskDataModule.getTasks().length === 0) renderEmptyList() ;
    //     }
    //
    // };
    const removeTask = function(taskName) {

        // Get all task items in the list
        const taskItems = document.querySelectorAll('.task-item');

        taskItems.forEach((taskItem) => {
            // Check if the task item's data-task-name matches the task name
            if (taskItem.dataset.taskName === taskName) {
                taskItem.remove();  // Remove the task item from the DOM
            }
        });

        // Check if the filtered tasks need to be updated
        filterSortModule.filterList({ target: { value: filterSortModule.getCategory() } });

    };

    /**
     * Populates the task form with the data of the task to be edited.
     *
     * @param task - The task object containing the task details.
     * @returns {void}
     */
    const editTask = function(task){
        const { taskName, category, priority, dueDateTime, description } = task;

        // Populate form fields with task data
        document.getElementById("taskName").value = taskName;
        document.getElementById("category").value = category;
        document.querySelector(`input[name="priority"][value="${priority}"]`).checked = true;
        document.getElementById("dueDateTime").value = dueDateTime;
        document.getElementById("description").value = description;

    };

    /**
     * Updates the color of the task based on its due date.
     * If the task is overdue, it adds a "danger" class to highlight it.
     *
     * @param taskElement - The task element to update.
     * @param dueDateTime - The due date and time of the task.
     * @returns {void}
     */
    const updateTaskColor = function(taskElement, dueDateTime) {
        const dueDate = new Date(dueDateTime);
        const now = new Date();

        if (dueDate < now)
        {
            taskElement.classList.add("list-group-item-danger"); // Mark task as overdue
        }
    };

    /**
     * Updates the remaining time for all tasks in the DOM and adjusts their color based on due dates.
     * Loops through all tasks, calculates the remaining time, and updates the display.
     * If a task is overdue, it updates the task's color to indicate it.
     *
     * @returns {void}
     */
    const updateRemainingTimes = function() {
        const remainingTimeElements = document.querySelectorAll('.remaining-time');

        remainingTimeElements.forEach(element => {
            // Find the parent task element to get the task index
            const taskElement = element.closest('.task-item'); // Ensure a unique identifier exists per task
            const taskName = taskElement.dataset.taskName; // Use taskName stored as data attribute
            const task = taskDataModule.getTaskByName(taskName); // Retrieve task data

            // Update the text content with the calculated remaining time
            element.textContent = calculateTimeRemaining(task.dueDateTime);

            // Update the task's color based on whether it's overdue
            updateTaskColor(taskElement, task.dueDateTime);
        });
    };

    /**
     * Calculates the remaining time until the given due date and returns it as a formatted string.
     * If the task is overdue, returns "Overdue".
     *
     * @param dueDateTime - The due date and time of the task.
     * @returns {string} - A string representing the remaining time in days, hours, and minutes,
     *                     or "Overdue" if the due date has passed.
     */
    const calculateTimeRemaining = function(dueDateTime) {
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
    };

    /**
     * Renders a message indicating that the task list is empty.
     * Creates and appends an "empty list" message to the task list container.
     *
     * @returns {void}
     */
    const renderEmptyList = function() {

        const taskListContainer = document.getElementById("taskListContainer");
        const existingEmptyMessage = document.querySelector(".empty-message");
        // If no empty-message exists, add the new one
        if (!existingEmptyMessage) {
            const noTasksMessage = document.createElement("li");
            noTasksMessage.classList.add("list-group-item", "text-center", "text-muted", "empty-message");
            noTasksMessage.textContent = "Your task list is empty!";
            taskListContainer.appendChild(noTasksMessage);
        }
    };

    const removeEmptyList = function() {

        const existingEmptyMessage = document.querySelector(".empty-message");
        if (existingEmptyMessage) {
            existingEmptyMessage.remove();
        }
    };


    return {
        toggleFormVisibility,
        renderTaskList,
        toggleErrors,
        removeTask,
        editTask,
        updateRemainingTimes,
        calculateTimeRemaining,
        toggleSortOptions,
        renderEmptyList,
        removeEmptyList
    }
})();

/**
 * Module responsible for managing the task data, including adding, deleting, retrieving tasks,
 * and reversing the order of tasks. It ensures that the tasks are sorted according to their due date
 * and provides methods for interacting with the task list.
 *
 *
 */
const taskDataModule = (function (){

    let taskList = [];       // inside the module without access to the outside
    let isAscending = true;  // Flag for sorting order: true = ascending, false = descending

    /**
     * Adds a task to the task list, inserting it based on the sorting order of its due date (ascending or descending).
     *
     * @param task - The task object to be added, containing a `dueDateTime` property.
     * @returns {void}
     */
    const addTask = function(task){

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
     *
     * @param taskName
     */
    const deleteTask = function (taskName) {
        const index = taskList.findIndex(task => task.taskName === taskName);
        if (index !== -1) {
            taskList.splice(index, 1); // Remove task by name
        }
    };

    /**
     *
     * @param taskName
     */
    const getTaskByName = function (taskName) {
        return taskList.find(task => task.taskName === taskName);
    };

    /**
     * Retrieves a copy of the task list to prevent direct modifications.
     *
     * @returns {Array} A copy of the task list.
     */
    const getTasks = function(){
        return taskList;
    };

    /**
     * Reverses the order of the task list and toggles the sorting order (ascending/descending).
     *
     * @returns {void}
     */
    const reverseTaskList = function(){
        taskList.reverse();
        isAscending = !isAscending;
    };

    return {
        addTask,
        deleteTask,
        getTasks,
        getTaskByName,
        reverseTaskList,
    }
})();

/**
 * Module for managing the task list, including task creation, submission, editing, deletion, and cancellation.
 * Provides methods for interacting with the task form and updating the task list in the UI.
 *
 * @type {{cancel, submit, edit, create, delete, attachDeleteListener}}
 */
const manageTaskListModule = ( function () {


    /**
     * Activates the task creation form.
     *
     * @returns {void}
     */
    const createTask = function () {
        UiModule.toggleFormVisibility(true);
    };

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
     */
    const editTask = function (taskName) {

        const taskToEdit = taskDataModule.getTaskByName(taskName);
        taskDataModule.deleteTask(taskName);    // to prevent a task from appearing more than once
        UiModule.toggleFormVisibility(true);
        UiModule.editTask(taskToEdit);
    };

    /**
     * Shows the deletion modal and sets the current task index.
     *
     *
     */
    const deleteTask = function (taskName) {

        if (confirm(" Are you sure you want to delete this task?"))
        {
            taskDataModule.deleteTask(taskName); // Remove from data
            UiModule.removeTask(taskName);
        }

    };




    /**
     * Cancels the task creation or editing process, clearing the form and hiding it.
     *
     * @returns {void}
     */
    const cancelTask = function () {
        formModule.clearForm();
        validationTaskModule.resetFieldsValid();
        UiModule.toggleErrors();  //Remove error highlights
        UiModule.toggleFormVisibility(false);
    };

    return {
        create: createTask,
        submit: submitTask,
        cancel: cancelTask,
        edit: editTask,
        delete: deleteTask//,
       // attachDeleteListener
    }
})();

/**
 * Module for interacting with the task form. Provides methods to retrieve form data and clear the form fields.
 *
 * @type {{clearForm, getFormData: (function(): {dueDateTime: *, description: *, taskName: *, category: *, priority})}}
 */
const formModule = (function () {

    /**
     * Retrieves the data from the task form fields.
     *
     * @returns {Object} An object containing the form data (task name, category, priority, due date time, description).
     */
    const getFormData = function(){
        return {taskName: document.getElementById("taskName").value,
            category: document.getElementById("category").value,
            priority: document.querySelector('input[name="priority"]:checked')?.value || '',
            dueDateTime: document.getElementById("dueDateTime").value,
            description: document.getElementById("description").value};
    };

    /**
     * Clears all fields in the task form.
     *
     * @returns {void}
     */
    const clearForm = function(){
        document.getElementById('taskForm').reset();

    };

    return {
        clearForm,
        getFormData
    }
})();

/**
 * Module for validating task data in the form.
 * Provides methods to validate individual fields and check overall task data validity.
 *
 * @type {{resetFieldsValid, validDescription: (function(*): *),
 *         getFieldsValid: (function(): {dueDateTime: boolean, description: boolean, taskName: boolean, category: boolean, priority: boolean}),
 *         isValid: (function(*): boolean), validDueDateTime: (function(*): boolean),
 *         validTaskName: ((function(*): boolean)|*), validCategory: (function(*): *), validPriority: (function(*): boolean)}}
 */
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
     * Resets the validation state of all form fields to valid (true).
     *
     * @returns {void}
     */
    const resetFieldsValid = function () {
        Object.keys(fieldsValid).forEach(key => {
            fieldsValid[key] = true;
        });
    };

    /**
     * Retrieves the current validation state of all form fields.
     *
     * @returns {Object} An object containing the validation state of each field.
     */
    const getFieldsValid = function () {
        return fieldsValid;
    };

    /**
     * Validates the task name for correct format and uniqueness.
     *
     * @param element - The task name to validate.
     * @returns {boolean} `true` if the task name is valid, otherwise `false`.
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
    };

    /**
     * Validates the selected category.
     *
     * @param element - The category to validate.
     * @returns {boolean} `true` if the category is valid, otherwise `false`.
     */
    const validCategory = function ( element ) {
        // Ensure category is selected and not "Select Category"
        return element && element !== 'Select Category';
    };

    /**
     * Validates the selected priority.
     *
     * @param element - The priority to validate.
     * @returns {boolean} `true` if the priority is selected, otherwise `false`.
     */
    const validPriority = function ( element ) {
        // Ensure priority is selected (should not be empty)
        return !!element;
    };

    /**
     * Validates the selected due date and time.
     *
     * @param element - The due date and time to validate.
     * @returns {boolean} `true` if the due date and time is selected, otherwise `false`.
     */
    const validDueDateTime = function ( element ) {
        // Ensure Due Date and Time is selected (should not be empty)
        return !!element;
    };

    /**
     * Validates the task description format.
     *
     * @param element - The description to validate.
     * @returns {boolean} `true` if the description is valid (or empty), otherwise `false`.
     */
    const validDescription = function ( element ) {
        const descriptionRegex = /^[A-Za-z0-9 .,!?'"-]*$/;

        // Allow the description to be empty, but if it's not, it must follow the regex
        return element === "" || descriptionRegex.test(element);
    };

    // Map form field to their validator functions
    const fieldValidators = {
        taskName: validTaskName,
        category: validCategory,
        priority: validPriority,
        dueDateTime: validDueDateTime,
        description: validDescription
    };

    /**
     * Validates the task data by checking each field against its respective validator function.
     *
     * This function iterates through all the fields of the task data, calling the appropriate
     * validation function for each field. It updates the `fieldsValid` object based on whether
     * the input is valid or not.
     *
     * @param taskData - The task data filled in the form.
     * @returns {boolean} `true` if all fields are valid, otherwise `false`.
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

/**
 * Module for handling filtering and sorting tasks in the task list.
 * Provides methods to sort tasks by due date, filter tasks by category, and retrieve the current filter state.
 *
 * @type {{sortTasks, getCategory: (function(): string), filterList}}
 */
const filterSortModule = ( function () {

    let currentFilter = 'All'; // Variable to store the current filter state

    /**
     * Sorts the task list by due date in ascending or descending order and updates the UI.
     *
     * This function reverses the task list order, toggles the sort button text,
     * and re-renders the updated task list. It also reapplies the current filter to the list.
     *
     * @returns {void}
     */
    const sortTasks = function(){

        taskDataModule.reverseTaskList();

        UiModule.toggleSortOptions();

        // Call the Ui module to render the updated task list
        UiModule.renderTaskList();

        filterList( {target : { value : currentFilter } });

    };

    /**
     * Filters the task list by category and updates the UI.
     *
     * This function filters tasks based on the selected category, hiding tasks that don't match the selected category.
     * If "All" is selected, all tasks are shown. If no tasks are visible after filtering,
     * an empty list message is displayed.
     *
     * @param element - The event object triggered by the category selection (e.g., dropdown change or filter selection).
     *
     * @returns {void}
     */
    const filterList = function ( element ) {

        const filterBy = element.target.value; //getting the selected value
        const taskListContainer = document.getElementById("taskListContainer");
        const taskItems = taskListContainer.querySelectorAll('.task-item');

        currentFilter = filterBy; // Store the selected filter value

        // Show or hide tasks based on the selected filter category
        taskItems.forEach((task) => {
            if (filterBy !== "All" && filterBy !== task.dataset.category) {
                task.classList.add("d-none");
            } else {
                task.classList.remove("d-none");
            }
        });

        const hiddenTasks = taskListContainer.querySelectorAll('.d-none').length;
        hiddenTasks === taskDataModule.getTasks().length ? UiModule.renderEmptyList() : UiModule.removeEmptyList();
    };

    /**
     * Returns the current category filter.
     *
     * @returns {string}
     */
    const getCategory = function () {
        return currentFilter;
    };

    return {
        sortTasks,
        filterList,
        getCategory
    }
})();
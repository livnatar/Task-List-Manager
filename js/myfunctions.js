

document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("add-task-main").addEventListener('click', createAndEditTaskModule.create);
    InitDomModule.initCategoryOptions();
    InitDomModule.InitPriorityOptions();
    document.querySelector('button[type="submit"]').addEventListener('click', createAndEditTaskModule.submit);
    document.getElementById('cancelBtn').addEventListener('click', createAndEditTaskModule.cancel);

});

// ----------------------- const ---------------------------------------
const form = document.getElementById("form-row");


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
     * ascending is default? or we need to move event
     * @param isAscending
     */
    const toggleSortOptions = (isAscending) => {

    };


    /**
     *
     * @param tasks
     */
    const renderTaskList = (tasks) => {

    };

    /**
     *
     */
    const renderFormErrors = () => {

    };

    return {
        toggleFormVisibility,
        renderTaskList,
        renderFormErrors
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
        return taskList;    // return a copy to avoid direct change
    };

    return {
        addTask,
        deleteTask,
        getTasks
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
    const submitTask = function () {
        const formData = formModule.getFormData();

        if (validationTaskModule.isValid()) {
            taskDataModule.addTask(formData);
            formModule.clearForm();
            UiModule.toggleFormVisibility(false);
            UiModule.renderTaskList();
        }
        else {
            UiModule.renderFormErrors();
        }
    };

    /**
     *
     * @param taskIndex
     */
    const editTask = function (taskIndex) {

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
        UiModule.toggleFormVisibility(false);
    }

    return {
        create: createTask,
        submit: submitTask,
        cancel: cancelTask
    }
})();


const formModule = (function () {

    /**
     *
     */
    const getFormData = () => {
        return {name: document.getElementById("taskName").value,
                category: document.getElementById("category").value,
                priority: document.getElementById("priority").value,
                date: document.getElementById("datetimepicker1").value,
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

    /**
     *
     * @param element
     */
    const validTaskName = function ( element ) {
        const nameRegex = /^[A-Za-z0-9\s]+$/;

        // checking if the name is unique
        let listOfLists =taskDataModule.getTasks();
        const exists = listOfLists.some(subList => subList.includes(element));

        return !exists && nameRegex.test(element);
    }

    /**
     *
     * @param element
     */
    const validCategory = function ( element ) {
        return (element === 'Select Category');
    }

    /**
     *
     * @param element
     */
    const validPriority = function ( element ) {
        return element;  // element is empty if priority not checked
    }

    /**
     *
     * @param element
     */
    const validDueDateTime = function ( element ) {

    }

    /**
     *
     * @param element
     */
    const validDescription = function ( element ) {
        const descriptionRegex = /^[A-Za-z0-9 .,!?'"-]*$/;
    }

    // Map form field to their validator functions
    const fieldValidators = {
        name: validTaskName,
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
        for (const [field, value] of Object.entries(taskData)) {
            const validator = fieldValidators[field];
            if (validator && !validator(value)) {
                return false; // Return false on first validation failure
            }
        }
        return true; // All fields valid
    };



    return {
        isValid,
        validTaskName,
        validCategory,
        validPriority,
        validDueDateTime,
        validDescription
    }
})();


const FilterSortModule = ( function () {


    return {

    }
})();



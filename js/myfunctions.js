

document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("add-task-main").addEventListener('click', createAndEditTaskModule.create);
    InitDom.initCategoryOptions();
    InitDom.InitPriorityOptions();

});

const InitDom = (function(){

    /**
     *
     */

    const InitdatePickers = () => {
        const datePickers = document.querySelectorAll('[data-coreui-toggle="date-picker"]');
        datePickers.forEach(picker => {
            new coreui.DatePicker(picker, {
                locale: picker.getAttribute('data-coreui-locale') || 'en-US',
                timepicker: picker.getAttribute('data-coreui-timepicker') === 'true',
                date: picker.getAttribute('data-coreui-date') || null
            });
        });
    };


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
        InitdatePickers,
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
        const form = document.getElementById("form-row");

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
    const renderFormError = () => {

    };

    return {
        toggleFormVisibility
    }
})();


const taskDataModule = (function (){

    let taskList = [];      // inside the module without access to the outside

    const addTask = (task) => {
        taskList.push(task);
    };

    const deleteTask = (index) => {
        taskList.splice(index, 1);
    };

    /**
     *
     * @param index
     * @returns {*}
     */
    const getTask = (index) => {
        return taskList[index];
    };

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
     *
     */
    const submitTask = function () {

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

    }

    return {
        create: createTask
    }
})();


const formModule = (function () {

    /**
     *
     */
    const getFormData = () => {

    };

    /**
     * go over all the form and check if valid
     * @param taskData
     */
    const isValid = (taskData) => {

    };


    /**
     *
     */
    const clearForm = () => {

    };

    return {

    }
})();


const validationTaskModule = ( function () {

    /**
     *
     * @param element
     */
    const validTaskName = function ( element ) {

    }

    /**
     *
     * @param element
     */
    const validCategory = function ( element ) {

    }

    /**
     *
     * @param element
     */
    const validPriority = function ( element ) {

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

    }

    return {
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



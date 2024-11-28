

document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("add-task-main").addEventListener('click', createAndEditTaskModule.create);
});

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
     */
    const renderPriorityOptions = () => {

    };

    /**
     *
     */
    const renderCategoryOptions = () => {

    };

    /**
     *
     */
    const renderFilterCategoryOptions = () => {

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
        /*
        const mainPage= document.getElementsByClassName("main-page-section")[0];
        mainPage.classList.add("d-none");

        const form = document.getElementById("form-row");
        form.classList.remove("d-none");*/
    }

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
     * use - renderPriorityOptions, renderCategoryOptions
     */
    const activateForm = () => {

    };

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



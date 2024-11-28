

document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("add-task-main").addEventListener('click', createAndEditTaskModule.create);
});

const UiModule = (function() {

    return {

    }
})();


const taskDataModule = (function (){

    let taskList = [];      // inside the module without access to the outside

    const addTask = (task) => {
        taskList.push(task);
    };

    const deleteTask = (index) =>{
        taskList.splice(index, 1);
    };

    const getTasks = () =>{
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
     *
     * @param event
     */
    const createTask = function (event) {
        const mainPage= document.getElementsByClassName("main-page-section")[0];
        mainPage.classList.add("d-none");

        const form = document.getElementById("form-row");
        form.classList.remove("d-none");
    }

    return {
        create: createTask
    }
})();


const formModule = (function () {




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



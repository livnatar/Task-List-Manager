

document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("add-task-main").addEventListener('click', createAndEditTaskModule.create);
});

const createAndEditTaskModule = ( function () {
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


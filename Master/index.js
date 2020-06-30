const inquirer = require("inquirer");
const connection = require("./db/connection")


//Add departments, roles, employees

function addDepartment(){

    inquirer.prompt([
        {
        message: "What is the department's name?",
        type: 'input',
        name : "departmentName"
        }
    ]).then((response) => {

        console.log(response);

    });

}

function addRole(){

}

function addEmployee(){

}

//View departments, roles, employees

function viewDepartment(){

}

function viewRole(){

}

function viewEmployee(){


}

//Update employee roles

function UpdateEmployeeRoles(){

}

addDepartment();
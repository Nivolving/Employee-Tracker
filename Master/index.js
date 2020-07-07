const inquirer = require("inquirer");
const connection = require("./db/connection")
const util = require('util');
connection.queryPromise = util.promisify(connection.query);

//Add departments, roles, employees

function newTasks() {
    inquirer.prompt([
        {
            message: " What would you like to do?",
            type: "list",
            name: "action",
            choices: [
                "View Departments",
                "View Roles",
                "View Employees",
                "Add New Department",
                "Add New Role",
                "Add New Employee",
                "Update Employee Roles",
                "Remove an employee",
                "Exit"
            ]
        }
    ]).then((tasks) => {

        if (tasks.action === "View Departments") {
            viewDepartments();
        } else if (tasks.action === "View Roles") {
            viewRoles();
        } else if (tasks.action === "View Employees") {
            viewEmployees();
        } else if (tasks.action === "Add New Department") {
            addDepartment();
        } else if (tasks.action === "Add New Role") {
            addRole();
        } else if (tasks.action === "Add New Employee") {
            addEmployee();
        } else if (tasks.action === "Update Employee Roles") {
            updateEmployeeRoles();
        } else if (tasks.action === "Remove an employee") {
            removeEmployee();
        }
        else if (tasks.action === "Exit") {
            process.exit();
        }

    });
}

function addDepartment() {

    inquirer.prompt([
        {
            message: "What is the department's name?",
            type: 'input',
            name: "departmentName"
        }
    ]).then((response) => {


        connection.query("INSERT INTO department (name) VALUES (?)", response.departmentName, (err, result) => {

            if (err) throw err;

            console.log("Insert as ID" + result.insertId);

            newTasks();
        });


    });

}

function addRole() {
    connection.query("Select * from department", (err, response) => {

        if (err) throw err;
        inquirer.prompt([
            {
                message: "What is the title?",
                type: 'input',
                name: "title"
            },
            {
                message: "What is the Salary?",
                type: 'number',
                name: "salary",
                validate: (value) => {
                    return !isNaN(value) ? true : "Please provide a number value.";
                }
            },
            {
                message: "What is the department the role belong to?",
                type: 'list',
                name: "department_id",
                choices: response.map(department => {
                    return {
                        name: department.name,
                        value: department.id

                    };
                })
            }
        ]).then((response) => {

            console.log(response);

            connection.query("INSERT INTO role SET ?", response, (err, result) => {

                if (err) throw err;

                newTasks();
            });
        });
    });

}

async function addEmployee() {

    var roles = await getRoles();
    var employees = await getEmployees();

    var employeeSelections = employees.map(employee => {
        return {
            name: employee.first_name + ' ' + employee.last_name,
            value: employee.id
        };
    });

    employeeSelections.unshift({ name: "None", value: null });

    var response = await inquirer
        .prompt([
            {
                message: "what is Employee's First Name?",
                type: "input",
                name: "first_name",
            },
            {
                message: "what is Employee's Last Name?",
                type: "input",
                name: "last_name",
            },
            {
                message: "what is Employee's Role?",
                type: "list",
                name: "role_id",
                choices: roles.map(role => {
                    //console.log(role);
                    return {
                        name: role.title,
                        value: role.id
                    };
                })
            },
            {
                message: "What is the Manager name?",
                type: "list",
                name: "manager_id",
                choices: employeeSelections,
            }

        ])

    var result = await connection.queryPromise("INSERT INTO employee SET ?", response);

    console.log("INSERT as ID " + result.insertID);

    newTasks();


}

function getRoles() {


    return connection.queryPromise("SELECT * FROM role")

}

async function getEmployees() {
    let employees = await connection.queryPromise('SELECT * FROM employee ');
    employees = employees.map(employee => {
        if (employee.manager_id) {
            for (let i = 0; i < employees.length; i++) {
                if (employees[i].id == employee.manager_id) {
                    employees[i].manger_name = employees[i].first_name + ' ' + employees[i].last_name;
                }
            }
        }
        return employee
    })

    return employees;
}

//View departments, roles, employees

function viewDepartments() {

    connection.query("SELECT * FROM department", (err, results) => {

        if (err) throw err;

        console.table(results);

        newTasks();

    })
}

function viewRoles() {
    getRoles()
        .then(roles => {
            console.table(roles)
            newTasks()
        })
        .catch(error => {
            console.log(error);
        });
}

function viewEmployees() {

    getEmployees()
        .then(employees => {
            console.table(employees);
            newTasks();
        })
        .catch(error => {
            console.log(error);
        });


}

//Update employee roles

async function updateEmployeeRoles() {

    var roles = await getRoles();
    var employees = await getEmployees();

    employeeSelections = employees.map(employee => {
        return {
            name: employee.first_name + ' ' + employee.last_name,
            value: employee.id
        };
    })
    employeeSelections.unshift({ name: "None", value: null });

    var response = await inquirer.prompt([
        {
            message: "What do you want to update",
            type: "list",
            name: "id",
            choices: employeeSelections
        },
        {
            message: "what is new role for Employee?",
            type: "list",
            name: "role_id",
            choices: roles.map(role => {
                console.log(role);
                return {
                    name: role.title,
                    value: role.id
                };
            })
        },
    ])

    await connection.queryPromise("UPDATE employee SET role_id = ? WHERE id = ?", [response.role_id, response.id]);
    newTasks();

}

async function removeEmployee() {

    var employees = await getEmployees();

    employeeSelections = employees.map(employee => {
        return {
            name: employee.first_name + ' ' + employee.last_name,
            value: employee.id
        };
    })

    var response = await inquirer
        .prompt([
            {
                message: "which Employee would you like to remove ?",
                type: "list",
                name: "employee_id",
                choices : employeeSelections
            }])
            await connection.queryPromise('DELETE FROM employee WHERE id = ?', [response.employee_id]);
            newTasks();


}

newTasks();
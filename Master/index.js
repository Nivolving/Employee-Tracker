const inquirer = require("inquirer");
const connection = require("./db/connection")


//Add departments, roles, employees

function newTasks ()
{
    inquirer.prompt([
        {
        message : " What would you like to do?",
        type: "list",
        name:"action",
        choices:[
            "View Departments",
            "View Roles",
            "View Employees",
            "Add New Department",
            "Add New Role",
            "Add New Employee",
            "Update Employee Roles",
            "Exit"
        ]
    }
]).then ((tasks) => {

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
    } else if (tasks.action === "Exit") {
        process.exit();
    }

});
}

function addDepartment(){

    inquirer.prompt([
        {
        message: "What is the department's name?",
        type: 'input',
        name : "departmentName"
        }
    ]).then((response) => {

        
        connection.query("INSERT INTO department (name) VALUES (?)", response.departmentName, (err, result) => {
            
            if (err) throw err;

            console.log("Insert as ID" + result.insertId);
        });


    });

}

function addRole()

{
    connection.query("Select * from department", (err, response) => {

        if (err) throw err;
        inquirer.prompt([
            {
            message: "What is the title?",
            type: 'input',
            name : "title"
            },
            {
                message: "What is the Salary?",
                type: 'number',
                name : "salary",
                validate: (value) => {
                    return !isNaN(value) ? true : "Please provide a number value.";
                }
            },
            {
                message: "What is the department the role belong to?",
                type: 'list',
                name : "department_id",
                choices : response.map(department => {
                    return {
                        name : department.name,
                        value : department.id
    
                    };
                })
            }
        ]).then((response) => {
    
            console.log(response);
    
            connection.query("INSERT INTO role SET ?" , response , (err, result) => {
    
                if (err) throw err;
            });
        });
    });

}

function addEmployee()
{

    console.log("Add employee");

    getRoles((roles) => {

        getEmployees ((employees) => {

            employeeSelections = employees.map ( employee => {
                return {
                    name : employee.first_name +' '+ employee.last_name,
                    value : employee.id
                };
            });

            employeeSelections.unshift( {name:"None", value:null} );

            inquirer
                .prompt([
                {
                    message : "what is Employee's First Name?",
                    type : "input",
                    name : "first_name",
                },
                {
                    message : "what is Employee's Last Name?",
                    type : "input",
                    name : "last_name",
                },
                {
                    message : "what is Employee's Role?",
                    type : "list",
                    name : "role_id",
                    choices : roles.map( role => {
                        //console.log(role);
                        return {
                            name : role.title,
                            value : role.id
                        };
                    })
                },
                {
                    message : "What is the Manager name?",
                    type: "list",
                    name:"manager_id",
                    choices: employeeSelections,
                }

            ]).then( (response) => {

                connection.query( "INSERT INTO employee SET ?", response, (err, result) => {

                    if(err) throw err;

                    console.log( "INSERT as ID "+ result.insertID);

                    newTasks();
                })
                
            });
    
        });
    
    });

}

function getRoles (cb) {

    connection.query("SELECT * FROM role", (err, results) => {

        if (err) throw err;

        cb(results);

        newTasks();

    });

}

function getEmployees(cb){
    connection.query("SELECT * FROM employee", (err, results) =>{

        if (err) throw err;

        cb(results);

        newTasks();
    });
}

//View departments, roles, employees

function viewDepartments(){

    connection.query("SELECT * FROM department", (err, results) => {

        if (err) throw err;

        console.table(results);

        newTasks();

    })
}

function viewRoles(){

    getRoles((roles) => {

        console.table(roles);

    });
}

function viewEmployees()
{

 getEmployees((employee) => {

    console.table(employee);
 });

  
}

//Update employee roles

function updateEmployeeRoles(){


    getRoles((roles) => {

        getEmployees ((employees) => {

            employeeSelections = employees.map ( employee => {
                return {
                    name : employee.first_name +' '+ employee.last_name,
                    value : employee.id
                };
            })
            employeeSelections.unshift( {name:"None", value:null});

            inquirer.prompt([
                {
                    message : "What do you want to update",
                    type : "input",
                    name : "first_name"
                },
                {
                    message : "what is new role for Employee?",
                    type : "list",
                    name : "role_id",
                    choices : roles.map( role => {
                        console.log(role);
                        return {
                            name : role.title,
                            value : role.id
                        };
                    })
                },
            ]).then( (response) => {
                connection.query( "UPDATE INTO employee SET ?", response, (err, result) => {
                    if(err) throw err;
                    
                    newTasks();

                })
            });
    
        });
    
    });

}

newTasks();
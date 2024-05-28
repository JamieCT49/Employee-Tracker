const inquirer = require('inquirer');
const {Pool} = require('pg');

const pool = new Pool(
    {
        user: 'postgres',
        password: 'postgres',
        host: 'localhost',
        database: 'employee_db',
        port: 5432
    },
   console.log(`Connected to database.`) 
);
// Connects to the database
pool.connect(function (err) {
    if (err) throw err;
    console.log('Connected to database.');
    start();
});
// Starts the app
function start() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Exit"
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case "View all departments":
                viewDepartments();
                break;
            case "View all roles":
                viewRoles();
                break;
            case "View all employees":
                viewEmployees();
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update an employee role":
                updateRole();
                break;
            case "Exit":
                console.log("Goodbye!");
                pool.end(); 
                break;
        }
    });
}

function viewDepartments() {
    const query = "SELECT * FROM department";
    pool.query(query, function (err, res) {
        if (err) throw err;
        console.table(res.rows);
        start();
    });
}

function viewRoles() {
    const query = "SELECT * FROM role";
    pool.query(query, function (err, res) {
        if (err) throw err;
        console.table(res.rows);
        start();
    });
}

function viewEmployees() {
    const query = "SELECT * FROM employee";
    pool.query(query, function (err, res) {
        if (err) throw err;
        console.table(res.rows);
        start();
    });
}
// adds department
function addDepartment() {
    inquirer.prompt({
        name: "name",
        type: "input",
        message: "Enter the name of the department:"
    }).then(function (answer) {
        const query = "INSERT INTO department (name) VALUES ($1)";
        pool.query(query, [answer.name], function (err, res) {
            if (err) throw err;
            console.log(`Department "${answer.name}" added successfully!`);
            start();
        });
    });
}
// adds role to the table
function addRole() {
    pool.query('SELECT * FROM department', function(err, res) {
        if (err) throw (err);
    inquirer.prompt ([{
        name: "title",
        type: "input",
        message: "Title of new role?"
    },
    {
        name: "salary",
        type: "input",
        message: "Salary for new role?"
    },
    {
        name: "departmentName",
        type: "list",
        message: "What department is this role under?",
        choices: res.rows.map(row => row.name)
    }
    ])
      .then(function(answer) {
    const departmentName = answer.departmentName;
    const department = res.rows.find(row => row.name === departmentName);
    const departmentId = department.id;
    const title = answer.title;
    const salary = parseFloat(answer.salary);

    const query = "INSERT INTO role(title, salary, department_id) VALUES ($1, $2, $3)";
    const values = [title, salary, departmentId];

    pool.query(query, values, function(err, res) {
        if (err) throw err;
        console.log(`New role added: ${title}`);
        viewRoles();
    });
});
});
}
// Adds employee but ids are wrong need to fix also i dont think the values are right.
async function addEmployee() {
    try {
        const roleResult = await pool.query('SELECT * FROM role');
        const roles = roleResult.rows.map(row => row.title);
        const answer = await inquirer.prompt([
        {
            name: "firstName",
            type: "input",
            message: "Employees first name?"
        },
        {
            name: "lastName",
            type: "input",
            message: "Employees last name?"
        },
        {
            name: "roleName",
            type: "list",
            message: "Role of the employee?",
            choices: roles
            
        }
    ]);

    const selectedRole = roleResult.rows.find(row => row.title === answer.roleName);
    const roleId = selectedRole.id;
    const mangagerResult = await pool.query('SELECT * FROM employee');
    const managers = mangagerResult.rows.map(row => row.last_name);
    const managerAnswer = await inquirer.prompt ([
        {
            name: "manager",
            type: "list",
            message: "Select manager for the employee:",
            choices: managers
        }
    ]);
    const selectedManager = mangagerResult.rows.find(row => row.last_name === managerAnswer.manager);
    const managerId = selectedManager ? selectedManager.id : null;
    const insertQuery = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)";
    const values = [answer.firstName, answer.lastName, roleId, managerId];
    await pool.query(insertQuery, values);

    console.log("Employee added.");
    viewEmployees();
}

catch (error) {
    console.error("Failed", error);
}}

// My failed update role atempt.

// function updateRole() {
//     pool.query('SELECT * FROM employee', function(err, result) {
//         if (err) throw (err);
//         inquirer.prompt([
//             {
//                 name: "empolyeeName",
//                 type: "list",
//                 message: "What employees role is changing?",
//                 choices: function() {
//                     employeeArray = [];
//                     result.forEach(result => {
//                         employeeArray.push(result.last_name);
//                     })
//                     return employeeArray;
//                 }
//             }
//         ])
//         .then(function(answer) {
//             console.log(answer);
//             const name = answer.employeeName;
//             pool.query("SELECT * FROM role", function(err, res) {
//                 inquirer.prompt ([
//                     {
//                         name: "role",
//                         type: "list",
//                         message: "What is their new role?",
//                         choices: function() {
//                             roleArray = [];
//                             res.forEach(res => {
//                                 roleArray.push(
//                                     res.title
//                                 )
//                             })
//                             return roleArray;
//                         }
//                     }
//                 ])
//                 .then(function(roleAnswer) {
//                     const role = roleAnswer.role;
//                     console.log(roleAnswer.role);
//                     pool.query('SELECT * FROM role WHERE title = ?', [role], function(err, res) {
//                         if (err) throw (err);
//                         let roleID = res[0].id;
//                         let query = "UPDATE employee SET role_id ? last_name ?";
//                         let values = [roleID, name]
//                         console.log(values);
//                         pool.query(query, values, function(err, res, fields){
//                             console.log(`Updated ${name}'s role to ${role}.`)
//                         })
//                         viewEmployees();
//                     })
//                 })
//             })
//         })
//     }

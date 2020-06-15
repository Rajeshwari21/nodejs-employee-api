// var firebase = require('firebase');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseConfig = require("../smartsoumyafirebase.json");
const Employee = require('../models/employeeModel');

// initialize firebase.
var firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: "https://smartsoumyaemployeeapi.firebaseio.com"
});
var database = admin.firestore();

let tmp = new Employee(0, "vipul", "MLEngineer", "10000", "01-01-2020", "PS");
var employees = [];
var departments = [];
employees.push(tmp);

// Show list of employees.
exports.list_all_employees = function(req, res) {
   res.json(employees);
};

// Add new employees.
exports.create_new_employees = function(req, res) {
    let id = employees.length;
    let name = req.body.name;
    if (checkIfNull("name", name, res)) return;
 
    let designation = req.body.designation;
    if (checkIfNull("designation", designation, res)) return;

    let salary = req.body.salary;
    if (checkIfNull("salary", salary, res)) return;

    let hire_date = req.body.hire_date;
    if (checkIfNull("hire_date", hire_date, res)) return;

    let dept = req.body.dept;
    if (checkIfNull(dept, dept, res)) return;
    let data = new Employee(id, name, designation, salary, hire_date, dept);
    employees.push(data);
    // add employee to database.
    addEmployeetoDatabase(data, res);
    res.json(employees);
}

function addEmployeetoDatabase(data, res) {
    try {
        database.collection('items').doc('/' + data.id + '/').create({item: data});
        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}
// Get the details of specific employee.
exports.get_employee = function(req,res) {
    let employeeId = req.params.employeesId;
    let foundEmployee = employees.find(function(employee){
       return employee.id == employeeId;
    });
    if (foundEmployee) {
        return res.json(foundEmployee);
    } else {
        return checkEmployeeExists("Employee", employeeId, res);
    }
}

// Update the details of a specific employee.
exports.update_employee = function(req, res) {
    let employeeId = parseInt(req.params.employeesId);
    let name = req.body.name;
    let designation = req.body.designation;
    employees.forEach(function(employee){
        if (employee.id == employeeId) {
            if (name) {
                employee.name = name;
            }
            if (designation) {
                employee.designation = designation;
            }
        }
    });
    res.json(employees);
}

// Delete the specific employee details.
exports.delete_employee = function(req, res) {
    let employeeId = parseInt(req.params.employeesId);
    let foundEmployee = employees.find(function(employee){
        return employee.id == employeeId;
    });
    if (foundEmployee) {
        employees = employees.filter(function(employee) {
            return employee.id !== employeeId;
        });
        res.status(200).json(employees);
    } else {
        return checkEmployeeExists("Employee", employeeId, res);
    }   
}

// Get the employees based on the department.
exports.get_employee_basedon_dept = function(req, res) {
    let dept = req.params.deptId;
    let foundDept = employees.find(function(employee){
        return employee.dept == dept;
    });
    if (foundDept) {
        employees.forEach(function(employee) {
            departments.push(employee);
        });
        departments = departments.filter(function(employeeDepartment){
            if (employeeDepartment.dept === dept) {
                return employeeDepartment;
            } 
        });
        res.status(200).json(departments);
    } else {
        return checkEmployeeExists("Department", dept, res);
    }
}

const checkIfNull = function(field, data, res) {
    if(!data) {
        res.status(400).send({
            message: 'Must provide ' + field
        });
        return true;
    }
}
const checkEmployeeExists = function (field, id, res) {
   return res.status(404).send({
        message: `${field} with id ${id} not found`,
    });
} 


// {
    // "id": 1,
    // "name": "Pavan",
    // "designation": "Intern",
    // "salary": "3000",
    // "hire_date": "02-01-2020",
    // "dept": "Intern"
// },
// {
//     "id": 2,
//     "name": "Tejas",
//     "designation": "Developer",
//     "salary": "8000",
//     "hire_date": "02-01-2020",
//     "dept": "PS"
// },
// {
//     "id": 3,
//     "name": "Sonal",
//     "designation": "FE dev",
//     "salary": "6000",
//     "hire_date": "02-01-2020",
//     "dept": "PS"
// }
const Employee = require('../models/employeeModel');
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
    projectId: 'fir-test-f739a',
    keyFilename: './firebase-config.json',
});

let tmp = new Employee(0, "vipul", "MLEngineer", "10000", "01-01-2020", "PS");
var employees = [];
var departments = [];

// Show list of employees.
exports.list_all_employees = function(req, res) {
    let result = []
    db.collection('employees')
        .get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                result.push({ ...doc.data(), _uid: doc.id })
            });
            res.json(result);
        })
        .catch((err) => {
            console.log('Error getting employees', err);
        });
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
}

function addEmployeetoDatabase(data, res) {
    let newEmployeeRef = db.collection('employees').doc();
    let addEmp = newEmployeeRef.set(JSON.parse(JSON.stringify(data)))
    addEmp.then(e => {
        res.json(e);
    }).catch(e => {
        console.error(e);
    })
}
// Get the details of specific employee.
exports.get_employee = function(req,res) {
    let employeeId = req.params.employeesId;
    db.collection('employees').doc(employeeId).get().then((doc) => {
        res.json(doc.data())
    }).catch(e => {
        res.json({err: `Employee with id ${employeeId} not found`})
    })
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
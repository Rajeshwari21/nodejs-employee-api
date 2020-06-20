const Employee = require('../models/employeeModel');
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
    projectId: 'smartsoumyaemployeeapi',
    keyFilename: './smartsoumyafirebase.json',
});

var employees = [];

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

// Helper function to add employee details in the database.
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
    let employeeId = req.params.employeesId;
    let name = req.body.name;
    let designation = req.body.designation;
    let updateEmployeeRef = db.collection('employees').doc(employeeId);
    if (name) {
        var updateData = updateEmployeeRef.update({name: name});
    } if (designation) {
        var updateData = updateEmployeeRef.update({designation: designation});
    }
    updateData.then(e => {
        res.json(e);
    }).catch(e => {
        res.json({err: `Employee with id ${employeeId} not updated`})
    })
}

// Increament salary of an employee in the system.
exports.update_increamented_salary = function(req, res) {
    let employeeId = req.params.employeesId;
    let increamentedSalary = parseInt(req.body.increamented_salary);
    if (increamentedSalary) {
        let employeeRef = db.collection('employees').doc(employeeId);
        let transaction = db.runTransaction(t => {
            return t.get(employeeRef)
                .then(doc => {
                    let actualSalary = parseInt(doc.data().salary);
                    let totalSalary = increamentedSalary + actualSalary;
                    t.update(employeeRef, {salary: totalSalary});
                    res.json({doc: `Salary of Employee with id ${employeeId} is increased.`})
                }).catch(err => {
                    console.log('Transaction failure:', err);
                });
        })
    }
}

// Delete the specific employee details.
exports.delete_employee = function(req, res) {
    let employeeId = req.params.employeesId;
    db.collection('employees').doc(employeeId).get().then((doc) => {
        doc.ref.delete();
        res.json({doc: `Employee with id ${employeeId} is deleted.`})
    }).catch(e => {
        res.json({err: `Employee with id ${employeeId} cannot be deleted.`})
    })
}

// Get the employees based on the department.
exports.get_employee_basedon_dept = function(req, res) {
    let departments = [];
    let dept = req.params.deptId;
    employees.forEach(function(employee) {
        if (employee.dept === dept) {
            departments.push(employee);
        }
    });
    if (departments.length > 0) {
        res.status(200).json(departments);
    } else {
        res.status(404).send({
            message: 'Must provide a valid department.',
        });
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

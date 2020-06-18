'use strict';
module.exports = function(app) {
  const employeeController = require('../controller/employeeController.js');

  // todoList Routes
  app.route('/employees').get(employeeController.list_all_employees).post(employeeController.create_new_employees);

  app.route('/employees/:employeesId').get(employeeController.get_employee)
    .put(employeeController.update_employee)
    .delete(employeeController.delete_employee);

  app.route('/employees/salary/:employeesId').put(employeeController.update_increamented_salary)
  app.route('/employees/dept/:deptId').get(employeeController.get_employee_basedon_dept);
};
INSERT INTO department (name)
VALUES ('Management'),
       ('Human Resources'),
       ('Accounting'),
       ('IT');

INSERT INTO role (title, salary, department_id)
VALUES ('General Manager', 140000, 1),
       ('Human Resource Officer', 100000, 2),
       ('Accountant', 110000, 3),
       ('IT Worker', 105000, 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ('John', 'Jones', 1),
       ('Peter', 'Moilet', 2),
       ('Julia', 'Taylor', 3),
       ('Gerard', 'Timp', 4); 
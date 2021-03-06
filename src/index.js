const express = require('express');
const { v4: uuidV4 } = require('uuid');
const app = express();
const port = 3000;
app.use(express.json());

const customers = [];

//Middleware
function verifyAccountExists(req, res, next) {
    const { cpf } = req.headers;
    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ err: 'Customer not found' });
    }

    req.customer = customer;

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    customerAlreadyExists = customers.some(customer => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return res.status(400).json({ err: `CPF ${cpf} already exists` });
    }

    customers.push({
        cpf,
        name,
        id: uuidV4(),
        statement: [],
    });

    return res.status(201).send();
});

app.put('/account', verifyAccountExists, (req, res) => {
    const { name } = req.body;
    const { customer } = req;

    customer.name = name;

    return res.status(201).send();
});

app.get('/account', verifyAccountExists, (req, res) => {
    const { customer } = req;

    return res.json(customer);
});

app.delete('/account', verifyAccountExists, (req, res) => {
    const { customer } = req;

    customers.splice(customer, 1);
    return res.status(200).json(customers);
});

app.get('/account/balance', verifyAccountExists, (req, res) => {
    const { customer } = req;
    const balance = getBalance(customer.statement);

    return res.json({ balance });
});

app.get('/statement', verifyAccountExists, (req, res) => {
    const { customer } = req;
    return res.json(customer.statement);
});

app.get('/statement/date', verifyAccountExists, (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + ' 00:00');

    const statement = customer.statement.filter(
        statement =>
            statement.createdAt.toDateString() ===
            new Date(dateFormat).toDateString(),
    );

    return res.json(statement);
});

app.post('/deposit', verifyAccountExists, (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req;
    const statementOperation = {
        description,
        amount,
        createdAt: new Date(),
        type: 'credit',
    };

    customer.statement.push(statementOperation);

    return res.status(201).send();
});

app.post('/withdraw', verifyAccountExists, (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req;

    const balance = getBalance(customer.statement);

    console.log(balance);

    if (balance < amount) {
        return res.status(400).json({ err: 'Insufficient funds' });
    }

    const statementOperation = {
        description,
        amount,
        createdAt: new Date(),
        type: 'debit',
    };

    customer.statement.push(statementOperation);

    return res.status(201).send();
});

//Server
app.listen(port, () => {
    console.log(`App is run in port http://localhost:${port}`);
});

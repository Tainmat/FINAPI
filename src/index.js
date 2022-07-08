const { response } = require('express');
const express = require('express');
const { v4: uuidV4 } = require('uuid');
const app = express();
const port = 3000;
app.use(express.json());

const customers = [];

app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    customerAlreadyExists = customers.some(customer => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return res.status(400).json({ err: `CPF ${cpf} alredy exists` });
    }

    customers.push({
        cpf,
        name,
        id: uuidV4(),
        statement: [],
    });

    return res.status(201).send();
});

app.get('/statement', (req, res) => {
    const { cpf } = req.headers;
    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ err: 'Customer not found' });
    }

    return res.json(customer.statement);
});

app.listen(port, () => {
    console.log(`App is run in port http://localhost:${port}`);
});

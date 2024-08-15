const port = 7000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors')
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(cors());

//connecting database with mongodb
mongoose.connect("mongodb://localhost:27017/loginSignup")

//api creation
app.get("/", (req, res) => {
    res.send("express is running")
})



//schema for creating user model

const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
})

//creating endpoint for registering the user
app.post('/signup', async (req, res) => {

    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found with the same email address" })
    }

    // Generate a salt
    const saltRounds = 10; // You can adjust the cost factor if needed
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: hashedPassword,

    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, 'secret_key');
    res.json({ success: true, token })
})

//creating endpoint for user login

app.post('/login', async (req, res) => {

    let user = await Users.findOne({ email: req.body.email });

    if (user) {
        const passCompare = await bcrypt.compare(req.body.password, user.password);
        console.log(passCompare, "password")
        if (passCompare) {
            const data = {
                user: {
                    id: user._id
                }
            }
            const token = jwt.sign(data, 'secret_key');

            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, error: "Wrong Password" });
        }
    }
    else {
        res.json({ success: false, error: "Wrong Email Id" });
    }

})


// creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using valid token" })
    }
    else {
        try {
            const data = jwt.verify(token, "secret_key");
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: " invalid token" })
        }
    }
}

app.get('/expense', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(404).send(error.message);
    }
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get token from Authorization header

    if (token == null) return res.sendStatus(401); // No token provided

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token

        // Attach user info to the request object
        req.user = user;
        next();
    });
}

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    
});

const Expense = mongoose.model('Expense', expenseSchema);




// Add Expense Endpoint (POST /api/expenses)
app.post('/addproduct',authenticateToken,  async (req, res) => {
    const { name, price } = req.body;

    if (!name || !price ) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newExpense = new Expense({
            userId: req.user.id,
            name,
            price,
           
        });

        await newExpense.save();
        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense', error: error.message });
    }
});

// Get Expenses Endpoint (GET /api/expenses)
app.get('/getproduct',authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
});

// Edit Expense Endpoint (PUT /api/expenses/:id)
app.put('/editproduct/:id',authenticateToken, async (req, res) => {
    const { name, price } = req.body;

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            { name, price},
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense', error: error.message });
    }
});

// Delete Expense Endpoint (DELETE /api/expenses/:id)
app.delete('/deleteproduct/:id',authenticateToken, async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
});


app.listen(port, (error) => {
    if (!error) {
        console.log("server is running on port " + port)
    }
    else {
        console.log("error :" + error)
    }
})
const Menu = require('../../models/menu')

function homeController() {
    return {
        async index(req, res) {
            try {
                const pizzas = await Menu.find()
                
                console.log("Fetched Pizzas:", pizzas)  
                console.log("Session Info:", req.session) 

                return res.render('home', { pizzas })
            } catch (err) {
                console.error('Error fetching pizzas:', err)
                return res.status(500).send('Something went wrong')
            }
        }
    }
}

module.exports = homeController
homeController
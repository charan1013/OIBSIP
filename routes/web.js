const authController = require('../app/http/controllers/authController')
const  homeController = require('../app/http/controllers/homeController')
const  cartController = require('../app/http/controllers/customers/cartController')
const  orderController = require('../app/http/controllers/customers/orderController')
const  AdminOrderController = require('../app/http/controllers/admin/orderController')
const  statusController = require('../app/http/controllers/admin/statusController')
const  pizzaController = require('../app/http/controllers/admin/pizzaController')
const upload = require('../app/config/upload')



//Middlewares
const guest = require('../app/http/middleware/guest')
const auth = require('../app/http/middleware/auth')
const admin = require('../app/http/middleware/admin')


function initRoutes(app) {
    

    app.get('/',homeController().index)


app.get('/login', guest,authController().login)

app.post('/login',authController().postLogin)

app.get('/register', guest, authController().register)

app.post('/register',authController().postRegister)

app.post('/logout',authController().logout)




app.get('/cart', cartController().index)
app.post('/update-cart', cartController().update)

//customer routes
app.post('/orders', auth, orderController().store )
app.get('/customer/orders', auth, orderController().index)
app.get('/customer/order/:id', auth, orderController().show)




//Admin
app.get('/admin/orders',admin, AdminOrderController().index)
app.post('/admin/order/status',admin, statusController().update)
app.get('/admin/addpizza', admin, pizzaController().addPizzaPage)
app.post('/admin/addpizza', admin, upload.single('image'), pizzaController().addPizza)

}

module.exports = initRoutes;
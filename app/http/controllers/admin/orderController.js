const Order = require('../../../models/order');

function orderController() {
    return {
        async index(req, res) {
            try {
                const orders = await Order.find({ status: { $ne: 'completed' } })
                    .sort({ createdAt: -1 })
                    .populate('customerId', '-password');

                if (req.xhr) {
                    return res.json(orders);
                } else {
                    return res.render('admin/orders');
                }
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                return res.status(500).send('Something went wrong');
            }
        }
    };
}

module.exports = orderController;

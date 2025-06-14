const Order = require('../../../models/order');
const mongoose = require('mongoose');

function statusController() {
    return {
        async update(req, res) {
            const { orderId, status } = req.body;

            // Validate input
            if (!orderId || !status) {
                req.flash('error', 'Order ID and status are required');
                return res.redirect('/admin/orders');
            }

            try {
                
                const id = new mongoose.Types.ObjectId(orderId);

                // Update the order
                await Order.updateOne({ _id: id }, { status });

                // Emit the update event
                const eventEmitter = req.app.get('eventEmitter');
                if (eventEmitter) {
                    eventEmitter.emit('orderUpdated', {
                        id: orderId,
                        status: status
                    });
                }

                return res.redirect('/admin/orders');
            } catch (err) {
                console.error('Failed to update order:', err);
                req.flash('error', 'Something went wrong while updating the order');
                return res.redirect('/admin/orders');
            }
        }
    };
}

module.exports = statusController;

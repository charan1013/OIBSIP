import axios from 'axios';
import Noty from 'noty';
import { initAdmin } from './admin';
import moment from 'moment';

const addToCart = document.querySelectorAll('.add-to-cart');
const cartCounter = document.querySelector('#cartCounter');

const updateCart = (pizza) => {
    axios.post('/update-cart', pizza).then(res => {
        cartCounter.innerText = res.data.totalQty;
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item added to cart',
            progressBar: false,
        }).show();
    }).catch(() => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false,
        }).show();
    });
};

addToCart.forEach(btn => {
    btn.addEventListener('click', () => {
        const pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
    });
});

// Remove alert message after timeout
const alertMsg = document.querySelector('#success-alert');
if (alertMsg) {
    setTimeout(() => alertMsg.remove(), 2000);
}

// Order status logic
const statuses = document.querySelectorAll('.status_line');
const hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? JSON.parse(hiddenInput.value) : null;

const time = document.createElement('small');

const updateStatus = (order) => {
    statuses.forEach(status => {
        status.classList.remove('step-completed', 'current');
    });

    let stepCompleted = true;
    statuses.forEach(status => {
        const dataProp = status.dataset.status;

        if (stepCompleted) {
            status.classList.add('step-completed');
        }

        if (dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);

            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current');
            }
        }
    });
};

if (order) {
    updateStatus(order);
}

// Socket setup
const socket = io();

if (order) {
    socket.emit('join', `order_${order._id}`);
}

const adminAreaPath = window.location.pathname;
if (adminAreaPath.includes('admin')) {
    initAdmin(socket);
    socket.emit('join', 'adminRoom');
}

socket.on('orderUpdated', data => {
    const updatedOrder = { ...order };
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;

    updateStatus(updatedOrder);

    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
});


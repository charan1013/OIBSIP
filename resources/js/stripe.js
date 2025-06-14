import axios from 'axios';
import Noty from 'noty';
import { loadStripe } from '@stripe/stripe-js';
import { placeOrder } from './apiService';
import { CardWidget } from './CardWidget';

export async function initStripe() {
    const stripe = await loadStripe('pk_test_51RWx1MCL2sc7A88b82QCnSkAkjaZbMeBoVuNplpLCrV64B4szf6YJPVkT0IbCMvfPMlCcqZSugTIQtkxawP79IdY00zL1Lcs5Z');
    let card = null;

    // Handle payment method switch
    const paymentType = document.querySelector('#paymentType');
    if (paymentType) {
        paymentType.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                // Mount Stripe Card Widget
                if (!card) {
                    card = new CardWidget(stripe);
                    card.mount();
                }
            } else {
                if (card) {
                    card.destroy();
                    card = null;
                }
            }
        });
    }

    // Handle form submit
    const paymentForm = document.querySelector('#payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(paymentForm);
            const formObject = {};
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }

            if (!card) {
                // No card payment selected — place order directly
                return placeOrder(formObject);
            }

            try {
                const result = await stripe.createToken(card.card);
                if (result.error) {
                    console.error('Stripe token error:', result.error.message);
                    alert(result.error.message);
                    return;
                }

                formObject.stripeToken = result.token.id;
                return placeOrder(formObject);
            } catch (err) {
                console.error('Stripe exception:', err);
            }
        });
    }
}

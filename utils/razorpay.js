const Razorpay = require('razorpay');
const crypto = require("crypto");


var instance = new Razorpay({ key_id: 'rzp_test_ZJyFwWTzVdpEiM', key_secret: 'ockRQ94WKNVoPPqj4YFxrTki' })


module.exports = {
    GenerateRazorpay: async(orderId, GrandTotal) => {
        try {
            const order =await instance.orders.create({
                amount: GrandTotal*100,
                currency: "INR",
                receipt: ""+orderId,
            })
            return order
        }
        catch(err){
            console.log(err);
        }
    },
    VerifyPayment : (razorResponse)=>{
        //   console.log("verify heee");
        //  console.log("heee util",process.env.RAZORPAY_KEY_ID);
        console.log(razorResponse);
    
        let hmac = crypto.createHmac('sha256','ockRQ94WKNVoPPqj4YFxrTki')
    
        hmac.update(razorResponse.razorpay_order_id + '|' + razorResponse.razorpay_payment_id)
        hmac = hmac.digest('hex')
        console.log(hmac);
        if(hmac===razorResponse.razorpay_signature){
            return true
        }else{
            return false
        }
    
    
    }
}